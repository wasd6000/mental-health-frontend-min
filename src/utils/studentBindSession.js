import { getStoredAccessToken } from '../request.js'
import { getJwtSubject } from './jwtPayload.js'

/**
 * `/api/bind/status/{studentId}` 等接口的路径参数：与 `parent_student_relation.student_id` 及家长绑定入参一致。
 * 业务状态：-1 未绑定 · 0 待确认 · 1 已验证 · 2 已拒绝（以后端约定为准）。
 * 业务上多为学号/登录账号（localStorage `studentId`），不是 JWT 里的 user_id（UUID）。
 * 顺序：studentId → userId / JWT sub（仅在后端关系表按 user_id 存储时使用）。
 */
export function getStudentBindUserId() {
  if (typeof localStorage === 'undefined') return ''
  const sid = localStorage.getItem('studentId')
  if (sid && String(sid).trim()) return String(sid).trim()
  const sidSnake = localStorage.getItem('student_id')
  if (sidSnake && String(sidSnake).trim()) return String(sidSnake).trim()
  const fromLs = localStorage.getItem('userId')
  if (fromLs && String(fromLs).trim()) return String(fromLs).trim()
  const sub = getJwtSubject(getStoredAccessToken())
  return sub && sub.trim() ? sub.trim() : ''
}
