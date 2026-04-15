import request from './request.js'

/**
 * 排班管理相关接口
 */

// 获取排班模板
export function getScheduleTemplate(params: { counselorId?: string; weekStart?: string } = {}) {
  return request.get('/api/schedule/template', { params })
}