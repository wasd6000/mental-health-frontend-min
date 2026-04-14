// 列表、详情、统计mock实现
export async function fetchCases() {
  // 实际应调用后端接口
  return [
    { id: 'case001', student_name: '张三', status: '进行中', created_at: '2026-02-01', progress: '初次面谈' },
    { id: 'case002', student_name: '李四', status: '已结案', created_at: '2026-01-15', progress: '已结案' }
  ]
}

export async function fetchCaseDetail(id: string) {
  return { id, student_name: '张三', status: '进行中', created_at: '2026-02-01', progress: '初次面谈' }
}

export async function fetchCaseStats() {
  return [
    { status: '进行中', count: 1 },
    { status: '已结案', count: 1 }
  ]
}
import {
  getCasesByConsultant,
  getCaseDetail,
  createCase,
  updateCase,
} from '../mock/case'
import type { Case } from '../types/case'

export function getCasesByConsultantAsync(counselorId: string) {
  return getCasesByConsultant(counselorId)
}

export function getCaseDetailAsync(id: string) {
  return getCaseDetail(id)
}

export function createCaseAsync(data: Partial<Case>) {
  return createCase(data as any)
}

export function updateCaseAsync(id: string, payload: Partial<Case>) {
  return updateCase(id, payload)
}
