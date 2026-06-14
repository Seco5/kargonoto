import { NextRequest, NextResponse } from 'next/server'
import { getClaims, approveClaim, rejectClaim } from '@/lib/services/trendyol'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const result = await getClaims({
      page: Number(searchParams.get('page') || '0'),
      size: Number(searchParams.get('size') || '50'),
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

export async function POST(req: NextRequest) {
  try {
    const { action, claimId, ...data } = await req.json()
    if (action === 'approve') {
      await approveClaim(claimId, data)
    } else if (action === 'reject') {
      await rejectClaim({ claimId, ...data })
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
