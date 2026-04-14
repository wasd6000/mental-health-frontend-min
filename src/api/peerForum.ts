import type {
  ForumPost,
  ForumPostStatus,
  ForumReply,
  ForumReport,
  ListPostsParams,
  PagedResult,
} from '@/types/peerForum'

const LS_KEYS = {
  posts: 'PEER_FORUM_POSTS',
  replies: 'PEER_FORUM_REPLIES',
  reports: 'PEER_FORUM_REPORTS',
  likes: 'PEER_FORUM_LIKES', // record per-user liked post ids
  collects: 'PEER_FORUM_COLLECTS', // record per-user collected post ids
  seeded: 'PEER_FORUM_SEEDED',
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

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`
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
  const name = userName || adminName || localStorage.getItem('user_name') || ''

  const isLoggedIn = !!token
  /** 学生/家长端会话下不得具备后台操作权限（忽略残留的 admin_role） */
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

function loadPosts(): ForumPost[] {
  return safeJsonParse<ForumPost[]>(localStorage.getItem(LS_KEYS.posts), [])
}

function savePosts(posts: ForumPost[]) {
  localStorage.setItem(LS_KEYS.posts, JSON.stringify(posts))
}

function loadReplies(): ForumReply[] {
  return safeJsonParse<ForumReply[]>(localStorage.getItem(LS_KEYS.replies), [])
}

function saveReplies(replies: ForumReply[]) {
  localStorage.setItem(LS_KEYS.replies, JSON.stringify(replies))
}

function loadReports(): ForumReport[] {
  return safeJsonParse<ForumReport[]>(localStorage.getItem(LS_KEYS.reports), [])
}

function saveReports(reports: ForumReport[]) {
  localStorage.setItem(LS_KEYS.reports, JSON.stringify(reports))
}

type UserSetMap = Record<string, string[]>

function loadUserSet(key: typeof LS_KEYS.likes | typeof LS_KEYS.collects): UserSetMap {
  return safeJsonParse<UserSetMap>(localStorage.getItem(key), {})
}

function saveUserSet(key: typeof LS_KEYS.likes | typeof LS_KEYS.collects, map: UserSetMap) {
  localStorage.setItem(key, JSON.stringify(map))
}

function ensureSeedData() {
  const seeded = localStorage.getItem(LS_KEYS.seeded) === 'true'
  if (seeded) return

  const seedPosts: ForumPost[] = [
    {
      id: 'p_1',
      title: '如何缓解考试前的焦虑？',
      content: '最近临近期末，晚上总睡不着，脑子停不下来。大家有什么有效的方法吗？',
      category: '话题讨论',
      tags: ['焦虑', '考试', '睡眠'],
      isAnonymous: true,
      authorDisplay: '匿名1023',
      authorId: 'seed_anon_1',
      status: 'approved',
      isTop: true,
      isEssence: true,
      likeCount: 12,
      collectCount: 5,
      replyCount: 2,
      viewCount: 186,
      createdAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
      updatedAt: undefined,
    },
    {
      id: 'p_2',
      title: '分享一个让我好受一点的小习惯',
      content: '情绪低落的时候，我会给自己定一个“最小行动”：下楼走 10 分钟。很多时候走着走着就没那么难受了。',
      category: '经验分享',
      tags: ['情绪', '自我照顾'],
      isAnonymous: false,
      authorDisplay: '开发者(学生)',
      authorId: 'seed_user_1',
      status: 'approved',
      isTop: false,
      isEssence: false,
      likeCount: 8,
      collectCount: 2,
      replyCount: 1,
      viewCount: 92,
      createdAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
      updatedAt: undefined,
    },
    {
      id: 'p_3',
      title: '我想匿名聊聊宿舍关系',
      content: '和室友最近很尴尬，不知道怎么开口沟通。有没有建议的表达方式？',
      category: '话题讨论',
      tags: ['人际', '沟通'],
      isAnonymous: true,
      authorDisplay: '匿名8841',
      authorId: 'seed_anon_2',
      status: 'pending',
      isTop: false,
      isEssence: false,
      likeCount: 0,
      collectCount: 0,
      replyCount: 0,
      viewCount: 20,
      createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
      updatedAt: undefined,
    },
  ]

  const seedReplies: ForumReply[] = [
    {
      id: 'r_1',
      postId: 'p_1',
      content: '我会用 4-7-8 呼吸法：吸气4秒、屏息7秒、呼气8秒，重复几轮。',
      isAnonymous: true,
      authorDisplay: '匿名3301',
      authorId: 'seed_anon_3',
      createdAt: new Date(Date.now() - 86400 * 1000 * 3 + 3600 * 1000).toISOString(),
    },
    {
      id: 'r_2',
      postId: 'p_1',
      content: '把担心写下来，然后把“我能控制的”和“我不能控制的”分开，会更踏实一些。',
      isAnonymous: false,
      authorDisplay: '测试咨询师',
      authorId: 'seed_counselor_1',
      createdAt: new Date(Date.now() - 86400 * 1000 * 3 + 7200 * 1000).toISOString(),
    },
    {
      id: 'r_3',
      postId: 'p_2',
      content: '赞同！我还会给自己准备一杯热饮，身体暖了，心也会稳一点。',
      isAnonymous: true,
      authorDisplay: '匿名5566',
      authorId: 'seed_anon_4',
      createdAt: new Date(Date.now() - 86400 * 1000 * 2 + 5400 * 1000).toISOString(),
    },
  ]

  savePosts(seedPosts)
  saveReplies(seedReplies)
  saveReports([])
  localStorage.setItem(LS_KEYS.seeded, 'true')
}

export async function listPosts(params: ListPostsParams = {}): Promise<PagedResult<ForumPost>> {
  ensureSeedData()
  const {
    page = 1,
    pageSize = 10,
    keyword,
    category,
    tag,
    sort = 'latest',
    status = 'approved',
  } = params

  const ctx = getUserContext()
  const likesMap = loadUserSet(LS_KEYS.likes)
  const collectsMap = loadUserSet(LS_KEYS.collects)
  const myLiked = new Set((likesMap[ctx.userId || ''] || []).map(String))
  const myCollected = new Set((collectsMap[ctx.userId || ''] || []).map(String))

  let list = loadPosts()

  // 状态过滤：默认只显示已通过；作者可见自己被驳回/审核中；管理员可看 all
  list = list.filter(p => {
    if (ctx.isAdminOperator && status === 'all') return true

    if (status === 'all') {
      if (p.status === 'approved') return true
      return !!ctx.userId && p.authorId === ctx.userId
    }

    if (status) {
      // 状态筛选模式：只展示指定状态（例如只展示 approved）
      return p.status === status
    }

    return p.status === 'approved'
  })

  if (keyword && keyword.trim()) {
    const k = keyword.trim().toLowerCase()
    list = list.filter(p => p.title.toLowerCase().includes(k) || p.content.toLowerCase().includes(k))
  }
  if (category) {
    list = list.filter(p => p.category === category)
  }
  if (tag) {
    list = list.filter(p => Array.isArray(p.tags) && p.tags.includes(tag))
  }

  const scoreHot = (p: ForumPost) => p.likeCount * 2 + p.replyCount * 3 + p.collectCount * 2 + p.viewCount * 0.2

  list.sort((a, b) => {
    // 置顶永远优先
    if (a.isTop && !b.isTop) return -1
    if (!a.isTop && b.isTop) return 1

    if (sort === 'top') {
      return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0)
    }
    if (sort === 'essence') {
      if (a.isEssence && !b.isEssence) return -1
      if (!a.isEssence && b.isEssence) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    if (sort === 'hot') {
      return scoreHot(b) - scoreHot(a)
    }
    // latest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const total = list.length
  const start = (page - 1) * pageSize
  const sliced = list.slice(start, start + pageSize).map(p => ({
    ...p,
    likedByMe: ctx.userId ? myLiked.has(p.id) : false,
    collectedByMe: ctx.userId ? myCollected.has(p.id) : false,
  }))

  return { list: sliced, total, page, pageSize }
}

export async function getPostDetail(id: string): Promise<ForumPost | null> {
  ensureSeedData()
  const posts = loadPosts()
  const ctx = getUserContext()

  const p = posts.find(x => String(x.id) === String(id))
  if (!p) return null

  // 非管理员/非作者时，仅可看已通过
  if (p.status !== 'approved' && !ctx.isAdminOperator) {
    if (!ctx.userId || p.authorId !== ctx.userId) return null
  }

  // 浏览量 +1
  const next = { ...p, viewCount: (p.viewCount || 0) + 1 }
  const idx = posts.findIndex(x => x.id === p.id)
  posts[idx] = next
  savePosts(posts)

  const likesMap = loadUserSet(LS_KEYS.likes)
  const collectsMap = loadUserSet(LS_KEYS.collects)
  const myLiked = new Set((likesMap[ctx.userId || ''] || []).map(String))
  const myCollected = new Set((collectsMap[ctx.userId || ''] || []).map(String))

  return {
    ...next,
    likedByMe: ctx.userId ? myLiked.has(next.id) : false,
    collectedByMe: ctx.userId ? myCollected.has(next.id) : false,
  }
}

export async function createPost(payload: {
  title: string
  content: string
  category: string
  tags?: string[]
  isAnonymous?: boolean
}): Promise<ForumPost> {
  ensureSeedData()
  const ctx = getUserContext()
  if (!ctx.isLoggedIn) {
    throw new Error('请先登录后再发帖')
  }

  const posts = loadPosts()
  const isAnonymous = !!payload.isAnonymous
  const post: ForumPost = {
    id: uid('p'),
    title: payload.title.trim(),
    content: payload.content.trim(),
    category: payload.category || '话题讨论',
    tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean).slice(0, 10) : [],
    isAnonymous,
    authorDisplay: displayName(isAnonymous),
    authorId: ctx.userId,
    status: 'pending',
    isTop: false,
    isEssence: false,
    likeCount: 0,
    collectCount: 0,
    replyCount: 0,
    viewCount: 0,
    createdAt: nowIso(),
  }

  posts.unshift(post)
  savePosts(posts)
  return post
}

export async function listReplies(postId: string, params: { page?: number; pageSize?: number } = {}): Promise<PagedResult<ForumReply>> {
  ensureSeedData()
  const { page = 1, pageSize = 20 } = params
  const all = loadReplies().filter(r => String(r.postId) === String(postId))
  all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const total = all.length
  const start = (page - 1) * pageSize
  return { list: all.slice(start, start + pageSize), total, page, pageSize }
}

export async function createReply(
  postId: string,
  payload: { content: string; isAnonymous?: boolean; replyToReplyId?: string }
): Promise<ForumReply> {
  ensureSeedData()
  const ctx = getUserContext()
  if (!ctx.isLoggedIn) {
    throw new Error('请先登录后再回帖')
  }
  const content = payload.content.trim()
  if (!content) throw new Error('回复内容不能为空')

  const replies = loadReplies()
  const isAnonymous = !!payload.isAnonymous
  const reply: ForumReply = {
    id: uid('r'),
    postId: String(postId),
    content,
    isAnonymous,
    authorDisplay: displayName(isAnonymous),
    authorId: ctx.userId,
    replyToReplyId: payload.replyToReplyId,
    createdAt: nowIso(),
  }
  replies.push(reply)
  saveReplies(replies)

  // bump replyCount
  const posts = loadPosts()
  const idx = posts.findIndex(p => String(p.id) === String(postId))
  if (idx > -1) {
    posts[idx] = {
      ...posts[idx],
      replyCount: (posts[idx].replyCount || 0) + 1,
      updatedAt: nowIso(),
    }
    savePosts(posts)
  }

  return reply
}

export async function toggleLike(postId: string): Promise<{ liked: boolean; likeCount: number }> {
  ensureSeedData()
  const ctx = getUserContext()
  if (!ctx.isLoggedIn) throw new Error('请先登录后再点赞')

  const map = loadUserSet(LS_KEYS.likes)
  const key = ctx.userId || ''
  const list = new Set((map[key] || []).map(String))
  const posts = loadPosts()
  const idx = posts.findIndex(p => String(p.id) === String(postId))
  if (idx < 0) throw new Error('帖子不存在')

  let liked = false
  if (list.has(String(postId))) {
    list.delete(String(postId))
    posts[idx] = { ...posts[idx], likeCount: Math.max(0, (posts[idx].likeCount || 0) - 1) }
    liked = false
  } else {
    list.add(String(postId))
    posts[idx] = { ...posts[idx], likeCount: (posts[idx].likeCount || 0) + 1 }
    liked = true
  }

  map[key] = Array.from(list)
  saveUserSet(LS_KEYS.likes, map)
  savePosts(posts)
  return { liked, likeCount: posts[idx].likeCount }
}

export async function toggleCollect(postId: string): Promise<{ collected: boolean; collectCount: number }> {
  ensureSeedData()
  const ctx = getUserContext()
  if (!ctx.isLoggedIn) throw new Error('请先登录后再收藏')

  const map = loadUserSet(LS_KEYS.collects)
  const key = ctx.userId || ''
  const list = new Set((map[key] || []).map(String))
  const posts = loadPosts()
  const idx = posts.findIndex(p => String(p.id) === String(postId))
  if (idx < 0) throw new Error('帖子不存在')

  let collected = false
  if (list.has(String(postId))) {
    list.delete(String(postId))
    posts[idx] = { ...posts[idx], collectCount: Math.max(0, (posts[idx].collectCount || 0) - 1) }
    collected = false
  } else {
    list.add(String(postId))
    posts[idx] = { ...posts[idx], collectCount: (posts[idx].collectCount || 0) + 1 }
    collected = true
  }

  map[key] = Array.from(list)
  saveUserSet(LS_KEYS.collects, map)
  savePosts(posts)
  return { collected, collectCount: posts[idx].collectCount }
}

export async function createReport(payload: {
  targetType: 'post' | 'reply'
  postId: string
  replyId?: string
  reason: string
  detail?: string
}): Promise<ForumReport> {
  ensureSeedData()
  const ctx = getUserContext()
  if (!ctx.isLoggedIn) throw new Error('请先登录后再举报')

  const reports = loadReports()
  const report: ForumReport = {
    id: uid('rep'),
    targetType: payload.targetType,
    postId: String(payload.postId),
    replyId: payload.replyId ? String(payload.replyId) : undefined,
    reason: payload.reason,
    detail: payload.detail,
    reporterId: ctx.userId,
    reporterDisplay: ctx.name || '用户',
    status: 'pending',
    createdAt: nowIso(),
  }
  reports.unshift(report)
  saveReports(reports)
  return report
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
  const posts = loadPosts()
  const idx = posts.findIndex(p => String(p.id) === String(id))
  if (idx < 0) throw new Error('帖子不存在')
  const status: ForumPostStatus = payload.action === 'approve' ? 'approved' : 'rejected'
  posts[idx] = {
    ...posts[idx],
    status,
    rejectReason: payload.action === 'reject' ? payload.comment || '已驳回' : undefined,
    updatedAt: nowIso(),
  }
  savePosts(posts)
  return posts[idx]
}

export async function adminSetTop(id: string, value: boolean) {
  requireAdmin()
  const posts = loadPosts()
  const idx = posts.findIndex(p => String(p.id) === String(id))
  if (idx < 0) throw new Error('帖子不存在')
  posts[idx] = { ...posts[idx], isTop: !!value, updatedAt: nowIso() }
  savePosts(posts)
  return posts[idx]
}

export async function adminSetEssence(id: string, value: boolean) {
  requireAdmin()
  const posts = loadPosts()
  const idx = posts.findIndex(p => String(p.id) === String(id))
  if (idx < 0) throw new Error('帖子不存在')
  posts[idx] = { ...posts[idx], isEssence: !!value, updatedAt: nowIso() }
  savePosts(posts)
  return posts[idx]
}

export async function adminDeletePost(id: string) {
  requireAdmin()
  const posts = loadPosts().filter(p => String(p.id) !== String(id))
  savePosts(posts)
  const replies = loadReplies().filter(r => String(r.postId) !== String(id))
  saveReplies(replies)
  return { ok: true }
}

export async function adminDeleteReply(id: string) {
  requireAdmin()
  const replies = loadReplies()
  const target = replies.find(r => String(r.id) === String(id))
  const next = replies.filter(r => String(r.id) !== String(id))
  saveReplies(next)

  if (target) {
    const posts = loadPosts()
    const idx = posts.findIndex(p => String(p.id) === String(target.postId))
    if (idx > -1) {
      posts[idx] = { ...posts[idx], replyCount: Math.max(0, (posts[idx].replyCount || 0) - 1), updatedAt: nowIso() }
      savePosts(posts)
    }
  }
  return { ok: true }
}

export async function adminListPendingPosts(params: { page?: number; pageSize?: number } = {}): Promise<PagedResult<ForumPost>> {
  requireAdmin()
  const { page = 1, pageSize = 10 } = params
  const list = loadPosts().filter(p => p.status === 'pending')
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total, page, pageSize }
}

export async function adminListReports(params: { page?: number; pageSize?: number; status?: 'pending' | 'handled' | 'all' } = {}): Promise<PagedResult<ForumReport>> {
  requireAdmin()
  const { page = 1, pageSize = 10, status = 'pending' } = params
  let list = loadReports()
  if (status !== 'all') {
    list = list.filter(r => r.status === status)
  }
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const total = list.length
  const start = (page - 1) * pageSize
  return { list: list.slice(start, start + pageSize), total, page, pageSize }
}

export async function adminHandleReport(id: string, payload: { handled: boolean }) {
  const ctx = requireAdmin()
  const reports = loadReports()
  const idx = reports.findIndex(r => String(r.id) === String(id))
  if (idx < 0) throw new Error('举报不存在')
  reports[idx] = {
    ...reports[idx],
    status: payload.handled ? 'handled' : 'pending',
    handledAt: payload.handled ? nowIso() : undefined,
    handledBy: payload.handled ? ctx.userId : undefined,
  }
  saveReports(reports)
  return reports[idx]
}

