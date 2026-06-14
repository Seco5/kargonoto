import { NextRequest, NextResponse } from 'next/server'
import {
  getHBQuestions,
  getHBPendingQuestions,
  answerHBQuestion,
  rejectHBQuestion,
} from '@/lib/services/hepsiburada/questions'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pending = searchParams.get('pending') === 'true'
    const result = pending
      ? await getHBPendingQuestions()
      : await getHBQuestions({
          status: Number(searchParams.get('status')) || undefined,
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
    const { questionId, action, answer, reason } = await req.json()
    if (action === 'answer') {
      await answerHBQuestion(questionId, answer)
    } else if (action === 'reject') {
      await rejectHBQuestion(questionId, reason)
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
