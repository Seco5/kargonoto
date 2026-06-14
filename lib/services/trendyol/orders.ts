import { trendyolFetch, getSupplierUrl } from './client'
import {
  TrendyolGetOrdersRequest,
  TrendyolGetOrdersResponse,
  TrendyolShipmentPackage,
} from './types'

// Sipariş paketlerini çek (getShipmentPackages)
// ÖNEMLI: Büyük hacimlerde getShipmentPackagesStream tercih edilmeli
export async function getOrders(
  params: TrendyolGetOrdersRequest = {}
): Promise<TrendyolGetOrdersResponse> {
  return trendyolFetch<TrendyolGetOrdersResponse>(
    getSupplierUrl('/orders/shipment-packages'),
    {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page ?? 0,
        size: params.size ?? 50,
        status: params.status,
        orderNumber: params.orderNumber,
        orderByField: params.orderByField ?? 'PackageLastModifiedDate',
        orderByDirection: params.orderByDirection ?? 'DESC',
        warehouseId: params.warehouseId,
        packageType: params.packageType,
      },
    }
  )
}

// Sipariş akışı ile çek (getShipmentPackagesStream)
// Büyük hacimler için tercih edilmeli
export async function getOrdersStream(
  params: TrendyolGetOrdersRequest = {}
): Promise<TrendyolGetOrdersResponse> {
  return trendyolFetch<TrendyolGetOrdersResponse>(
    getSupplierUrl('/orders/shipment-packages-stream'),
    {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page ?? 0,
        size: params.size ?? 200,
        status: params.status,
        orderByField: params.orderByField ?? 'PackageLastModifiedDate',
        orderByDirection: params.orderByDirection ?? 'DESC',
      },
    }
  )
}

// Askıdaki siparişleri çek
export async function getPendingOrders(
  params: Pick<TrendyolGetOrdersRequest, 'page' | 'size'> = {}
): Promise<TrendyolGetOrdersResponse> {
  return trendyolFetch<TrendyolGetOrdersResponse>(
    getSupplierUrl('/orders/shipment-packages'),
    {
      method: 'GET',
      params: {
        status: 'Created',
        page: params.page ?? 0,
        size: params.size ?? 50,
        orderByField: 'PackageLastModifiedDate',
        orderByDirection: 'DESC',
      },
    }
  )
}

// Bugünün siparişleri
export async function getTodaysOrders(): Promise<TrendyolGetOrdersResponse> {
  const now = Date.now()
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  return getOrders({
    startDate: startOfDay.getTime(),
    endDate: now,
    size: 200,
    orderByField: 'CreatedDate',
    orderByDirection: 'DESC',
  })
}

// Son N günün siparişleri
export async function getRecentOrders(
  days: number = 7
): Promise<TrendyolGetOrdersResponse> {
  const end = Date.now()
  const start = Date.now() - days * 24 * 60 * 60 * 1000

  return getOrders({
    startDate: start,
    endDate: end,
    size: 200,
  })
}

// Trendyol sipariş durumunu Kargonoto durumuna çevir
export function mapTrendyolStatus(status: string): {
  label: string
  color: 'gray' | 'blue' | 'green' | 'red' | 'orange' | 'yellow'
} {
  const map: Record<
    string,
    {
      label: string
      color: 'gray' | 'blue' | 'green' | 'red' | 'orange' | 'yellow'
    }
  > = {
    Created: { label: 'Yeni Sipariş', color: 'blue' },
    Picking: { label: 'Hazırlanıyor', color: 'yellow' },
    Invoiced: { label: 'Faturalandı', color: 'orange' },
    Shipped: { label: 'Kargoda', color: 'blue' },
    Delivered: { label: 'Teslim Edildi', color: 'green' },
    Cancelled: { label: 'İptal Edildi', color: 'red' },
    Returned: { label: 'İade', color: 'orange' },
    UnDelivered: { label: 'Teslim Edilemedi', color: 'red' },
  }
  return map[status] || { label: status, color: 'gray' }
}

// Trendyol paketini Kargonoto sipariş formatına dönüştür
export function mapTrendyolOrder(pkg: TrendyolShipmentPackage) {
  return {
    platform: 'trendyol' as const,
    platformOrderId: String(pkg.shipmentPackageId),
    orderNumber: pkg.orderNumber,
    status: pkg.status,
    statusLabel: mapTrendyolStatus(pkg.status).label,
    statusColor: mapTrendyolStatus(pkg.status).color,
    customerName: pkg.deliveryAddress.fullName,
    customerPhone: '', // Trendyol telefonu maskeler
    address: pkg.deliveryAddress.fullAddress,
    city: pkg.deliveryAddress.city,
    district: pkg.deliveryAddress.district,
    products: pkg.lines.map((line) => ({
      barcode: line.barcode,
      name: line.productName,
      quantity: line.quantity,
      price: line.price,
      sku: line.merchantSku,
    })),
    totalPrice: pkg.totalPrice,
    cargoProvider: pkg.cargoProviderName,
    trackingNumber: pkg.cargoTrackingNumber,
    trackingUrl: pkg.cargoTrackingLink,
    orderDate: new Date(pkg.orderDate),
    lastModified: new Date(pkg.lastModifiedDate),
    isBundle: pkg.isBundle,
    packageType: pkg.packageType,
    rawData: pkg, // Tüm veriyi sakla
  }
}
