import { trendyolFetch, getSupplierUrl } from './client'

export interface TrendyolQuestion {
  id: string
  text: string
  customerName: string
  productName: string
  productId: number
  barcode: string
  createdDate: number
  status: 'WAITING_FOR_ANSWER' | 'ANSWERED' | 'REJECTED'
  answer?: string
  answeredDate?: number
}

export interface TrendyolGetQuestionsRequest {
  startDate?: number
  endDate?: number
  page?: number
  size?: number
  status?: string
}

export interface TrendyolGetQuestionsResponse {
  totalElements: number
  totalPages: number
  page: number
  size: number
  content: TrendyolQuestion[]
}

// Müşteri sorularını çek
export async function getTYQuestions(
  params: TrendyolGetQuestionsRequest = {}
): Promise<TrendyolGetQuestionsResponse> {
  return trendyolFetch<TrendyolGetQuestionsResponse>(
    getSupplierUrl('/questions'),
    {
      method: 'GET',
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page ?? 0,
        size: params.size ?? 50,
        status: params.status,
      },
    }
  )
}

// Bekleyen soruları çek
export async function getTYPendingQuestions(): Promise<TrendyolGetQuestionsResponse> {
  return getTYQuestions({
    status: 'WAITING_FOR_ANSWER',
    size: 100,
  })
}

// Soruyu cevapla
export async function answerTYQuestion(
  questionId: string,
  text: string
): Promise<void> {
  await trendyolFetch<void>(
    getSupplierUrl(`/questions/${questionId}/answers`),
    { method: 'POST', body: { text } }
  )
}

// Soruyu reddet
export async function rejectTYQuestion(questionId: string): Promise<void> {
  await trendyolFetch<void>(
    getSupplierUrl(`/questions/${questionId}/reject`),
    { method: 'POST' }
  )
}

// Kalan cevap süresini hesapla (saat cinsinden)
export function getAnswerTimeLeft(createdDate: number): {
  hours: number
  isUrgent: boolean // 4 saatten az kaldıysa
  isExpired: boolean
} {
  const deadline = createdDate + 48 * 60 * 60 * 1000 // 2 iş günü ~48 saat
  const now = Date.now()
  const diff = deadline - now
  const hours = Math.max(0, Math.floor(diff / (60 * 60 * 1000)))
  return {
    hours,
    isUrgent: hours < 4,
    isExpired: diff <= 0,
  }
}
