/**
 * 仅解析 JWT payload（不校验签名），用于联调时取出 sub（与 psychological_platform 写入的 userId 一致）。
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.trim().split('.')
  if (parts.length < 2) return null
  const p = parts[1]
  try {
    const b64 = p.replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
    const json = JSON.parse(atob(b64 + pad))
    return json && typeof json === 'object' ? json : null
  } catch {
    return null
  }
}

/** JWT subject：后端 ComminServiceImpl 使用 userInfo.getUserId() 作为 subject */
export function getJwtSubject(token) {
  const pl = parseJwtPayload(token)
  return pl && typeof pl.sub === 'string' ? pl.sub : ''
}

/** 从 JWT 中提取 role_code（用户角色编码），如 INSTRUCTOR、STUDENT、PARENT 等 */
export function getJwtRoleCode(token) {
  const pl = parseJwtPayload(token)
  return pl && typeof pl.role_code === 'string' ? pl.role_code : ''
}
