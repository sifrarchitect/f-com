'use server'

// =============================================
// Product Server Actions — Shop Admin
// =============================================

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { createProductSchema, updateProductSchema } from '@/lib/validations'
import type { ActionResult } from '@/types/database'
import DOMPurify from 'isomorphic-dompurify'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

export async function createProduct(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await requireRole('shop_owner')

  const raw = {
    name: formData.get('name') as string,
    slug: (formData.get('slug') as string) || slugify(formData.get('name') as string || ''),
    description: (formData.get('description') as string) || undefined,
    base_price: parseInt(formData.get('base_price') as string, 10) || 0,
    simple_stock: parseInt(formData.get('simple_stock') as string, 10) || 0,
    images: JSON.parse((formData.get('images') as string) || '[]') as string[],
    variants: JSON.parse((formData.get('variants') as string) || '[]'),
    is_active: formData.get('is_active') !== 'false',
    sort_order: parseInt(formData.get('sort_order') as string, 10) || 0,
    seo_title: (formData.get('seo_title') as string) || undefined,
    seo_description: (formData.get('seo_description') as string) || undefined,
  }

  const parsed = createProductSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .insert({
      shop_id: user.shopId!,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ? DOMPurify.sanitize(parsed.data.description) : null,
      images: parsed.data.images,
      base_price: parsed.data.base_price,
      simple_stock: parsed.data.simple_stock,
      variants: parsed.data.variants.length > 0 ? JSON.stringify(parsed.data.variants) : '[]',
      is_active: parsed.data.is_active,
      sort_order: parsed.data.sort_order,
      seo_title: parsed.data.seo_title || null,
      seo_description: parsed.data.seo_description || null,
    } as never)
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { data: null, error: 'A product with this URL slug already exists. Try a different name.' }
    }
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/products')
  return { data: data as { id: string }, error: null }
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult<null>> {
  const user = await requireRole('shop_owner')

  const updates: Record<string, unknown> = {}
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description')
  const basePrice = formData.get('base_price')
  const simpleStock = formData.get('simple_stock')
  const images = formData.get('images')
  const variants = formData.get('variants')
  const isActive = formData.get('is_active')
  const sortOrder = formData.get('sort_order')
  const seoTitle = formData.get('seo_title')
  const seoDescription = formData.get('seo_description')

  const rawData = {
    name: name || undefined,
    slug: slug || undefined,
    description: description !== null ? description : undefined,
    base_price: basePrice ? parseInt(basePrice as string, 10) : undefined,
    simple_stock: simpleStock !== null ? parseInt(simpleStock as string, 10) : undefined,
    images: images ? JSON.parse(images as string) : undefined,
    variants: variants ? JSON.parse(variants as string) : undefined,
    is_active: isActive !== null ? isActive === 'true' : undefined,
    sort_order: sortOrder !== null ? parseInt(sortOrder as string, 10) : undefined,
    seo_title: seoTitle !== null ? seoTitle : undefined,
    seo_description: seoDescription !== null ? seoDescription : undefined,
  }

  const parsed = updateProductSchema.safeParse(rawData)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const validatedData = parsed.data

  if (validatedData.name) updates.name = validatedData.name
  if (validatedData.slug) updates.slug = validatedData.slug
  if (validatedData.description !== undefined) updates.description = validatedData.description ? DOMPurify.sanitize(validatedData.description) : null
  if (validatedData.base_price !== undefined) updates.base_price = validatedData.base_price
  if (validatedData.simple_stock !== undefined) updates.simple_stock = validatedData.simple_stock
  if (validatedData.images !== undefined) updates.images = validatedData.images
  if (validatedData.variants !== undefined) updates.variants = validatedData.variants
  if (validatedData.is_active !== undefined) updates.is_active = validatedData.is_active
  if (validatedData.sort_order !== undefined) updates.sort_order = validatedData.sort_order
  if (validatedData.seo_title !== undefined) updates.seo_title = validatedData.seo_title || null
  if (validatedData.seo_description !== undefined) updates.seo_description = validatedData.seo_description || null

  const supabase = await createClient()

  // Verify product belongs to this shop
  const { data: existing } = await supabase
    .from('products')
    .select('id, shop_id')
    .eq('id', id)
    .eq('shop_id', user.shopId!)
    .single()

  if (!existing) {
    return { data: null, error: 'Product not found' }
  }

  const { error } = await supabase
    .from('products')
    .update(updates as never)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { data: null, error: 'A product with this URL slug already exists.' }
    }
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/products')
  revalidatePath(`/dashboard/products/${id}/edit`)
  return { data: null, error: null }
}

export async function deleteProduct(id: string): Promise<ActionResult<null>> {
  const user = await requireRole('shop_owner')
  const supabase = await createClient()

  // Verify ownership
  const { data: existing } = await supabase
    .from('products')
    .select('id, shop_id')
    .eq('id', id)
    .eq('shop_id', user.shopId!)
    .single()

  if (!existing) {
    return { data: null, error: 'Product not found' }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/products')
  return { data: null, error: null }
}

export async function reorderProducts(productIds: string[]): Promise<ActionResult<null>> {
  const user = await requireRole('shop_owner')
  const supabase = await createClient()

  // Batch update sort_order
  const updates = productIds.map((id, index) =>
    supabase
      .from('products')
      .update({ sort_order: index } as never)
      .eq('id', id)
      .eq('shop_id', user.shopId!)
  )

  await Promise.all(updates)

  revalidatePath('/dashboard/products')
  return { data: null, error: null }
}

export async function toggleProduct(id: string, isActive: boolean): Promise<ActionResult<null>> {
  const user = await requireRole('shop_owner')
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive } as never)
    .eq('id', id)
    .eq('shop_id', user.shopId!)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/products')
  return { data: null, error: null }
}
