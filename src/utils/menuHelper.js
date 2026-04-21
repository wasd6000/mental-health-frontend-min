/**
 * 将后端返回的菜单数据转换为前端可用的格式
 * @param {Array} backendMenus - 后端返回的菜单数组
 * @returns {Array} 前端可用的菜单数组
 */
export function transformBackendMenus(backendMenus) {
  if (!backendMenus || !Array.isArray(backendMenus)) {
    return []
  }

  // 获取当前用户角色（只在顶层获取一次）
  const role = localStorage.getItem('admin_role') || localStorage.getItem('user_role')

  // 定义领导角色
  const leaderRoles = ['leader', 'school_leader', 'college', 'college_leader']
  const isLeader = leaderRoles.includes(role)

  // 判断是否为院系领导
  const isCollegeLeader = ['college', 'college_leader'].includes(role)

  console.log('📋 菜单转换 - 当前角色:', role, '是否为领导:', isLeader, '是否为院系领导:', isCollegeLeader)

  // 标记是否已经处理过"朋辈互助"菜单（用于去重）
  let peerSupportViewProcessed = false
  let peerSupportAuditProcessed = false

  return backendMenus
      .map(menu => {
        console.log('🔍 处理菜单项:', { name: menu.name, path: menu.path, isLeader })

        const menuName = menu.name || ''
        const menuPath = menu.path || ''

        // 对于所有后台角色，处理"朋辈互助"相关菜单
        if (menuName.includes('同辈互助') || menuName.includes('朋辈互助')) {
          // 1. 审核菜单 → 只保留一个"朋辈互助审核"
          if (menuName.includes('审核')) {
            if (!peerSupportAuditProcessed) {
              if (isLeader) {
                // 领导角色使用独立路由
                const pathPrefix = isCollegeLeader ? 'college' : 'leader'
                console.log('🔧 转换领导角色的互助审核菜单:', {
                  from: menuName,
                  to: '同辈互助审核',
                  path: `${pathPrefix}-peer-forum-audit`
                })
                peerSupportAuditProcessed = true
                return {
                  path: `${pathPrefix}-peer-forum-audit`,
                  label: '同辈互助审核',
                  icon: menu.icon || 'DocumentChecked',
                  children: []
                }
              } else {
                // 非领导角色也使用独立的审核路由（指向 AdminPeerForum.vue 的 pending 标签页）
                console.log('🔧 转换非领导角色的互助审核菜单:', {
                  from: menuName,
                  to: '同辈互助审核',
                  path: 'peer-forum-pending'
                })
                peerSupportAuditProcessed = true
                return {
                  path: 'peer-forum-pending',
                  label: '同辈互助审核',
                  icon: menu.icon || 'DocumentChecked',
                  children: []
                }
              }
            } else {
              console.log('🚫 过滤重复的审核菜单:', { name: menuName, path: menuPath })
              return null
            }
          }

          // 2. 查看菜单 → 指向 LeaderPeerForumView.vue（卡片式浏览）
          if (!menuName.includes('审核')) {
            if (!peerSupportViewProcessed) {
              if (isLeader) {
                // 领导角色使用独立路由
                const pathPrefix = isCollegeLeader ? 'college' : 'leader'
                console.log('🔧 转换领导角色的互助查看菜单:', {
                  from: menuName,
                  to: '朋辈互助',
                  path: `${pathPrefix}-peer-support`
                })
                peerSupportViewProcessed = true
                return {
                  path: `${pathPrefix}-peer-support`,
                  label: '朋辈互助',
                  icon: menu.icon || 'Forum',
                  children: []
                }
              } else {
                // 非领导角色也使用独立路由（指向 LeaderPeerForumView）
                console.log('🔧 转换非领导角色的互助查看菜单:', {
                  from: menuName,
                  to: '朋辈互助',
                  path: 'peer-forum-view'
                })
                peerSupportViewProcessed = true
                return {
                  path: 'peer-forum-view',
                  label: '朋辈互助',
                  icon: menu.icon || 'Forum',
                  children: []
                }
              }
            } else {
              console.log('🚫 过滤重复的查看菜单:', { name: menuName, path: menuPath })
              return null
            }
          }
        }

        // 对于所有角色，过滤掉不需要的 peer-forum 子路径菜单
        // 过滤"待审核帖子"、"举报管理"等子菜单
        if (menuPath.includes('peer-forum/posts') ||
            menuPath.includes('peer-forum/pending') ||
            menuPath.includes('peer-forum/reports')) {
          console.log('🚫 过滤 peer-forum 子路径菜单:', { name: menuName, path: menuPath })
          return null
        }

        // 对于领导角色，额外过滤其他 peer-forum 相关菜单
        if (isLeader) {
          // 过滤掉其他所有指向 /admin/peer-forum 的菜单（兜底保护）
          if (menuPath === '/admin/peer-forum' || menuPath === 'peer-forum') {
            console.log('🚫 过滤领导角色的通用 peer-forum 菜单:', { name: menuName, path: menuPath })
            return null
          }
        }

        // 递归转换子菜单（传入相同的角色信息，避免重复读取）
        const children = menu.children ? transformBackendMenusInternal(menu.children, isLeader) : []

        return {
          path: menu.path?.replace('/admin/', '') || '',
          label: menu.name,
          icon: menu.icon || null,
          children: children.filter(child => child !== null)
        }
      })
      .filter(menu => menu !== null)
}

/**
 * 内部递归函数，避免重复读取角色信息
 */
function transformBackendMenusInternal(backendMenus, isLeader) {
  if (!backendMenus || !Array.isArray(backendMenus)) {
    return []
  }

  return backendMenus
      .map(menu => {
        // 对于领导角色，过滤掉不合适的菜单
        if (isLeader) {
          const menuName = menu.name || ''
          const menuPath = menu.path || ''

          // 过滤所有 peer-forum 相关的子菜单
          if (menuPath.includes('peer-forum')) {
            console.log('🚫 过滤子菜单中的 peer-forum 路径:', { name: menuName, path: menuPath })
            return null
          }
        }

        const children = menu.children ? transformBackendMenusInternal(menu.children, isLeader) : []

        return {
          path: menu.path?.replace('/admin/', '') || '',
          label: menu.name,
          icon: menu.icon || null,
          children: children.filter(child => child !== null)
        }
      })
      .filter(menu => menu !== null)
}

/**
 * 扁平化菜单树（用于侧边栏单层显示）
 * @param {Array} menuTree - 菜单树
 * @returns {Array} 扁平化的菜单列表
 */
export function flattenMenuTree(menuTree) {
  const result = []

  function traverse(menus) {
    if (!menus || !Array.isArray(menus)) return

    menus.forEach(menu => {
      if (menu.path) {
        result.push({
          path: menu.path,
          label: menu.label,
          icon: menu.icon
        })
      }

      if (menu.children && menu.children.length > 0) {
        traverse(menu.children)
      }
    })
  }

  traverse(menuTree)
  return result
}
