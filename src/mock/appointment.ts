import { clearSchedule, generateFromTemplate } from './schedule'
import type { Appointment } from '../types/appointment'
import { db } from './db'

// ===== 工具函数 =====
function now() {
  return new Date().toISOString()
}

function generateId() {
  return 'apt_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

function toDay(d: string | Date) {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt.getTime())) return ''
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ===== 创建预约 =====

interface CreateAppointmentInput {
  studentId: string
  counselorId: string
  counselorName: string
  appointmentDate: string
  create_time: string
  end_time: string
  type?: string
  status?: string
  location?: string
  campus?: string
  form_data?: any
}

export function createAppointmentForStudent(
  data: CreateAppointmentInput
) {
  const appointment: Appointment = {
    id: generateId(),
    studentId: data.studentId,
    counselorId: data.counselorId,
    counselorName: data.counselorName,
    date: data.date,
    create_time: data.create_time,
    end_time: data.end_time,
    type: data.type || 'student',
    status: data.status || 'draft',
    location: data.location || '',
    campus: data.campus || '',
    form_data: data.form_data || {},
    created_at: now(),
    updated_at: now(),
    timeline: [
      {
        status: data.status || 'draft',
        time: now(),
      },
    ],
  }

  db.pushAppointment(appointment)

  return Promise.resolve({
    code: 200,
    data: { ...appointment },
  })
}

// ===== 更新预约状态 =====

export async function updateAppointmentStatus(
  id: string,
  status: string,
  payload?: Partial<Appointment>,
) {
  const ok = db.updateAppointment(id, a => {
    a.status = status
    a.updated_at = now()

    if (!a.timeline) {
      a.timeline = []
    }

    a.timeline.push({
      status,
      time: now(),
    })

    if (payload) {
      Object.assign(a, payload)
    }
  })

  if (!ok) {
    return Promise.reject({
      code: 404,
      message: '预约不存在',
    })
  }

  const appointment = db.appointments.find(a => a.id === id)!

  if (status === 'confirmed') {
    await clearSchedule(appointment.date, appointment.create_time)
  }

  return Promise.resolve({
    code: 200,
    data: appointment,
  })
}

// ===== 咨询师端：查询自己的预约 =====

export function getAppointmentsByCounselor(consultantId: string) {
  const list = db.appointments.filter(
    a => String(a.counselorId) === String(consultantId)
  )

  return Promise.resolve({ code: 200, data: list })
}

// ===== 学生端：查询自己的预约 =====

export function getAppointmentsByStudent(studentId: string) {
  const list = db.appointments.filter(
    a => a.studentId === studentId
  )

  return Promise.resolve({ code: 200, data: list })
}

// ===== 获取指定预约 =====

export function getAppointmentById(id: string) {
  const apt = db.appointments.find(a => a.id === id)

  if (!apt) {
    return Promise.reject({ code: 404, message: '预约不存在' })
  }

  return Promise.resolve({ code: 200, data: { ...apt } })
}

// ===== development seed data =====

(function seedAppointments() {
  if (db.appointments.length === 0) {
    const today = new Date().toISOString().slice(0, 10)

    db.pushAppointment({
      id: generateId(),
      studentId: 'stu001',
      counselorId: 'con001',
      counselorName: '张老师',
      date: today,
      create_time: '09:00',
      end_time: '10:00',
      status: 'confirmed',
      created_at: today,
      updated_at: today,
      timeline: [{ status: 'confirmed', time: today }],
      type: 'student'
    })

    db.pushAppointment({
      id: generateId(),
      studentId: 'stu002',
      counselorId: 'con001',
      counselorName: '张老师',
      date: today,
      create_time: '10:00',
      end_time: '11:00',
      status: 'draft',
      created_at: today,
      updated_at: today,
      timeline: [{ status: 'draft', time: today }],
      type: 'student'
    })
  }
})()

// ===== 学生端：获取某天可预约时间 =====

export async function getAvailableSlots(date: string) {
  const schedule = generateFromTemplate()
  const target = toDay(date)

  const used = db.appointments
    .filter((a: Appointment) => toDay(a.date) === target)
    .map(a => a.create_time)

  const result = schedule.filter((s: any) => {
    return toDay(s.date) === target && !used.includes(s.time)
  })

  return result
}

// ===== 返回未来 N 天内有排班的日期 =====

export async function getAvailableDates(start: string, days = 10) {
  const schedule = generateFromTemplate()
  const startDay = new Date(toDay(start))
  const endDay = new Date(toDay(start))
  endDay.setDate(endDay.getDate() + days)

  const set = new Set<string>()

  schedule.forEach(s => {
    const d = new Date(toDay(s.date))
    if (d >= startDay && d <= endDay) {
      set.add(toDay(s.date))
    }
  })

  return Array.from(set).sort()
}