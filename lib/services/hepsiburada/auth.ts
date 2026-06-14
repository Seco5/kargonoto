import { getHBToken, clearHBTokenCache } from './client'

export async function testHBConnection(): Promise<{
  success: boolean
  message: string
}> {
  try {
    clearHBTokenCache()
    await getHBToken()
    return {
      success: true,
      message: 'Hepsiburada bağlantısı başarılı ✓',
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Hepsiburada bağlantısı başarısız',
    }
  }
}
