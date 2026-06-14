import { NextRequest, NextResponse } from 'next/server'
import {
  getTYBuybox,
  getTYLostBuybox,
  getTYWonBuybox,
} from '@/lib/services/trendyol/buybox'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter')
    let result
    if (filter === 'lost') result = await getTYLostBuybox()
    else if (filter === 'won') result = await getTYWonBuybox()
    else
      result = await getTYBuybox({
        page: Number(searchParams.get('page') || '0'),
        barcode: searchParams.get('barcode') || undefined,
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
