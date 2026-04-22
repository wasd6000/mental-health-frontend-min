import request from './request.js'

/**
 * 咨询师记录管理相关接口
 */

// 获取咨询师的记录列表
export function getCounselorRecords(params = {}) {
  return request.get('/api/record/counselor-list', { params })
}

// 获取学生的记录列表
export function getStudentRecords(params = {}) {
  return request.get('/api/record/student-list', { params })
}

// 获取记录详情
export function getRecordDetail(id) {
  return request.get(`/api/record/detail?id=${id}`)
}

// 创建记录
export function createRecord(data) {
  return request.post('/api/record/create', data)
}

// 更新记录
export function updateRecord(id, data) {
  return request.put(`/api/record/update?id=${id}`, data)
}

// 自动保存草稿
export function autosaveRecord(data) {
  return request.post('/api/record/autosave', data)
}

// 异步获取咨询师记录列表（别名，用于兼容）
export function getRecordsByConsultantAsync(params = {}) {
  return request.get('/api/record/counselor-list', { params })
}

// 异步创建记录（别名，用于兼容）
export function createRecordAsync(data) {
  return request.post('/api/record/create', data)
}

// 异步更新记录（别名，用于兼容）
export function updateRecordAsync(id, data) {
  return request.put(`/api/record/update?id=${id}`, data)
}

// 异步自动保存草稿（别名，用于兼容）
export function autosaveRecordAsync(data) {
  return request.post('/api/record/autosave', data)
}

// 异步获取记录详情（别名，用于兼容）
export function getRecordByIdAsync(id) {
  return request.get(`/api/record/detail?id=${id}`)
}