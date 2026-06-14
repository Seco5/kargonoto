import { NextRequest, NextResponse } from 'next/server'
import { splitPackage } from '@/lib/services/trendyol'

export async function POST(req: NextRequest) {
  try {
    const { shipmentPackageId, orderLineItems } = await req.json()
    await splitPackage(shipmentPackageId, { shipmentPackageId, orderLineItems })
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
