import { NextResponse } from 'next/server'
import { testHBConnection } from '@/lib/services/hepsiburada'

export async function GET() {
  try {
    const result = await testHBConnection()
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
