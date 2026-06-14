import { hepsiburadaFetch, MPOP_URL } from './client'

export interface HBSettlementItem {
  orderId: string
  orderNumber: string
  orderDate: string
  productName: string
  merchantSku: string
  quantity: number
  salePrice: number
  commission: number
  commissionRate: number
  netAmount: number
  settlementDate: string
  transactionType: string
}

export interface HBSettlementResponse {
  totalCount: number
  totalNetAmount: number
  totalCommission: number
  items: HBSettlementItem[]
}

// Mutabakat verisi çek
export async function getHBSettlement(
  params: {
    beginDate?: string
    endDate?: string
    offset?: number
    limit?: number
  } = {}
): Promise<HBSettlementResponse> {
  return hepsiburadaFetch<HBSettlementResponse>(MPOP_URL, '/api/settlement', {
    method: 'GET',
    params: {
      beginDate: params.beginDate,
      endDate: params.endDate,
      offset: params.offset ?? 0,
      limit: params.limit ?? 50,
    },
  })
}
