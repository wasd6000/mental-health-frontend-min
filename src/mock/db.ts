import type { Appointment } from '../types/appointment'
import type { AppointmentRecord } from '../types/record'
import type { CrisisCase } from '../types/crisis'
import type { Case } from '../types/case'
import type { User } from '../types/user'
import type { Student } from '../types/student'
import type { Consultant } from '../types/consultant'
import type { College } from '../types/college'

const KEY = 'MOCK_DB'

// ===== 内存中的唯一 db =====
const state = {
  appointments: [] as Appointment[],
  records: [] as AppointmentRecord[],
  cases: [] as Case[],
  crises: [] as CrisisCase[],
  users: [] as User[],
  students: [] as Student[],
  consultants: [] as Consultant[],
  colleges: [] as College[],
}

// ===== 初始化：只在第一次加载时，从 localStorage 读 =====
const raw = localStorage.getItem(KEY)

if (raw) {
  try {
    const data = JSON.parse(raw)

    if (Array.isArray(data.appointments)) state.appointments = data.appointments
    if (Array.isArray(data.records)) state.records = data.records
    if (Array.isArray(data.cases)) state.cases = data.cases
    if (Array.isArray(data.crises)) state.crises = data.crises
    if (Array.isArray(data.users)) state.users = data.users
    if (Array.isArray(data.students)) state.students = data.students
    if (Array.isArray(data.consultants)) state.consultants = data.consultants
    if (Array.isArray(data.colleges)) state.colleges = data.colleges

  } catch (e) {
    console.warn('mock db 解析失败，已重置', e)
  }
}

// ===== 持久化方法 =====
function persist() {
  localStorage.setItem(KEY, JSON.stringify(state))
}

// ===== 对外暴露的 db =====
export const db = {

  // ===== appointment helpers =====
  get appointments() {
    return state.appointments
  },
  set appointments(list: Appointment[]) {
    state.appointments = list
    persist()
  },
  pushAppointment(a: Appointment) {
    state.appointments.push(a)
    persist()
  },
  updateAppointment(id: string, updater: (a: Appointment) => void) {
    const item = state.appointments.find(i => i.id === id)
    if (item) {
      updater(item)
      persist()
      return true
    }
    return false
  },

  // ===== record helpers =====
  get records() {
    return state.records
  },
  set records(list: AppointmentRecord[]) {
    state.records = list
    persist()
  },
  pushRecord(r: AppointmentRecord) {
    state.records.push(r)
    persist()
  },
  updateRecord(id: string, updater: (r: AppointmentRecord) => void) {
    const item = state.records.find(i => i.id === id)
    if (item) {
      updater(item)
      persist()
      return true
    }
    return false
  },

  // ===== case helpers =====
  get cases() {
    return state.cases
  },
  set cases(list: CrisisCase[]) {
    state.cases = list
    persist()
  },
  pushCase(c: CrisisCase) {
    state.cases.push(c)
    persist()
  },
  updateCase(id: string, updater: (c: CrisisCase) => void) {
    const item = state.cases.find(i => i.id === id)
    if (item) {
      updater(item)
      persist()
      return true
    }
    return false
  },

  // ===== crisis helpers =====
  get crises() {
    return state.crises
  },
  set crises(list: CrisisCase[]) {
    state.crises = list
    persist()
  },
  pushCrisis(c: CrisisCase) {
    state.crises.push(c)
    persist()
  },
  updateCrisis(id: string, updater: (c: CrisisCase) => void) {
    const item = state.crises.find(i => i.id === id)
    if (item) {
      updater(item)
      persist()
      return true
    }
    return false
  },

  // ===== user helpers =====
  get users() {
    return state.users
  },
  set users(list: User[]) {
    state.users = list
    persist()
  },
  pushUser(u: User) {
    state.users.push(u)
    persist()
  },

  // ===== student helpers =====
  get students() {
    return state.students
  },
  set students(list: Student[]) {
    state.students = list
    persist()
  },
  pushStudent(s: Student) {
    state.students.push(s)
    persist()
  },

  // ===== consultant helpers =====
  get consultants() {
    return state.consultants
  },
  set consultants(list: Consultant[]) {
    state.consultants = list
    persist()
  },
  pushConsultant(c: Consultant) {
    state.consultants.push(c)
    persist()
  },

  // ===== college helpers =====
  get colleges() {
    return state.colleges
  },
  set colleges(list: College[]) {
    state.colleges = list
    persist()
  },
  pushCollege(c: College) {
    state.colleges.push(c)
    persist()
  },
}