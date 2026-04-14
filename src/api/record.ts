import request from './request.js'
import { unwrapPageResult } from './psychPlatformAppointment.js'
import { isApiSuccess } from './helpers.js'
import type { AppointmentRecord, RecordStatus } from '../types/record'

function toYmd(d: string | Date | undefined) {
  if (d == null || d === '') return ''
  if (typeof d === 'string') return d.slice(0, 10)
  const dt = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(dt.getTime())) return ''
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function extractAttachmentUrls(payload: any): string[] {
  const raw = payload?.attachments
  if (!Array.isArray(raw)) return []
  return raw
    .map((a: any) => (typeof a === 'string' ? a : a?.url))
    .filter(Boolean)
}

/** 列表/关联：对齐 RecordVO（OpenAPI）并兼容旧页面字段 */
export function normalizeRecordListItem(vo: any) {
  if (!vo || typeof vo !== 'object') return vo
  const st = String(vo.status ?? '').toUpperCase()
  let record_status = vo.record_status
  if (!record_status) {
    if (st === 'DRAFT') record_status = 'pending'
    else if (st === 'SUBMITTED') record_status = 'submitted'
    else record_status = (vo.status || 'pending').toLowerCase()
  }
  const rd = vo.recordDate
  const appointment_date =
    typeof rd === 'string' ? rd.slice(0, 10) : rd != null ? String(rd).slice(0, 10) : ''
  return {
    ...vo,
    appointment_id: vo.appointmentId ?? vo.appointment_id,
    appointment_date: appointment_date || vo.appointment_date,
    student_name: vo.studentName ?? vo.student_name,
    record_status,
  }
}

function mapLegacyStatusToRecordStatus(status?: RecordStatus, payload?: any): string {
  if (payload?.recordStatus) return String(payload.recordStatus)
  const s = String(status ?? '')
  if (s === '未审核' || s === 'submitted') return 'SUBMITTED'
  if (s === '修改待审核' || s === 'pending' || s === 'filled') return 'DRAFT'
  return 'DRAFT'
}

/** GET /api/record/list（OpenAPI + RecordListQueryDTO） */
export async function getRecordsByConsultantAsync(counselorId: string) {
  const res: any = await request.get('/api/record/list', {
    params: {
      counselorId,
      page: 1,
      pageSize: 200,
    },
  })
  const { records } = unwrapPageResult(res)
  return {
    ...res,
    data: records.map(normalizeRecordListItem),
  }
}

/** 别名：历史代码 import 名 */
export const getRecordsByCounselorAsync = getRecordsByConsultantAsync

export async function getRecordsByStudentAsync(studentId: string) {
  const res: any = await request.get('/api/record/list', {
    params: {
      studentId,
      page: 1,
      pageSize: 200,
    },
  })
  const { records } = unwrapPageResult(res)
  return { ...res, data: records.map(normalizeRecordListItem) }
}

/** GET /api/record/detail?id= */
export async function getRecordByIdAsync(id: string) {
  const res: any = await request.get('/api/record/detail', { params: { id } })
  if (!isApiSuccess(res)) return res
  const d = res.data || {}
  const content = d.content ?? d.sessionContent ?? ''
  const consultationDate = d.recordDate ?? d.consultationDate
  return {
    ...res,
    data: {
      ...d,
      appointmentId: d.appointmentId ?? d.appointment_id,
      content,
      sessionContent: d.sessionContent ?? content,
      consultationDate,
      riskAssessment: d.counselorNotes ?? d.riskAssessment,
      counselorName: d.counselorName,
      studentId: d.studentId,
    },
  }
}

/** POST /api/record/create multipart（OpenAPI） */
export async function createRecordAsync(data: Partial<AppointmentRecord> | any) {
  const appointmentId = data.appointmentId ?? data.appointment_id
  if (!appointmentId) {
    return Promise.reject(new Error('预约ID不能为空'))
  }
  const sessionContent = data.content ?? data.sessionContent ?? ''
  if (!String(sessionContent).trim()) {
    return Promise.reject(new Error('咨询内容不能为空'))
  }

  const fd = new FormData()
  fd.append('appointmentId', appointmentId)
  fd.append('recordDate', toYmd(data.consultationDate ?? data.recordDate) || toYmd(new Date()))
  fd.append('sessionNumber', String(data.sessionNumber ?? 1))
  fd.append('presentingProblem', data.presentingProblem ?? '')
  fd.append('sessionContent', String(sessionContent))
  fd.append('counselorObservations', data.counselorObservations ?? '')
  fd.append('interventionMethods', data.interventionMethods ?? '')
  fd.append('homeworkAssignment', data.homeworkAssignment ?? '')
  fd.append('nextSessionPlan', data.nextSessionPlan ?? '')
  fd.append('counselorNotes', data.riskAssessment ?? data.counselorNotes ?? '')
  fd.append('confidentialLevel', data.confidentialLevel ?? 'NORMAL')
  fd.append('recordStatus', data.recordStatus ?? mapLegacyStatusToRecordStatus(undefined, data))

  const file = data.handwrittenRecordFile
  if (file instanceof Blob) {
    fd.append('handwrittenRecordFile', file)
  }

  return request.post('/api/record/create', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** PUT /api/record/update，body: RecordUpdateDTO */
export async function updateRecordAsync(
  id: string,
  status?: RecordStatus,
  payload?: any,
) {
  const p = payload || {}
  const body = {
    recordId: id,
    recordStatus: mapLegacyStatusToRecordStatus(status, p),
    sessionContent: p.content ?? p.sessionContent,
    counselorObservations: p.counselorObservations,
    interventionMethods: p.interventionMethods,
    homeworkAssignment: p.homeworkAssignment,
    nextSessionPlan: p.nextSessionPlan,
    counselorNotes: p.riskAssessment ?? p.counselorNotes,
    presentingProblem: p.presentingProblem,
    confidentialLevel: p.confidentialLevel ?? 'NORMAL',
    attachments: extractAttachmentUrls(p),
  }
  return request.put('/api/record/update', body)
}

/** POST /api/record/autosave?id= （无 id 时走创建草稿） */
export async function autosaveRecordAsync(id: string | null, payload: any) {
  const p = payload || {}
  if (!id) {
    return createRecordAsync({
      ...p,
      recordStatus: 'DRAFT',
    })
  }
  const body = {
    recordId: id,
    sessionContent: p.content ?? p.sessionContent,
    counselorObservations: p.counselorObservations,
    interventionMethods: p.interventionMethods,
    homeworkAssignment: p.homeworkAssignment,
    nextSessionPlan: p.nextSessionPlan,
    counselorNotes: p.riskAssessment ?? p.counselorNotes,
    presentingProblem: p.presentingProblem,
    confidentialLevel: p.confidentialLevel ?? 'NORMAL',
    attachments: extractAttachmentUrls(p),
  }
  return request.post(`/api/record/autosave?id=${encodeURIComponent(id)}`, body)
}

/** 咨询记录修改申请（若后端未实现将 404，保留路径便于后续接） */
export function submitConsultRecordModifyRequest(data: {
  recordId: string
  reason: string
  remark?: string
}) {
  return request.post('/api/counselor/record/modify-request', data)
}
