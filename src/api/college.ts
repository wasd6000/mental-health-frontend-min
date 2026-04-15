import request from './request.js'

/**
 * 获取学院列表
 */
export function getCollegeList() {
  return request.get('/api/college/list')
}

/**
 * 获取专业列表
 */
export function getMajorList(collegeId?: number) {
  return request.get('/api/college/major/list', {
    params: { collegeId }
  })
}

/**
 * 获取班级列表
 */
export function getClassList(collegeId?: number, gradeId?: number) {
  return request.get('/api/college/class/list', {
    params: { collegeId, gradeId }
  })
}
