import request from './request.js'

// 心理微课相关
export function getMicroCourseList() {
  return request.get('/api/course/my-list')
}

export function getMicroCourseDetail(id) {
  return request.get(`/api/course/detail?id=${id}`)
}

export function updateMicroCourseProgress(data) {
  return request.post('/api/course/progress', data)
}

// 音乐调节相关
export function getMusicList() {
  return request.get('/api/self-help/list', { params: { type: 'music' } })
}

export function getMusicByEmotion(emotion) {
  return request.get('/api/self-help/list', { params: { type: 'music', emotion } })
}

export function getMusicDetail(id) {
  return request.get(`/api/self-help/detail?id=${id}`)
}

// 心理健康课程相关
export function getHealthCourseList() {
  return request.get('/api/course/list')
}

export function getHealthCourseDetail(id) {
  return request.get(`/api/course/detail?id=${id}`)
}

export function enrollHealthCourse(courseId) {
  return request.post('/api/course/progress', { courseId, action: 'enroll' })
}

export function getHealthCourseReviews(courseId) {
  return request.get('/api/course/detail', { params: { id: courseId, include: 'reviews' } })
}

export function submitHealthCourseReview(data) {
  return request.post('/api/course/progress', { ...data, action: 'review' })
}