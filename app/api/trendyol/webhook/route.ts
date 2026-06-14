// Trendyol'dan gelen webhook bildirimlerini alır

import { NextRequest, NextResponse } from 'next/server'
import { processTrendyolWebhook } from '@/lib/services/trendyol'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const event = processTrendyolWebhook(payload)

    // DB bağlandığında burada siparişi güncelle
    console.log('Trendyol webhook:', event)

    // Her zaman 200 dön — Trendyol retry yapar
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    // Yine de 200 dön
    return NextResponse.json({ success: true })
  }
}
