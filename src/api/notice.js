import request from './request.js'

/** GET /api/notice/list */
export function getNoticeList(params) {
  return request.get('/api/notice/list', { params })
}

/** GET /api/notice/detail */
export function getNoticeDetail(params) {
  return request.get('/api/notice/detail', { params })
}
