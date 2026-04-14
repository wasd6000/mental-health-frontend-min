import request from './request.js'

export function saveConversation(data) {
  return request.post('/api/conversation/save', data)
}
