// src/utils/idHelper.js

/**
 * 根据模块类型智能处理 ID
 * @param {string|number} id - 原始 ID
 * @param {string} module - 模块名称（用于判断 ID 类型）
 * @returns {string|number} - 处理后的 ID
 */
export function normalizeId(id, module = 'default') {
  if (id == null || id === '') return id

  // UUID 模块列表（保持字符串）
  const uuidModules = [
    'profile',      // 心理档案
    'student',      // 学生管理
    'user',         // 用户管理
    'appointment',  // 预约
    'consultation', // 咨询
    'crisis',       // 危机
  ]

  // 自增 ID 模块列表（转换为数字）
  const autoIncrementModules = [
    'content',      // CMS 内容
    'notice',       // 公告
    'activity',     // 活动
    'course',       // 课程
  ]

  // 判断模块类型
  if (uuidModules.includes(module)) {
    // UUID 模块：保持字符串类型
    return String(id)
  } else if (autoIncrementModules.includes(module)) {
    // 自增 ID 模块：尝试转换为数字
    const numId = Number(id)
    return isNaN(numId) ? id : numId
  } else {
    // 默认：尝试智能判断
    // 如果是 UUID 格式，保持字符串
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id))) {
      return String(id)
    }
    // 如果是纯数字，转换为数字
    if (/^\d+$/.test(String(id))) {
      return Number(id)
    }
    // 其他情况保持原样
    return id
  }
}

/**
 * 检查 ID 是否为 UUID 格式
 */
export function isUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id))
}

/**
 * 检查 ID 是否为数字类型
 */
export function isNumericId(id) {
  return /^\d+$/.test(String(id))
}
