import { hepsiburadaFetch, ORDER_URL } from './client'

export type HBClaimType =
  | 'RETURN' // İade
  | 'EXCHANGE' // Değişim
  | 'MISSING' // Eksik parça
  | 'DAMAGED' // Hasarlı ürün
  | 'WRONG' // Yanlış ürün

export interface HBClaim {
  id: string
  claimType: HBClaimType
  orderNumber: string
  lineItemId: string
  productName: string
  merchantSku: string
  quantity: number
  price: number
  reason: string
  description?: string
  status: string
  claimDate: string
  lastModifiedDate: string
  cargoTrackingNumber?: string
  cargoCompany?: string
  customerName: string
  customerPhone?: string
  shippingAddress?: {
    addressLine1: string
    city: string
    district: string
  }
}

export interface HBGetClaimsRequest {
  offset?: number
  limit?: number
  status?: string
  claimType?: HBClaimType
  beginDate?: string
  endDate?: string
}

export interface HBGetClaimsResponse {
  totalCount: number
  hasNextPage: boolean
  data: HBClaim[]
}

// Talepleri çek
export async function getHBClaims(
  params: HBGetClaimsRequest = {}
): Promise<HBGetClaimsResponse> {
  return hepsiburadaFetch<HBGetClaimsResponse>(ORDER_URL, '/api/claims', {
    method: 'GET',
    params: {
      offset: params.offset ?? 0,
      limit: params.limit ?? 50,
      status: params.status,
      claimType: params.claimType,
      beginDate: params.beginDate,
      endDate: params.endDate,
    },
  })
}

// Bekleyen talepleri çek
export async function getHBPendingClaims(): Promise<HBGetClaimsResponse> {
  return getHBClaims({ status: 'WAITING', limit: 100 })
}

// Talebi onayla
export async function approveHBClaim(claimId: string): Promise<void> {
  await hepsiburadaFetch<void>(ORDER_URL, `/api/claims/${claimId}/approve`, {
    method: 'PUT',
  })
}

// Talebi reddet
export async function rejectHBClaim(
  claimId: string,
  reason: string
): Promise<void> {
  await hepsiburadaFetch<void>(ORDER_URL, `/api/claims/${claimId}/reject`, {
    method: 'PUT',
    body: { reason },
  })
}

// Talep tipini Türkçeye çevir
export function getHBClaimTypeLabel(type: HBClaimType): string {
  const labels: Record<HBClaimType, string> = {
    RETURN: 'İade',
    EXCHANGE: 'Değişim',
    MISSING: 'Eksik Parça',
    DAMAGED: 'Hasarlı Ürün',
    WRONG: 'Yanlış Ürün',
  }
  return labels[type] || type
}
