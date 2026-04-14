import request from './request.js'

/** 文档第十章 心理微课 */
export function getMicroCourseList(params) {
  return request.get('/api/micro-course/list', { params })
}

export function getMicroCourseDetail(params) {
  return request.get('/api/micro-course/detail', { params })
}

export function updateMicroCourseProgress(data) {
  return request.post('/api/micro-course/progress', data)
}

export function getMyMicroCourses(params) {
  return request.get('/api/micro-course/my', { params })
}
