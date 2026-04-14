/**
 * 与 psychological_platform 及《微信接口.openapi.json》对齐的预约 / 排班 / 咨询师接口封装。
 *
 * 说明见：docs/APPOINTMENT_BACKEND_ALIGNMENT.md
 */
import request from './request.js'

/** 解析 R.data 为 PageResult：{ total, records } */
export function unwrapPageResult(res) {
  const d = res?.data
  if (Array.isArray(d)) {
    const records = d.filter((x) => x != null)
    return { total: records.length, records }
  }
  if (d && typeof d === 'object') {
    const rows = Array.isArray(d.records)
      ? d.records
      : Array.isArray(d.list)
        ? d.list
        : null
    if (rows) {
      return { total: Number(d.total) || 0, records: rows.filter((x) => x != null) }
    }
  }
  return { total: 0, records: [] }
}

/** 后端 submit 返回 Map<Boolean,String>，JSON 中为 { "true"|"false": "消息" } */
export function parseAppointmentSubmitData(data) {
  if (data == null || typeof data !== 'object') {
    return { ok: false, message: '响应异常' }
  }
  if (Object.prototype.hasOwnProperty.call(data, 'true')) {
    return { ok: true, message: String(data.true) }
  }
  if (Object.prototype.hasOwnProperty.call(data, 'false')) {
    return { ok: false, message: String(data.false) }
  }
  return { ok: false, message: '无法解析预约结果' }
}

/** GET /api/schedule/list */
export function fetchScheduleList(params = {}) {
  return request.get('/api/schedule/list', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 200,
      ...params,
    },
  })
}

/** GET /api/consultant/list */
export function fetchConsultantList(params = {}) {
  return request.get('/api/consultant/list', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 200,
      ...params,
    },
  })
}

/**
 * GET /api/appointment/list — 后端 PageQueryDTO + MyBatis listAppointments：
 * - counselorId：AND cs.counselor_id = #{counselorId}（咨询师工作台须传，且等于登录用户 ID / 排班表 counselor_id）
 * - userId：AND ca.student_id = #{userId}（学生维度；勿与 counselorId 同时误传，否则交集为空）
 * - page / pageSize：分页
 * appointment_status 若需筛选由后端字段约定；PageQueryDTO.status 为 Integer，切勿把 PENDING 等字符串塞进 status。
 */
export function fetchAppointmentList(params = {}) {
  return request.get('/api/appointment/list', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
      ...params,
    },
  })
}

/** OpenAPI 名称保留：实际后端为「排班分页」，非「我的预约」 */
export function fetchAppointmentMyList(params = {}) {
  return request.get('/api/appointment/my-list', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 50,
      ...params,
    },
  })
}

/** POST /api/appointment/submit，body 对齐 AppointmentDTO */
export function submitAppointment(body) {
  return request.post('/api/appointment/submit', body)
}

export function padTimeFragment(t) {
  if (t == null) return ''
  const s = String(t)
  const m = s.match(/(\d{1,2}):(\d{2})/)
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}`
  return s.slice(0, 5)
}

/**
 * 日历日期字段格式化（若后端将来改为存 yyyy-MM-dd 可用）。
 * 注意：psychological_platform 的 counselor_schedule.schedule_date 为「星期 1–7」，
 * 不能走本函数用 new Date(数字)，否则会变成 1970 年附近，选时页会被学期范围过滤光。
 */
export function formatScheduleRowDate(scheduleDate) {
  if (scheduleDate == null) return ''
  if (typeof scheduleDate === 'string') {
    const t = scheduleDate.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t
    return scheduleDate.includes('T') ? scheduleDate.slice(0, 10) : scheduleDate.slice(0, 10)
  }
  try {
    const d = new Date(scheduleDate)
    if (Number.isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    if (y < 2000) return ''
    const mo = String(d.getMonth() + 1).padStart(2, '0')
    const da = String(d.getDate()).padStart(2, '0')
    return `${y}-${mo}-${da}`
  } catch (_) {
    return ''
  }
}

/** 与 ScheduleCreateDTO / 表注释一致：1=周一 … 6=周六，7=周日 → JS Date.getDay()（0=周日） */
export function dbWeekdayToJsGetDay(dbWeekday) {
  const n = Number(dbWeekday)
  if (!Number.isFinite(n) || n < 1 || n > 7) return null
  return n === 7 ? 0 : n
}

/** 判断 schedule_date 是否按库表语义存的是「星期几」而非公历日 */
export function isLikelyDbWeekdayOnly(scheduleDate) {
  if (scheduleDate == null) return false
  if (typeof scheduleDate === 'number') {
    return scheduleDate >= 1 && scheduleDate <= 7
  }
  const s = String(scheduleDate).trim()
  return /^[1-7]$/.test(s)
}

export function eachDateStringInRange(semesterStart, semesterEnd) {
  const out = []
  const cur = new Date(`${semesterStart}T12:00:00`)
  const end = new Date(`${semesterEnd}T12:00:00`)
  if (Number.isNaN(cur.getTime()) || Number.isNaN(end.getTime())) return out
  while (cur <= end) {
    const y = cur.getFullYear()
    const mo = String(cur.getMonth() + 1).padStart(2, '0')
    const da = String(cur.getDate()).padStart(2, '0')
    out.push(`${y}-${mo}-${da}`)
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

export function datesMatchingDbWeekday(semesterStart, semesterEnd, dbWeekday) {
  const want = dbWeekdayToJsGetDay(dbWeekday)
  if (want == null) return []
  return eachDateStringInRange(semesterStart, semesterEnd).filter((ds) => {
    const d = new Date(`${ds}T12:00:00`)
    return d.getDay() === want
  })
}

/**
 * 一行 counselor_schedule 展开为选时页多条 slot（星期制时按学期内每个匹配日一条）
 */
export function expandScheduleRowToSlots(row, counselorNameMap, semesterStart, semesterEnd) {
  const scheduleId = row.scheduleId ?? row.schedule_id
  const counselorId = String(row.counselorId ?? row.counselor_id ?? '')
  if (!scheduleId) return []

  const st = padTimeFragment(row.startTime ?? row.start_time)
  const et = padTimeFragment(row.endTime ?? row.end_time)
  const time = et && et !== st ? `${st}-${et}` : st || et
  const counselorName =
    counselorNameMap.get(counselorId) ||
    counselorNameMap.get(String(counselorId)) ||
    '咨询师'
  const available = row.availableSlots ?? row.available_slots ?? 0
  const sd = row.scheduleDate ?? row.schedule_date

  const base = {
    scheduleId,
    counselorId,
    time,
    counselorName,
    availableSlots: available,
    scheduleType: row.scheduleType ?? row.schedule_type,
    unitType: 'single_unit',
    avoid_colleges: [],
    consultant_college_id: '',
  }

  if (isLikelyDbWeekdayOnly(sd)) {
    return datesMatchingDbWeekday(semesterStart, semesterEnd, sd).map((date) => ({
      ...base,
      date,
    }))
  }

  const date = formatScheduleRowDate(sd)
  if (!date) return []
  return [{ ...base, date }]
}

/** 将咨询师列表行映射为 id -> 显示名 */
export function buildCounselorNameMap(records) {
  const map = new Map()
  ;(records || []).forEach((row) => {
    const id =
      row.counselorId ||
      row.userVO?.userId ||
      row.user_id ||
      row.id
    const name =
      row.userVO?.realName ||
      row.real_name ||
      row.realName ||
      row.name ||
      ''
    if (id) map.set(String(id), name || '咨询师')
  })
  return map
}

/**
 * 将排班行转为选时页 slot（需带 scheduleId 供 submit）
 */
export function scheduleRowToSlot(row, counselorNameMap) {
  const scheduleId = row.scheduleId ?? row.schedule_id
  const counselorId = String(row.counselorId ?? row.counselor_id ?? '')
  const date = formatScheduleRowDate(row.scheduleDate ?? row.schedule_date)
  const st = padTimeFragment(row.startTime ?? row.start_time)
  const et = padTimeFragment(row.endTime ?? row.end_time)
  const time = et && et !== st ? `${st}-${et}` : st || et
  const counselorName =
    counselorNameMap.get(counselorId) || counselorNameMap.get(String(counselorId)) || '咨询师'
  const available =
    row.availableSlots ?? row.available_slots ?? 0
  return {
    scheduleId,
    counselorId,
    date,
    time,
    counselorName,
    availableSlots: available,
    scheduleType: row.scheduleType ?? row.schedule_type,
    unitType: 'single_unit',
    avoid_colleges: [],
    consultant_college_id: '',
  }
}

export function defaultSubmitBodyFromSlot(slot, extra = {}) {
  return {
    scheduleId: slot.scheduleId,
    appointmentType: extra.appointmentType || 'INDIVIDUAL',
    consultationMode: extra.consultationMode || 'OFFLINE',
    location: extra.location || '',
    isUrgent: extra.isUrgent ?? 0,
    notes: extra.notes || '',
    ...extra,
  }
}
