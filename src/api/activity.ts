import request from './request.js'
import { unwrapPageResult } from './psychPlatformAppointment.js'
import { isApiSuccess } from './helpers.js'

/**
 * 团体活动接口
 */

/**
 * 创建活动
 * POST /api/activity/create
 */
export function createActivity(data: {
  name: string
  date: string
  description?: string
  location?: string
  maxParticipants?: number
  counselorId?: string
}) {
  return request.post('/api/activity/create', data)
}

/**
 * 获取活动列表
 * GET /api/activity/list
 */
export async function getActivityList(params: {
    page?: number
    pageSize?: number
    keyword?: string
    status?: string
    dateFrom?: string
    dateTo?: string
} = {}) {
    const query: Record<string, any> = {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
    }

    if (params.keyword) {
        query.keyword = params.keyword
    }
    if (params.status) {
        query.status = params.status
    }
    if (params.dateFrom) {
        query.dateFrom = params.dateFrom
    }
    if (params.dateTo) {
        query.dateTo = params.dateTo
    }

    const res = await request.get('/api/activity/list', { params: query })
    const { total, records } = unwrapPageResult(res)
    return {
        ...res,
        data: {
            list: records || [],
            total: Number(total) || 0,
        },
    }
}

/**
 * 获取活动详情
 * GET /api/activity/detail
 */
export function getActivityDetail(id: string) {
  return request.get('/api/activity/detail', { params: { id } })
}

/**
 * 更新活动
 * PUT /api/activity/update
 */
export function updateActivity(data: {
  id: string
  name?: string
  date?: string
  description?: string
  location?: string
  maxParticipants?: number
  status?: string
}) {
  return request.put('/api/activity/update', data)
}

/**
 * 删除活动
 * DELETE /api/activity/delete
 */
export function deleteActivity(id: string) {
  return request.delete('/api/activity/delete', { params: { id } })
}

/**
 * 报名活动
 * POST /api/activity/enroll
 */
export function enrollActivity(data: {
  activityId: string
  studentId: string
  studentName: string
}) {
  return request.post('/api/activity/enroll', data)
}

/**
 * 取消报名
 * POST /api/activity/cancel-enroll
 */
export function cancelEnroll(data: {
  activityId: string
  studentId: string
}) {
  return request.post('/api/activity/cancel-enroll', data)
}

/**
 * 获取我的活动报名列表
 * GET /api/activity/my-enrollments
 */
export async function getMyEnrollments(studentId: string) {
    const res = await request.get('/api/activity/my-enrollments', {
        params: { studentId },
    })
    const { records } = unwrapPageResult(res)
    return {
        ...res,
        data: records || [],
    }
}

/**
 * 获取我的活动列表（别名，用于兼容 ActivityManage.vue）
 * GET /api/activity/my-list
 */
export async function getMyActivities(params: { page?: number; pageSize?: number } = {}) {
    const query = {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
    }

    const res = await request.get('/api/activity/my-list', { params: query })
    const { total, records } = unwrapPageResult(res)
    return {
        ...res,
        data: {
            list: records || [],
            total: Number(total) || 0,
        },
    }
}

/**
 * 获取活动报名列表（管理员/咨询师）
 * GET /api/activity/enrollments
 */
export async function getActivityEnrollments(activityId: string) {
    const res = await request.get('/api/activity/enrollments', {
        params: { activityId },
    })
    const { records } = unwrapPageResult(res)
    return {
        ...res,
        data: records || [],
    }
}

/**
 * 报名活动（别名，用于兼容 ActivityManage.vue）
 * POST /api/activity/join
 */
export function joinActivity(activityId: string) {
    return request.post('/api/activity/join', { activityId })
}

/**
 * 取消报名（别名，用于兼容 ActivityManage.vue）
 * POST /api/activity/cancel
 */
export function cancelActivity(activityId: string) {
    return request.post('/api/activity/cancel', { activityId })
}

