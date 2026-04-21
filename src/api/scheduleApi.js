import request from './request.js'

/**
 * 获取咨询师列表
 * GET /api/consultant/list
 */
export function getCounselorList(params = {}) {
  return request.get('/api/consultant/list', { params })
}

/**
 * 获取排班列表
 * GET /api/schedule/list
 */
export function getScheduleList(params = {}) {
  return request.get('/api/schedule/list', { params })
}

/**
 * 创建排班
 * POST /api/schedule/create
 */
export function createSchedule(data) {
  return request.post('/api/schedule/create', data)
}

/**
 * 批量创建排班
 * POST /api/schedule/batch-create
 */
export function batchCreateSchedule(data) {
  return request.post('/api/schedule/batch-create', data)
}

/**
 * 更新排班
 * PUT /api/schedule/update/{id}
 */
export function updateSchedule(id, data) {
  return request.put(`/api/schedule/update/${id}`, data)
}

/**
 * 删除排班
 * DELETE /api/schedule/delete/{id}
 */
export function deleteSchedule(id) {
  return request.delete(`/api/schedule/delete/${id}`)
}

/**
 * 清空某天排班
 * DELETE /api/schedule/clear
 */
export function clearScheduleByDate(params) {
  return request.delete('/api/schedule/clear', { params })
}

/**
 * 保存周模板
 * POST /api/schedule/template/save
 */
export function saveWeekTemplate(data) {
  return request.post('/api/schedule/template/save', data)
}

/**
 * 获取模板列表
 * GET /api/schedule/template/list
 */
export function getTemplateList(params = {}) {
  return request.get('/api/schedule/template/list', { params })
}

/**
 * 应用模板生成排班
 * POST /api/schedule/template/apply
 */
export function applyTemplate(data) {
  return request.post('/api/schedule/template/apply', data)
}

/**
 * 删除模板
 * DELETE /api/schedule/template/{id}
 */
export function deleteTemplate(id) {
  return request.delete(`/api/schedule/template/${id}`)
}
