import { NextRequest, NextResponse } from 'next/server'
import {
  getHBOrders,
  getHBPendingOrders,
  getHBTodaysOrders,
} from '@/lib/services/hepsiburada'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const pending = searchParams.get('pending') === 'true'
    const today = searchParams.get('today') === 'true'
    const offset = Number(searchParams.get('offset') || '0')
    const limit = Number(searchParams.get('limit') || '50')

    let result
    if (pending) {
      result = await getHBPendingOrders()
    } else if (today) {
      result = await getHBTodaysOrders()
    } else {
      result = await getHBOrders({ status, offset, limit })
    }

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
