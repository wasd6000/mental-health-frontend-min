import request from './request.js'

/** 创建预约：后端为 POST /api/appointment/submit（对齐 OpenAPI / psychological_platform） */
export function createAppointment(data) {
  return request.post('/api/appointment/submit', data)
}

/** 别名：与 openapi 命名一致 */
export function submitAppointment(data) {
  return request.post('/api/appointment/submit', data)
}

export function getAppointmentList(params) {
  return request.get('/api/appointment/list', { params })
}

export function getAppointmentDetail(params) {
  return request.get('/api/appointment/detail', { params })
}

export function cancelAppointment(data) {
  return request.post('/api/appointment/cancel', data)
}

export function getPreAssessment() {
  return request.get('/api/appointment/pre-assessment')
}

export function getAppointmentConsent() {
  return request.get('/api/appointment/consent')
}

export function saveAppointmentRecord(data) {
  return request.post('/api/appointment/record/save', data)
}

/**
 * 我的预约（学生）：应使用 GET /api/appointment/list + userId
 * 注意：/api/appointment/my-list 在后端当前实现为排班分页，不是预约记录
 */
export function getMyAppointments(params) {
  return request.get('/api/appointment/list', { params })
}
