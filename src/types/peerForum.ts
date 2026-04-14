export type ForumPostStatus = 'pending' | 'approved' | 'rejected'

export type ForumSort = 'latest' | 'hot' | 'essence' | 'top'

export interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isAnonymous: boolean
  authorDisplay: string
  authorId?: string
  status: ForumPostStatus
  rejectReason?: string
  isTop: boolean
  isEssence: boolean
  likeCount: number
  collectCount: number
  replyCount: number
  viewCount: number
  likedByMe?: boolean
  collectedByMe?: boolean
  createdAt: string
  updatedAt?: string
}

export interface ForumReply {
  id: string
  postId: string
  content: string
  isAnonymous: boolean
  authorDisplay: string
  authorId?: string
  replyToReplyId?: string
  createdAt: string
}

export type ForumReportTargetType = 'post' | 'reply'
export type ForumReportStatus = 'pending' | 'handled'

export interface ForumReport {
  id: string
  targetType: ForumReportTargetType
  postId: string
  replyId?: string
  reason: string
  detail?: string
  reporterId?: string
  reporterDisplay?: string
  status: ForumReportStatus
  createdAt: string
  handledAt?: string
  handledBy?: string
}

export interface ListPostsParams {
  page?: number
  pageSize?: number
  keyword?: string
  category?: string
  tag?: string
  sort?: ForumSort
  status?: ForumPostStatus | 'all'
}

export interface PagedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

