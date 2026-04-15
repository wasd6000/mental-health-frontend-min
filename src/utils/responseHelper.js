/**
 * API 响应类型守卫和辅助函数
 * 用于解决 TypeScript 类型检查问题，统一处理API响应
 */

/**
 * 检查响应是否成功
 * @param {any} res - API响应
 * @returns {res is {code: number, data: any, msg?: string}}
 */
export function isSuccess(res) {
  return res && typeof res === 'object' && res.code === 200
}

/**
 * 安全获取响应数据
 * @template T
 * @param {any} res - API响应
 * @param {T} defaultValue - 默认值
 * @returns {T}
 */
export function getData(res, defaultValue = null) {
  return (res && res.code === 200) ? res.data : defaultValue
}

/**
 * 类型安全的响应数据处理
 * @template T
 * @param {any} res - API响应
 * @returns {T | null}
 */
export function safeData(res) {
  if (res && res.code === 200) {
    return res.data
  }
  return null
}

/**
 * 检查是否为错误响应
 * @param {any} res - API响应
 * @returns {boolean}
 */
export function isError(res) {
  return !res || res.code !== 200
}

/**
 * 获取响应消息
 * @param {any} res - API响应
 * @param {string} defaultMsg - 默认消息
 * @returns {string}
 */
export function getMessage(res, defaultMsg = '操作成功') {
  return (res && (res.msg || res.message)) || defaultMsg
}