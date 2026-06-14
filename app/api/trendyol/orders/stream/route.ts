import { NextRequest, NextResponse } from 'next/server'
import { getOrdersStream } from '@/lib/services/trendyol'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const result = await getOrdersStream({
      startDate: Number(searchParams.get('startDate')) || undefined,
      endDate: Number(searchParams.get('endDate')) || undefined,
      page: Number(searchParams.get('page') || '0'),
      size: Number(searchParams.get('size') || '200'),
      status: searchParams.get('status') || undefined,
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
