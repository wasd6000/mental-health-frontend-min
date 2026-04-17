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
  return request.get('/api/case/detail', { params: { id } })
}

// 兼容旧调用名（历史组件仍可能引用 fetchCaseDetail）
export async function fetchCaseDetail(id) {
  const res = await getCaseDetail(id)
  return res?.data ?? res
}

// 创建个案
export function createCase(data) {
  return request.post('/api/case/create', data)
}

// 更新个案
export function updateCase(data) {
  return request.put('/api/case/update', data)
}

// 个案统计（供 CaseStats.vue 使用）
export async function fetchCaseStats(params = {}) {
  const res = await request.get('/api/case/stats', { params })
  return res?.data ?? []
}