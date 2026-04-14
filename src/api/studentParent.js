import request from './request.js'
import * as mock from '../mock/studentFamily.ts'

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV

function useMock() {
  return (
    isDev ||
    (import.meta.env && import.meta.env.VITE_USE_MOCK_STUDENT_PARENT === 'true')
  )
}

/** 我发起的家长关联记录 */
export function listStudentParentInvites() {
  if (useMock()) return mock.listStudentParentInvites()
  return request.get('/api/student/parent-bind/list')
}

/** 学生发起绑定家长（手机号/统一身份账号以学校为准） */
export function createStudentParentInvite(data) {
  if (useMock()) return mock.createStudentParentInvite(data)
  return request.post('/api/student/parent-bind/invite', data)
}
