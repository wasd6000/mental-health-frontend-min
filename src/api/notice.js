// src/api/notice.js
import request from './request.js'

/**
 * 获取公告列表
 */
export function getNoticeList(params = {}) {
  return request.get('/api/notice/list', {
    params: {
      page: 1,
      pageSize: 20,
      ...params
    }
  })
}

/**
 * 获取公告详情
 */
export function getNoticeDetail(id) {
  // 公告模块使用自增 ID，转换为数字
  const numericId = Number(id)
  const normalizedId = isNaN(numericId) ? id : numericId

  return request.get('/api/notice/detail', {
    params: { id: normalizedId }
  })
}

/**
 * 创建公告
 */
export function createNotice(data) {
  return request.post('/api/notice', data)
}

/**
 * 更新公告
 */
export function updateNotice(id, data) {
  return request.put(`/api/notice/${id}`, data)
}

/**
 * 删除公告
 */
export function deleteNotice(id) {
  return request.delete(`/api/notice/${id}`)
}
