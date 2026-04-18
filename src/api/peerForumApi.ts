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
}

/**
 * 获取帖子详情
 * GET /api/peer-forum/post/:id
 */
export async function getPostDetail(id: string): Promise<ForumPost | null> {
  try {
    const res = await request.get(`/api/peer-forum/post/${id}`)
    return res.data || null
  } catch (e) {
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
  const res = await request.post('/api/peer-forum/post', {
    title: payload.title.trim(),
    content: payload.content.trim(),
    category: payload.category || '话题讨论',
    tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean).slice(0, 10) : [],
    isAnonymous: !!payload.isAnonymous,
  })

  return res.data
}

/**
 * 获取回复列表
 * GET /api/peer-forum/post/:postId/replies
 */
export async function listReplies(
  postId: string,
  params: { page?: number; pageSize?: number } = {}
): Promise<PagedResult<ForumReply>> {
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
}

/**
 * 创建回复
 * POST /api/peer-forum/post/:postId/reply
 */
export async function createReply(
  postId: string,
  payload: { content: string; isAnonymous?: boolean; replyToReplyId?: string }
): Promise<ForumReply> {
  const res = await request.post(`/api/peer-forum/post/${postId}/reply`, {
    content: payload.content.trim(),
    isAnonymous: !!payload.isAnonymous,
    replyToReplyId: payload.replyToReplyId,
  })

  return res.data
}

/**
 * 点赞/取消点赞
 * POST /api/peer-forum/post/:postId/like
 */
export async function toggleLike(postId: string): Promise<{ liked: boolean; likeCount: number }> {
  const res = await request.post(`/api/peer-forum/post/${postId}/like`)
  return res.data
}

/**
 * 收藏/取消收藏
 * POST /api/peer-forum/post/:postId/collect
 */
export async function toggleCollect(postId: string): Promise<{ collected: boolean; collectCount: number }> {
  const res = await request.post(`/api/peer-forum/post/${postId}/collect`)
  return res.data
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
  const res = await request.post('/api/peer-forum/report', payload)
  return res.data
}

/**
 * 管理员 - 审核帖子
 * POST /api/peer-forum/admin/review
 */
export async function adminReviewPost(
  id: string,
  payload: { action: 'approve' | 'reject'; comment?: string }
) {
  const res = await request.post('/api/peer-forum/admin/review', {
    postId: id,
    action: payload.action,
    comment: payload.comment,
  })
  return res.data
}

/**
 * 管理员 - 置顶/取消置顶
 * POST /api/peer-forum/admin/set-top
 */
export async function adminSetTop(id: string, value: boolean) {
  const res = await request.post('/api/peer-forum/admin/set-top', {
    postId: id,
    isTop: value,
  })
  return res.data
}

/**
 * 管理员 - 精华/取消精华
 * POST /api/peer-forum/admin/set-essence
 */
export async function adminSetEssence(id: string, value: boolean) {
  const res = await request.post('/api/peer-forum/admin/set-essence', {
    postId: id,
    isEssence: value,
  })
  return res.data
}

/**
 * 管理员 - 删除帖子
 * DELETE /api/peer-forum/admin/post/:id
 */
export async function adminDeletePost(id: string) {
  await request.delete(`/api/peer-forum/admin/post/${id}`)
  return { ok: true }
}

/**
 * 管理员 - 删除回复
 * DELETE /api/peer-forum/admin/reply/:id
 */
export async function adminDeleteReply(id: string) {
  await request.delete(`/api/peer-forum/admin/reply/${id}`)
  return { ok: true }
}

/**
 * 管理员 - 获取待审核帖子列表
 * GET /api/peer-forum/admin/pending
 */
export async function adminListPendingPosts(
  params: { page?: number; pageSize?: number } = {}
): Promise<PagedResult<ForumPost>> {
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
}

/**
 * 管理员 - 获取举报列表
 * GET /api/peer-forum/admin/reports
 */
export async function adminListReports(
    params: { page?: number; pageSize?: number; status?: 'pending' | 'handled' | 'all' } = {}
): Promise<PagedResult<ForumReport>> {
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
}

/**
 * 管理员 - 处理举报
 * POST /api/peer-forum/admin/handle-report
 */
export async function adminHandleReport(id: string, payload: { handled: boolean }) {
  const res = await request.post('/api/peer-forum/admin/handle-report', {
    reportId: id,
    handled: payload.handled,
  })
  return res.data
}
