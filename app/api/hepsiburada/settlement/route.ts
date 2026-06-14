import { NextRequest, NextResponse } from 'next/server'
import { getHBSettlement } from '@/lib/services/hepsiburada/settlement'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const result = await getHBSettlement({
      beginDate: searchParams.get('beginDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      offset: Number(searchParams.get('offset') || '0'),
      limit: Number(searchParams.get('limit') || '50'),
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
