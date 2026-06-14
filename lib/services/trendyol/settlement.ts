import { trendyolFetch, getSupplierUrl } from './client'

export interface TrendyolSettlementItem {
  orderNumber: string
  orderDate: string
  productName: string
  barcode: string
  quantity: number
  salePrice: number
  commission: number
  commissionRate: number
  netAmount: number
  settlementDate: string
  transactionType: string
}

export interface TrendyolSettlementResponse {
  totalCount: number
  totalNetAmount: number
  totalCommission: number
  items: TrendyolSettlementItem[]
}

// Mutabakat verisi çek
export async function getTYSettlement(
  params: {
    startDate?: string
    endDate?: string
    page?: number
    size?: number
  } = {}
): Promise<TrendyolSettlementResponse> {
  return trendyolFetch<TrendyolSettlementResponse>(
    getSupplierUrl('/finance/checklist'),
    {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page ?? 0,
        size: params.size ?? 50,
      },
    }
  )
}
