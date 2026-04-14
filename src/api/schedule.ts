import { fetchSchedule, updateSchedule } from '../mock/schedule'

export function getScheduleAsync() {
  return fetchSchedule()
}

export function updateScheduleAsync(data: { date: string; time: string; counselorId: string; counselorName: string }) {
  return updateSchedule(data)
}
