import request from './request.js'

export function getReportList(params) {
  return request.get('/api/report/list', { params })
}

export function getReportHistory(params) {
  return request.get('/api/report/history', { params })
}

export function postReportPreview(data) {
  return request.post('/api/report/preview', data)
}

export function postReportGenerate(data) {
  return request.post('/api/report/generate', data)
}

/** 文档 12.1 */
export function getMonthlyReport(params) {
  return request.get('/api/report/monthly', { params })
}

/** 文档 12.2 */
export function getReportDownloadUrl(id) {
  return `/api/report/download/${id}`
}
