import request from './request.js'

/**
 * 获取待办事项列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.status - 状态: PENDING-待处理, COMPLETED-已完成, ALL-全部
 * @param {string} params.type - 类型: crisis, assessment, activity, report, appointment, leave, other
 * @param {string} params.priority - 优先级: high, medium, low
 */
export function getTodoList(params) {
  return request.get('/api/workbench/todo/list', { params })
}

/**
 * 更新待办事项状态
 * @param {number} id - 待办事项ID
 * @param {Object} data - 更新数据
 * @param {string} data.status - 新状态: COMPLETED, IGNORED
 * @param {string} data.remark - 备注
 */
export function updateTodoStatus(id, data) {
  return request.put(`/api/workbench/todo/${id}/status`, data)
}

/**
 * 批量更新待办事项状态
 * @param {Object} data - 批量更新数据
 * @param {Array} data.ids - 待办事项ID数组
 * @param {string} data.status - 新状态
 * @param {string} data.remark - 备注
 */
export function batchUpdateTodoStatus(data) {
  return request.put('/api/workbench/todo/batch-status', data)
}

/**
 * 获取待办事项统计
 */
export function getTodoStatistics() {
  return request.get('/api/workbench/todo/statistics')
}
