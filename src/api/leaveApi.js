import request from './request.js'
import { unwrapPageResult } from './psychPlatformAppointment.js'

/**
 * 咨询师请假管理 API
 */

// ==================== 咨询师端接口 ====================

/**
 * 提交请假申请
 * 兼容两套后端实现：
 * - 咨询师：POST /api/counselor/leave/apply（需 counselorId）
 * - 其它：POST /api/leave/apply（LeaveApplyDTO）
 */
export function submitLeave(data) {
  const role =
    (typeof localStorage !== 'undefined' &&
      (localStorage.getItem('admin_role') || localStorage.getItem('user_role'))) ||
    ''

  // 兼容当前后端：/api/leave/apply 在咨询师场景会走 counselor_info.user_id 查询，库表不存在该列时会 500
  if (String(role).toLowerCase() === 'counselor') {
    const counselorId =
      (typeof localStorage !== 'undefined' &&
        (localStorage.getItem('userId') ||
          localStorage.getItem('user_id') ||
          localStorage.getItem('counselorId') ||
          localStorage.getItem('counselor_id'))) ||
      ''

    return request.post('/api/counselor/leave/apply', {
      counselorId,
      leaveType: data?.leaveType,
      reason: data?.reason,
      startTime: data?.startTime,
      endTime: data?.endTime,
      leaveDate: data?.leaveDate,
    })
  }

  return request.post('/api/leave/apply', {
    leaveType: data?.leaveType,
    reason: data?.reason,
    startTime: data?.startTime,
    endTime: data?.endTime,
    leaveDate: data?.leaveDate,
  })
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
  // 从多个可能的存储位置获取审批人ID
  const approverId =
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id') ||
      localStorage.getItem('admin_user_id') ||
      localStorage.getItem('counselorId') ||
      localStorage.getItem('counselor_id') ||
      ''

  console.log('🔍 审批请求调试信息:', {
    leaveId,
    approverId,
    userId: localStorage.getItem('userId'),
    user_id: localStorage.getItem('user_id'),
    admin_user_id: localStorage.getItem('admin_user_id'),
    counselorId: localStorage.getItem('counselorId'),
    counselor_id: localStorage.getItem('counselor_id'),
    requestBody: {
      approverId,
      ...data
    }
  })

  if (!approverId) {
    console.error('❌ 错误：审批人ID为空，请重新登录')
    throw new Error('审批人ID不能为空，请重新登录')
  }

  return request.put(`/api/counselor/leave/${leaveId}/approve`, {
    status: 'APPROVED',
    ...data
  }, {
    headers: {
      'X-User-Id': approverId
    }
  })
}

/**
 * 拒绝请假
 * PUT /api/counselor/leave/{leaveId}/reject
 */
export function rejectLeave(leaveId, data) {
  // 从多个可能的存储位置获取审批人ID
  const approverId =
      localStorage.getItem('userId') ||
      localStorage.getItem('user_id') ||
      localStorage.getItem('admin_user_id') ||
      localStorage.getItem('counselorId') ||
      localStorage.getItem('counselor_id') ||
      ''

  console.log('🔍 拒绝请求调试信息:', {
    leaveId,
    approverId,
    userId: localStorage.getItem('userId'),
    user_id: localStorage.getItem('user_id'),
    admin_user_id: localStorage.getItem('admin_user_id'),
    counselorId: localStorage.getItem('counselorId'),
    counselor_id: localStorage.getItem('counselor_id'),
    requestBody: {
      approverId,
      ...data
    }
  })

  if (!approverId) {
    console.error('❌ 错误：审批人ID为空，请重新登录')
    throw new Error('审批人ID不能为空，请重新登录')
  }

  return request.put(`/api/counselor/leave/${leaveId}/reject`, {
    status: 'REJECTED',
    ...data
  }, {
    headers: {
      'X-User-Id': approverId
    }
  })
}

/**
 * 拒绝请假（兼容旧接口）
 * POST /api/leave/reject
 * @deprecated 请使用 rejectLeave(leaveId, data)
 */
export function rejectLeaveLegacy(data) {
  return request.post('/api/leave/reject', data)
}

/**
 * 查询审批列表（待审批/已处理）
 * GET /api/counselor/leave/approval/list
 * @param {Object} params - 查询参数
 * @param {string} params.status - 状态筛选：pending/approved/rejected
 */
export function getLeaveApprovalList(params = {}) {
  return request.get('/api/counselor/leave/approval/list', { params })
}

/**
 * 查询已处理的请假列表
 * GET /api/counselor/leave/processed
 * @param {Object} params - 查询参数
 * @param {string} params.status - 状态筛选：approved/rejected
 */
export function getProcessedLeaveList(params = {}) {
  return request.get('/api/counselor/leave/processed', { params })
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
