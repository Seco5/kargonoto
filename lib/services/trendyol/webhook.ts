import { trendyolFetch, getSupplierUrl } from './client'
import { TrendyolWebhookModel } from './types'

// Webhook oluştur
export async function createWebhook(data: {
  url: string
  username?: string
  password?: string
  subscribedStatuses: string[]
}): Promise<TrendyolWebhookModel> {
  return trendyolFetch<TrendyolWebhookModel>(getSupplierUrl('/webhooks'), {
    method: 'POST',
    body: data,
  })
}

// Webhook listele
export async function listWebhooks(): Promise<TrendyolWebhookModel[]> {
  return trendyolFetch<TrendyolWebhookModel[]>(getSupplierUrl('/webhooks'), {
    method: 'GET',
  })
}

// Webhook güncelle
export async function updateWebhook(
  webhookId: number,
  data: Partial<TrendyolWebhookModel>
): Promise<TrendyolWebhookModel> {
  return trendyolFetch<TrendyolWebhookModel>(
    getSupplierUrl(`/webhooks/${webhookId}`),
    { method: 'PUT', body: data }
  )
}

// Webhook sil
export async function deleteWebhook(webhookId: number): Promise<void> {
  await trendyolFetch<void>(getSupplierUrl(`/webhooks/${webhookId}`), {
    method: 'DELETE',
  })
}

// Webhook aktif/pasif
export async function toggleWebhook(
  webhookId: number,
  active: boolean
): Promise<void> {
  await trendyolFetch<void>(
    getSupplierUrl(
      `/webhooks/${webhookId}/${active ? 'activate' : 'deactivate'}`
    ),
    { method: 'PUT' }
  )
}

// Webhook payload işleyici
// Bu fonksiyon /api/trendyol/webhook POST route'unda kullanılır
export function processTrendyolWebhook(payload: unknown): {
  orderNumber: string
  shipmentPackageId: number
  status: string
  eventDate: Date
} {
  const data = payload as Record<string, unknown>
  return {
    orderNumber: String(data.orderNumber || ''),
    shipmentPackageId: Number(data.shipmentPackageId || 0),
    status: String(data.status || ''),
    eventDate: new Date(Number(data.eventDate || Date.now())),
  }
}
