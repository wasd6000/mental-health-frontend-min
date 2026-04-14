import request from './request.js'

export function getSystemConfig() {
  return request.get('/api/admin/config/system')
}

export function saveSystemConfig(data) {
  return request.put('/api/admin/config/system', data)
}
