import { trendyolFetch, getSupplierUrl } from './client'
import {
  TrendyolUpdatePackageRequest,
  TrendyolCreateLabelRequest,
  TrendyolGetLabelRequest,
  TrendyolLabelResponse,
  TrendyolSplitPackageRequest,
  TrendyolUpdateBoxInfoRequest,
  TrendyolChangeCargoProviderRequest,
} from './types'

// Paket statü bildirimi (updatePackage)
// Picking → Invoiced → Shipped gibi geçişler
export async function updatePackageStatus(
  shipmentPackageId: number,
  data: TrendyolUpdatePackageRequest
): Promise<void> {
  await trendyolFetch<void>(
    getSupplierUrl(`/orders/shipment-packages/${shipmentPackageId}`),
    { method: 'PUT', body: data }
  )
}

// Siparişi kargoya ver (Shipped)
export async function markAsShipped(
  shipmentPackageId: number,
  trackingNumber: string,
  cargoProviderName: string
): Promise<void> {
  await updatePackageStatus(shipmentPackageId, {
    lines: [], // Tüm ürünler
    params: {
      status: 'Shipped',
      trackingNumber,
      cargoProviderName,
    },
  })
}

// Siparişi picking'e al (hazırlanıyor)
export async function markAsPicking(
  shipmentPackageId: number,
  lines: Array<{ lineId: number; quantity: number }>
): Promise<void> {
  await updatePackageStatus(shipmentPackageId, {
    lines,
    params: { status: 'Picking' },
  })
}

// Fatura bildirimi
export async function markAsInvoiced(
  shipmentPackageId: number,
  invoiceNumber: string,
  invoiceLink: string,
  lines: Array<{ lineId: number; quantity: number }>
): Promise<void> {
  await updatePackageStatus(shipmentPackageId, {
    lines,
    params: {
      status: 'Invoiced',
      invoiceNumber,
      invoiceLink,
    },
  })
}

// Tedarik edememe bildirimi (iptal)
export async function cancelPackage(
  shipmentPackageId: number,
  lines: Array<{ lineId: number; quantity: number }>
): Promise<void> {
  await updatePackageStatus(shipmentPackageId, {
    lines,
    params: { status: 'Cancelled' },
  })
}

// Ortak etiket barkod talebi (createCommonLabel)
export async function createLabel(
  data: TrendyolCreateLabelRequest
): Promise<TrendyolLabelResponse> {
  return trendyolFetch<TrendyolLabelResponse>(
    getSupplierUrl('/shipment-packages/labels'),
    { method: 'POST', body: data }
  )
}

// Oluşan barkodu al (getCommonLabel)
export async function getLabel(
  data: TrendyolGetLabelRequest
): Promise<TrendyolLabelResponse> {
  return trendyolFetch<TrendyolLabelResponse>(
    getSupplierUrl('/shipment-packages/labels'),
    {
      method: 'GET',
      params: { barcode: data.barcode },
    }
  )
}

// Paket bölme (splitShipmentPackage)
export async function splitPackage(
  shipmentPackageId: number,
  data: TrendyolSplitPackageRequest
): Promise<void> {
  await trendyolFetch<void>(
    getSupplierUrl(`/orders/shipment-packages/${shipmentPackageId}/split`),
    { method: 'POST', body: data }
  )
}

// Desi ve koli bilgisi bildirimi (updateBoxInfo)
export async function updateBoxInfo(
  shipmentPackageId: number,
  data: TrendyolUpdateBoxInfoRequest
): Promise<void> {
  await trendyolFetch<void>(
    getSupplierUrl(`/orders/shipment-packages/${shipmentPackageId}/box-info`),
    { method: 'PUT', body: data }
  )
}

// Kargo firması değiştir (changeCargoProvider)
export async function changeCargoProvider(
  shipmentPackageId: number,
  data: TrendyolChangeCargoProviderRequest
): Promise<void> {
  await trendyolFetch<void>(
    getSupplierUrl(
      `/orders/shipment-packages/${shipmentPackageId}/cargo-providers`
    ),
    { method: 'PUT', body: data }
  )
}
