import axios from 'axios'

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV

/** 登录成功后由 setAuthToken 写入，优先级最高 */
export const AUTH_TOKEN_STORAGE_KEY = 'auth_token'

//测试用token：本地匿名 JWT 键名；正式登录后由 setAuthToken 清除，全局请求仍走拦截器
export const ANON_TOKEN_STORAGE_KEY = 'anon_token'

/** 兼容历史代码的其它键（在 auth / anon 均无值时使用） */
const LEGACY_TOKEN_KEYS = ['access_token', 'admin_token', 'User_token', 'user_token', 'token']

/** 生产可设为完整后端根地址；开发留空走 Vite 代理 */
const baseURL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || ''

function normalizeToken(v) {
  if (v == null) return ''
  let s = String(v).trim()
  if (!s) return ''
  if (/^bearer\s+/i.test(s)) s = s.replace(/^bearer\s+/i, '')
  return s
}

//测试用token：写入后后续请求自动带正式 Bearer，不再用 anon_token
/**
 * 登录成功后调用，持久化正式 token（会覆盖「仅匿名」场景下的请求身份）
 * @param {string} token 原始 token（可含或不含 "Bearer " 前缀）
 */
export function setAuthToken(token) {
  if (typeof localStorage === 'undefined' || token == null) return
  const v = normalizeToken(token)
  if (!v) return
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, v)
  try {
    localStorage.removeItem(ANON_TOKEN_STORAGE_KEY)
  } catch (_) {}
}

//测试用token：供拦截器读取，决定全局 Bearer 用匿名还是正式
/**
 * 当前用于 Authorization 的 token：正式登录 > 匿名初始化 > 兼容旧键
 */
export function getStoredAccessToken() {
  if (typeof localStorage === 'undefined') return ''

  const formal = normalizeToken(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY))
  if (formal) return formal

  const anon = normalizeToken(localStorage.getItem(ANON_TOKEN_STORAGE_KEY))
  if (anon) return anon

  for (const k of LEGACY_TOKEN_KEYS) {
    const v = normalizeToken(localStorage.getItem(k))
    if (v) return v
  }
  return ''
}

export function clearAuthTokens() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(ANON_TOKEN_STORAGE_KEY)
  } catch (_) {}
  for (const k of LEGACY_TOKEN_KEYS) {
    try {
      localStorage.removeItem(k)
    } catch (_) {}
  }
}

/** 合并额外请求头；若需要可显式传入 token */
export function buildAuthHeaders(extra = {}, opts = {}) {
  const headers = { ...extra }
  const raw =
    opts.token != null ? normalizeToken(opts.token) : getStoredAccessToken()
  if (raw && !headers.Authorization) {
    headers.Authorization = `Bearer ${raw}`
  }
  return headers
}

//测试用token：.env 中 VITE_ANONYMOUS_TOKEN，或 GET VITE_ANONYMOUS_TOKEN_API（默认 /api/auth/anonymous）
/**
 * 应用启动时调用：在尚无正式 auth_token 时拉取/注入匿名 token，便于测试阶段所有接口统一带 Bearer。
 * 优先级：已有 auth_token 则跳过；已有 anon_token 则跳过；环境变量；否则请求匿名接口。
 */
export async function ensureAnonymousToken() {
  if (typeof localStorage === 'undefined') return

  if (normalizeToken(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY))) return
  if (normalizeToken(localStorage.getItem(ANON_TOKEN_STORAGE_KEY))) return

  //测试用token：开发环境可在 .env.development 配置 VITE_ANONYMOUS_TOKEN=xxx
  const env =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ANONYMOUS_TOKEN
  const fromEnv = env != null ? normalizeToken(env) : ''
  if (fromEnv) {
    localStorage.setItem(ANON_TOKEN_STORAGE_KEY, fromEnv)
    return
  }

  const path =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_ANONYMOUS_TOKEN_API) ||
    '/api/auth/anonymous'

  const bare = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  })

  try {
    const res = await bare.get(path)
    const body = res.data
    const token =
      body?.data?.token ??
      body?.data?.accessToken ??
      body?.token ??
      (typeof body?.data === 'string' ? body.data : '')
    const t = normalizeToken(token)
    if (t) {
      localStorage.setItem(ANON_TOKEN_STORAGE_KEY, t)
    } else {
      console.warn('[request] ensureAnonymousToken: 响应中未解析到 token，可配置 .env 中 VITE_ANONYMOUS_TOKEN')
    }
  } catch (e) {
    console.warn(
      '[request] ensureAnonymousToken: 请求失败，可在 .env 配置 VITE_ANONYMOUS_TOKEN 作为测试用匿名令牌',
      e?.message || e
    )
  }
}

function buildDevFallback(err) {
  const method = (err?.config?.method || 'get').toLowerCase()
  const url = String(err?.config?.url || '')

  if (method === 'get' && (url.includes('/list') || url.includes('/my-list') || url.includes('/my'))) {
    return { code: 200, msg: 'ok', data: [] }
  }
  if (method === 'get' && url.includes('/detail')) {
    return { code: 200, msg: 'ok', data: {} }
  }
  if (method === 'get' && url.includes('/overview')) {
    return { code: 200, msg: 'ok', data: {} }
  }
  return { code: 200, msg: 'ok', data: {} }
}

function inferDefaultData(url = '', method = 'get') {
  const lowerUrl = String(url).toLowerCase()
  const lowerMethod = String(method).toLowerCase()
  if (lowerMethod === 'get' && (lowerUrl.includes('/list') || lowerUrl.includes('/my-list') || lowerUrl.includes('/my'))) {
    return []
  }
  return {}
}

function normalizeApiBody(body, config = {}) {
  if (!body || typeof body !== 'object') {
    return {
      code: 200,
      msg: 'ok',
      data: inferDefaultData(config?.url, config?.method),
    }
  }
  /** 保留 data: null（如绑定状态无记录）；勿用 ?? 把 null 换成 inferDefaultData 的 {} */
  const hasDataKey = Object.prototype.hasOwnProperty.call(body, 'data')
  return {
    ...body,
    msg: body.msg ?? body.message ?? 'ok',
    data: hasDataKey ? body.data : inferDefaultData(config?.url, config?.method),
  }
}

function pruneEmpty(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => pruneEmpty(item))
      .filter((item) => item !== undefined)
  }
  if (value && typeof value === 'object') {
    const out = {}
    Object.keys(value).forEach((key) => {
      const normalized = pruneEmpty(value[key])
      if (normalized !== undefined) {
        out[key] = normalized
      }
    })
    return out
  }
  if (value == null) return undefined
  if (typeof value === 'string' && value.trim() === '') return undefined
  return value
}

function clearAuthAndRedirectLogin() {
  clearAuthTokens()
  try {
    localStorage.removeItem('User_role')
    localStorage.removeItem('admin_role')
  } catch (_) {}
  if (typeof window === 'undefined' || window.location.pathname.includes('/login')) return
  const p = window.location.pathname
  window.location.href = p.startsWith('/admin') ? '/login/admin' : '/login/user'
}

const request = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

//测试用token：全局自动加 Authorization: Bearer（匿名 anon_token 或正式 auth_token，见 getStoredAccessToken）；skipAuth 可关闭单次附加
request.interceptors.request.use((config) => {
  config.headers = config.headers || {}
  if (config.params && typeof config.params === 'object') {
    config.params = pruneEmpty(config.params)
  }

  if (config.skipAuth === true) {
    delete config.headers.Authorization
    return config
  }

  const override = config.token
  const token =
    override != null
      ? normalizeToken(override)
      : getStoredAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }

  return config
})

request.interceptors.response.use(
  (res) => {
    const body = normalizeApiBody(res.data, res.config)
    if (body && typeof body === 'object' && body.code === 401) {
      clearAuthAndRedirectLogin()
      return Promise.reject(new Error(body.message || '未授权'))
    }
    return body
  },
  (err) => {
    if (isDev && err && err.code === 'ERR_NETWORK') {
      return Promise.resolve(buildDevFallback(err))
    }
    const status = err?.response?.status
    if (isDev && status >= 500) {
      return Promise.resolve(buildDevFallback(err))
    }
    if (status === 401) {
      clearAuthAndRedirectLogin()
    }
    if (status === 403) {
      console.warn('[api] 403', err?.config?.method, err?.config?.url, err?.response?.data)
    }
    console.error('接口错误', err)
    return Promise.reject(err)
  }
)

export default request
