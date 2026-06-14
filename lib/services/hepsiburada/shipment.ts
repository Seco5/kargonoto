import { hepsiburadaFetch, ORDER_URL } from './client'
import { HepsiburadaUpdatePackageRequest } from './types'

// Kargo bilgisi gönder (paket statüsünü güncelle)
export async function updateHBPackage(
  data: HepsiburadaUpdatePackageRequest
): Promise<void> {
  await hepsiburadaFetch<void>(ORDER_URL, `/api/orders/package/ship`, {
    method: 'POST',
    body: data,
  })
}

// Siparişi kargoya ver
export async function shipHBOrder(
  packageId: string,
  cargoCompany: string,
  trackingNumber: string,
  invoiceNumber?: string
): Promise<void> {
  await updateHBPackage({
    id: packageId,
    cargoCompany,
    cargoTrackingNumber: trackingNumber,
    invoiceNumber,
    invoiceDate: new Date().toISOString(),
  })
}

// Kargo firması kodları (HB'nin beklediği değerler)
export const HB_CARGO_COMPANIES: Record<string, string> = {
  Sendeo: 'KOLAYGELSIN',
  Aras: 'ARAS',
  Yurtiçi: 'YURTICI',
  MNG: 'MNG',
  PTT: 'PTT',
  DHL: 'DHL',
  UPS: 'UPS',
  HepsiJet: 'HEPSIJET',
  Sürat: 'SURAT',
}

// Kargonoto firma adını HB koduna çevir
export function getHBCargoCode(firmName: string): string {
  return HB_CARGO_COMPANIES[firmName] || firmName.toUpperCase()
}
