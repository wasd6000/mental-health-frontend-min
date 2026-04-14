import request from './request.js'

/** OpenAPI: POST /api/consulate/setConsultationTime，body: ConsultationScheduleDTO */
export function setConsultationTime(data) {
  return request.post('/api/consulate/setConsultationTime', data)
}

/** OpenAPI: POST /api/consulate/list，body: PageQueryDTO → PageResult */
export function fetchConsulateCounselorList(data = {}) {
  const body = {
    page: data.page ?? 1,
    pageSize: data.pageSize ?? 20,
    ...data,
  }
  return request.post('/api/consulate/list', body)
}

/** GET /api/consulate/detail?counselorId= */
export function fetchCounselorDetail(counselorId) {
  return request.get('/api/consulate/detail', {
    params: { counselorId },
  })
}
