import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'sonner'
import { matchRoute, MockHttpError } from './mockRouter'

const ARTIFICIAL_DELAY_MS = 300

export function installMockInterceptors(...instances: AxiosInstance[]) {
  instances.forEach(instance => {
    instance.interceptors.request.use(config => {
      config.adapter = mockAdapter
      return config
    })
  })
}

async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await new Promise(resolve => setTimeout(resolve, ARTIFICIAL_DELAY_MS))

  const method = (config.method ?? 'get').toUpperCase()
  const path = (config.url ?? '').split('?')[0]

  const query: Record<string, string> = {}
  if (config.params) {
    Object.entries(config.params as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) query[key] = String(value)
    })
  }

  let body: unknown = config.data
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      // deja el body como string si no es JSON válido
    }
  }

  const headers = config.headers as unknown as { get?: (name: string) => string | undefined; Authorization?: string }
  const authHeader = typeof headers?.get === 'function' ? headers.get('Authorization') : headers?.Authorization
  const token = authHeader ? String(authHeader).replace(/^Bearer\s+/i, '') : null

  const matched = matchRoute(method, path, query)
  if (!matched) {
    return Promise.reject(buildAxiosError(config, 404, { error: `Modo demo: ruta no implementada (${method} ${path})` }))
  }

  try {
    const data = matched.handler({ params: matched.params, query, body, token })
    if (method !== 'GET') {
      toast.info('Modo demo: cambio aplicado localmente (se reinicia al recargar la página)')
    }
    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as AxiosResponse
  } catch (err) {
    if (err instanceof MockHttpError) {
      return Promise.reject(buildAxiosError(config, err.status, err.data))
    }
    throw err
  }
}

function buildAxiosError(config: InternalAxiosRequestConfig, status: number, data: unknown) {
  const error = new Error(`Mock request failed with status ${status}`) as Error & {
    config: InternalAxiosRequestConfig
    response: AxiosResponse
    isAxiosError: boolean
  }
  error.config = config
  error.response = { data, status, statusText: '', headers: {}, config } as AxiosResponse
  error.isAxiosError = true
  return error
}
