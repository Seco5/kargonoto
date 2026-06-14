import { trendyolFetch, getSupplierUrl } from './client'

export interface TrendyolBuyboxItem {
  barcode: string
  productName: string
  sellerId: number
  sellerName: string
  salePrice: number
  listPrice: number
  winnerSellerId: number
  isWinner: boolean
  winnerPrice: number
  competitorCount: number
}

export interface TrendyolBuyboxResponse {
  totalElements: number
  content: TrendyolBuyboxItem[]
}

// Buybox durumunu çek
export async function getTYBuybox(
  params: {
    page?: number
    size?: number
    barcode?: string
    isWinner?: boolean
  } = {}
): Promise<TrendyolBuyboxResponse> {
  return trendyolFetch<TrendyolBuyboxResponse>(
    getSupplierUrl('/products/price-list'),
    {
      method: 'GET',
      params: {
        page: params.page ?? 0,
        size: params.size ?? 50,
        barcode: params.barcode,
        isWinner: params.isWinner,
      },
    }
  )
}

// Buybox kaybedilen ürünler
export async function getTYLostBuybox(): Promise<TrendyolBuyboxResponse> {
  return getTYBuybox({ isWinner: false, size: 100 })
}

// Buybox kazanılan ürünler
export async function getTYWonBuybox(): Promise<TrendyolBuyboxResponse> {
  return getTYBuybox({ isWinner: true, size: 100 })
}

// Rakibe göre fiyat farkı hesapla
export function getPriceDiff(item: TrendyolBuyboxItem): {
  diff: number
  percentage: number
  shouldLower: boolean
} {
  const diff = item.salePrice - item.winnerPrice
  const percentage = Math.round((diff / item.winnerPrice) * 100)
  return {
    diff: Math.abs(diff),
    percentage: Math.abs(percentage),
    shouldLower: diff > 0,
  }
}
