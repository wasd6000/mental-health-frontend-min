import { db } from '../mock/db'

const myId = localStorage.getItem('userId')

const myAppointments = computed(() =>
  db.appointments.filter(a => a.counselorId === myId)
)

const today = new Date().toISOString().slice(0, 10)

const todaySchedules = computed(() =>
  db.schedules.filter(
    s => s.counselorId === myId && s.date === today
  )
)
