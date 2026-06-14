import { hepsiburadaFetch, LISTING_URL } from './client'
import { HepsiburadaListing, HepsiburadaUpdateStockRequest } from './types'

// Listing listesi çek
export async function getHBListings(
  params: {
    offset?: number
    limit?: number
    sku?: string
  } = {}
): Promise<{
  totalCount: number
  listings: HepsiburadaListing[]
}> {
  return hepsiburadaFetch(LISTING_URL, '/api/listings', {
    method: 'GET',
    params: {
      offset: params.offset ?? 0,
      limit: params.limit ?? 50,
      sku: params.sku,
    },
  })
}

// Stok ve fiyat güncelle
export async function updateHBStock(
  data: HepsiburadaUpdateStockRequest
): Promise<{ trackingId: string }> {
  return hepsiburadaFetch(LISTING_URL, '/api/inventory/update', {
    method: 'POST',
    body: data,
  })
}

// Tekil stok güncelle
export async function updateHBSingleStock(
  hepsiburadaSku: string,
  availableStock: number,
  price?: number
): Promise<{ trackingId: string }> {
  return updateHBStock({
    items: [{ hepsiburadaSku, availableStock, price }],
  })
}
