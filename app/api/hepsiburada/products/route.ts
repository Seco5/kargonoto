import { NextRequest, NextResponse } from 'next/server'
import { getHBListings, updateHBStock } from '@/lib/services/hepsiburada'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const result = await getHBListings({
      offset: Number(searchParams.get('offset') || '0'),
      limit: Number(searchParams.get('limit') || '50'),
      sku: searchParams.get('sku') || undefined,
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
    const result = await updateHBStock(body)
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
