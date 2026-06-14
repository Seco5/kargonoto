import { hepsiburadaFetch, MPOP_URL } from './client'

export interface HBQuestion {
  id: string
  text: string
  customerName?: string
  productId: string
  productName: string
  merchantSku: string
  createdDate: string // ISO
  expireDate: string // ISO — cevap son tarihi
  status: number
  // 1: Cevap Bekliyor
  // 2: Cevaplandı (Answered)
  // 3: Reddedildi (Rejected)
  // 4: Süresi Doldu (AutoClosed)
  answer?: string
  answeredDate?: string
}

export interface HBGetQuestionsRequest {
  status?: number | number[]
  page?: number
  size?: number
  sortBy?: 0 | 1
  // 0: soru tarihine göre, 1: son güncellenme
}

export interface HBGetQuestionsResponse {
  totalCount: number
  questions: HBQuestion[]
}

// Soruları çek
export async function getHBQuestions(
  params: HBGetQuestionsRequest = {}
): Promise<HBGetQuestionsResponse> {
  const statusParam = Array.isArray(params.status)
    ? params.status.map((s) => `status=${s}`).join('&')
    : params.status !== undefined
    ? `status=${params.status}`
    : undefined

  return hepsiburadaFetch<HBGetQuestionsResponse>(
    MPOP_URL,
    `/api/questions${statusParam ? `?${statusParam}` : ''}`,
    {
      method: 'GET',
      params: {
        page: params.page ?? 0,
        size: params.size ?? 50,
        sortBy: params.sortBy ?? 0,
      },
    }
  )
}

// Bekleyen soruları çek (status=1)
export async function getHBPendingQuestions(): Promise<HBGetQuestionsResponse> {
  return getHBQuestions({ status: 1, size: 100 })
}

// Soruyu cevapla
export async function answerHBQuestion(
  questionId: string,
  answer: string
): Promise<void> {
  await hepsiburadaFetch<void>(
    MPOP_URL,
    `/api/questions/${questionId}/answer`,
    { method: 'POST', body: { answer } }
  )
}

// Soruyu reddet/bildir
export async function rejectHBQuestion(
  questionId: string,
  reason?: string
): Promise<void> {
  await hepsiburadaFetch<void>(
    MPOP_URL,
    `/api/questions/${questionId}/reject`,
    { method: 'POST', body: { reason } }
  )
}

// Kalan süreyi hesapla
export function getHBAnswerTimeLeft(expireDate: string): {
  hours: number
  minutes: number
  isUrgent: boolean // 2 saatten az
  isExpired: boolean
} {
  const deadline = new Date(expireDate).getTime()
  const now = Date.now()
  const diff = deadline - now
  const hours = Math.max(0, Math.floor(diff / (60 * 60 * 1000)))
  const minutes = Math.max(
    0,
    Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  )
  return {
    hours,
    minutes,
    isUrgent: diff > 0 && diff < 2 * 60 * 60 * 1000,
    isExpired: diff <= 0,
  }
}
