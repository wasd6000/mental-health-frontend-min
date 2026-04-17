import request from './request.js'

/**
 * 角色管理
 */

// 获取角色列表
export function getRoleList(params) {
  return request.get('/api/admin/role/list', { params })
}

// 获取角色详情
export function getRoleDetail(id) {
  return request.get(`/api/admin/role/detail/${id}`)
}

// 创建角色
export function createRole(data) {
  return request.post('/api/admin/role/create', data)
}

// 更新角色
export function updateRole(id, data) {
  return request.put(`/api/admin/role/update/${id}`, data)
}

// 删除角色
export function deleteRole(id) {
  return request.delete(`/api/admin/role/delete/${id}`)
}

// 获取角色权限
export function getRolePermissions(roleId) {
  return request.get(`/api/admin/role/${roleId}/permissions`)
}

// 分配角色权限
export function assignRolePermissions(roleId, permissionIds) {
  return request.put(`/api/admin/role/${roleId}/permissions`, { permissionIds })
}

/**
 * 权限管理
 */

// 获取权限树
export function getPermissionTree() {
  return request.get('/api/admin/permission/tree')
}

// 获取权限列表（支持分页、类型筛选、关键词搜索）
export function getPermissionList(params) {
  return request.get('/api/admin/permission/list', { params })
}

// 获取权限详情
export function getPermissionDetail(id) {
  return request.get(`/api/admin/permission/detail/${id}`)
}

// 创建权限
export function createPermission(data) {
  return request.post('/api/admin/permission/create', data)
}

// 更新权限
export function updatePermission(id, data) {
  return request.put(`/api/admin/permission/update/${id}`, data)
}

// 删除权限
export function deletePermission(id) {
  return request.delete(`/api/admin/permission/delete/${id}`)
}

// 批量删除权限
export function batchDeletePermissions(ids) {
  return request.post('/api/admin/permission/batch-delete', { ids })
}

/**
 * 用户角色关联
 */

// 获取用户角色
export function getUserRoles(userId) {
  return request.get(`/api/admin/user/${userId}/roles`)
}

// 分配用户角色
export function assignUserRoles(userId, roleIds) {
  return request.put(`/api/admin/user/${userId}/roles`, { roleIds })
}

/**
 * 获取当前用户权限和菜单
 */
export function getMyPermissions() {
  return request.get('/api/admin/auth/my-permissions')
}
