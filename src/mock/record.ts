import { db } from './db'
import type { AppointmentRecord } from '../types/record'

type RecordStatus = string

function now() {
  return new Date().toISOString()
}

function generateId() {
  return 'rec_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

function toDay(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ===== dev seed =====
;(function seedRecords() {
  if (db.records.length === 0) {
    db.pushRecord({
      id: generateId(),
      appointment_id: '',
      studentId: 'stu001',
      student_name: '张三',
      counselorId: 'con001',
      content: '初次咨询记录',
      appointment_date: toDay(new Date()),
      appointment_time: '09:00-10:00',
      summary: '首次来访',
      problem_type: '情绪',
      images: [],
      record_status: 'submitted',
      created_at: now(),
      updated_at: now(),
    } as AppointmentRecord)
  }
})()

// ===== 咨询师端：查询自己的记录 =====
export function getRecordsByConsultant(counselorId: string) {
  const list = db.records.filter(r => (r as any).counselorId === counselorId)
  return Promise.resolve({ code: 200, data: list })
}

// ===== 查询单条记录 =====
export function getRecordById(id: string) {
  const rec = db.records.find(r => r.id === id)
  if (!rec) {
    return Promise.reject({ code: 404, message: '记录不存在' })
  }
  return Promise.resolve({ code: 200, data: { ...rec } })
}

// ===== 学生端：查询自己的记录 =====
export function getRecordsByStudent(studentId: string) {
  const list = db.records.filter(
    r => r.studentId === studentId
  )
  return Promise.resolve({ code: 200, data: list })
}

// ===== 自动同步心理档案 =====
function syncToProfile(record: any) {
  try {
    const raw = localStorage.getItem('MOCK_PROFILE') || '{}'
    const profile = JSON.parse(raw)

    const sid = record.studentId
    if (!profile[sid]) {
      profile[sid] = { records: [] }
    }
    profile[sid].records.push({
      id: record.id,
      appointment_id: record.appointment_id,
      date: record.appointment_date,
      content: record.content,
      problem_type: record.problem_type,
      counselorId: record.counselorId,
    })

    localStorage.setItem('MOCK_PROFILE', JSON.stringify(profile))
  } catch (e) {
    // ignore
  }
}

// ===== 创建记录 =====
export function createRecord(
  data: Omit<AppointmentRecord, 'id' | 'created_at' | 'updated_at'>
) {
  const rec: AppointmentRecord = {
    id: generateId(),
    ...data,
    record_status: '未审核',
    created_at: now(),
    updated_at: now(),
  }
  db.pushRecord(rec)
  syncToProfile(rec)
  return Promise.resolve({ code: 200, data: rec })
}

// ===== 更新记录 =====
export function updateRecord(
  id: string,
  status: RecordStatus,
  payload?: Partial<AppointmentRecord>
) {
  const ok = db.updateRecord(id, r => {
    r.record_status = status
    r.updated_at = now()
    if (payload) Object.assign(r, payload)
  })

  if (!ok) {
    return Promise.reject({ code: 404, message: '记录不存在' })
  }

  const rec = db.records.find(r => r.id === id)!

  syncToProfile(rec)

  return Promise.resolve({ code: 200, data: rec })
}

// ===== 自动保存草稿 =====
export function autosaveRecord(
  id: string | null,
  payload: Partial<AppointmentRecord>
) {
  if (!id) {
    const rec: AppointmentRecord = {
      id: generateId(),
      ...payload,
      record_status: '未审核',
      created_at: now(),
      updated_at: now(),
    }
    db.pushRecord(rec)
    return Promise.resolve({ code: 200, data: rec })
  }
  const ok = db.updateRecord(id, r => {
    Object.assign(r, payload)
    r.updated_at = now()
  })
  if (!ok) {
    return Promise.reject({ code: 404, message: '记录不存在' })
  }
  const rec = db.records.find(r => r.id === id)!
  return Promise.resolve({ code: 200, data: rec })
}