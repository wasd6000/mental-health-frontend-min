import request from './request.js'
import { unwrapPageResult } from './psychPlatformAppointment.js'
// @ts-ignore
import type {
  ForumPost,
  ForumReply,
  ForumReport,
  ListPostsParams,
  PagedResult,
} from '../types/peerForum'

/**
 * 朋辈互助论坛 - 真实后端接口
 */

/**
 * 获取帖子列表
 * GET /api/peer-forum/posts
 */
export async function listPosts(params: ListPostsParams = {}): Promise<PagedResult<ForumPost>> {
  try {
    const query: Record<string, any> = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    }

    if (params.keyword) {
      query.keyword = params.keyword
    }
    if (params.category) {
      query.category = params.category
    }
    if (params.tag) {
      query.tag = params.tag
    }
    if (params.sort) {
      query.sort = params.sort
    }
    if (params.status) {
      query.status = params.status
    }

    const res = await request.get('/api/peer-forum/posts', { params: query })
    const { total, records } = unwrapPageResult(res)

    return {
      list: records || [],
      total: Number(total) || 0,
      page: query.page,
      pageSize: query.pageSize,
    }
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 朋辈互助帖子列表接口暂未实现，使用空数据')
      return {
        list: [],
        total: 0,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      }
    }
    throw error
  }
}

/**
 * 获取帖子详情
 * GET /api/peer-forum/post/:id
 */
export async function getPostDetail(id: string): Promise<ForumPost | null> {
  try {
    const res = await request.get(`/api/peer-forum/post/${id}`)
    return res.data || null
  } catch (e: any) {
    if (e?.response?.status === 403 || e?.response?.status >= 500) {
      console.warn('⚠️ 帖子详情接口暂未实现')
      return null
    }
    console.error('获取帖子详情失败:', e)
    return null
  }
}

/**
 * 创建帖子
 * POST /api/peer-forum/post
 */
export async function createPost(payload: {
  title: string
  content: string
  category: string
  tags?: string[]
  isAnonymous?: boolean
}): Promise<ForumPost> {
  try {
    const res = await request.post('/api/peer-forum/post', {
      title: payload.title.trim(),
      content: payload.content.trim(),
      category: payload.category || '话题讨论',
      tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean).slice(0, 10) : [],
      isAnonymous: !!payload.isAnonymous,
    })

    return res.data
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 创建帖子接口暂未实现')
      throw new Error('创建帖子功能暂未开放，请稍后再试')
    }
    throw error
  }
}

/**
 * 获取回复列表
 * GET /api/peer-forum/post/:postId/replies
 */
export async function listReplies(
  postId: string,
  params: { page?: number; pageSize?: number } = {}
): Promise<PagedResult<ForumReply>> {
  try {
    const query = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    }

    const res = await request.get(`/api/peer-forum/post/${postId}/replies`, { params: query })
    const { total, records } = unwrapPageResult(res)

    return {
      list: records || [],
      total: Number(total) || 0,
      page: query.page,
      pageSize: query.pageSize,
    }
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 回复列表接口暂未实现，使用空数据')
      return {
        list: [],
        total: 0,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      }
    }
    throw error
  }
}

/**
 * 创建回复
 * POST /api/peer-forum/post/:postId/reply
 */
export async function createReply(
  postId: string,
  payload: { content: string; isAnonymous?: boolean; replyToReplyId?: string }
): Promise<ForumReply> {
  try {
    const res = await request.post(`/api/peer-forum/post/${postId}/reply`, {
      content: payload.content.trim(),
      isAnonymous: !!payload.isAnonymous,
      replyToReplyId: payload.replyToReplyId,
    })

    return res.data
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 创建回复接口暂未实现')
      throw new Error('回复功能暂未开放，请稍后再试')
    }
    throw error
  }
}

/**
 * 点赞/取消点赞
 * POST /api/peer-forum/post/:postId/like
 */
export async function toggleLike(postId: string): Promise<{ liked: boolean; likeCount: number }> {
  try {
    const res = await request.post(`/api/peer-forum/post/${postId}/like`)
    // 后端返回格式: { code: 200, data: { liked: boolean, likeCount: number } }
    if (res?.data) {
      return {
        liked: res.data.liked ?? false,
        likeCount: res.data.likeCount ?? 0
      }
    }
    return { liked: false, likeCount: 0 }
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 点赞接口暂未实现')
      throw new Error('点赞功能暂未开放')
    }
    throw error
  }
}

/**
 * 收藏/取消收藏
 * POST /api/peer-forum/post/:postId/collect
 */
export async function toggleCollect(postId: string): Promise<{ collected: boolean; collectCount: number }> {
  try {
    const res = await request.post(`/api/peer-forum/post/${postId}/collect`)
    // 后端返回格式: { code: 200, data: { collected: boolean, collectCount: number } }
    if (res?.data) {
      return {
        collected: res.data.collected ?? false,
        collectCount: res.data.collectCount ?? 0
      }
    }
    return { collected: false, collectCount: 0 }
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 收藏接口暂未实现')
      throw new Error('收藏功能暂未开放')
    }
    throw error
  }
}

/**
 * 举报
 * POST /api/peer-forum/report
 */
export async function createReport(payload: {
  targetType: 'post' | 'reply'
  postId: string
  replyId?: string
  reason: string
  detail?: string
}): Promise<ForumReport> {
  try {
    const res = await request.post('/api/peer-forum/report', payload)
    return res.data
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 举报接口暂未实现')
      throw new Error('举报功能暂未开放')
    }
    throw error
  }
}

/**
 * 管理员 - 审核帖子
 * POST /api/peer-forum/admin/review
 */
export async function adminReviewPost(
  id: string,
  payload: { action: 'approve' | 'reject'; comment?: string }
) {
  try {
    const res = await request.post('/api/peer-forum/admin/review', {
      postId: id,
      action: payload.action,
      comment: payload.comment,
    })
    return res.data
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 审核帖子接口暂未实现')
      throw new Error('审核功能暂未开放')
    }
    throw error
  }
}

/**
 * 管理员 - 置顶/取消置顶
 * POST /api/peer-forum/admin/set-top
 */
export async function adminSetTop(id: string, value: boolean) {
  try {
    const res = await request.post('/api/peer-forum/admin/set-top', {
      postId: id,
      isTop: value,
    })
    return res.data
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 置顶接口暂未实现')
      throw new Error('置顶功能暂未开放')
    }
    throw error
  }
}

/**
 * 管理员 - 精华/取消精华
 * POST /api/peer-forum/admin/set-essence
 */
export async function adminSetEssence(id: string, value: boolean) {
  try {
    const res = await request.post('/api/peer-forum/admin/set-essence', {
      postId: id,
      isEssence: value,
    })
    return res.data
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 加精接口暂未实现')
      throw new Error('加精功能暂未开放')
    }
    throw error
  }
}

/**
 * 管理员 - 删除帖子
 * DELETE /api/peer-forum/admin/post/:id
 */
export async function adminDeletePost(id: string) {
  try {
    await request.delete(`/api/peer-forum/admin/post/${id}`)
    return { ok: true }
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 删除帖子接口暂未实现')
      throw new Error('删除功能暂未开放')
    }
    throw error
  }
}

/**
 * 管理员 - 删除回复
 * DELETE /api/peer-forum/admin/reply/:id
 */
export async function adminDeleteReply(id: string) {
  try {
    await request.delete(`/api/peer-forum/admin/reply/${id}`)
    return { ok: true }
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 删除回复接口暂未实现')
      throw new Error('删除回复功能暂未开放')
    }
    throw error
  }
}

/**
 * 管理员 - 获取待审核帖子列表
 * GET /api/peer-forum/admin/pending
 */
export async function adminListPendingPosts(
  params: { page?: number; pageSize?: number } = {}
): Promise<PagedResult<ForumPost>> {
  try {
    const query = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    }

    const res = await request.get('/api/peer-forum/admin/pending', { params: query })
    const { total, records } = unwrapPageResult(res)

    return {
      list: records || [],
      total: Number(total) || 0,
      page: query.page,
      pageSize: query.pageSize,
    }
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 待审核列表接口暂未实现，使用空数据')
      return {
        list: [],
        total: 0,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      }
    }
    throw error
  }
}

/**
 * 管理员 - 获取举报列表
 * GET /api/peer-forum/admin/reports
 */
export async function adminListReports(
    params: { page?: number; pageSize?: number; status?: 'pending' | 'handled' | 'all' } = {}
): Promise<PagedResult<ForumReport>> {
  try {
    const query: Record<string, any> = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    }

    if (params.status) {
      query.status = params.status
    }

    const res = await request.get('/api/peer-forum/admin/reports', { params: query })
    const { total, records } = unwrapPageResult(res)

    return {
      list: records || [],
      total: Number(total) || 0,
      page: query.page,
      pageSize: query.pageSize,
    }
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 举报列表接口暂未实现，使用空数据')
      return {
        list: [],
        total: 0,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
      }
    }
    throw error
  }
}

/**
 * 管理员 - 处理举报
 * POST /api/peer-forum/admin/handle-report
 */
export async function adminHandleReport(id: string, payload: { handled: boolean }) {
  try {
    const res = await request.post('/api/peer-forum/admin/handle-report', {
      reportId: id,
      handled: payload.handled,
    })
    return res.data
  } catch (error: any) {
    if (error?.response?.status === 403 || error?.response?.status >= 500) {
      console.warn('⚠️ 处理举报接口暂未实现')
      throw new Error('处理举报功能暂未开放')
    }
    throw error
  }
}
