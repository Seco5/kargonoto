import { NextRequest, NextResponse } from 'next/server'
import { getProducts, updateStockAndPrice } from '@/lib/services/trendyol'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const result = await getProducts({
      approved: searchParams.get('approved')
        ? searchParams.get('approved') === 'true'
        : undefined,
      barcode: searchParams.get('barcode') || undefined,
      page: Number(searchParams.get('page') || '0'),
      size: Number(searchParams.get('size') || '50'),
    })
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await updateStockAndPrice(body)
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
