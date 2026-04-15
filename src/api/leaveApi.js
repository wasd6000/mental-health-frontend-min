import request from './request.js'
import { unwrapPageResult } from './psychPlatformAppointment.js'

/**
 * 咨询师请假管理 API
 */

// ==================== 咨询师端接口 ====================

/**
 * 提交请假申请
 * POST /api/counselor/leave/apply
 */
export function submitLeave(data) {
  return request.post('/api/counselor/leave/apply', data)
}

/**
 * 查询我的请假列表
 * GET /api/counselor/leave/my/{counselorId}
 */
export function getMyLeaveList(counselorId) {
  return request.get(`/api/counselor/leave/my/${counselorId}`)
}

/**
 * 查询请假详情
 * GET /api/counselor/leave/{leaveId}
 */
export function getLeaveDetail(leaveId) {
  return request.get(`/api/counselor/leave/${leaveId}`)
}

/**
 * 更新请假申请
 * PUT /api/counselor/leave/{leaveId}
 */
export function updateLeave(leaveId, data) {
  return request.put(`/api/counselor/leave/${leaveId}`, data)
}

/**
 * 取消请假
 * PUT /api/counselor/leave/{leaveId}/cancel
 */
export function cancelLeave(leaveId, data) {
  return request.put(`/api/counselor/leave/${leaveId}/cancel`, data || {})
}

// ==================== 管理员/心理中心接口 ====================

/**
 * 审批请假
 * PUT /api/counselor/leave/{leaveId}/approve
 */
export function approveLeave(leaveId, data) {
  return request.put(`/api/counselor/leave/${leaveId}/approve`, data, {
    headers: {
      'X-User-Id': localStorage.getItem('userId')
    }
  })
}

/**
 * 查询审批列表
 * GET /api/counselor/leave/approval/list
 */
export function getLeaveApprovalList(params = {}) {
  return request.get('/api/counselor/leave/approval/list', { params })
}

/**
 * 拒绝请假（兼容旧接口）
 * POST /api/leave/reject
 */
export function rejectLeave(data) {
  return request.post('/api/leave/reject', data)
}

// ==================== 枚举值映射 ====================

/**
 * 请假类型映射
 */
export const LEAVE_TYPE_MAP = {
  SICK: { label: '病假', color: '#ef4444' },
  PERSONAL: { label: '事假', color: '#f59e0b' },
  ANNUAL: { label: '年假', color: '#3b82f6' },
  OTHER: { label: '其他', color: '#6b7280' }
}

/**
 * 请假状态映射
 */
export const LEAVE_STATUS_MAP = {
  PENDING: { label: '待审批', color: '#f59e0b', tagType: 'warning' },
  APPROVED: { label: '已批准', color: '#16a34a', tagType: 'success' },
  REJECTED: { label: '已拒绝', color: '#ef4444', tagType: 'danger' },
  CANCELLED: { label: '已取消', color: '#6b7280', tagType: 'info' }
}
