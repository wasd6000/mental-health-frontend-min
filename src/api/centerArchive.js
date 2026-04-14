import request from './request.js'

/** 文档 11.3 建议路径；若后端仍用档案接口可二选一实现 */
export function getStudentList(params) {
  return request.get('/api/student/list', { params })
}

export function getArchiveStudents(params) {
  return request.get('/api/center/archive/students', { params })
}

export function getArchiveCounselors(params) {
  return request.get('/api/center/archive/counselors', { params })
}

export function getArchiveStudentDetail(params) {
  return request.get('/api/center/archive/student/detail', { params })
}

export function getCenterApprovalList(params) {
  return request.get('/api/center/approval/list', { params })
}
