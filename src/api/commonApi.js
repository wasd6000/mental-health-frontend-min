import request from './request.js'

export function getCollegeOptions(params) {
  return request.get('/api/common/colleges', { params })
}

/** 文档 16.1 */
export function uploadCommonFile(file, fieldName = 'file', folder = 'common') {
  const form = new FormData()
  form.append(fieldName, file)
  return request.post('/api/common/upload', form, {
    params: { folder },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 文档 16.1（图片上传） */
export function uploadCommonImage(file, fieldName = 'file') {
  const form = new FormData()
  form.append(fieldName, file)
  return request.post('/api/common/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** 文档 16.2 */
export function submitFeedback(data) {
  return request.post('/api/feedback', data)
}
