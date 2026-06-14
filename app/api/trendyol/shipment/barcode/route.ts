import { NextRequest, NextResponse } from 'next/server'
import { createLabel, getLabel } from '@/lib/services/trendyol'

export async function POST(req: NextRequest) {
  try {
    const { shipmentPackageId } = await req.json()
    const result = await createLabel({ shipmentPackageId })
    return NextResponse.json(result)
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const barcode = searchParams.get('barcode') || ''
    const result = await getLabel({ barcode })
    return NextResponse.json(result)
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
