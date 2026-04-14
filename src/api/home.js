import request from './request.js'

/** 文档 4.1 */
export function getHomeData() {
  return request.get('/api/home/data')
}

/** 文档 4.2 工作台（可选） */
export function getWorkbenchStats() {
  return request.get('/api/workbench/stats')
}

export function getWorkbenchTodo() {
  return request.get('/api/workbench/todo')
}

export function getWorkbenchSchedule() {
  return request.get('/api/workbench/schedule')
}

export function getWorkbenchNotifications() {
  return request.get('/api/workbench/notifications')
}
