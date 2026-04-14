import request from './request.js'
import { unwrapPageResult } from './psychPlatformAppointment.js'

/** 咨询师提交请假申请（LeaveApplyDTO：leaveType, reason, startTime, endTime 为 ISO_LOCAL_DATE_TIME） */
export function submitLeave(data) {
  return request.post('/api/leave/apply', data)
}

export function getLeaveList(params = {}) {
  return request.get('/api/leave/list', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      ...params,
    },
  })
}

/** 解析 R.data 为 PageResult：{ total, records } */
export function parseLeavePage(res) {
  return unwrapPageResult(res)
}

export function getLeaveApprovalList(params) {
  return request.get('/api/leave/approval/list', { params })
}

export function approveLeave(data) {
  return request.post('/api/leave/approve', data)
}

export function rejectLeave(data) {
  return request.post('/api/leave/reject', data)
}

export function cancelLeave(data) {
  const leaveId = data?.leaveId ?? data?.id
  const reason = data?.reason
  return request.post('/api/leave/cancel', null, {
    params: {
      leaveId,
      ...(reason != null && reason !== '' ? { reason } : {}),
    },
  })
}
