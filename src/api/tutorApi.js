import request from './request.js'

/**
 * 获取辅导员学生列表
 * GET /api/tutor/students
 */
export function getTutorStudents(params = {}) {
  return request.get('/api/tutor/students', { params })
}

/**
 * 获取辅导员测评列表
 * GET /api/tutor/assessments
 */
export function getTutorAssessments(params = {}) {
  return request.get('/api/tutor/assessments', { params })
}

/**
 * 获取辅导员工作台统计
 * GET /api/tutor/workbench/stats
 */
export function getTutorWorkbenchStats() {
  return request.get('/api/tutor/workbench/stats')
}

/**
 * 获取访谈任务列表
 * GET /api/tutor/interviews/tasks
 */
export function getInterviewTasks(params = {}) {
  return request.get('/api/tutor/interviews/tasks', { params })
}

/**
 * 创建访谈任务
 * POST /api/tutor/interviews/tasks
 */
export function createInterviewTask(data) {
  return request.post('/api/tutor/interviews/tasks', data)
}

/**
 * 获取访谈记录列表
 * GET /api/tutor/interviews/records
 */
export function getInterviewRecords(params = {}) {
  return request.get('/api/tutor/interviews/records', { params })
}
