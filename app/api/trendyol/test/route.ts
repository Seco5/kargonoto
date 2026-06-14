// Bağlantı testi

import { NextResponse } from 'next/server'
import { testTrendyolConnection } from '@/lib/services/trendyol'

export async function GET() {
  try {
    const result = await testTrendyolConnection()
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
