import { hepsiburadaFetch, ORDER_URL } from './client'

export type HBBarcodeFormat = 'zpl' | 'base64zpl' | 'pdf' | 'png' | 'jpg'

// Ortak barkod al (HepsiJet ve Aras destekli)
export async function getHBBarcode(
  packageId: string,
  format: HBBarcodeFormat = 'pdf'
): Promise<string | Blob> {
  const result = await hepsiburadaFetch<{
    barcode: string
    format: string
  }>(ORDER_URL, `/api/packages/${packageId}/barcode`, {
    method: 'GET',
    params: { format },
  })
  return result.barcode // base64 veya ZPL string
}

// Toplu barkod al
export async function getHBBulkBarcodes(
  packageIds: string[],
  format: HBBarcodeFormat = 'pdf'
): Promise<Array<{ packageId: string; barcode: string }>> {
  return hepsiburadaFetch(ORDER_URL, '/api/packages/barcodes', {
    method: 'POST',
    body: { packageIds, format },
  })
}
