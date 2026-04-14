/**
 * 学生/家长统一走 UserLogin，身份在 User_role。
 * 用于避免与后台 admin_token / admin_role 残留叠加导致误判权限。
 */
export function isStudentOrParentPortal() {
  if (typeof localStorage === 'undefined') return false
  const r = localStorage.getItem('User_role')
  return r === 'student' || r === 'parent'
}

/** 学生/家长登录成功时调用，避免与后台会话 localStorage 混用产生越权 */
export function clearStaffSessionKeys() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_role')
}
