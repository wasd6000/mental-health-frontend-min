import request from './request.js'
import { unwrapPageResult } from './psychPlatformAppointment.js'
import { isApiSuccess } from './helpers.js'

/**
 * 将后端 CrisisReportVO / OpenAPI CrisisReportVO 转为危机列表页使用的行结构
 */
export function normalizeCrisisReportVo(vo) {
  if (!vo) return null
  if (vo.studentInfo && (vo.reportId || vo.id)) return vo
  const levelRaw = String(vo.crisisLevel || vo.level || 'blue').toLowerCase()
  const okLevels = ['red', 'orange', 'yellow', 'blue', 'green']
  const level = okLevels.includes(levelRaw) ? levelRaw : 'blue'
  const reportStatus = vo.reportStatus|| 'processing'
  const uiStatus = reportStatus === 'closed' ? 'closed' : 'processing'

  const typeLabel =
    REPORT_TYPE_LABELS[vo.reportType] || vo.reportType || vo.typeLabel || '—'

  return {
    apiReportType: vo.reportType,
    id: vo.reportId,
    reportId: vo.reportId,
    caseNo: vo.reportId || vo.caseNo,
    level,
    status: uiStatus,
    reportStatus,
    typeLabel,
    studentInfo: {
      name: vo.studentName || '—',
      studentId: vo.studentId || '',
      college: vo.college || '',
      avatar: vo.avatar || '',
    },
    reporterName: vo.reporter || '—',
    reporterRole: '上报人',
    reportTime: vo.createdAt,
    discoverTime: vo.createdAt,
    discoverSource: '',
    description: vo.incidentDescription || '',
    initialMeasures: '',
    emergencyContacts: [],
    interventionTeam: [],
    interventionRecords: [],
    levelHistory: [],
  }
}

const REPORT_TYPE_LABELS = {
  SUICIDAL: '自杀风险',
  VIOLENT: '暴力倾向',
  SELF_HARM: '自伤行为',
  OTHER: '其他',
  suicide: '自杀倾向',
  self_harm: '自伤行为',
}

/** 列表筛选项 → report_status（OpenAPI: processing / closed） */
export function mapUiCrisisStatusToReportStatus(uiStatus) {
  if (!uiStatus) return undefined
  if (uiStatus === 'closed') return 'closed'
  return 'processing'
}

/**
 * GET /api/crisis/list
 * query: page, pageSize, college, crisis_level, report_status（与 CrisisListQueryDTO 一致）
 */
export async function getCrisisList(params = {}) {
  const query = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  }
  const college = params.college ?? params.keyword
  if (college) query.college = college

  const crisis_level = params.crisis_level ?? params.level
  if (crisis_level) query.crisis_level = crisis_level

  let report_status = params.report_status
  if (report_status == null && params.status != null && params.status !== '') {
    report_status = mapUiCrisisStatusToReportStatus(params.status)
  }
  if (report_status) query.report_status = report_status

  const res = await request.get('/api/crisis/list', { params: query })
  const { total, records } = unwrapPageResult(res)
  const raw = Array.isArray(records) ? records.filter(Boolean) : []
  const list = raw.map(normalizeCrisisReportVo).filter(Boolean)
  return {
    ...res,
    data: { list, total: Number(total) || list.length, records: list },
  }
}

export function getCrisisDetail(params) {
  return request.get('/api/crisis/detail', { params: { id: params.id } })
}

/**
 * OpenAPI: CrisistLevelDTO { reportId, crisisLevel }
 * 列表页调级使用五色等级 red/orange/yellow/blue/green（与 query 参数 crisis_level 一致）
 */
export function updateCrisisLevel(data) {
  return request.post('/api/crisis/update-level', {
    reportId: data.reportId || data.id,
    crisisLevel: data.crisisLevel || data.level,
  })
}

/**
 * OpenAPI: CrisisReportCreateDTO（后端会在 service 内生成 reportId，无需前端传）
 */
export function reportCrisis(data) {
  return request.post('/api/crisis/report', data)
}

/** 危机上报表单 → 后端 DTO（TutorCrisisReport 等） */
export function buildCrisisReportCreateBody(form) {
  const typeMap = {
    suicide: 'SUICIDAL',
    self_harm: 'SELF_HARM',
    depression: 'OTHER',
    anxiety: 'OTHER',
    mental: 'OTHER',
    violence: 'VIOLENT',
    other: 'OTHER',
  }
  const levelMap = {
    red: 'SEVERE',
    orange: 'HIGH',
    yellow: 'MODERATE',
    blue: 'LOW',
  }
  const meta = [
    form.studentName && `姓名：${form.studentName}`,
    form.gender && `性别：${form.gender}`,
    form.className && `班级：${form.className}`,
    form.phone && `电话：${form.phone}`,
    form.dorm && `宿舍：${form.dorm}`,
    form.discoverTime && `发现时间：${form.discoverTime}`,
    form.emergencyContact && `紧急联系人：${form.emergencyContact}`,
    form.emergencyPhone && `联系人电话：${form.emergencyPhone}`,
    form.emergencyRelation && `关系：${form.emergencyRelation}`,
    form.notifiedParent != null && `是否已通知家长：${form.notifiedParent ? '是' : '否'}`,
  ]
    .filter(Boolean)
    .join('；')

  const incidentDescription = [form.description, meta].filter(Boolean).join('\n')

  return {
    appointmentId: form.appointmentId || undefined,
    counselorId: form.counselorId || undefined,
    studentId: form.studentId,
    reportType: typeMap[form.type] || 'OTHER',
    crisisLevel: levelMap[form.level] || 'MODERATE',
    incidentDescription,
    riskAssessment: form.riskAssessment || '',
    immediateActions: form.measures || '',
    recommendedActions: form.recommendedActions || '',
    handwrittenReportUrl: form.handwrittenReportUrl || undefined,
  }
}

export { isApiSuccess }

export function addCrisisIntervention(data) {
  return request.post('/api/crisis/intervention/add', data)
}

export function updateCrisisRecord(data) {
  return request.post('/api/crisis/update-record', data)
}

export function approveCrisisReport(data) {
  return request.post('/api/center/approval/crisis/approve', data)
}

export function rejectCrisisReport(data) {
  return request.post('/api/center/approval/crisis/reject', data)
}

export function getLeaderCrisisApprovalList(params) {
  return request.get('/api/center/approval/crisis/list', { params })
}
