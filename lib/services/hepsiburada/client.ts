import { HepsiburadaTokenCache } from './types'

// URL'ler
const MPOP_URL =
  process.env.HEPSIBURADA_MPOP_URL || 'https://mpop.hepsiburada.com'
const LISTING_URL =
  process.env.HEPSIBURADA_LISTING_URL ||
  'https://listing-external.hepsiburada.com'
const ORDER_URL =
  process.env.HEPSIBURADA_ORDER_URL || 'https://oms-external.hepsiburada.com'

export { MPOP_URL, LISTING_URL, ORDER_URL }

// In-memory token cache
// DB gelince burası cache'e taşınır
let tokenCache: HepsiburadaTokenCache | null = null

export async function getHBToken(): Promise<string> {
  // Cache geçerli mi? (1 saat buffer ile)
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

  const username = process.env.HEPSIBURADA_USERNAME
  const password = process.env.HEPSIBURADA_PASSWORD

  if (!username || !password) {
    throw new HepsiburadaError(
      'Hepsiburada credentials eksik. ' +
        'HEPSIBURADA_USERNAME ve HEPSIBURADA_PASSWORD tanımlanmalı.',
      401
    )
  }

  const response = await fetch(`${MPOP_URL}/api/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      authenticationType: 'INTEGRATOR',
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new HepsiburadaError(
      error.message || 'Hepsiburada token alınamadı',
      response.status
    )
  }

  const data = await response.json()

  // Token'ı 55 dakika cache'le (1 saatlik süresi var varsayımıyla)
  tokenCache = {
    token: data.jwt,
    expiresAt: Date.now() + 55 * 60 * 1000,
  }

  return data.jwt
}

export class HepsiburadaError extends Error {
  statusCode: number
  errors?: Array<{ field: string; message: string }>

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = 'HepsiburadaError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

export async function hepsiburadaFetch<T>(
  baseUrl: string,
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: unknown
    params?: Record<string, string | number | boolean | undefined>
    retried?: boolean
  } = {}
): Promise<T> {
  const { method = 'GET', body, params, retried = false } = options

  const token = await getHBToken()

  // Query params
  let url = `${baseUrl}${path}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        searchParams.append(k, String(v))
      }
    })
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  // 401 → token expire, bir kez yenile ve tekrar dene
  if (response.status === 401 && !retried) {
    tokenCache = null
    return hepsiburadaFetch<T>(baseUrl, path, {
      ...options,
      retried: true,
    })
  }

  // 429 Rate limit
  if (response.status === 429) {
    throw new HepsiburadaError(
      'Hepsiburada rate limit aşıldı (1k/sn). Bekleyip tekrar deneyin.',
      429
    )
  }

  if (!response.ok) {
    let errorBody: Record<string, unknown> = {}
    try {
      errorBody = await response.json()
    } catch {}
    throw new HepsiburadaError(
      String(errorBody.message || `Hepsiburada API hatası: ${response.status}`),
      response.status
    )
  }

  if (response.status === 204) return {} as T
  return response.json()
}

export function clearHBTokenCache() {
  tokenCache = null
}
