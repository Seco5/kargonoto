import { NextRequest, NextResponse } from 'next/server'
import {
  getTYQuestions,
  getTYPendingQuestions,
  answerTYQuestion,
  rejectTYQuestion,
} from '@/lib/services/trendyol/questions'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pending = searchParams.get('pending') === 'true'
    const result = pending
      ? await getTYPendingQuestions()
      : await getTYQuestions({
          status: searchParams.get('status') || undefined,
          page: Number(searchParams.get('page') || '0'),
          size: Number(searchParams.get('size') || '50'),
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
    const { questionId, action, text } = await req.json()
    if (action === 'answer') {
      await answerTYQuestion(questionId, text)
    } else if (action === 'reject') {
      await rejectTYQuestion(questionId)
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
