'use server'

// =============================================
// Order Server Actions — Shop Admin + Checkout
// =============================================

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireRole, getUser } from '@/lib/auth'
import { checkoutSchema } from '@/lib/validations'
import { normalizePhone } from '@/lib/phone'
import { createSteadfastOrder } from '@/lib/steadfast'
import { sendOrderConfirmation, sendNewOrderAlert, sendOrderCancelled } from '@/lib/email/send'
import type { ActionResult, Order, Shop, Product, VariantType, VariantSnapshot, DiscountTimer } from '@/types/database'

// =============================================
// Place Order (Customer Checkout — public, no auth)
// =============================================
export async function placeOrder(formData: FormData): Promise<ActionResult<{ id: string; order_number: string }>> {
  const raw = {
    customer_name: formData.get('customer_name') as string,
    customer_phone: formData.get('customer_phone') as string,
    customer_email: (formData.get('customer_email') as string) || '',
    customer_address: formData.get('customer_address') as string,
    delivery_zone: formData.get('delivery_zone') as string,
    quantity: parseInt(formData.get('quantity') as string, 10) || 1,
    payment_method: formData.get('payment_method') as string,
    payment_trx_id: formData.get('payment_trx_id') as string,
    product_id: formData.get('product_id') as string,
    variant_type: (formData.get('variant_type') as string) || null,
    variant_value: (formData.get('variant_value') as string) || null,
  }

  // 1. Zod validate
  const parsed = checkoutSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const d = parsed.data
  const normalizedPhone = normalizePhone(d.customer_phone)

  // Use service client for public checkout (no auth needed)
  const supabase = await createServiceClient()

  // 2. Check blacklist
  const { data: isBlacklisted } = await supabase
    .rpc('is_customer_blacklisted', { p_phone: normalizedPhone } as any)

  if (isBlacklisted) {
    return { data: null, error: 'Unable to process order. Please contact the shop.' }
  }

  // 2.5 Rate Limiter (Anti-Spam) - Max 5 pending orders per 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: spamCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('customer_phone', normalizedPhone)
    .gte('created_at', oneDayAgo)
    .eq('delivery_status', 'pending')

  if (spamCount !== null && spamCount >= 5) {
    return { data: null, error: 'Too many pending orders. Please wait or contact support.' }
  }

  // 3. Get product + verify stock
  const { data } = await supabase
    .from('products')
    .select('id, shop_id, name, base_price, simple_stock, variants, is_active, images')
    .eq('id', d.product_id)
    .eq('is_active', true)
    .single()
  const product = data as unknown as Product

  if (!product) {
    return { data: null, error: 'Product not found or unavailable' }
  }

  // 4. Get shop (for delivery fees, merchant numbers)
  const { data: shopData } = await supabase
    .from('shops')
    .select('id, name, delivery_fee_inside_dhaka, delivery_fee_outside_dhaka, bkash_merchant_number, nagad_merchant_number, rocket_merchant_number, owner_id, owner_email')
    .eq('id', product.shop_id)
    .eq('is_active', true)
    .single()
  const shop = shopData as unknown as Shop

  if (!shop) {
    return { data: null, error: 'Shop is currently unavailable' }
  }

  // 5. Verify payment method is available
  const merchantNumbers: Record<string, string | null> = {
    bkash: shop.bkash_merchant_number,
    nagad: shop.nagad_merchant_number,
    rocket: shop.rocket_merchant_number,
  }
  if (!merchantNumbers[d.payment_method]) {
    return { data: null, error: `${d.payment_method} is not available for this shop` }
  }

  // 6. Calculate price server-side
  const variants = (product.variants ? (Array.isArray(product.variants) ? product.variants : JSON.parse(product.variants as string)) : []) as VariantType[]
  let unitPrice = product.base_price
  let originalUnitPrice = product.base_price
  let variantSnapshot: VariantSnapshot | null = null

  if (d.variant_type && d.variant_value && variants.length > 0) {
    const vType = variants.find(v => v.type === d.variant_type)
    const vOption = vType?.options.find(o => o.value === d.variant_value)
    if (!vType || !vOption) {
      return { data: null, error: 'Selected variant not available' }
    }
    if (vOption.stock < d.quantity) {
      return { data: null, error: `Only ${vOption.stock} units available for ${d.variant_value}` }
    }
    unitPrice = product.base_price + vOption.price_modifier
    variantSnapshot = {
      type: d.variant_type,
      value: d.variant_value,
      price_modifier: vOption.price_modifier,
      original_price: product.base_price,
      final_price: unitPrice,
    }
  } else {
    // No variant — check simple stock
    if (product.simple_stock < d.quantity) {
      return { data: null, error: `Only ${product.simple_stock} units available` }
    }
  }

  // 7. Check for active discount timer
  const { data: timerData } = await supabase
    .from('discount_timers')
    .select('id, discount_percent')
    .eq('shop_id', product.shop_id)
    .eq('is_active', true)
    .gt('ends_at', new Date().toISOString())
    .or(`product_id.eq.${d.product_id},product_id.is.null`)
    .order('product_id', { ascending: false, nullsFirst: false }) // product-specific first
    .limit(1)
    .single()
  const timer = timerData as unknown as DiscountTimer

  let discountAmount = 0
  if (timer) {
    originalUnitPrice = unitPrice
    const discountPerUnit = Math.round(unitPrice * timer.discount_percent / 100)
    unitPrice = unitPrice - discountPerUnit
    discountAmount = discountPerUnit * d.quantity
  }

  const deliveryFee = d.delivery_zone === 'inside_dhaka'
    ? (shop as Shop).delivery_fee_inside_dhaka
    : (shop as Shop).delivery_fee_outside_dhaka
  const totalPrice = (unitPrice * d.quantity) + deliveryFee

  // 8. Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      shop_id: product.shop_id,
      product_id: d.product_id,
      variant_snapshot: variantSnapshot ? JSON.stringify(variantSnapshot) : null,
      customer_name: d.customer_name,
      customer_phone: normalizedPhone,
      customer_email: d.customer_email || null,
      customer_address: d.customer_address,
      delivery_zone: d.delivery_zone,
      quantity: d.quantity,
      unit_price: unitPrice,
      original_unit_price: originalUnitPrice,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      total_price: totalPrice,
      payment_method: d.payment_method,
      payment_trx_id: d.payment_trx_id,
      payment_amount_expected: totalPrice,
      payment_status: 'pending',
      delivery_status: 'pending',
    } as never)
    .select('id, order_number')
    .single()

  if (orderError) {
    return { data: null, error: 'Failed to create order. Please try again.' }
  }

  // 9. Deduct stock atomically
  const { data: stockResult } = await supabase
    .rpc('deduct_variant_stock', {
      p_product_id: d.product_id,
      p_variant_type: d.variant_type || null,
      p_variant_value: d.variant_value || null,
      p_quantity: d.quantity,
    } as any)

  if (stockResult && !(stockResult as { success: boolean }).success) {
    // Roll back order on stock failure
    await supabase.from('orders').delete().eq('id', (order as { id: string }).id)
    return { data: null, error: (stockResult as { error?: string }).error || 'Stock unavailable' }
  }

  // 10. Send emails (fire-and-forget — don't block checkout)
  const orderData = order as { id: string; order_number: string }
  const productData = product as Product

  try {
    if (d.customer_email) {
      sendOrderConfirmation({
        to: d.customer_email,
        orderNumber: orderData.order_number,
        customerName: d.customer_name,
        productName: productData.name,
        quantity: d.quantity,
        unitPrice,
        deliveryFee,
        totalPrice,
        deliveryZone: d.delivery_zone,
        customerAddress: d.customer_address,
        paymentMethod: d.payment_method,
        shopName: (shop as Shop).name,
      })
    }

    if ((shop as Shop).owner_email) {
      sendNewOrderAlert({
        to: (shop as Shop).owner_email!,
        orderNumber: orderData.order_number,
        customerName: d.customer_name,
        customerPhone: normalizedPhone,
        customerAddress: d.customer_address,
        productName: productData.name,
        quantity: d.quantity,
        totalPrice,
        paymentMethod: d.payment_method,
        paymentTrxId: d.payment_trx_id,
        shopName: (shop as Shop).name,
        agencySlug: 'dashboard',
      })
    }
  } catch {
    // Email failures shouldn't block checkout
  }

  return { data: orderData, error: null }
}

// =============================================
// Cancel Order (Shop Admin)
// =============================================
export async function cancelOrder(orderId: string, reason: string): Promise<ActionResult<null>> {
  const user = await requireRole('shop_owner')
  const supabase = await createServiceClient()

  // Verify ownership
  const { data: order } = await supabase
    .from('orders')
    .select('id, shop_id, delivery_status, customer_email, customer_name, order_number, total_price')
    .eq('id', orderId)
    .eq('shop_id', user.shopId!)
    .single()

  if (!order) return { data: null, error: 'Order not found' }

  const o = order as Order
  if (o.delivery_status === 'delivered' || o.delivery_status === 'cancelled') {
    return { data: null, error: `Cannot cancel an order that is already ${o.delivery_status}` }
  }

  // Restore stock via RPC
  const { data: result } = await supabase.rpc('restore_variant_stock', { p_order_id: orderId } as any)
  if (result && !(result as { success: boolean }).success) {
    return { data: null, error: (result as { error?: string }).error || 'Failed to restore stock' }
  }

  // Update order
  await supabase
    .from('orders')
    .update({
      delivery_status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
      stock_restored: true,
    } as never)
    .eq('id', orderId)

  // Send cancel email
  if (o.customer_email) {
    try {
      const { data: shop } = await supabase.from('shops').select('name').eq('id', o.shop_id).single()
      const { data: product } = await supabase.from('products').select('name').eq('id', o.product_id || '').single()
      
      sendOrderCancelled({
        to: o.customer_email,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        totalPrice: o.total_price,
        cancellationReason: reason,
        shopName: (shop as unknown as { name: string })?.name || 'Our Shop',
        productName: (product as unknown as { name: string })?.name || 'Your Item',
      })
    } catch { /* ignore */ }
  }

  revalidatePath('/dashboard/orders')
  revalidatePath(`/dashboard/orders/${orderId}`)
  return { data: null, error: null }
}

// =============================================
// Send to Steadfast (Shop Admin)
// =============================================
export async function sendToSteadfast(orderId: string): Promise<ActionResult<{ consignment_id: string; tracking_code: string }>> {
  const user = await requireRole('shop_owner')
  const supabase = await createClient()

  // Get order + shop (for Steadfast keys)
  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, customer_phone, customer_address, total_price, payment_status, delivery_status, shop_id')
    .eq('id', orderId)
    .eq('shop_id', user.shopId!)
    .single()

  if (!order) return { data: null, error: 'Order not found' }

  const o = order as Order
  if (o.payment_status !== 'verified') {
    return { data: null, error: 'Payment must be verified before sending to courier' }
  }
  if (o.delivery_status !== 'pending' && o.delivery_status !== 'processing') {
    return { data: null, error: `Cannot send order with status: ${o.delivery_status}` }
  }

  const { data: shop } = await supabase
    .from('shops')
    .select('steadfast_api_key, steadfast_secret_key')
    .eq('id', user.shopId!)
    .single()

  if (!shop || !(shop as Shop).steadfast_api_key || !(shop as Shop).steadfast_secret_key) {
    return { data: null, error: 'Steadfast API keys not configured. Go to Store Settings.' }
  }

  const response = await createSteadfastOrder(
    (shop as Shop).steadfast_api_key!,
    (shop as Shop).steadfast_secret_key!,
    {
      invoice: o.order_number,
      recipient_name: o.customer_name,
      recipient_phone: o.customer_phone,
      recipient_address: o.customer_address,
      cod_amount: o.total_price,
      note: `F-Manager | ${o.order_number}`,
    }
  )

  if (response.status !== 200 || !response.consignment) {
    return { data: null, error: response.message || 'Steadfast API error' }
  }

  // Save tracking info
  await supabase
    .from('orders')
    .update({
      steadfast_consignment_id: response.consignment.consignment_id,
      steadfast_tracking_code: response.consignment.tracking_code,
      delivery_status: 'processing',
    } as never)
    .eq('id', orderId)

  revalidatePath('/dashboard/orders')
  revalidatePath(`/dashboard/orders/${orderId}`)

  return {
    data: {
      consignment_id: response.consignment.consignment_id,
      tracking_code: response.consignment.tracking_code,
    },
    error: null,
  }
}

// =============================================
// Bulk Send to Steadfast
// =============================================
export async function bulkSendToSteadfast(orderIds: string[]): Promise<ActionResult<{ success: number; failed: number }>> {
  let success = 0
  let failed = 0

  for (const id of orderIds) {
    const result = await sendToSteadfast(id)
    if (result.error) {
      failed++
    } else {
      success++
    }
    // Rate limit: 300ms delay between requests
    await new Promise(r => setTimeout(r, 300))
  }

  return { data: { success, failed }, error: null }
}

// =============================================
// Update Delivery Status (Shop Admin)
// =============================================
export async function updateDeliveryStatus(orderId: string, status: string): Promise<ActionResult<null>> {
  const user = await requireRole('shop_owner')

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  if (!validStatuses.includes(status)) {
    return { data: null, error: 'Invalid delivery status' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ delivery_status: status } as never)
    .eq('id', orderId)
    .eq('shop_id', user.shopId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/orders')
  revalidatePath(`/dashboard/orders/${orderId}`)
  return { data: null, error: null }
}
