import { db } from './db'
import type { CrisisCase } from '../types/crisis'

function now() {
  return new Date().toISOString()
}

function generateId() {
  return 'cr_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

// dev seed
;(function seedCrises() {
  if (db.crises.length === 0) {
    db.pushCrisis({
      id: generateId(),
      studentId: 'stu002',
      counselorId: 'con001',
      level: '2',
      status: 'pending',
      description: '学生情绪波动较大',
      created_at: now(),
      updated_at: now(),
    } as CrisisCase)
  }
})()

export function getCrisesByConsultant(consultantId: string) {
  const list = db.crises.filter(c => (c as any).counselorId === consultantId)
  return Promise.resolve({ code: 200, data: list })
}

export function getCrisisDetail(id: string) {
  const item = db.crises.find(c => c.id === id)
  if (!item) return Promise.reject({ code: 404, message: '危机不存在' })
  return Promise.resolve({ code: 200, data: item })
}

export function createCrisis(data: Omit<CrisisCase, 'id' | 'created_at' | 'updated_at'>) {
  const c: CrisisCase = {
    id: generateId(),
    ...data,
    created_at: now(),
    updated_at: now(),
  }
  db.pushCrisis(c)
  return Promise.resolve({ code: 200, data: c })
}

export function updateCrisis(id: string, payload: Partial<CrisisCase>) {
  const ok = db.updateCrisis(id, c => {
    Object.assign(c, payload)
    c.updated_at = now()
  })
  if (!ok) return Promise.reject({ code: 404, message: '危机不存在' })
  const c = db.crises.find(c => c.id === id)!
  return Promise.resolve({ code: 200, data: c })
}
