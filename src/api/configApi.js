import request from './request.js'

/**
 * 配置管理相关接口
 */

// 获取配置列表
export function getConfigList(params = {}) {
  return request.get('/api/config/list', { params })
}

// 获取配置详情
export function getConfigDetail(id) {
  return request.get(`/api/config/detail/${id}`)
}

// 更新配置
export function updateConfig(id, value) {
  return request.post('/api/config/update', { id, value })
}