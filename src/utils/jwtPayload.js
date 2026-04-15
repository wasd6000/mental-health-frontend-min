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

/** 从 JWT 中提取 role_code（用户角色编码），支持多种字段名 */
export function getJwtRoleCode(token) {
  const pl = parseJwtPayload(token)
  if (!pl || typeof pl !== 'object') return ''

  // 尝试多种可能的字段名
  const possibleFields = [
    'role_code',      // 标准字段
    'roleCode',       // 驼峰命名
    'role',           // 简化字段
    'roles',          // 复数形式
    'userRole',       // 用户角色
    'authority',      // Spring Security
    'authorities',    // Spring Security 复数
  ]

  for (const field of possibleFields) {
    const value = pl[field]
    if (value) {
      // 如果是数组，取第一个元素
      if (Array.isArray(value)) {
        if (value.length > 0) {
          const first = value[0]
          return typeof first === 'string' ? first : (first?.authority || first?.role || '')
        }
      }
      // 如果是字符串，直接返回
      if (typeof value === 'string') {
        return value
      }
      // 如果是对象，尝试提取 authority 或 role
      if (typeof value === 'object') {
        return value.authority || value.role || ''
      }
    }
  }

  return ''
}
