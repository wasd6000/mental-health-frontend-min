import request from './request.js'

/**
 * 工作台动态相关接口
 */

// 获取辅导员最近动态
export function getTutorRecentActivities(limit = 5) {
  return request.get('/api/workbench/tutor/activities/recent', { params: { limit } })
}

// 获取管理员最近动态
export function getAdminRecentActivities(limit = 5) {
  return request.get('/api/workbench/admin/activities/recent', { params: { limit } })
}