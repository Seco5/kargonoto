// ─── AUTH ────────────────────────────────
// Hepsiburada iki aşamalı auth kullanır:
// 1. /api/authenticate endpoint'inden JWT token al
// 2. Her istekte Authorization: Bearer {token} gönder

export interface HepsiburadaAuthRequest {
  username: string
  password: string
  authenticationType: 'INTEGRATOR' // sabit
}

export interface HepsiburadaAuthResponse {
  jwt: string // Bearer token
  id?: string
  username?: string
}

export interface HepsiburadaTokenCache {
  token: string
  expiresAt: number // timestamp — token süresi belli değil, 1 saatte bir yenile
}

// ─── SİPARİŞ TİPLERİ ────────────────────

export interface HepsiburadaOrderLine {
  id: string
  lineItemId: string
  productId: string
  merchantSku: string
  productName: string
  quantity: number
  price: number
  status: string
  deliveryType?: string
}

export interface HepsiburadaOrder {
  id: string
  orderNumber: string
  status: string // 'WaitingInPackage' | 'InPackage' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned'
  orderDate: string // ISO date
  lastModifiedDate: string
  customerId: string
  customerName: string
  customerSurname: string
  shippingAddress: {
    addressLine1: string
    addressLine2?: string
    city: string
    district: string
    postCode: string
    fullName: string
    phone: string
  }
  billingAddress: {
    fullName: string
    addressLine1: string
    city: string
    district: string
    postCode: string
  }
  totalPrice: number
  currencyCode: string
  cargoCompany?: string
  cargoTrackingNumber?: string
  orderLines: HepsiburadaOrderLine[]
  packageId?: string
  deliveryType?: string
  estimatedDeliveryDate?: string
}

export interface HepsiburadaGetOrdersRequest {
  offset?: number // default 0
  limit?: number // default 50, max 100
  status?: string
  beginDate?: string // ISO date: 2026-01-01T00:00:00.000Z
  endDate?: string
  sortField?: string // 'orderDate' | 'lastModifiedDate'
  sortDirection?: string // 'ASC' | 'DESC'
}

export interface HepsiburadaGetOrdersResponse {
  totalCount: number
  hasNextPage: boolean
  data: HepsiburadaOrder[]
}

// ─── KARGO BİLDİRİMİ ────────────────────

export interface HepsiburadaUpdatePackageRequest {
  id: string // packageId
  cargoCompany: string // 'KOLAYGELSIN' | 'ARAS' | 'YURTICI' | 'MNG' | 'PTT'
  cargoTrackingNumber: string
  invoiceId?: string
  invoiceDate?: string // ISO date
  invoiceNumber?: string
}

// ─── ÜRÜN / LISTING ──────────────────────

export interface HepsiburadaListing {
  hepsiburadaSku: string
  merchantSku: string
  price: number
  availableStock: number
  dispatchType?: string
  cargoCompanyCode?: string
}

export interface HepsiburadaUpdateStockRequest {
  items: Array<{
    hepsiburadaSku: string
    availableStock: number
    price?: number
  }>
}

// ─── İADE ───────────────────────────────

export interface HepsiburadaClaim {
  claimId: string
  orderNumber: string
  lineItemId: string
  productName: string
  quantity: number
  claimReason: string
  claimDate: string
  status: string
}

// ─── HATA ───────────────────────────────

export interface HepsiburadaApiError {
  code?: number
  message?: string
  errors?: Array<{ field: string; message: string }>
}
