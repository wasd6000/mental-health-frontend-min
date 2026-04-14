import request from './request.js'
import * as parentMock from '../mock/parent.ts'

/**
 * 仅当 VITE_USE_MOCK_PARENT=true 时使用家长端 mock。
 * 开发环境默认走真实接口（/api/parent/...），以便与 psychological_platform 联调双向绑定。
 */
function useMockParent() {
  return (
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_USE_MOCK_PARENT === 'true'
  )
}

function useParentApiFallback() {
  return (
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_PARENT_API_FALLBACK === 'true'
  )
}

async function parentOrMock(mockFn, apiFn) {
  if (useMockParent()) return mockFn()
  try {
    return await apiFn()
  } catch (e) {
    if (useParentApiFallback()) {
      console.warn('[parent] 接口失败，已使用本地演示数据', e)
      return mockFn()
    }
    throw e
  }
}

export function getParentCounselor(studentId) {
  return parentOrMock(
    () => parentMock.getParentCounselor(studentId),
    () => request.get('/api/parent/counselor', { params: { studentId } })
  )
}

export function sendParentMessage(data) {
  return parentOrMock(
    () => parentMock.sendParentMessage(data),
    () => request.post('/api/parent/message/send', data)
  )
}

export function getParentMessages(params) {
  return parentOrMock(
    () => parentMock.getParentMessages(params),
    () => request.get('/api/parent/message/list', { params })
  )
}

/** 子女列表（对齐 /api/parent/children/list） */
export function getChildrenList() {
  return parentOrMock(
    () => parentMock.getChildrenList(),
    () => request.get('/api/parent/children/list')
  )
}

/** POST /api/parent/children/bind，请求体对齐 ParentBindChildDTO（studentId / studentName / relationType / verificationInfo） */
export function bindChild(data) {
  return parentOrMock(
    () => parentMock.bindChild(data),
    () =>
      request.post('/api/parent/children/bind', {
        studentId: data?.studentId ?? '',
        studentName: data?.studentName ?? '',
        relationType: data?.relationType ?? '',
        verificationInfo: data?.verificationInfo ?? '',
      })
  )
}

export function unbindChild(childId) {
  return parentOrMock(
    () => parentMock.unbindChild(childId),
    () =>
      request.post('/api/parent/children/unbind', null, {
        params: { childId },
      })
  )
}

/** 学生发起绑定后，家长端待确认列表（规划：双向确认） */
export function getPendingParentBinds() {
  return parentOrMock(
    () => parentMock.getPendingParentBinds(),
    () => request.get('/api/parent/children/pending-bind')
  )
}

export function confirmParentBind(requestId) {
  return parentOrMock(
    () => parentMock.confirmParentBind(requestId),
    () => request.post('/api/parent/children/confirm-bind', { requestId })
  )
}

export function rejectParentBind(requestId) {
  return parentOrMock(
    () => parentMock.rejectParentBind(requestId),
    () => request.post('/api/parent/children/reject-bind', { requestId })
  )
}

export function getChildAssessments(studentId) {
  return parentOrMock(
    () => parentMock.getChildAssessments(studentId),
    () =>
      request.get('/api/parent/children/assessments', {
        params: { studentId, page: 1, pageSize: 100 }
      })
  )
}

export function getChildAppointments(studentId) {
  return parentOrMock(
    () => parentMock.getChildAppointments(studentId),
    () =>
      request.get('/api/parent/children/appointments', {
        params: { studentId, page: 1, pageSize: 100 }
      })
  )
}

export function getChildActivities(studentId) {
  return parentOrMock(
    () => parentMock.getChildActivities(studentId),
    () =>
      request.get('/api/parent/children/activities', {
        params: { studentId, page: 1, pageSize: 100 }
      })
  )
}

/** 成长档案（对齐 /api/parent/children/detail） */
export function getChildProfile(studentId) {
  return parentOrMock(
    () => parentMock.getChildProfile(studentId),
    () => request.get('/api/parent/children/detail', { params: { studentId } })
  )
}
