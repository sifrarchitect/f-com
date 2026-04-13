'use server'

import type { ActionResult } from '@/types/database'

export async function placeOrder(formData: FormData): Promise<ActionResult<{ id: string; order_number: string }>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function cancelOrder(orderId: string, reason: string): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function sendToSteadfast(orderId: string): Promise<ActionResult<{ consignment_id: string; tracking_code: string }>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function bulkSendToSteadfast(orderIds: string[]): Promise<ActionResult<{ success: number; failed: number }>> {
  return { data: null, error: 'Not yet implemented' }
}

export async function updateDeliveryStatus(orderId: string, status: string): Promise<ActionResult<null>> {
  return { data: null, error: 'Not yet implemented' }
}
