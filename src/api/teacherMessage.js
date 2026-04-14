import request from './request.js'

/** 文档 十四 */
export function getTeacherMessageInbox() {
  return request.get('/api/teacher/message/inbox')
}

export function replyTeacherMessage(data) {
  return request.post('/api/teacher/message/reply', data)
}
