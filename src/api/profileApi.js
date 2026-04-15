import request from './request.js'

/**
 * 文档 11.1 心理档案汇总
 * @param {Object} params - 支持多种参数格式
 * @param {string|number} params.id - 用户ID
 * @param {string} params.userId - 用户ID（备选）
 * @param {string} params.studentId - 学生ID/学号（备选）
 */
export function getProfileDetail(params) {
  const requestParams = {}

  // 同时传递多种可能的参数名，让后端选择
  if (params.id != null) {
    requestParams.id = params.id
    requestParams.userId = params.id
    requestParams.studentId = params.id
    console.log('[profileApi] 传递多参数:', requestParams)
  } else if (params.userId != null) {
    requestParams.userId = params.userId
    requestParams.id = params.userId
    console.log('[profileApi] 使用 userId:', params.userId)
  } else if (params.studentId != null) {
    requestParams.studentId = params.studentId
    requestParams.id = params.studentId
    console.log('[profileApi] 使用 studentId:', params.studentId)
  }

  return request.get('/api/profile/detail', {
    params: requestParams
  })
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
