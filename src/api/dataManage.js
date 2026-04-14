import request from './request.js'

/** 获取备份列表 */
export function getBackupList() {
  return request.get('/api/admin/data/backup/list')
}

/** 创建备份 */
export function createBackup() {
  return request.post('/api/admin/data/backup')
}

/** 恢复备份 */
export function restoreBackup(backupId) {
  return request.post('/api/admin/data/restore', { backupId })
}

/** 获取归档配置 */
export function getArchiveConfig() {
  return request.get('/api/admin/data/archive/config')
}

/** 保存归档配置 */
export function saveArchiveConfig(data) {
  return request.post('/api/admin/data/archive/config', data)
}

/** 获取归档历史 */
export function getArchiveHistory(params) {
  return request.get('/api/admin/data/archive/history', { params })
}

/** 获取字典类型列表 */
export function getDictTypes() {
  return request.get('/api/admin/data/dict/types')
}

/** 获取字典项列表 */
export function getDictItems(typeCode) {
  return request.get('/api/admin/data/dict/items', { params: { typeCode } })
}

/** 新增/编辑字典类型 */
export function saveDictType(data) {
  return data.id ? request.put(`/api/admin/data/dict/types/${data.id}`, data) : request.post('/api/admin/data/dict/types', data)
}

/** 新增/编辑字典项 */
export function saveDictItem(data) {
  return data.id ? request.put(`/api/admin/data/dict/items/${data.id}`, data) : request.post('/api/admin/data/dict/items', data)
}

/** 删除字典项 */
export function deleteDictItem(id) {
  return request.delete(`/api/admin/data/dict/items/${id}`)
}
