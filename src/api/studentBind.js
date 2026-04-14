import request from './request.js'

/**
 * 路径与 psychological_platform TwoBindingController（/api/bind）一致；
 * 仅使用路径变量 studentId，无 query / body。
 */
function bindPathSegment(studentId) {
  const id = String(studentId || '').trim()
  if (!id) return ''
  return encodeURIComponent(id)
}

/** GET /api/bind/status/{studentId} → -1 未绑定 0 待确认 1 已验证 2 已拒绝 */
export function getBindStatus(studentId) {
  const seg = bindPathSegment(studentId)
  return request.get(`/api/bind/status/${seg}`)
}

/** POST /api/bind/confirm/{studentId}，仅路径参数，无 body */
export function confirmStudentBind(studentId) {
  const seg = bindPathSegment(studentId)
  return request.post(`/api/bind/confirm/${seg}`)
}

/** POST /api/bind/reject/{studentId}，仅路径参数，无 body */
export function rejectStudentBind(studentId) {
  const seg = bindPathSegment(studentId)
  return request.post(`/api/bind/reject/${seg}`)
}
