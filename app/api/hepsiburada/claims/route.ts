import { NextRequest, NextResponse } from 'next/server'
import {
  getHBClaims,
  getHBPendingClaims,
  approveHBClaim,
  rejectHBClaim,
} from '@/lib/services/hepsiburada/claims'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pending = searchParams.get('pending') === 'true'
    const result = pending
      ? await getHBPendingClaims()
      : await getHBClaims({
          status: searchParams.get('status') || undefined,
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

export async function POST(req: NextRequest) {
  try {
    const { claimId, action, reason } = await req.json()
    if (action === 'approve') {
      await approveHBClaim(claimId)
    } else if (action === 'reject') {
      await rejectHBClaim(claimId, reason)
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
