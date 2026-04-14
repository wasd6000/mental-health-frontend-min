/** 团体活动列表/详情：后端 VO 与页面展示字段转换（LocalDateTime、activityId 等） */

const COVER_PLACEHOLDER =
  'https://placehold.co/800x400/e2e8f0/64748b?text=%E5%9B%A2%E4%BD%93%E6%B4%BB%E5%8A%A8'

export function parseBackendDateTime(val) {
  if (val == null) return null
  if (typeof val === 'string') {
    const t = Date.parse(val)
    return Number.isNaN(t) ? null : t
  }
  if (Array.isArray(val) && val.length >= 3) {
    const [y, m, d, h = 0, min = 0, sec = 0] = val
    return new Date(y, m - 1, d, h, min, sec).getTime()
  }
  return null
}

export function formatDateTimeRange(start, end) {
  const fmt = (ts) => {
    if (ts == null) return ''
    const d = new Date(ts)
    const p = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  }
  const a = parseBackendDateTime(start)
  const b = parseBackendDateTime(end)
  const fs = fmt(a)
  const fe = fmt(b)
  if (!fs && !fe) return '时间待定'
  if (fs && fe) return `${fs} ~ ${fe}`
  return fs || fe
}

/** 用于前端筛选与标签：即将开始 / 进行中 / 已结束 */
export function deriveScheduleStatus(start, end) {
  const now = Date.now()
  const s = parseBackendDateTime(start)
  const e = parseBackendDateTime(end)
  if (s == null || e == null) return 'upcoming'
  if (now < s) return 'upcoming'
  if (now <= e) return 'ongoing'
  return 'ended'
}

export function mapListItemToCard(row) {
  if (!row || typeof row !== 'object') return null
  const activityId = row.activityId
  if (!activityId) return null
  const uiStatus = deriveScheduleStatus(row.startTime, row.endTime)
  return {
    id: activityId,
    activityId,
    title: row.title || '',
    description: row.summary || '',
    image: row.coverUrl || COVER_PLACEHOLDER,
    time: formatDateTimeRange(row.startTime, row.endTime),
    location: row.location || '—',
    type: 'group',
    status: uiStatus,
    maxParticipants: row.capacity ?? 0,
    currentParticipants: row.joinedCount ?? 0,
    joined: !!row.joined,
  }
}

/** 我的活动列表行 MyActivityVO → 卡片 */
export function mapMyActivityRow(row) {
  if (!row || typeof row !== 'object' || !row.activityId) return null
  return {
    id: row.activityId,
    activityId: row.activityId,
    title: row.title || '',
    image: row.coverUrl || COVER_PLACEHOLDER,
    time: formatDateTimeRange(row.startTime, row.endTime),
    location: row.location || '—',
    status: deriveScheduleStatus(row.startTime, row.endTime),
    feedbackSubmitted: false,
    joinStatus: row.joinStatus,
    checkinStatus: row.checkinStatus,
  }
}

export function mapDetailVoToView(d) {
  if (!d || typeof d !== 'object') return null
  const uiStatus = deriveScheduleStatus(d.startTime, d.endTime)
  return {
    id: d.activityId,
    activityId: d.activityId,
    title: d.title || '',
    description: d.summary || '',
    content: d.content || '',
    type: 'group',
    status: uiStatus,
    time: formatDateTimeRange(d.startTime, d.endTime),
    location: d.location || '—',
    maxParticipants: d.capacity ?? 0,
    currentParticipants: d.joinedCount ?? 0,
    image: d.coverUrl || COVER_PLACEHOLDER,
    joinStartTime: d.joinStartTime,
    joinEndTime: d.joinEndTime,
    backendStatus: d.status || '',
    joined: !!d.joined,
    checkedIn: !!d.checkedIn,
    speaker: null,
  }
}
