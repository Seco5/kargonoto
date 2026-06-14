// ─── AUTH ───────────────────────────────

// Trendyol HTTP Basic Auth kullanır
// Base64(API_KEY:API_SECRET) header'a eklenir
// Token sistemi yok — her istekte credentials gönderilir

// ─── SİPARİŞ TİPLERİ ────────────────────

export interface TrendyolAddress {
  id: number
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  cityCode: number
  district: string
  districtId: number
  postalCode: string
  countryCode: string
  fullName: string
  fullAddress: string
}

export interface TrendyolOrderLine {
  id: number
  quantity: number
  salesCampaignId: number
  productContentId: number
  merchantSku: string
  productName: string
  productCode: number
  barcode: string
  price: number
  discountedPrice: number
  currencyCode: string
  vatBaseAmount: number
  publicSalePrice: number
  originalPrice: number
  merchantId: number
  amount: number
  discount: number
  tyDiscount: number
  productSize: string
  productColor: string
  productCategory: string
  productCategoryId: number
  imageUrl: string
  taxRate: number
  itemStatus: string // 'Created' | 'Picking' | 'Invoiced' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned'
}

export interface TrendyolShipmentPackage {
  shipmentPackageId: number
  orderNumber: string
  status: string
  operationStatus: string
  orderDate: number // timestamp
  lastModifiedDate: number
  packageType: string // 'Normal' | 'Express'
  timeSlotStartDate?: number
  timeSlotEndDate?: number
  scheduledDeliveryStoreId?: string
  estimatedDeliveryStartDate?: number
  estimatedDeliveryEndDate?: number
  totalPrice: number
  deliveryType?: string
  cargoTrackingNumber?: string
  cargoTrackingLink?: string
  cargoSenderNumber?: string
  cargoProviderName: string
  lines: TrendyolOrderLine[]
  deliveryAddress: TrendyolAddress
  invoiceAddress: TrendyolAddress
  factoryName?: string
  factoryAddress?: string
  isBundle: boolean
  warehouseId?: number
  originShipmentDate?: number
  lastPrice: number
  grossVolume?: number
  packageDimension?: {
    width: number
    length: number
    height: number
  }
}

export interface TrendyolGetOrdersRequest {
  startDate?: number // timestamp (ms)
  endDate?: number // timestamp (ms)
  page?: number // default 0
  size?: number // default 50, max 200
  supplierId?: number
  orderNumber?: string
  status?: string // 'Created' | 'Picking' | 'Invoiced' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned'
  orderByField?: string // 'PackageLastModifiedDate' | 'CreatedDate'
  orderByDirection?: string // 'ASC' | 'DESC'
  shipmentPackageIds?: number[]
  warehouseId?: number
  packageType?: string // 'Normal' | 'Express'
}

export interface TrendyolGetOrdersResponse {
  page: number
  size: number
  totalPages: number
  totalElements: number
  content: TrendyolShipmentPackage[]
}

// ─── PAKET STATÜ BİLDİRİMİ ──────────────

export type TrendyolPackageStatus =
  | 'Picking'
  | 'Invoiced'
  | 'Shipped'
  | 'Cancelled'

export interface TrendyolUpdatePackageRequest {
  lines: Array<{
    lineId: number
    quantity: number
  }>
  params?: {
    status?: TrendyolPackageStatus
    trackingNumber?: string
    cargoProviderName?: string
    warehouseId?: number
    invoiceLink?: string
    invoiceNumber?: string
  }
}

// ─── BARKOD / ETİKET ────────────────────

export interface TrendyolCreateLabelRequest {
  shipmentPackageId: number
}

export interface TrendyolGetLabelRequest {
  barcode: string
}

export interface TrendyolLabelResponse {
  barcodeContent?: string // base64 PDF
  status?: string
  barcode?: string
}

// ─── PAKET BÖLME ────────────────────────

export interface TrendyolSplitPackageRequest {
  shipmentPackageId: number
  orderLineItems: Array<{
    id: number
    quantity: number
  }>
}

// ─── DESİ VE KOLİ ───────────────────────

export interface TrendyolUpdateBoxInfoRequest {
  deci?: number
  boxQuantity?: number
  params?: Record<string, unknown>
}

// ─── KARGO FİRMASI DEĞİŞTİR ─────────────

export interface TrendyolChangeCargoProviderRequest {
  cargoProviderName: string
}

// ─── İADE ───────────────────────────────

export interface TrendyolClaim {
  id: string
  orderId: string
  orderNumber: string
  claimDate: number
  lastModifiedDate: number
  items: Array<{
    id: string
    barcode: string
    productName: string
    quantity: number
    price: number
    claimReason: string
    claimReasonDescription?: string
  }>
  status: string
  claimType: string
  customerFirstName: string
  customerLastName: string
  cargoTrackingNumber?: string
}

export interface TrendyolGetClaimsRequest {
  startDate?: number
  endDate?: number
  page?: number
  size?: number
  status?: string
  claimType?: string
}

export interface TrendyolGetClaimsResponse {
  page: number
  size: number
  totalPages: number
  totalElements: number
  content: TrendyolClaim[]
}

export interface TrendyolApproveClaimRequest {
  claimId: string
  params?: {
    cargoTrackingNumber?: string
    cargoProviderName?: string
  }
}

export interface TrendyolRejectClaimRequest {
  claimId: string
  claimIssueReasonId: number
  description?: string
}

// ─── FATURA ─────────────────────────────

export interface TrendyolSendInvoiceLinkRequest {
  shipmentPackageId: number
  invoiceLink: string
}

// ─── WEBHOOK ────────────────────────────

export interface TrendyolWebhookModel {
  id: number
  url: string
  username?: string
  password?: string
  status: 'ACTIVE' | 'PASSIVE'
  subscribedStatuses: string[]
}

export interface TrendyolWebhookPayload {
  orderNumber: string
  shipmentPackageId: number
  status: string
  eventDate: number
  cargoTrackingNumber?: string
  cargoProviderName?: string
}

// ─── STOK & FİYAT ───────────────────────

export interface TrendyolUpdateStockPriceRequest {
  items: Array<{
    barcode: string
    quantity: number
    salePrice: number
    listPrice: number
  }>
}

// ─── GENEL API HATA ─────────────────────

export interface TrendyolApiError {
  status: number
  message?: string
  errors?: Array<{
    code?: string
    message?: string
  }>
}
