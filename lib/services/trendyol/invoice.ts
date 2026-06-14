import { trendyolFetch, getSupplierUrl } from './client'
import { TrendyolSendInvoiceLinkRequest } from './types'

// Fatura linki gönder (sendInvoiceLink)
export async function sendInvoiceLink(
  data: TrendyolSendInvoiceLinkRequest
): Promise<void> {
  await trendyolFetch<void>(getSupplierUrl('/orders/invoice-link'), {
    method: 'POST',
    body: data,
  })
}

// Fatura dosyası gönder (base64)
export async function sendInvoiceFile(
  shipmentPackageId: number,
  invoiceContent: string // base64 PDF
): Promise<void> {
  await trendyolFetch<void>(getSupplierUrl('/orders/invoice'), {
    method: 'POST',
    body: {
      shipmentPackageId,
      invoiceContent,
    },
  })
}

// Fatura linkini sil
export async function deleteInvoiceLink(
  shipmentPackageId: number
): Promise<void> {
  await trendyolFetch<void>(
    getSupplierUrl(
      `/orders/shipment-packages/${shipmentPackageId}/invoice-link`
    ),
    { method: 'DELETE' }
  )
}
