import type {
  ForumPost,
  ForumPostStatus,
  ForumReply,
  ForumReport,
  ListPostsParams,
  PagedResult,
} from '@/types/peerForum'
import request from './request.js'

const LS_KEYS = {
  likes: 'PEER_FORUM_LIKES', // record per-user liked post ids
  collects: 'PEER_FORUM_COLLECTS', // record per-user collected post ids
} as const

function nowIso() {
  return new Date().toISOString()
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function getUserContext() {
  const userToken = localStorage.getItem('User_token')
  const userRole = localStorage.getItem('User_role')
  const userName = localStorage.getItem('User_name')

  const adminToken = localStorage.getItem('admin_token')
  const adminRole = localStorage.getItem('admin_role')
  const adminName = localStorage.getItem('user_name')

  const token =
    localStorage.getItem('access_token') ||
    userToken ||
    adminToken ||
    localStorage.getItem('user_token') ||
    ''
  const role = userRole || adminRole || localStorage.getItem('user_role') || ''
  const name = userName || adminName || localStorage.getItem('user_name') || localStorage.getItem('User_name') || ''

  const isLoggedIn = !!token
  const portalIsStudentOrParent = userRole === 'student' || userRole === 'parent'
  const staffRoleForAdmin = adminRole || localStorage.getItem('user_role') || ''
  const isAdminOperator =
    !portalIsStudentOrParent &&
    ['admin', 'counselor', 'center'].includes(String(staffRoleForAdmin || role))

  return {
    token,
    role,
    name,
    userId: token || undefined,
    isLoggedIn,
    isAdminOperator,
  }
}

function displayName(isAnonymous: boolean) {
  const ctx = getUserContext()
  if (isAnonymous) {
    const suffix = Math.random().toString(10).slice(2, 6)
    return `匿名${suffix}`
  }
  return String(ctx.name || '用户')
}

type UserSetMap = Record<string, string[]>

function loadUserSet(key: typeof LS_KEYS.likes | typeof LS_KEYS.collects): UserSetMap {
  return safeJsonParse<UserSetMap>(localStorage.getItem(key), {})
}

function saveUserSet(key: typeof LS_KEYS.likes | typeof LS_KEYS.collects, map: UserSetMap) {
  localStorage.setItem(key, JSON.stringify(map))
}

export async function listPosts(params: ListPostsParams = {}): Promise<PagedResult<ForumPost>> {
  try {
    const res = await request.get('/api/peer-forum/posts', { params })
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e) {
    console.warn('获取帖子列表失败', e)
  }
  return { list: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 10 }
}

export async function getPostDetail(id: string): Promise<ForumPost | null> {
  try {
    const res = await request.get(`/api/peer-forum/post/${id}`)
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e) {
    console.warn('获取帖子详情失败', e)
  }
  return null
}

export async function createPost(payload: {
  title: string
  content: string
  category: string
  tags?: string[]
  isAnonymous?: boolean
}): Promise<ForumPost> {
  const ctx = getUserContext()
  if (!ctx.isLoggedIn) {
    throw new Error('请先登录后再发帖')
  }
  try {
    const res = await request.post('/api/peer-forum/post', payload)
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '发帖失败')
  }
  throw new Error('发帖失败')
}

export async function listReplies(postId: string, params: { page?: number; pageSize?: number } = {}): Promise<PagedResult<ForumReply>> {
  try {
    const res = await request.get(`/api/peer-forum/post/${postId}/replies`, { params })
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e) {
    console.warn('获取回复列表失败', e)
  }
  return { list: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 }
}

export async function createReply(
  postId: string,
  payload: { content: string; isAnonymous?: boolean; replyToReplyId?: string }
): Promise<ForumReply> {
  const ctx = getUserContext()
  if (!ctx.isLoggedIn) {
    throw new Error('请先登录后再回帖')
  }
  try {
    const res = await request.post(`/api/peer-forum/post/${postId}/reply`, payload)
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '回复失败')
  }
  throw new Error('回复失败')
}

export async function toggleLike(postId: string): Promise<{ liked: boolean; likeCount: number }> {
  const ctx = getUserContext()
  if (!ctx.isLoggedIn) throw new Error('请先登录后再点赞')
  try {
    const res = await request.post(`/api/peer-forum/post/${postId}/like`)
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '点赞失败')
  }
  throw new Error('点赞失败')
}

export async function toggleCollect(postId: string): Promise<{ collected: boolean; collectCount: number }> {
  const ctx = getUserContext()
  if (!ctx.isLoggedIn) throw new Error('请先登录后再收藏')
  try {
    const res = await request.post(`/api/peer-forum/post/${postId}/collect`)
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '收藏失败')
  }
  throw new Error('收藏失败')
}

export async function createReport(payload: {
  targetType: 'post' | 'reply'
  postId: string
  replyId?: string
  reason: string
  detail?: string
}): Promise<ForumReport> {
  const ctx = getUserContext()
  if (!ctx.isLoggedIn) throw new Error('请先登录后再举报')
  try {
    const res = await request.post('/api/peer-forum/report', payload)
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '举报失败')
  }
  throw new Error('举报失败')
}

function requireAdmin() {
  const ctx = getUserContext()
  if (!ctx.isAdminOperator) {
    throw new Error('你没有操作权限')
  }
  return ctx
}

export async function adminReviewPost(id: string, payload: { action: 'approve' | 'reject'; comment?: string }) {
  requireAdmin()
  try {
    const res = await request.post('/api/peer-forum/admin/review', { postId: id, ...payload })
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '审核失败')
  }
  throw new Error('审核失败')
}

export async function adminSetTop(id: string, value: boolean) {
  requireAdmin()
  try {
    const res = await request.post('/api/peer-forum/admin/set-top', { postId: id, isTop: value })
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '设置置顶失败')
  }
  throw new Error('设置置顶失败')
}

export async function adminSetEssence(id: string, value: boolean) {
  requireAdmin()
  try {
    const res = await request.post('/api/peer-forum/admin/set-essence', { postId: id, isEssence: value })
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '设置精华失败')
  }
  throw new Error('设置精华失败')
}

export async function adminDeletePost(id: string) {
  requireAdmin()
  try {
    const res = await request.delete(`/api/peer-forum/post/${id}`)
    if (res?.code === 200) {
      return { ok: true }
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '删除失败')
  }
  throw new Error('删除失败')
}

export async function adminDeleteReply(id: string) {
  requireAdmin()
  try {
    const res = await request.delete(`/api/peer-forum/reply/${id}`)
    if (res?.code === 200) {
      return { ok: true }
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '删除失败')
  }
  throw new Error('删除失败')
}

export async function adminListPendingPosts(params: { page?: number; pageSize?: number } = {}): Promise<PagedResult<ForumPost>> {
  requireAdmin()
  try {
    const res = await request.get('/api/peer-forum/admin/pending', { params })
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e) {
    console.warn('获取待审核帖子列表失败', e)
  }
  return { list: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 10 }
}

export async function adminListReports(params: { page?: number; pageSize?: number; status?: 'pending' | 'handled' | 'all' } = {}): Promise<PagedResult<ForumReport>> {
  requireAdmin()
  try {
    const res = await request.get('/api/peer-forum/admin/reports', { params })
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e) {
    console.warn('获取举报列表失败', e)
  }
  return { list: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 10 }
}

export async function adminHandleReport(id: string, payload: { handled: boolean }) {
  const ctx = requireAdmin()
  try {
    const res = await request.post('/api/peer-forum/admin/handle-report', { reportId: id, ...payload, handledBy: ctx.userId })
    if (res?.code === 200 && res.data) {
      return res.data
    }
  } catch (e: any) {
    throw new Error(e?.response?.data?.message || '处理举报失败')
  }
  throw new Error('处理举报失败')
}

