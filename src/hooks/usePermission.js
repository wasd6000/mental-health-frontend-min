import { computed } from 'vue'
import { ElMessage } from 'element-plus'

export function usePermission(allowRoles = []) {
  // 优先从 admin_role 获取，其次 user_role（这些字段现在都来自 JWT 的 role_code）
  const role = localStorage.getItem('admin_role') || localStorage.getItem('user_role')

  const can = computed(() => {
    if (!allowRoles.length) return true
    return allowRoles.includes(role)
  })

  function guard() {
    if (!can.value) {
      ElMessage.error('你没有操作权限')
      return false
    }
    return true
  }

  return { can, guard }
}
