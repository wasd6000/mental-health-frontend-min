import request from './request.js'

/**
 * 危机干预模块 API
 */

// ==================== 危机评估管理 ====================

/**
 * 创建危机评估
 * POST /api/crisis/evaluation
 */
export function createCrisisEvaluation(data) {
  return request.post('/api/crisis/evaluation', data, {
    headers: {
      'X-User-Id': data.evaluatorId || localStorage.getItem('userId')
    }
  })
}

/**
 * 查询危机评估
 * GET /api/crisis/evaluation/{reportId}
 */
export function getCrisisEvaluation(reportId) {
  return request.get(`/api/crisis/evaluation/${reportId}`)
}

/**
 * 更新危机评估
 * PUT /api/crisis/evaluation/{evaluationId}
 */
export function updateCrisisEvaluation(evaluationId, data) {
  return request.put(`/api/crisis/evaluation/${evaluationId}`, data)
}

// ==================== 危机干预团队管理 ====================

/**
 * 创建干预团队
 * POST /api/crisis/team
 */
export function createInterventionTeam(data) {
  return request.post('/api/crisis/team', data)
}

/**
 * 查询干预团队
 * GET /api/crisis/team/{reportId}
 */
export function getInterventionTeam(reportId) {
  return request.get(`/api/crisis/team/${reportId}`)
}

/**
 * 添加团队成员
 * POST /api/crisis/team/member
 */
export function addTeamMember(data) {
  return request.post('/api/crisis/team/member', data)
}

/**
 * 移除团队成员
 * DELETE /api/crisis/team/member/{memberId}
 */
export function removeTeamMember(memberId) {
  return request.delete(`/api/crisis/team/member/${memberId}`)
}

/**
 * 更新团队成员信息
 * PUT /api/crisis/team/member/{memberId}
 */
export function updateTeamMember(memberId, data) {
  return request.put(`/api/crisis/team/member/${memberId}`, data)
}

// ==================== 危机进展跟踪 ====================

/**
 * 创建进展记录
 * POST /api/crisis/progress
 */
export function createProgressRecord(data) {
  return request.post('/api/crisis/progress', data)
}

/**
 * 查询进展列表
 * GET /api/crisis/progress/{reportId}
 */
export function getProgressList(reportId) {
  return request.get(`/api/crisis/progress/${reportId}`)
}

/**
 * 更新进展记录
 * PUT /api/crisis/progress/{progressId}
 */
export function updateProgressRecord(progressId, data) {
  return request.put(`/api/crisis/progress/${progressId}`, data)
}

/**
 * 删除进展记录
 * DELETE /api/crisis/progress/{progressId}
 */
export function deleteProgressRecord(progressId) {
  return request.delete(`/api/crisis/progress/${progressId}`)
}

// ==================== 谈话记录管理 ====================

/**
 * 创建谈话记录
 * POST /api/crisis/talk-record
 */
export function createTalkRecord(data) {
  return request.post('/api/crisis/talk-record', data)
}

/**
 * 按报告查询谈话记录
 * GET /api/crisis/talk-record/report/{reportId}
 */
export function getTalkRecordsByReport(reportId) {
  return request.get(`/api/crisis/talk-record/report/${reportId}`)
}

/**
 * 按学生查询谈话记录
 * GET /api/crisis/talk-record/student/{studentId}
 */
export function getTalkRecordsByStudent(studentId) {
  return request.get(`/api/crisis/talk-record/student/${studentId}`)
}

/**
 * 更新谈话记录
 * PUT /api/crisis/talk-record/{talkRecordId}
 */
export function updateTalkRecord(talkRecordId, data) {
  return request.put(`/api/crisis/talk-record/${talkRecordId}`, data)
}

/**
 * 删除谈话记录
 * DELETE /api/crisis/talk-record/{talkRecordId}
 */
export function deleteTalkRecord(talkRecordId) {
  return request.delete(`/api/crisis/talk-record/${talkRecordId}`)
}

// ==================== 危机结案管理 ====================

/**
 * 创建结案记录
 * POST /api/crisis/closure
 */
export function createClosureRecord(data) {
  return request.post('/api/crisis/closure', data)
}

/**
 * 查询结案记录
 * GET /api/crisis/closure/{reportId}
 */
export function getClosureRecord(reportId) {
  return request.get(`/api/crisis/closure/${reportId}`)
}

/**
 * 更新结案记录
 * PUT /api/crisis/closure/{closureId}
 */
export function updateClosureRecord(closureId, data) {
  return request.put(`/api/crisis/closure/${closureId}`, data)
}

/**
 * 删除结案记录
 * DELETE /api/crisis/closure/{closureId}
 */
export function deleteClosureRecord(closureId) {
  return request.delete(`/api/crisis/closure/${closureId}`)
}

// ==================== 枚举值映射 ====================

/**
 * 危机等级映射
 */
export const CRISIS_LEVEL_MAP = {
  LOW: { label: '低', color: '#16a34a', bgColor: '#f0fdf4' },
  MODERATE: { label: '中', color: '#eab308', bgColor: '#fefce8' },
  HIGH: { label: '高', color: '#f59e0b', bgColor: '#fffbeb' },
  SEVERE: { label: '严重', color: '#dc2626', bgColor: '#fef2f2' }
}

/**
 * 进展类型映射
 */
export const PROGRESS_TYPE_MAP = {
  INTERVIEW: { label: '面谈', color: '#3b82f6' },
  PHONE_CALL: { label: '电话沟通', color: '#8b5cf6' },
  HOME_VISIT: { label: '家访', color: '#10b981' },
  MEETING: { label: '会议', color: '#f59e0b' },
  OTHER: { label: '其他', color: '#6b7280' }
}

/**
 * 当前状态映射
 */
export const CURRENT_STATUS_MAP = {
  IMPROVING: { label: '好转', color: '#16a34a' },
  STABLE: { label: '稳定', color: '#3b82f6' },
  WORSENING: { label: '恶化', color: '#f59e0b' },
  URGENT: { label: '紧急', color: '#dc2626' }
}

/**
 * 谈话类型映射
 */
export const TALK_TYPE_MAP = {
  FACE_TO_FACE: { label: '面对面', color: '#3b82f6' },
  PHONE: { label: '电话', color: '#8b5cf6' },
  ONLINE: { label: '线上', color: '#10b981' },
  OTHER: { label: '其他', color: '#6b7280' }
}

/**
 * 结案类型映射
 */
export const CLOSURE_TYPE_MAP = {
  RESOLVED: { label: '已解决', color: '#16a34a' },
  TRANSFERRED: { label: '已转介', color: '#3b82f6' },
  GRADUATED: { label: '毕业离校', color: '#8b5cf6' },
  DROPPED: { label: '退学', color: '#ef4444' },
  OTHER: { label: '其他', color: '#6b7280' }
}

/**
 * 团队成员角色映射
 */
export const MEMBER_ROLE_MAP = {
  LEADER: { label: '负责人', color: '#f59e0b' },
  COUNSELOR: { label: '咨询师', color: '#3b82f6' },
  TEACHER: { label: '辅导员', color: '#10b981' },
  PARENT: { label: '家长', color: '#8b5cf6' },
  OTHER: { label: '其他', color: '#6b7280' }
}