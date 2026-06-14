import { NextRequest, NextResponse } from 'next/server'
import { sendInvoiceLink } from '@/lib/services/trendyol'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await sendInvoiceLink(body)
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
