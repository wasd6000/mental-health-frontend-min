import request from './request.js'

/**
 * 知情同意书管理 API
 */

/**
 * 签署知情同意书
 * POST /api/consent/sign
 */
export function signConsent(data) {
  return request.post('/api/consent/sign', data)
}

/**
 * 查询知情同意书
 * GET /api/consent/{appointmentId}
 */
export function getConsent(appointmentId) {
  return request.get(`/api/consent/${appointmentId}`)
}

/**
 * 更新知情同意书
 * PUT /api/consent/{consentId}
 */
export function updateConsent(consentId, data) {
  return request.put(`/api/consent/${consentId}`, data)
}

/**
 * 来访登记管理 API
 */

/**
 * 填写来访登记
 * POST /api/visit/register
 */
export function registerVisit(data) {
  return request.post('/api/visit/register', data)
}

/**
 * 查询来访登记
 * GET /api/visit/{appointmentId}
 */
export function getVisitRegistration(appointmentId) {
  return request.get(`/api/visit/${appointmentId}`)
}

/**
 * 更新来访登记
 * PUT /api/visit/{registrationId}
 */
export function updateVisitRegistration(registrationId, data) {
  return request.put(`/api/visit/${registrationId}`, data)
}