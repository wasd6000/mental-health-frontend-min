import request from './request.js'

/** 文档 11.1 心理档案汇总 */
export function getProfileDetail(params) {
  return request.get('/api/profile/detail', { params })
}

export function getProfileAssessments(params) {
  return request.get('/api/profile/assessment', { params })
}

export function getProfileAppointments(params) {
  return request.get('/api/profile/appointment', { params })
}

export function getProfileCrisis(params) {
  return request.get('/api/profile/crisis', { params })
}
