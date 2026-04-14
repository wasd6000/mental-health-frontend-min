import { db } from './db'
import type { CrisisCase } from '../types/crisis'

function now() {
  return new Date().toISOString()
}

function generateId() {
  return 'case_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

// dev seed
;(function seedCases() {
  if (db.cases.length === 0) {
    db.pushCase({
      id: generateId(),
      studentId: 'stu001',
      counselorId: 'con001',
      level: '2',
      status: 'pending',
      description: '学生情绪波动较大',
      created_at: now(),
      updated_at: now(),
    } as CrisisCase)
  }
})()

export function getCasesByConsultant(consultantId: string) {
  const list = db.cases.filter(c => (c as any).counselorId === consultantId)
  return Promise.resolve({ code: 200, data: list })
}

export function getCaseDetail(id: string) {
  const item = db.cases.find(c => c.id === id)
  if (!item) return Promise.reject({ code: 404, message: '个案不存在' })
  return Promise.resolve({ code: 200, data: item })
}

export function createCase(data: Omit<CrisisCase, 'id' | 'created_at' | 'updated_at'>) {
  const c: CrisisCase = {
    id: generateId(),
    ...data,
    created_at: now(),
    updated_at: now(),
  }
  db.pushCase(c)
  return Promise.resolve({ code: 200, data: c })
}

export function updateCase(id: string, payload: Partial<CrisisCase>) {
  const ok = db.updateCase(id, c => {
    Object.assign(c, payload)
    c.updated_at = now()
  })
  if (!ok) return Promise.reject({ code: 404, message: '个案不存在' })
  const c = db.cases.find(c => c.id === id)!
  return Promise.resolve({ code: 200, data: c })
}
