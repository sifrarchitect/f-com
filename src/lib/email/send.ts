// =============================================
// F-Manager — High-Level Email Sending Functions
// These wrap the Resend client + templates for easy use in Server Actions
// =============================================

import React from 'react'
import { sendEmail } from './resend'
import OrderConfirmation from './templates/OrderConfirmation'
import PaymentVerified from './templates/PaymentVerified'
import NewOrderAlert from './templates/NewOrderAlert'
import ShopInvite from './templates/ShopInvite'
import AgencyInvite from './templates/AgencyInvite'
import InvoiceGenerated from './templates/InvoiceGenerated'
import OrderCancelled from './templates/OrderCancelled'
import WelcomeAgency from './templates/WelcomeAgency'

const DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'fmanager.com'

// --- Order Confirmation → Customer ---
export async function sendOrderConfirmation(params: {
  to: string
  customerName: string
  orderNumber: string
  productName: string
  variantLabel?: string
  quantity: number
  unitPrice: number
  deliveryFee: number
  discountAmount?: number
  totalPrice: number
  deliveryZone: string
  customerAddress: string
  paymentMethod?: string
  merchantNumber?: string
  shopName: string
  agencyLogo?: string
}) {
  return sendEmail({
    to: params.to,
    subject: `Order Confirmed — ${params.orderNumber}`,
    react: React.createElement(OrderConfirmation, {
      ...params,
      trackUrl: `https://${DOMAIN}/track/${params.orderNumber}`,
    }),
  })
}

// --- Payment Verified → Customer ---
export async function sendPaymentVerified(params: {
  to: string
  customerName: string
  orderNumber: string
  totalPrice: number
  paymentMethod: string
  shopName: string
}) {
  return sendEmail({
    to: params.to,
    subject: `✅ Payment Verified — ${params.orderNumber}`,
    react: React.createElement(PaymentVerified, {
      ...params,
      trackUrl: `https://${DOMAIN}/track/${params.orderNumber}`,
    }),
  })
}

// --- New Order Alert → Shop Owner ---
export async function sendNewOrderAlert(params: {
  to: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerAddress: string
  productName: string
  variantLabel?: string
  quantity: number
  totalPrice: number
  paymentMethod?: string
  paymentTrxId?: string
  shopName: string
  agencySlug: string
}) {
  return sendEmail({
    to: params.to,
    subject: `🛍 New Order: ${params.orderNumber} — ${params.totalPrice} BDT`,
    react: React.createElement(NewOrderAlert, {
      ...params,
      dashboardUrl: `https://${params.agencySlug}.${DOMAIN}/dashboard/orders`,
    }),
  })
}

// --- Shop Invite → New Shop Owner ---
export async function sendShopInvite(params: {
  to: string
  agencyName: string
  agencyLogo?: string
  shopName: string
  tempPassword?: string
  agencySlug: string
}) {
  return sendEmail({
    to: params.to,
    subject: `You're invited to ${params.agencyName}'s platform!`,
    react: React.createElement(ShopInvite, {
      ...params,
      loginUrl: `https://${params.agencySlug}.${DOMAIN}/login`,
      setupUrl: `https://${params.agencySlug}.${DOMAIN}/dashboard`,
    }),
  })
}

// --- Agency Invite → New Agency Owner ---
export async function sendAgencyInvite(params: {
  to: string
  agencyName: string
  tempPassword?: string // Making it optional for backwards compatibility, but we will pass it
  ownerName?: string
  slug: string
}) {
  return sendEmail({
    to: params.to,
    subject: `Your agency "${params.agencyName}" is ready on F-Manager`,
    react: React.createElement(AgencyInvite, {
      ...params,
      loginUrl: `https://${params.slug}.${DOMAIN}/login`,
    }),
  })
}

// --- Invoice Generated → Agency Owner ---
export async function sendInvoiceGenerated(params: {
  to: string
  agencyName: string
  month: string
  year: number
  activeShopCount: number
  amountBdt: number
  agencySlug: string
}) {
  return sendEmail({
    to: params.to,
    subject: `📋 Invoice for ${params.month} ${params.year} — ${params.amountBdt} BDT`,
    react: React.createElement(InvoiceGenerated, {
      ...params,
      billingUrl: `https://${params.agencySlug}.${DOMAIN}/billing`,
    }),
  })
}

// --- Order Cancelled → Customer ---
export async function sendOrderCancelled(params: {
  to: string
  customerName: string
  orderNumber: string
  productName: string
  totalPrice: number
  cancellationReason: string
  shopName: string
  contactPhone?: string
}) {
  return sendEmail({
    to: params.to,
    subject: `Order Cancelled — ${params.orderNumber}`,
    react: React.createElement(OrderCancelled, params),
  })
}

// --- Welcome Agency → After first login ---
export async function sendWelcomeAgency(params: {
  to: string
  agencyName: string
  ownerName: string
  agencySlug: string
}) {
  return sendEmail({
    to: params.to,
    subject: `Welcome to F-Manager, ${params.agencyName}!`,
    react: React.createElement(WelcomeAgency, {
      ...params,
      panelUrl: `https://${params.agencySlug}.${DOMAIN}`,
    }),
  })
}
