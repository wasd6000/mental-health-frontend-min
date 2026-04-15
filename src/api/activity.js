import request from './request.js'

/**
 * 活动管理相关接口
 */

// 获取活动列表
export function getActivityList(params = {}) {
  return request.get('/api/activity/list', { params })
}

// 获取活动详情
export function getActivityDetail(id) {
  return request.get(`/api/activity/detail?id=${id}`)
}

// 报名活动
export function joinActivity(activityId) {
  return request.post('/api/activity/join', { activityId })
}

// 取消报名
export function cancelActivity(activityId) {
  return request.post('/api/activity/cancel', { activityId })
}

// 活动签到
export function checkinActivity(activityId, studentId) {
  return request.post('/api/activity/checkin', { activityId, studentId })
}

// 获取我的活动记录
export function getMyActivities(params = {}) {
  return request.get('/api/activity/my-list', { params })
}