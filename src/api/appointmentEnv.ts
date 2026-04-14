import { getJwtSubject } from '../utils/jwtPayload.js'

/**
 * 预约模块数据源开关（Vite 在构建时注入）。
 *
 * - 未设置或不为字符串 "true"：走真实后端 /api/*（开发环境经 Vite 代理）
 * - VITE_USE_MOCK_APPOINTMENT=true：走本地 mock（离线演示）
 *
 * 说明：此前用 `import.meta.env.DEV` 判断，导致 npm run dev 时永远不请求后端。
 */
export function useAppointmentMock(): boolean {
  try {
    const v =
      typeof import.meta !== 'undefined' && import.meta.env
        ? import.meta.env.VITE_USE_MOCK_APPOINTMENT
        : ''
    return String(v || '').toLowerCase() === 'true'
  } catch {
    return false
  }
}

function readBearerTokenFromStorage(): string {
  if (typeof localStorage === 'undefined') return ''
  const keys = ['auth_token', 'access_token', 'User_token', 'admin_token', 'token']
  for (const k of keys) {
    const raw = localStorage.getItem(k)
    if (!raw) continue
    let s = String(raw).trim()
    if (!s || !s.includes('.')) continue
    if (/^bearer\s+/i.test(s)) s = s.replace(/^bearer\s+/i, '')
    if (s.split('.').length === 3) return s
  }
  return ''
}

/**
 * 调用「我的预约」等接口时传给后端的 userId。
 * - 后端 JWT subject = 数据库 user.user_id（UUID），预约表 student_id 与此一致。
 * - 登录页曾只存 studentId=用户名，导致 GET /api/appointment/list?userId=用户名 永远查不到。
 * - 联调：优先 localStorage.userId（登录后写入），否则从当前 token 解析 sub 并回写。
 * - mock：仍用 studentId（与 mock 数据一致）。
 */
export function resolveBackendUserIdForAppointmentApi(): string {
  if (typeof localStorage === 'undefined') return ''
  if (useAppointmentMock()) {
    return localStorage.getItem('studentId') || ''
  }

  let uid =
    localStorage.getItem('userId') ||
    localStorage.getItem('user_id') ||
    ''

  if (!uid) {
    const sub = getJwtSubject(readBearerTokenFromStorage())
    if (sub) {
      try {
        localStorage.setItem('userId', sub)
      } catch {
        /* ignore */
      }
      uid = sub
    }
  }

  return uid || localStorage.getItem('studentId') || ''
}
