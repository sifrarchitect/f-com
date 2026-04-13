// =============================================
// F-Manager — Steadfast Courier Integration
// Full implementation: Session 7
// =============================================

const STEADFAST_API_URL = process.env.STEADFAST_API_URL || 'https://portal.steadfast.com.bd/public-api'

export interface SteadfastOrderPayload {
  invoice: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  cod_amount: number
  note?: string
}

export interface SteadfastResponse {
  status: number
  message: string
  consignment?: {
    consignment_id: string
    tracking_code: string
    status: string
  }
}

/**
 * Create a Steadfast courier order.
 * Each shop has its own API key + secret stored in the DB.
 */
export async function createSteadfastOrder(
  apiKey: string,
  secretKey: string,
  payload: SteadfastOrderPayload
): Promise<SteadfastResponse> {
  const response = await fetch(`${STEADFAST_API_URL}/create-order`, {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Secret-Key': secretKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return response.json()
}

/**
 * Get Steadfast order status by consignment ID
 */
export async function getSteadfastStatus(
  apiKey: string,
  secretKey: string,
  consignmentId: string
): Promise<SteadfastResponse> {
  const response = await fetch(
    `${STEADFAST_API_URL}/status_by_cid/${consignmentId}`,
    {
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
      },
    }
  )

  return response.json()
}
