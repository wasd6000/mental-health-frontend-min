import request from './request.js'

/** 当前用户信息（文档 2.4.1） */
export function getCurrentUserInfo() {
  return request.get('/api/user/info')
}

/** 更新用户（文档 2.4.2） */
export function updateUserProfile(body) {
  return request.put('/api/user/update', body)
}

/**
 * 头像上传（文档 2.5，multipart）
 * 字段名 avatar
 */
export function uploadAvatar(file) {
  const form = new FormData()
  form.append('avatar', file)
  return request.post('/user/upload-avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
