import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Appointment, AppointmentStatus } from '../types/appointment'
import type { AppointmentRecord } from '../types/record'
import type { Case } from '../types/case'
import type { CrisisCase } from '../types/crisis'
import {
  getCounselorAppointmentsAsync,
  getMyAppointmentsAsync,
  getAppointmentByIdAsync,
  updateAppointmentStatusAsync,
  createAppointmentForStudentAsync,
} from '../api/appointment'
import {
  getRecordsByConsultantAsync,
  getRecordsByStudentAsync,
  getRecordByIdAsync,
  createRecordAsync,
  updateRecordAsync,
  autosaveRecordAsync,
} from '../api/record'
import { getScheduleAsync, updateScheduleAsync } from '../api/schedule'

export const useAppStore = defineStore('app', () => {
  // ===== 预约数据 =====
  const appointments = ref<Appointment[]>([])
  const records = ref<AppointmentRecord[]>([])
  const cases_ = ref<Case[]>([])
  const crises = ref<CrisisCase[]>([])
  const schedule = ref<any[]>([])

  // ===== 预约操作 =====
  async function fetchCounselorAppointments(counselorId: string) {
    try {
      const res = await getCounselorAppointmentsAsync(counselorId)
      appointments.value = res.data || []
    } catch (e) {
      console.error('获取咨询师预约失败', e)
    }
  }

  async function fetchMyAppointments(studentId: string) {
    try {
      const res = await getMyAppointmentsAsync(studentId)
      appointments.value = res.data || []
    } catch (e) {
      console.error('获取学生预约失败', e)
    }
  }

  async function getAppointmentById(id: string) {
    try {
      const res = await getAppointmentByIdAsync(id)
      return res.data
    } catch (e) {
      console.error('获取预约详情失败', e)
    }
  }

  async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
    try {
      const res = await updateAppointmentStatusAsync(id, status)
      // 更新本地数据
      const apt = appointments.value.find(a => a.id === id)
      if (apt) Object.assign(apt, res.data)
      return res.data
    } catch (e) {
      console.error('更新预约状态失败', e)
    }
  }

  async function createAppointment(data: any) {
    try {
      const res = await createAppointmentForStudentAsync(data)
      appointments.value.push(res.data)
      // 全局通知刷新
      window.dispatchEvent(new Event('appointments-updated'))
      return res.data
    } catch (e) {
      console.error('创建预约失败', e)
    }
  }

  // ===== 咨询记录操作 =====
  async function fetchCounselorRecords(counselorId: string) {
    try {
      const res = await getRecordsByConsultantAsync(counselorId)
      records.value = res.data || []
    } catch (e) {
      console.error('获取咨询记录失败', e)
    }
  }

  async function fetchStudentRecords(studentId: string) {
    try {
      const res = await getRecordsByStudentAsync(studentId)
      records.value = res.data || []
    } catch (e) {
      console.error('获取学生咨询记录失败', e)
    }
  }

  async function getRecordById(id: string) {
    try {
      const res = await getRecordByIdAsync(id)
      return res.data
    } catch (e) {
      console.error('获取咨询记录详情失败', e)
    }
  }

  async function createRecord(data: any) {
    try {
      const res = await createRecordAsync(data)
      records.value.push(res.data)
      return res.data
    } catch (e) {
      console.error('创建咨询记录失败', e)
    }
  }

  async function updateRecord(id: string, payload: any) {
    try {
      const res = await updateRecordAsync(id, payload.status, payload)
      const rec = records.value.find(r => r.id === id)
      if (rec) Object.assign(rec, res.data)
      return res.data
    } catch (e) {
      console.error('更新咨询记录失败', e)
    }
  }

  async function autosaveRecord(id: string | null, payload: any) {
    try {
      const res = await autosaveRecordAsync(id, payload)
      if (!id) {
        records.value.push(res.data)
      } else {
        const rec = records.value.find(r => r.id === id)
        if (rec) Object.assign(rec, res.data)
      }
      return res.data
    } catch (e) {
      console.error('自动保存咨询记录失败', e)
    }
  }

  // ===== 排班操作 =====
  async function fetchSchedule() {
    try {
      const res = await getScheduleAsync()
      schedule.value = res.data || []
    } catch (e) {
      console.error('获取排班失败', e)
    }
  }

  async function updateSchedule(data: any) {
    try {
      await updateScheduleAsync(data)
      // 更新本地排班并通知所有页面
      await fetchSchedule()
      window.dispatchEvent(new Event('schedule-updated'))
    } catch (e) {
      console.error('更新排班失败', e)
    }
  }

  return {
    appointments,
    records,
    cases_,
    crises,
    schedule,
    fetchCounselorAppointments,
    fetchMyAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    createAppointment,
    fetchCounselorRecords,
    fetchStudentRecords,
    getRecordById,
    createRecord,
    updateRecord,
    autosaveRecord,
    fetchSchedule,
    updateSchedule,
  }
})
