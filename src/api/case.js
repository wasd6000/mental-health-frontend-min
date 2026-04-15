import request from './request.js'

/**
 * 个案管理相关接口
 */

// 获取咨询师的个案列表
export function getCounselorCases(params = {}) {
  return request.get('/api/case/list', { params })
}

// 获取个案详情
export function getCaseDetail(id) {
  return request.get(`/api/case/detail?id=${id}`)
}

// 创建个案
export function createCase(data) {
  return request.post('/api/case/create', data)
}

// 更新个案
export function updateCase(id, data) {
  return request.put(`/api/case/update?id=${id}`, data)
}