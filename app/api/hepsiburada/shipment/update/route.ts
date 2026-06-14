import { NextRequest, NextResponse } from 'next/server'
import { shipHBOrder, getHBCargoCode } from '@/lib/services/hepsiburada'

export async function POST(req: NextRequest) {
  try {
    const { packageId, cargoCompany, trackingNumber, invoiceNumber } =
      await req.json()

    await shipHBOrder(
      packageId,
      getHBCargoCode(cargoCompany),
      trackingNumber,
      invoiceNumber
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Hata',
      },
      { status: 500 }
    )
  }
}
