/**
 * 将后端返回的菜单数据转换为前端可用的格式
 * @param {Array} backendMenus - 后端返回的菜单数组
 * @returns {Array} 前端可用的菜单数组
 */
export function transformBackendMenus(backendMenus) {
  if (!backendMenus || !Array.isArray(backendMenus)) {
    return []
  }

  return backendMenus.map(menu => ({
    path: menu.path?.replace('/admin/', '') || '', // 去除 /admin/ 前缀
    label: menu.name,
    icon: menu.icon || null,
    // 如果有子菜单，递归转换
    children: menu.children ? transformBackendMenus(menu.children) : []
  }))
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
      // 只添加有路径的菜单项（排除父级菜单）
      if (menu.path) {
        result.push({
          path: menu.path,
          label: menu.label,
          icon: menu.icon
        })
      }

      // 递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        traverse(menu.children)
      }
    })
  }

  traverse(menuTree)
  return result
}
