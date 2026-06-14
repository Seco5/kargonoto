import { hepsiburadaFetch, ORDER_URL } from './client'
import {
  HepsiburadaGetOrdersRequest,
  HepsiburadaGetOrdersResponse,
  HepsiburadaOrder,
} from './types'

// Siparişleri çek
export async function getHBOrders(
  params: HepsiburadaGetOrdersRequest = {}
): Promise<HepsiburadaGetOrdersResponse> {
  return hepsiburadaFetch<HepsiburadaGetOrdersResponse>(
    ORDER_URL,
    '/api/orders',
    {
      method: 'GET',
      params: {
        offset: params.offset ?? 0,
        limit: params.limit ?? 50,
        status: params.status,
        beginDate: params.beginDate,
        endDate: params.endDate,
        sortField: params.sortField ?? 'lastModifiedDate',
        sortDirection: params.sortDirection ?? 'DESC',
      },
    }
  )
}

// Bekleyen siparişler
export async function getHBPendingOrders(): Promise<HepsiburadaGetOrdersResponse> {
  return getHBOrders({ status: 'WaitingInPackage', limit: 100 })
}

// Bugünün siparişleri
export async function getHBTodaysOrders(): Promise<HepsiburadaGetOrdersResponse> {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return getHBOrders({
    beginDate: start.toISOString(),
    endDate: new Date().toISOString(),
    limit: 100,
  })
}

// Son N günün siparişleri
export async function getHBRecentOrders(
  days = 7
): Promise<HepsiburadaGetOrdersResponse> {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return getHBOrders({
    beginDate: start.toISOString(),
    endDate: end.toISOString(),
    limit: 100,
  })
}

// HB sipariş durumunu Kargonoto formatına çevir
export function mapHBStatus(status: string): {
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
    WaitingInPackage: { label: 'Yeni Sipariş', color: 'blue' },
    InPackage: { label: 'Hazırlanıyor', color: 'yellow' },
    Shipped: { label: 'Kargoda', color: 'blue' },
    Delivered: { label: 'Teslim Edildi', color: 'green' },
    Cancelled: { label: 'İptal Edildi', color: 'red' },
    Returned: { label: 'İade', color: 'orange' },
    UnDelivered: { label: 'Teslim Edilemedi', color: 'red' },
  }
  return map[status] || { label: status, color: 'gray' }
}

// HB siparişini Kargonoto ortak formatına çevir
export function mapHBOrder(order: HepsiburadaOrder) {
  return {
    platform: 'hepsiburada' as const,
    platformOrderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: mapHBStatus(order.status).label,
    statusColor: mapHBStatus(order.status).color,
    customerName: `${order.customerName} ${order.customerSurname}`,
    customerPhone: order.shippingAddress.phone,
    address: order.shippingAddress.addressLine1,
    city: order.shippingAddress.city,
    district: order.shippingAddress.district,
    products: order.orderLines.map((line) => ({
      barcode: '',
      name: line.productName,
      quantity: line.quantity,
      price: line.price,
      sku: line.merchantSku,
      lineItemId: line.lineItemId,
    })),
    totalPrice: order.totalPrice,
    cargoProvider: order.cargoCompany,
    trackingNumber: order.cargoTrackingNumber,
    orderDate: new Date(order.orderDate),
    lastModified: new Date(order.lastModifiedDate),
    packageId: order.packageId,
    rawData: order,
  }
}
