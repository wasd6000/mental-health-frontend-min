import request from './request'

/** 仅当 VITE_USE_MOCK_MESSAGE=true 时使用本地 Mock，否则开发/生产均走真实后端 */
const useMessageMock =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK_MESSAGE === 'true'

function coerceMessageListType(type) {
  if (type === undefined || type === null || type === '') return undefined
  if (typeof type === 'number' && Number.isFinite(type)) return type
  if (typeof type === 'string' && /^\d+$/.test(type)) return Number(type)
  return undefined
}

// 消息类型枚举
export const messageTypes = [
  { value: '', label: '全部' },
  { value: 'crisis', label: '危机' },
  { value: 'appointment', label: '预约' },
  { value: 'assessment', label: '测评' },
  { value: 'system', label: '系统' },
  { value: 'activity', label: '活动' }
]

// 消息类型标签颜色
export const messageTypeColors = {
  crisis: '#ff4d4f',
  appointment: '#1890ff',
  assessment: '#52c41a',
  system: '#faad14',
  activity: '#722ed1'
}

// 获取消息列表（MessageListQueryDTO：userId 由后端从 JWT 填充；type 为 PageQueryDTO 的整型栏目类型，勿传 crisis 等字符串）
export function getMessageList(params = {}) {
  if (useMessageMock) {
    return getMessageListMock(params)
  }
  const type = coerceMessageListType(params.type)
  return request({
    url: '/api/message/list',
    method: 'get',
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      ...(type !== undefined ? { type } : {}),
      read: params.read,
      countOnly: params.countOnly === true ? true : undefined,
    },
  })
}

// 获取未读消息数量（GET /api/message/unread-count，可选 type 字符串由后端解析）
export function getUnreadCount(type) {
  if (useMessageMock) {
    return getUnreadCountMock()
  }
  return request({
    url: '/api/message/unread-count',
    method: 'get',
    params: type != null && type !== '' ? { type: String(type) } : {},
  })
}

// 标记消息为已读
export function markAsRead(messageIds) {
  if (useMessageMock) {
    return markAsReadMock(messageIds)
  }
  const ids = Array.isArray(messageIds) ? messageIds : [messageIds]
  return request({
    url: '/api/message/mark-read',
    method: 'post',
    data: { messageIds: ids },
  })
}

// 标记消息为未读
export function markAsUnread(messageIds) {
  if (useMessageMock) {
    return markAsUnreadMock(messageIds)
  }
  const ids = Array.isArray(messageIds) ? messageIds : [messageIds]
  return request({
    url: '/api/message/mark-unread',
    method: 'post',
    data: { messageIds: ids },
  })
}

// 全部标记为已读
export function markAllAsRead() {
  if (useMessageMock) {
    return markAllAsReadMock()
  }
  return request({
    url: '/api/message/mark-all-read',
    method: 'post',
  })
}

/** 站内/业务 notice 发送（POST /api/message/send） */
export function sendSiteMessage(data) {
  if (useMessageMock) {
    return Promise.resolve({ code: 200, message: 'ok' })
  }
  return request.post('/api/message/send', data)
}

// 删除消息
export function deleteMessages(messageIds) {
  if (useMessageMock) {
    return deleteMessagesMock(messageIds)
  }
  const ids = Array.isArray(messageIds) ? messageIds : [messageIds]
  return request({
    url: '/api/message/delete',
    method: 'delete',
    data: { messageIds: ids }
  })
}

// ========== Mock 数据（开发阶段使用，后端对接后删除） ==========
const mockMessages = [
  { id: '1', type: 'crisis', title: '【危机预警】待处理危机上报', content: '学生张三（计算机学院）需紧急评估，心理测评结果显示存在较高风险，请尽快跟进处理。', read: false, createTime: '2025-02-25T09:00:00', link: '/admin/crisis', priority: true },
  { id: '2', type: 'appointment', title: '新预约待确认', content: '学生李四预约了 2月26日 14:00-15:00 的心理咨询服务，请及时确认。', read: false, createTime: '2025-02-25T10:30:00', link: '/admin/appointments', priority: false },
  { id: '3', type: 'appointment', title: '预约已确认', content: '学生王五的预约已确认，咨询时间：2月27日 10:00-11:00，地点：心理咨询中心201室。', read: true, createTime: '2025-02-24T16:00:00', link: '/admin/appointments', priority: false },
  { id: '4', type: 'system', title: '系统维护通知', content: '本周五（2月28日）22:00-24:00 将进行系统维护升级，届时系统将暂停服务，请提前做好安排。', read: true, createTime: '2025-02-23T08:00:00', link: null, priority: false },
  { id: '5', type: 'assessment', title: '测评预警通知', content: '1 名学生测评结果需关注，请查看详情并进行跟踪。', read: false, createTime: '2025-02-25T08:00:00', link: '/admin/assessment', priority: true },
  { id: '6', type: 'activity', title: '活动报名提醒', content: '心理健康讲座"压力管理与情绪调节"已有 50 人报名，活动将于 3月1日 下午举行。', read: false, createTime: '2025-02-24T14:00:00', link: '/admin/activities', priority: false },
  { id: '7', type: 'system', title: '账号安全提醒', content: '检测到您的账号在新设备登录，如非本人操作，请及时修改密码。', read: true, createTime: '2025-02-22T20:00:00', link: null, priority: false },
  { id: '8', type: 'appointment', title: '预约取消通知', content: '学生赵六取消了原定于 2月25日 的心理咨询预约，取消原因：课程冲突。', read: true, createTime: '2025-02-24T09:00:00', link: '/admin/appointments', priority: false },
  { id: '9', type: 'crisis', title: '【危机预警】新增危机事件', content: '物理学院学生小明被辅导员上报为高危学生，详情请查看危机管理模块。', read: false, createTime: '2025-02-25T11:30:00', link: '/admin/crisis', priority: true },
  { id: '10', type: 'assessment', title: '测评完成通知', content: '本周心理健康普查已完成，共收到有效答卷 1,256 份，请查看统计报告。', read: true, createTime: '2025-02-23T17:00:00', link: '/admin/assessment', priority: false }
]

// 导出 Mock 函数（开发阶段）
export async function getMessageListMock(params = {}) {
  const { type, read, page = 1, pageSize = 10 } = params
  let list = [...mockMessages]
  if (type) {
    list = list.filter(m => m.type === type)
  }
  if (typeof read === 'boolean') {
    list = list.filter(m => m.read === read)
  }
  list.sort((a, b) => {
    if (a.priority && !b.priority) return -1
    if (!a.priority && b.priority) return 1
    return new Date(b.createTime) - new Date(a.createTime)
  })
  const total = list.length
  const start = (page - 1) * pageSize
  const paginatedList = list.slice(start, start + pageSize)
  return Promise.resolve({
    code: 200,
    data: {
      list: paginatedList,
      total,
      page,
      pageSize
    }
  })
}

export async function getUnreadCountMock() {
  const count = mockMessages.filter(m => !m.read).length
  return Promise.resolve({ code: 200, data: count })
}

export async function markAsReadMock(messageIds) {
  const ids = Array.isArray(messageIds) ? messageIds : [messageIds]
  ids.forEach(id => {
    const msg = mockMessages.find(m => m.id === id)
    if (msg) msg.read = true
  })
  return Promise.resolve({ code: 200, message: '标记成功' })
}

export async function markAsUnreadMock(messageIds) {
  const ids = Array.isArray(messageIds) ? messageIds : [messageIds]
  ids.forEach(id => {
    const msg = mockMessages.find(m => m.id === id)
    if (msg) msg.read = false
  })
  return Promise.resolve({ code: 200, message: '标记成功' })
}

export async function markAllAsReadMock() {
  mockMessages.forEach(m => { m.read = true })
  return Promise.resolve({ code: 200, message: '全部标记已读' })
}

export async function deleteMessagesMock(messageIds) {
  const ids = Array.isArray(messageIds) ? messageIds : [messageIds]
  ids.forEach(id => {
    const idx = mockMessages.findIndex(m => m.id === id)
    if (idx > -1) mockMessages.splice(idx, 1)
  })
  return Promise.resolve({ code: 200, message: '删除成功' })
}

/**
 * 私信接口（新增）
 */

/**
 * 获取私信列表
 * GET /api/message/private
 */
export async function getPrivateMessages(params = {}) {
  const query = {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    type: params.type || 'received', // received | sent
  }

  const res = await request.get('/api/message/private', { params: query })
  const data = res.data || {}
  const list = data.list || data.records || []
  const total = data.total || list.length

  return {
    ...res,
    data: {
      list,
      total: Number(total) || 0,
    },
  }
}

/**
 * 发送私信
 * POST /api/message/private/send
 */
export function sendPrivateMessage(data) {
  return request.post('/api/message/private/send', {
    receiverId: data.receiverId,
    receiverName: data.receiverName,
    content: data.content,
    attachmentUrl: data.attachmentUrl,
  })
}

/**
 * 标记私信为已读
 * POST /api/message/private/:id/read
 */
export function markPrivateMessageRead(messageId) {
  return request.post(`/api/message/private/${messageId}/read`)
}

/**
 * 删除私信
 * DELETE /api/message/private/:id
 */
export function deletePrivateMessage(messageId) {
  return request.delete(`/api/message/private/${messageId}`)
}

/**
 * 获取联系人列表（用于选择收件人）
 * GET /api/message/contacts
 */
export async function getContactList(keyword = '') {
  const res = await request.get('/api/message/contacts', {
    params: { keyword },
  })
  const data = res.data || {}
  const list = data.list || data.records || []
  return list
}
