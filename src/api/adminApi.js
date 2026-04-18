import request from './request.js'

/**
 * 获取咨询师列表
 * GET /api/admin/counselors
 */
export function getAdminCounselors(params = {}) {
  return request.get('/api/admin/counselors', { params })
}

/**
 * 创建咨询师
 * POST /api/admin/counselors
 */
export function createAdminCounselor(data) {
  return request.post('/api/admin/counselors', data)
}

/**
 * 更新咨询师
 * PUT /api/admin/counselors/:id
 */
export function updateAdminCounselor(id, data) {
  return request.put(`/api/admin/counselors/${id}`, data)
}

/**
 * 删除咨询师
 * DELETE /api/admin/counselors/:id
 */
export function deleteAdminCounselor(id) {
  return request.delete(`/api/admin/counselors/${id}`)
}

/**
 * 获取学生列表（管理端）
 * GET /api/admin/students
 */
export function getAdminStudents(params = {}) {
  return request.get('/api/admin/students', { params })
}

/**
 * 更新学生信息
 * PUT /api/admin/students/:id
 */
export function updateAdminStudent(id, data) {
  return request.put(`/api/admin/students/${id}`, data)
}

/**
 * 删除学生
 * DELETE /api/admin/students/:id
 */
export function deleteAdminStudent(id) {
  return request.delete(`/api/admin/students/${id}`)
}

/**
 * 获取管理工作台统计
 * GET /api/admin/workbench/stats
 */
export function getAdminWorkbenchStats() {
  return request.get('/api/admin/workbench/stats')
}

/**
 * 获取统计概览
 * GET /api/admin/stats/overview
 */
export function getStatsOverview(params = {}) {
  return request.get('/api/admin/stats/overview', { params })
}

/**
 * 获取咨询量趋势
 * GET /api/admin/stats/consult-trend
 * 降级处理：后端未实现时返回空数据
 */
export async function getConsultTrend(params = {}) {
  try {
    const res = await request.get('/api/admin/stats/consult-trend', { params })

    // 验证并转换数据结构
    if (res?.code === 200 && res.data) {
      const dates = Array.isArray(res.data.dates) ? res.data.dates : []

      // 处理 values
      let values = []
      if (Array.isArray(res.data.values)) {
        values = res.data.values
      } else if (typeof res.data.values === 'function') {
        console.warn('⚠️ 咨询量趋势 values 是函数类型，后端可能存在序列化问题')
        values = []
      } else if (typeof res.data.values === 'number') {
        values = [res.data.values]
      } else if (res.data.values && typeof res.data.values === 'object') {
        values = Object.values(res.data.values).filter(v => typeof v === 'number')
      }

      return {
        ...res,
        data: {
          dates,
          values,
        }
      }
    }
    return res
  } catch (error) {
    // 403或500错误时返回空数据结构
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 咨询量趋势接口暂未实现，使用空数据')
      return { code: 200, msg: 'ok', data: { dates: [], values: [] } }
    }
    throw error
  }
}

/**
 * 获取测评完成率
 * GET /api/admin/stats/assessment-rate
 * 降级处理：后端未实现时返回空数据
 */
export async function getAssessmentRate(params = {}) {
  try {
    const res = await request.get('/api/admin/stats/assessment-rate', { params })

    // 验证并转换数据结构
    if (res?.code === 200 && res.data) {
      return {
        ...res,
        data: {
          completed: Number(res.data.completed) || 0,
          incomplete: Number(res.data.incomplete) || 0,
        }
      }
    }
    return res
  } catch (error) {
    // 403或500错误时返回空数据结构
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 测评完成率接口暂未实现，使用空数据')
      return { code: 200, msg: 'ok', data: { completed: 0, incomplete: 0 } }
    }
    throw error
  }
}

/**
 * 获取危机等级分布
 * GET /api/admin/stats/crisis-distribution
 * 降级处理：后端未实现时返回空数据
 */
export async function getCrisisDistribution(params = {}) {
  try {
    const res = await request.get('/api/admin/stats/crisis-distribution', { params })

    // 验证并转换数据结构
    if (res?.code === 200 && res.data) {
      const levels = Array.isArray(res.data.levels) ? res.data.levels : []

      // 处理 values：如果是函数或其他非数组类型，尝试转换
      let values = []
      if (Array.isArray(res.data.values)) {
        values = res.data.values
      } else if (typeof res.data.values === 'function') {
        // 如果是函数，可能是后端序列化问题，尝试调用或忽略
        console.warn('⚠️ 危机等级分布 values 是函数类型，后端可能存在序列化问题')
        values = []
      } else if (typeof res.data.values === 'number') {
        // 如果单个数字，包装成数组
        values = [res.data.values]
      } else if (res.data.values && typeof res.data.values === 'object') {
        // 如果是对象，尝试提取值
        values = Object.values(res.data.values).filter(v => typeof v === 'number')
      }

      return {
        ...res,
        data: {
          levels,
          values,
        }
      }
    }
    return res
  } catch (error) {
    // 403或500错误时返回空数据结构
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 危机等级分布接口暂未实现，使用空数据')
      return { code: 200, msg: 'ok', data: { levels: [], values: [] } }
    }
    throw error
  }
}

/**
 * 获取预约时段分布
 * GET /api/admin/stats/slot-distribution
 * 降级处理：后端未实现时返回空数据
 */
export async function getSlotDistribution(params = {}) {
  try {
    const res = await request.get('/api/admin/stats/slot-distribution', { params })

    // 验证并转换数据结构
    if (res?.code === 200 && res.data) {
      const slots = Array.isArray(res.data.slots) ? res.data.slots : []

      // 处理 values：如果是函数或其他非数组类型，尝试转换
      let values = []
      if (Array.isArray(res.data.values)) {
        values = res.data.values
      } else if (typeof res.data.values === 'function') {
        // 如果是函数，可能是后端序列化问题
        console.warn('⚠️ 预约时段分布 values 是函数类型，后端可能存在序列化问题')
        values = []
      } else if (typeof res.data.values === 'number') {
        values = [res.data.values]
      } else if (res.data.values && typeof res.data.values === 'object') {
        values = Object.values(res.data.values).filter(v => typeof v === 'number')
      }

      return {
        ...res,
        data: {
          slots,
          values,
        }
      }
    }
    return res
  } catch (error) {
    // 403或500错误时返回空数据结构
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 预约时段分布接口暂未实现，使用空数据')
      return { code: 200, msg: 'ok', data: { slots: [], values: [] } }
    }
    throw error
  }
}

/**
 * 获取系统健康状态
 * GET /api/admin/system/health
 */
export function getSystemHealth() {
  return request.get('/api/admin/system/health')
}

/**
 * 获取系统性能指标
 * GET /api/admin/system/metrics
 */
export function getSystemMetrics() {
  return request.get('/api/admin/system/metrics')
}

/**
 * 获取系统告警列表
 * GET /api/admin/system/alerts
 */
export function getSystemAlerts(params = {}) {
  return request.get('/api/admin/system/alerts', { params })
}

/**
 * 获取操作日志
 * GET /api/admin/system/logs
 */
export function getOperationLogs(params = {}) {
  return request.get('/api/admin/system/logs', { params })
}
