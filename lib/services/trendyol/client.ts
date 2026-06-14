import { TrendyolApiError } from './types'

// Trendyol API base URL'leri
const PROD_BASE = 'https://api.trendyol.com/sapigw'
const TEST_BASE = 'https://stageapi.trendyol.com/stagesapigw'

const isTest = process.env.TRENDYOL_ENV === 'test'
export const BASE_URL = isTest ? TEST_BASE : PROD_BASE

// Trendyol'da token yok — HTTP Basic Auth
// Her istekte Authorization: Basic base64(apiKey:apiSecret)
function getAuthHeader(): string {
  const apiKey = process.env.TRENDYOL_API_KEY
  const apiSecret = process.env.TRENDYOL_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error(
      'Trendyol credentials eksik. ' +
        'TRENDYOL_API_KEY ve TRENDYOL_API_SECRET tanımlanmalı.'
    )
  }

  const encoded = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  return `Basic ${encoded}`
}

function getSellerId(): string {
  const sellerId = process.env.TRENDYOL_SELLER_ID
  if (!sellerId) {
    throw new Error('TRENDYOL_SELLER_ID tanımlanmalı.')
  }
  return sellerId
}

// Tüm URL'ler /suppliers/{sellerId}/... formatında
export function getSupplierUrl(path: string): string {
  return `${BASE_URL}/suppliers/${getSellerId()}${path}`
}

export class TrendyolError extends Error {
  statusCode: number
  errors?: TrendyolApiError['errors']

  constructor(
    message: string,
    statusCode: number,
    errors?: TrendyolApiError['errors']
  ) {
    super(message)
    this.name = 'TrendyolError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

export async function trendyolFetch<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    params?: Record<string, string | number | boolean | undefined>
  } = {}
): Promise<T> {
  const { method = 'GET', body, params } = options

  // Query params oluştur
  let fullUrl = url
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) fullUrl += `?${queryString}`
  }

  const headers: Record<string, string> = {
    Authorization: getAuthHeader(),
    'Content-Type': 'application/json',
    // Trendyol entegratör ID'si — kimden istek geldiğini belirtir
    'User-Agent': `${getSellerId()} - ${
      process.env.TRENDYOL_ENTEGRATOR_ID || 'Kargonoto'
    }`,
  }

  const response = await fetch(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // 429 Rate Limit
  if (response.status === 429) {
    throw new TrendyolError(
      'Trendyol rate limit aşıldı. Lütfen bekleyip tekrar deneyin.',
      429
    )
  }

  // 401 Unauthorized
  if (response.status === 401) {
    throw new TrendyolError(
      'Trendyol kimlik doğrulama hatası. API Key ve Secret kontrol edin.',
      401
    )
  }

  if (!response.ok) {
    let errorBody: TrendyolApiError = {
      status: response.status,
    }
    try {
      errorBody = await response.json()
    } catch {
      // JSON parse edilemedi
    }
    throw new TrendyolError(
      errorBody.message || `Trendyol API hatası: ${response.status}`,
      response.status,
      errorBody.errors
    )
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

// Bağlantı testi
export async function testTrendyolConnection(): Promise<{
  success: boolean
  message: string
  sellerId?: string
}> {
  try {
    const sellerId = getSellerId()
    // Satıcı adres bilgilerini çekerek bağlantı test edilir
    await trendyolFetch(getSupplierUrl('/addresses'), { method: 'GET' })
    return {
      success: true,
      message: 'Trendyol bağlantısı başarılı ✓',
      sellerId,
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Trendyol bağlantısı başarısız',
    }
  }
}
