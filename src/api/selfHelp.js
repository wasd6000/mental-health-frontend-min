import request from './request.js'
// 导入学生端模拟数据
import * as studentMock from '../mock/student.ts'

// 开发环境使用模拟数据，生产环境使用真实接口
const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV

// 心理微课相关
export function getMicroCourseList() {
  if (isDev) {
    return studentMock.getMicroCourseList()
  }
  return request.get('/api/course/my-list')
}

export function getMicroCourseDetail(id) {
  if (isDev) {
    return studentMock.getMicroCourseDetail(id)
  }
  return request.get(`/api/course/detail?id=${id}`)
}

export function updateMicroCourseProgress(data) {
  if (isDev) {
    return studentMock.updateMicroCourseProgress(data)
  }
  return request.post('/api/course/progress', data)
}

// 音乐调节相关
export function getMusicList() {
  if (isDev) {
    return studentMock.getMusicList()
  }
  return request.get('/api/self-help/list', { params: { type: 'music' } })
}

export function getMusicByEmotion(emotion) {
  if (isDev) {
    return studentMock.getMusicByEmotion(emotion)
  }
  return request.get('/api/self-help/list', { params: { type: 'music', emotion } })
}

export function getMusicDetail(id) {
  if (isDev) {
    return studentMock.getMusicDetail(id)
  }
  return request.get(`/api/self-help/detail?id=${id}`)
}

// 心理健康课程相关
export function getHealthCourseList() {
  if (isDev) {
    return studentMock.getHealthCourseList()
  }
  return request.get('/api/course/list')
}

export function getHealthCourseDetail(id) {
  if (isDev) {
    return studentMock.getHealthCourseDetail(id)
  }
  return request.get(`/api/course/detail?id=${id}`)
}

export function enrollHealthCourse(courseId) {
  if (isDev) {
    return studentMock.enrollHealthCourse(courseId)
  }
  return request.post('/api/course/progress', { courseId, action: 'enroll' })
}

export function getHealthCourseReviews(courseId) {
  if (isDev) {
    return studentMock.getHealthCourseReviews(courseId)
  }
  return request.get('/api/course/detail', { params: { id: courseId, include: 'reviews' } })
}

export function submitHealthCourseReview(data) {
  if (isDev) {
    return studentMock.submitHealthCourseReview(data)
  }
  return request.post('/api/course/progress', { ...data, action: 'review' })
}