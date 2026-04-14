/**
 * 咨询师侧「排班 / 预约列表」过滤用 ID，应对 GET /api/appointment/list 的 PageQueryDTO.counselorId。
 * 须与 psychological_platform 中 counselor_schedule.counselor_id、JWT 用户主键一致（咨询师登录后与 userId 同源）。
 */
export function getCounselorIdForScheduleFilter() {
  if (typeof localStorage === 'undefined') return ''
  return (
    localStorage.getItem('userId') ||
    localStorage.getItem('user_id') ||
    localStorage.getItem('counselorId') ||
    ''
  )
}

/** 与 getCounselorIdForScheduleFilter 相同（历史命名） */
export function getCounselorUserId() {
  return getCounselorIdForScheduleFilter()
}
