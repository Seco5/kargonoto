import { trendyolFetch, getSupplierUrl } from './client'
import { TrendyolUpdateStockPriceRequest } from './types'

// Stok ve fiyat güncelle (max 1000 SKU)
export async function updateStockAndPrice(
  data: TrendyolUpdateStockPriceRequest
): Promise<{ batchRequestId: string }> {
  return trendyolFetch<{ batchRequestId: string }>(
    getSupplierUrl('/products/price-and-inventory'),
    { method: 'POST', body: data }
  )
}

// Batch işlem sonucunu kontrol et
export async function getBatchResult(batchRequestId: string): Promise<{
  batchRequestId: string
  status: string
  items: Array<{
    requestItem: unknown
    status: string
    failureReasons?: string[]
  }>
}> {
  return trendyolFetch(
    getSupplierUrl(`/products/batch-requests/${batchRequestId}`),
    { method: 'GET' }
  )
}

// Ürün listesi çek
export async function getProducts(
  params: {
    approved?: boolean
    barcode?: string
    startDate?: number
    endDate?: number
    page?: number
    size?: number
  } = {}
): Promise<{
  totalElements: number
  totalPages: number
  content: unknown[]
}> {
  return trendyolFetch(getSupplierUrl('/products'), {
    method: 'GET',
    params: {
      approved: params.approved,
      barcode: params.barcode,
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page,
      size: params.size,
    },
  })
}
