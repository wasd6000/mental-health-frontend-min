import {
  getCrisisList as fetchCrisisListPage,
  getCrisisDetail as fetchCrisisDetailApi,
  normalizeCrisisReportVo,
  isApiSuccess,
} from './crisisApi.js'
import type { Crisis } from '../types/crisis'

/** 咨询师工作台：拉取危机分页（全库列表，与 OpenAPI 一致；可按需再按 reporter 客户端过滤） */
export async function getCrisesByConsultantAsync(_counselorId: string) {
  const res: any = await fetchCrisisListPage({
    page: 1,
    pageSize: 200,
  })
  if (!isApiSuccess(res)) {
    return { ...res, data: [] }
  }
  const list = res.data?.list || res.data?.records || []
  return { ...res, data: list }
}

export async function getCrisisDetailAsync(id: string) {
  const res: any = await fetchCrisisDetailApi({ id })
  if (!isApiSuccess(res)) return res
  const d = res.data
  if (d) {
    return { ...res, data: normalizeCrisisReportVo(d) }
  }
  const listRes: any = await fetchCrisisListPage({ page: 1, pageSize: 500 })
  if (isApiSuccess(listRes)) {
    const rows = listRes.data?.list || []
    const hit = rows.find((r: any) => r.reportId === id || r.id === id)
    if (hit) return { ...res, data: hit }
  }
  return res
}

export async function createCrisisAsync(data: Partial<Crisis>) {
  const { reportCrisis } = await import('./crisisApi.js')
  return reportCrisis(data)
}

export async function updateCrisisAsync(
  id: string,
  payload: Partial<Crisis> & { level?: string },
) {
  const { updateCrisisLevel } = await import('./crisisApi.js')
  return updateCrisisLevel({
    reportId: id,
    crisisLevel: (payload as any).crisisLevel || (payload as any).level,
  })
}

/** 保留名称，供极少数 mock 场景 */
export async function fetchCrises() {
  const res: any = await fetchCrisisListPage({ page: 1, pageSize: 50 })
  return res.data?.list || []
}

export async function fetchCrisisDetail(id: string) {
  const res: any = await getCrisisDetailAsync(id)
  return isApiSuccess(res) ? res.data : null
}
