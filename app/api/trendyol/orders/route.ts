import { NextRequest, NextResponse } from 'next/server'
import { getOrders, getPendingOrders } from '@/lib/services/trendyol'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const page = Number(searchParams.get('page') || '0')
    const size = Number(searchParams.get('size') || '50')
    const pending = searchParams.get('pending') === 'true'

    const result = pending
      ? await getPendingOrders({ page, size })
      : await getOrders({ status, page, size })

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
