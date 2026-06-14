import { NextRequest, NextResponse } from 'next/server'
import {
  markAsShipped,
  markAsPicking,
  cancelPackage,
} from '@/lib/services/trendyol'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shipmentPackageId, action, trackingNumber, cargoProviderName, lines } =
      body

    switch (action) {
      case 'shipped':
        await markAsShipped(shipmentPackageId, trackingNumber, cargoProviderName)
        break
      case 'picking':
        await markAsPicking(shipmentPackageId, lines)
        break
      case 'cancel':
        await cancelPackage(shipmentPackageId, lines)
        break
      default:
        return NextResponse.json(
          { success: false, message: 'Geçersiz aksiyon' },
          { status: 400 }
        )
    }

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
