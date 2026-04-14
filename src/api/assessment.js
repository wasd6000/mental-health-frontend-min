import request from './request.js'
import { isApiSuccess, unwrapListPayload } from './helpers.js'
import * as studentMock from '../mock/student.ts'

/** 设为 true 时走本地 mock（仅开发调 UI）；默认走真实接口 */
const useMockStudentAssessment =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.VITE_USE_MOCK_STUDENT_ASSESSMENT === 'true'

export function getMyAssessments(params) {
  if (useMockStudentAssessment) {
    return studentMock.getMyAssessments(params)
  }
  return request.get('/api/assessment/my-list', { params })
}

/**
 * 获取测评题目骨架：优先量表详情，失败则尝试 detail 查询参数
 */
export async function getAssessmentDetail(id) {
  if (useMockStudentAssessment) {
    return studentMock.getAssessmentDetail(id)
  }
  try {
    return await request.get(`/api/assessment/scales/${encodeURIComponent(id)}`)
  } catch (_) {
    return request.get('/api/assessment/detail', { params: { id } })
  }
}

export function startAssessment(data) {
  if (useMockStudentAssessment) {
    return studentMock.startAssessment(data)
  }
  return request.post('/api/assessment/start', data)
}

export function submitAssessment(data) {
  if (useMockStudentAssessment) {
    return studentMock.submitAssessment(data)
  }
  return request.post('/api/assessment/submit', data)
}

export function getAssessmentResult(id) {
  if (useMockStudentAssessment) {
    return studentMock.getAssessmentResult(id)
  }
  return request.get('/api/assessment/result', { params: { id } })
}

/**
 * 测评列表（管理端/咨询师端 «心理普查» 等）
 * GET /api/assessment/list — 返回 R，data 多为 { total, records } 或直接为数组
 */
export function getAssessmentList(params) {
  return request.get('/api/assessment/list', { params })
}

/**
 * 测评方案详情（管理端/咨询师端）
 * GET /api/assessment/detail — params: planId 或 id
 */
export function getAssessmentPlanDetail(planId) {
  if (!planId) {
    return Promise.reject(new Error('缺少 planId'))
  }
  return request.get('/api/assessment/detail', { params: { planId } })
}

/** psychological_platform AssessmentPlanVO：status 0 草稿 / 1 进行中 / 2 已结束 */
const PLAN_STATUS_LABEL = {
  0: '草稿',
  1: '进行中',
  2: '已结束',
}

function mapRowToSurveyItem(row) {
  if (!row || typeof row !== 'object') {
    return { id: '', name: '', date: '', status: '' }
  }
  const id = row.planId ?? row.id ?? row.assessmentId ?? row.scaleId ?? ''
  const name =
    row.planName ?? row.scaleName ?? row.title ?? row.name ?? row.assessmentName ?? ''
  const rawDate =
    row.startTime ?? row.endTime ?? row.date ?? row.createdAt ?? row.createTime ?? row.publishTime ?? ''
  const dateStr =
    rawDate == null || rawDate === ''
      ? ''
      : typeof rawDate === 'string'
        ? rawDate.slice(0, 10)
        : String(rawDate)
  const st = row.status
  let status = ''
  if (st == null || st === '') status = ''
  else if (typeof st === 'string') status = st
  else if (typeof st === 'number') status = PLAN_STATUS_LABEL[st] ?? String(st)
  else status = String(st)
  return { id: String(id), name: String(name), date: dateStr, status }
}

/**
 * @param {{ page?: number, pageSize?: number } & Record<string, any>} [params]
 * @returns {Promise<{ records: Array<{ id: string, name: string, date: string, status: string }>, total: number }>}
 */
export async function getSurveyList(params = {}) {
  const res = await getAssessmentList(params)
  if (!isApiSuccess(res)) {
    const errMsg = res?.msg ?? res?.message ?? '加载测评列表失败'
    throw new Error(errMsg)
  }
  const payload = res.data
  const recordsRaw = unwrapListPayload(payload)
  const total =
    payload != null && typeof payload === 'object' && !Array.isArray(payload) && payload.total != null
      ? Number(payload.total)
      : recordsRaw.length
  return {
    records: recordsRaw.map(mapRowToSurveyItem),
    total,
  }
}
