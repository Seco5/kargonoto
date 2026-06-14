import { NextResponse } from 'next/server'

// NOT: Hepsiburada etiket/barkod servisi henüz tanımlanmadı.
// Servis katmanına label fonksiyonu eklenince burası doldurulacak.
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Hepsiburada barkod/etiket servisi henüz uygulanmadı.',
    },
    { status: 501 }
  )
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'Hepsiburada barkod/etiket servisi henüz uygulanmadı.',
    },
    { status: 501 }
  )
}
