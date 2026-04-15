import request from './request.js'

/**
 * 获取咨询师列表
 * GET /api/admin/counselors
 */
export function getAdminCounselors(params = {}) {
  return request.get('/api/admin/counselors', { params })
}

/**
 * 创建咨询师
 * POST /api/admin/counselors
 */
export function createAdminCounselor(data) {
  return request.post('/api/admin/counselors', data)
}

/**
 * 更新咨询师
 * PUT /api/admin/counselors/:id
 */
export function updateAdminCounselor(id, data) {
  return request.put(`/api/admin/counselors/${id}`, data)
}

/**
 * 删除咨询师
 * DELETE /api/admin/counselors/:id
 */
export function deleteAdminCounselor(id) {
  return request.delete(`/api/admin/counselors/${id}`)
}

/**
 * 获取学生列表（管理端）
 * GET /api/admin/students
 */
export function getAdminStudents(params = {}) {
  return request.get('/api/admin/students', { params })
}

/**
 * 更新学生信息
 * PUT /api/admin/students/:id
 */
export function updateAdminStudent(id, data) {
  return request.put(`/api/admin/students/${id}`, data)
}

/**
 * 删除学生
 * DELETE /api/admin/students/:id
 */
export function deleteAdminStudent(id) {
  return request.delete(`/api/admin/students/${id}`)
}

/**
 * 获取管理工作台统计
 * GET /api/admin/workbench/stats
 */
export function getAdminWorkbenchStats() {
  return request.get('/api/admin/workbench/stats')
}

/**
 * 获取统计概览
 * GET /api/admin/stats/overview
 */
export function getStatsOverview(params = {}) {
  return request.get('/api/admin/stats/overview', { params })
}

/**
 * 获取咨询量趋势
 * GET /api/admin/stats/consult-trend
 */
export function getConsultTrend(params = {}) {
  return request.get('/api/admin/stats/consult-trend', { params })
}

/**
 * 获取测评完成率
 * GET /api/admin/stats/assessment-rate
 */
export function getAssessmentRate(params = {}) {
  return request.get('/api/admin/stats/assessment-rate', { params })
}

/**
 * 获取危机等级分布
 * GET /api/admin/stats/crisis-distribution
 */
export function getCrisisDistribution(params = {}) {
  return request.get('/api/admin/stats/crisis-distribution', { params })
}

/**
 * 获取预约时段分布
 * GET /api/admin/stats/slot-distribution
 */
export function getSlotDistribution(params = {}) {
  return request.get('/api/admin/stats/slot-distribution', { params })
}

/**
 * 获取系统健康状态
 * GET /api/admin/system/health
 */
export function getSystemHealth() {
  return request.get('/api/admin/system/health')
}

/**
 * 获取系统性能指标
 * GET /api/admin/system/metrics
 */
export function getSystemMetrics() {
  return request.get('/api/admin/system/metrics')
}

/**
 * 获取系统告警列表
 * GET /api/admin/system/alerts
 */
export function getSystemAlerts(params = {}) {
  return request.get('/api/admin/system/alerts', { params })
}

/**
 * 获取操作日志
 * GET /api/admin/system/logs
 */
export function getOperationLogs(params = {}) {
  return request.get('/api/admin/system/logs', { params })
}
