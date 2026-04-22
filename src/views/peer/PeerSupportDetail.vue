<template>
  <div class="peer-support-detail">
    <header class="page-header" :style="{ background: typeGradient }">
      <div class="header-decoration">
        <div class="deco-blob deco-blob-1"></div>
        <div class="deco-blob deco-blob-2"></div>
      </div>
      <div class="header-content">
        <button @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </button>
        <div class="header-type" v-if="post">
          <el-icon><component :is="typeIcon" /></el-icon>
          {{ post.category || '话题讨论' }}
        </div>
      </div>
    </header>

    <div class="page-content">
      <div v-if="loading" class="loading-wrap">
        <div class="loading-spinner">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <span>正在加载内容...</span>
      </div>

      <template v-else-if="post">
        <article class="detail-article">
          <div class="article-header">
            <div class="header-tags">
              <span class="type-tag" :style="{ background: typeGradient }">
                <el-icon><component :is="typeIcon" /></el-icon>
                {{ post.category || '话题讨论' }}
              </span>
              <span v-if="post.isTop" class="flag top-flag">置顶</span>
              <span v-if="post.isEssence" class="flag essence-flag">精华</span>
              <span v-if="post.status === 'pending'" class="flag pending-flag">审核中</span>
              <span v-if="post.status === 'rejected'" class="flag rejected-flag">已驳回</span>
            </div>
            <h1 class="article-title">{{ post.title }}</h1>
            <div class="article-meta">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>发布于 {{ formatDate(post.createdAt) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ post.viewCount || 0 }} 次查看</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ post.authorDisplay }}</span>
              </div>
            </div>
          </div>

          <div class="article-divider">
            <div class="divider-line"></div>
            <span class="divider-icon" :style="{ background: typeGradient }">
              <el-icon><Link /></el-icon>
            </span>
            <div class="divider-line"></div>
          </div>

          <div class="article-body">
            <p class="content-text">{{ post.content }}</p>
            <div v-if="post.tags && post.tags.length" class="tag-row">
              <el-tag v-for="t in post.tags" :key="t" size="small" style="margin-right: 8px">
                #{{ t }}
              </el-tag>
            </div>
          </div>

          <div class="action-bar">
            <el-button @click="handleLike" :type="post?.likedByMe ? 'primary' : 'default'">
              <el-icon><Pointer /></el-icon>
              赞 {{ post?.likeCount || 0 }}
            </el-button>
            <el-button @click="handleCollect" :type="post?.collectedByMe ? 'success' : 'default'">
              <el-icon><Star /></el-icon>
              收藏 {{ post?.collectCount || 0 }}
            </el-button>
            <el-button @click="openReport('post')" type="warning" plain>
              <el-icon><Warning /></el-icon>
              举报
            </el-button>
          </div>

          <div v-if="canAdmin" class="admin-bar">
            <el-button v-if="post.status !== 'approved'" type="success" @click="adminApprove">审核通过</el-button>
            <el-button v-if="post.status !== 'rejected'" type="danger" plain @click="openReject">驳回</el-button>
            <el-button :type="post.isTop ? 'info' : 'primary'" plain @click="toggleTop">
              {{ post.isTop ? '取消置顶' : '置顶' }}
            </el-button>
            <el-button :type="post.isEssence ? 'info' : 'success'" plain @click="toggleEssence">
              {{ post.isEssence ? '取消精华' : '设为精华' }}
            </el-button>
            <el-button type="danger" @click="adminRemovePost">删除帖子</el-button>
          </div>

          <div class="article-footer">
            <div class="footer-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>如有疑问，欢迎联系心理中心或心理委员咨询</span>
            </div>
          </div>
        </article>

        <div class="reply-section">
          <h3 class="reply-title">
            <el-icon><ChatDotRound /></el-icon>
            回复（{{ replyTotal }}）
          </h3>

          <div class="reply-editor">
            <div v-if="replyingTo" class="replying-tip">
              正在回复：#{{ replyingTo.floor }} {{ replyingTo.authorDisplay }}
              <el-button link type="primary" @click="cancelReplyTo">取消</el-button>
            </div>
            <el-input
              v-model="replyText"
              type="textarea"
              :rows="4"
              maxlength="800"
              show-word-limit
              placeholder="写下你的回复（纯文本）"
            />
            <div class="reply-actions">
              <el-checkbox v-model="replyAnonymous">匿名回复</el-checkbox>
              <el-button type="primary" :loading="replySubmitting" @click="submitReply">发布回复</el-button>
            </div>
          </div>

          <div class="reply-list">
            <div v-for="(r, idx) in replies" :key="r.id" class="reply-item">
              <div class="reply-meta">
                <span class="floor">#{{ idx + 1 + (replyPage - 1) * replyPageSize }}</span>
                <span class="author">{{ r.authorDisplay }}</span>
                <span class="time">{{ formatDateTime(r.createdAt) }}</span>
              </div>
              <div class="reply-content">{{ r.content }}</div>
              <div class="reply-tools">
                <el-button size="small" text @click="setReplyTo(r, idx)">回复</el-button>
                <el-button size="small" text type="warning" @click="openReport('reply', r.id)">举报</el-button>
                <el-button v-if="canAdmin" size="small" text type="danger" @click="adminRemoveReply(r.id)">删除</el-button>
              </div>
            </div>
          </div>

          <div class="pager" v-if="replyTotal > replyPageSize">
            <el-pagination
              v-model:current-page="replyPage"
              v-model:page-size="replyPageSize"
              layout="prev, pager, next"
              :total="replyTotal"
              @current-change="loadReplies"
            />
          </div>
        </div>

        <div class="related-actions">
          <h3 class="actions-title">
            <el-icon><Flag /></el-icon>
            相关服务
          </h3>
          <div class="action-cards">
            <router-link to="/appointment/select" class="action-card">
              <div class="action-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)">
                <el-icon><Calendar /></el-icon>
              </div>
              <div class="action-info">
                <h4>预约咨询</h4>
                <p>专业心理咨询服务</p>
              </div>
            </router-link>
            <router-link to="/wiki" class="action-card">
              <div class="action-icon" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%)">
                <el-icon><Reading /></el-icon>
              </div>
              <div class="action-info">
                <h4>心理百科</h4>
                <p>探索心理知识</p>
              </div>
            </router-link>
            <router-link to="/articles" class="action-card">
              <div class="action-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)">
                <el-icon><Document /></el-icon>
              </div>
              <div class="action-info">
                <h4>心理美文</h4>
                <p>温暖心灵文字</p>
              </div>
            </router-link>
          </div>
        </div>

        <div class="nav-section">
          <router-link :to="listPath" class="nav-link" :style="{ background: typeGradient }">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回朋辈互助</span>
          </router-link>
        </div>
      </template>

      <div v-else class="empty-tip">
        <div class="empty-illustration">
          <el-icon class="empty-icon"><Link /></el-icon>
        </div>
        <p class="empty-text">未找到该内容</p>
        <router-link :to="listPath" class="empty-link">
          <el-icon><ArrowLeft /></el-icon>
          返回朋辈互助列表
        </router-link>
      </div>
    </div>

    <div class="reading-progress" :style="{ width: readingProgress + '%', background: typeGradient }"></div>
  </div>

  <el-dialog v-model="reportVisible" title="举报" width="520px" :close-on-click-modal="false">
    <el-form :model="reportForm" label-width="90px">
      <el-form-item label="原因">
        <el-select v-model="reportForm.reason" placeholder="请选择原因" style="width: 100%">
          <el-option label="辱骂/攻击" value="abuse" />
          <el-option label="敏感信息" value="sensitive" />
          <el-option label="垃圾广告" value="spam" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      <el-form-item label="说明">
        <el-input v-model="reportForm.detail" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="可选：补充说明" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="reportVisible = false">取消</el-button>
      <el-button type="primary" :loading="reportSubmitting" @click="submitReport">提交</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="rejectVisible" title="驳回原因" width="520px" :close-on-click-modal="false">
    <el-input v-model="rejectReason" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入驳回原因（可留空）" />
    <template #footer>
      <el-button @click="rejectVisible = false">取消</el-button>
      <el-button type="danger" :loading="adminSubmitting" @click="adminReject">确认驳回</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Loading,
  Calendar,
  View,
  User,
  Link,
  Pointer,
  Star,
  Warning,
  InfoFilled,
  ChatDotRound,
  Flag,
  Reading,
  Document,
} from '@element-plus/icons-vue'
import {
  getPostDetail,
  listReplies,
  createReply,
  toggleLike,
  toggleCollect,
  createReport,
  adminReviewPost,
  adminSetTop,
  adminSetEssence,
  adminDeletePost,
  adminDeleteReply,
} from '@/api/peerForumApi.js'
import type { ForumPost, ForumReply } from '@/types/peerForum.js'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const post = ref<ForumPost | null>(null)
const readingProgress = ref(0)
const replies = ref<ForumReply[]>([])
const replyTotal = ref(0)
const replyPage = ref(1)
const replyPageSize = ref(20)
const replyText = ref('')
const replyAnonymous = ref(true)
const replySubmitting = ref(false)
const replyingTo = ref<{ id: string; floor: number; authorDisplay: string } | null>(null)

const reportVisible = ref(false)
const reportSubmitting = ref(false)
const reportTarget = ref<{ targetType: 'post' | 'reply'; replyId?: string } | null>(null)
const reportForm = ref<{ reason: string; detail: string }>({ reason: '', detail: '' })

const rejectVisible = ref(false)
const rejectReason = ref('')
const adminSubmitting = ref(false)

function isStudentOrParentPortal() {
  const path = window.location.pathname
  return path.startsWith('/student/') || path.startsWith('/parent/')
}

const canAdmin = computed(() => {
  if (isStudentOrParentPortal()) return false
  const role = localStorage.getItem('admin_role') || localStorage.getItem('User_role') || ''
  const token = localStorage.getItem('auth_token') || localStorage.getItem('admin_token') || ''
  return !!token && ['admin', 'counselor', 'center'].includes(String(role).toLowerCase())
})

const typeConfig = {
  '心理委员值班': { gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', icon: 'Clock' },
  '朋辈咨询': { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', icon: 'ChatDotRound' },
  '互助知识': { gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', icon: 'Notebook' },
  '经验分享': { gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', icon: 'Star' },
  '话题讨论': { gradient: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)', icon: 'ChatDotRound' },
  'default': { gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', icon: 'Link' }
}

const typeGradient = computed(() => {
  if (!post.value) {
    return typeConfig['default'].gradient
  }
  return typeConfig[post.value.category]?.gradient || typeConfig['default'].gradient
})

const typeIcon = computed(() => {
  if (!post.value) {
    return typeConfig['default'].icon
  }
  return typeConfig[post.value.category]?.icon || typeConfig['default'].icon
})

// 根据当前路由动态返回列表页路径
const listPath = computed(() => {
  const currentPath = route.path
  // 如果是领导端的详情页（/admin/leader-peer-support/:id），返回领导端列表
  if (currentPath.includes('/admin/leader-peer-support/')) {
    return '/admin/leader-peer-support'
  }
  // 如果是院系领导的详情页（/admin/college-peer-support/:id），返回院系领导列表
  if (currentPath.includes('/admin/college-peer-support/')) {
    return '/admin/college-peer-support'
  }
  // 如果是其他后台角色的详情页（/admin/peer-forum-view/:id 或 /admin/peer-forum-pending/:id），返回查看页面
  if (currentPath.includes('/admin/peer-forum-view/') || currentPath.includes('/admin/peer-forum-pending/')) {
    return '/admin/peer-forum-view'
  }
  // 其他情况返回学生端列表
  return '/student/peer-support'
})

function goBack() {
  router.push(listPath.value)
}

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

function formatDateTime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
}

async function fetchDetail() {
  const id = String(route.params.id || '')
  if (!id) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    post.value = await getPostDetail(id)
  } catch {
    post.value = null
  } finally {
    loading.value = false
  }
  if (post.value) {
    await loadReplies()
  }
}

function updateReadingProgress() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  readingProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
}

async function loadReplies() {
  if (!post.value) return
  const res = await listReplies(post.value.id, { page: replyPage.value, pageSize: replyPageSize.value })
  replies.value = res.list
  replyTotal.value = res.total
}

function setReplyTo(r: ForumReply, idx: number) {
  replyingTo.value = { id: r.id, floor: idx + 1 + (replyPage.value - 1) * replyPageSize.value, authorDisplay: r.authorDisplay }
}

function cancelReplyTo() {
  replyingTo.value = null
}

async function submitReply() {
  if (!post.value) return
  if (!replyText.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  replySubmitting.value = true
  try {
    await createReply(post.value.id, {
      content: replyText.value,
      isAnonymous: replyAnonymous.value,
      replyToReplyId: replyingTo.value?.id,
    })
    ElMessage.success('回复成功')
    replyText.value = ''
    replyingTo.value = null
    replyPage.value = 1
    await fetchDetail()
  } catch (e: any) {
    ElMessage.error(e?.message || '回复失败')
  } finally {
    replySubmitting.value = false
  }
}

async function handleLike() {
  if (!post.value) return
  try {
    const res = await toggleLike(post.value.id)
    if (res) {
      post.value.likeCount = res.likeCount ?? 0
      post.value.likedByMe = res.liked ?? false
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

async function handleCollect() {
  if (!post.value) return
  try {
    const res = await toggleCollect(post.value.id)
    if (res) {
      post.value.collectCount = res.collectCount ?? 0
      post.value.collectedByMe = res.collected ?? false
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

function openReport(targetType: 'post' | 'reply', replyId?: string) {
  reportTarget.value = { targetType, replyId }
  reportForm.value.reason = ''
  reportForm.value.detail = ''
  reportVisible.value = true
}

async function submitReport() {
  if (!post.value || !reportTarget.value) return
  if (!reportForm.value.reason) {
    ElMessage.warning('请选择举报原因')
    return
  }
  reportSubmitting.value = true
  try {
    await createReport({
      targetType: reportTarget.value.targetType,
      postId: post.value.id,
      replyId: reportTarget.value.replyId,
      reason: reportForm.value.reason,
      detail: reportForm.value.detail,
    })
    ElMessage.success('举报已提交')
    reportVisible.value = false
  } catch (e: any) {
    ElMessage.error(e?.message || '举报失败')
  } finally {
    reportSubmitting.value = false
  }
}

async function adminApprove() {
  if (!post.value) return
  adminSubmitting.value = true
  try {
    post.value = await adminReviewPost(post.value.id, { action: 'approve' })
    ElMessage.success('已通过')
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    adminSubmitting.value = false
  }
}

function openReject() {
  rejectReason.value = ''
  rejectVisible.value = true
}

async function adminReject() {
  if (!post.value) return
  adminSubmitting.value = true
  try {
    post.value = await adminReviewPost(post.value.id, { action: 'reject', comment: rejectReason.value })
    ElMessage.success('已驳回')
    rejectVisible.value = false
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    adminSubmitting.value = false
  }
}

async function toggleTop() {
  if (!post.value) return
  adminSubmitting.value = true
  try {
    post.value = await adminSetTop(post.value.id, !post.value.isTop)
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    adminSubmitting.value = false
  }
}

async function toggleEssence() {
  if (!post.value) return
  adminSubmitting.value = true
  try {
    post.value = await adminSetEssence(post.value.id, !post.value.isEssence)
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    adminSubmitting.value = false
  }
}

async function adminRemovePost() {
  if (!post.value) return
  try {
    await ElMessageBox.confirm('确定删除该帖子吗？删除后不可恢复。', '提示', { type: 'warning' })
  } catch {
    return
  }
  adminSubmitting.value = true
  try {
    await adminDeletePost(post.value.id)
    ElMessage.success('已删除')
    router.push('/student/peer-support')
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  } finally {
    adminSubmitting.value = false
  }
}

async function adminRemoveReply(id: string) {
  try {
    await ElMessageBox.confirm('确定删除该回复吗？', '提示', { type: 'warning' })
  } catch {
    return
  }
  adminSubmitting.value = true
  try {
    await adminDeleteReply(id)
    ElMessage.success('已删除')
    await fetchDetail()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  } finally {
    adminSubmitting.value = false
  }
}

onMounted(() => {
  fetchDetail()
  window.addEventListener('scroll', updateReadingProgress)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateReadingProgress)
})

watch(() => route.params.id, fetchDetail)
</script>

<style scoped>
.peer-support-detail {
  min-height: 100vh;
  background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 100%);
}

.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  z-index: 1000;
  transition: width 0.1s;
}

.page-header {
  position: relative;
  padding: 30px;
  color: white;
  overflow: hidden;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.deco-blob {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float-blob 8s ease-in-out infinite;
}

.deco-blob-1 {
  width: 200px;
  height: 200px;
  top: -80px;
  right: -40px;
  animation-delay: 0s;
}

.deco-blob-2 {
  width: 120px;
  height: 120px;
  bottom: -40px;
  left: 10%;
  animation-delay: -4s;
}

@keyframes float-blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(20px, -20px) scale(1.05);
  }
  66% {
    transform: translate(-10px, 10px) scale(0.95);
  }
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.header-type {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.page-content {
  max-width: 900px;
  margin: -20px auto 0;
  padding: 0 24px 60px;
  position: relative;
  z-index: 10;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.detail-article {
  background: white;
  border-radius: 24px;
  padding: 50px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(236, 72, 153, 0.05);
  position: relative;
  overflow: hidden;
}

.detail-article::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: v-bind(typeGradient);
  opacity: 0.8;
}

.article-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #fce7f3;
}

.header-tags {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  gap: 8px;
  flex-wrap: wrap;
}

.type-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.type-tag:hover {
  transform: scale(1.05);
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
  line-height: 1.4;
  letter-spacing: -0.5px;
}

.article-meta {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  padding: 8px 16px;
  background: #f8fafc;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.meta-item:hover {
  background: #fdf2f8;
  color: #ec4899;
}

.meta-item .el-icon {
  color: #ec4899;
  font-size: 16px;
}

.article-divider {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 40px 0;
}

.divider-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #fce7f3, transparent);
}

.divider-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.article-body {
  font-size: 17px;
  line-height: 2;
  color: #334155;
  padding: 20px 0;
}

.article-body .content-text {
  white-space: pre-wrap;
  margin: 0;
}

.article-body .tag-row {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px dashed #e2e8f0;
}

.article-body .tag-row .el-tag {
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 13px;
  border: none;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  color: #be185d;
  transition: all 0.3s ease;
}

.article-body .tag-row .el-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2);
}

.article-body :deep(p) {
  margin: 0 0 20px 0;
  text-indent: 2em;
}

.article-body :deep(h2),
.article-body :deep(h3) {
  margin: 32px 0 16px;
  color: #1e293b;
  font-weight: 600;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  margin: 16px 0;
  padding-left: 2em;
}

.article-body :deep(li) {
  margin: 8px 0;
}

.article-body :deep(strong) {
  color: #be185d;
}

/* 操作栏样式 - 优化 */
.action-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 40px 0;
  padding: 24px;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-radius: 16px;
  flex-wrap: wrap;
}

.action-bar .el-button {
  min-width: 100px;
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.action-bar .el-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.25);
}

.action-bar .el-button--primary {
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  border: none;
}

.action-bar .el-button--success {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border: none;
}

/* 管理员操作栏 */
.admin-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
  padding: 20px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  border: 1px dashed #f59e0b;
  flex-wrap: wrap;
}

.admin-bar .el-button {
  border-radius: 8px;
}

/* 标签样式 */
.flag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
}

.top-flag {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.essence-flag {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.pending-flag {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.rejected-flag {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

/* 回复区样式 - 优化 */
.reply-section {
  margin-top: 40px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
}

.reply-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 28px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 2px solid #fce7f3;
}

.reply-title .el-icon {
  color: #ec4899;
  font-size: 24px;
}

.reply-editor {
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.replying-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #64748b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.reply-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.reply-actions .el-checkbox {
  font-size: 14px;
  color: #64748b;
}

.reply-actions .el-button {
  border-radius: 8px;
  padding: 12px 32px;
  font-weight: 500;
}

/* 回复列表样式 */
.reply-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.reply-item {
  background: linear-gradient(135deg, #fafafa 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.reply-item:hover {
  background: white;
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.1);
  border-color: #fce7f3;
  transform: translateX(4px);
}

.reply-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.reply-meta .floor {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 24px;
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  padding: 0 10px;
}

.reply-meta .author {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
}

.reply-meta .time {
  font-size: 13px;
  color: #94a3b8;
}

.reply-content {
  font-size: 15px;
  line-height: 1.8;
  color: #334155;
  margin: 12px 0;
  padding-left: 52px;
}

.reply-tools {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-left: 52px;
}

.reply-tools .el-button {
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
}

/* 分页样式 */
.pager {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.pager :deep(.el-pagination) {
  --el-pagination-button-bg-color: white;
  --el-pagination-hover-color: #ec4899;
}

.pager :deep(.el-pagination .el-pager li.active) {
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
}

/* 文章页脚 */
.article-footer {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 2px solid #fce7f3;
}

.footer-tip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-radius: 14px;
  font-size: 14px;
  color: #be185d;
  border-left: 4px solid #ec4899;
}

.footer-tip .el-icon {
  font-size: 22px;
  color: #ec4899;
  flex-shrink: 0;
}

/* 相关服务 - 优化 */
.related-actions {
  margin-top: 40px;
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
}

.actions-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.actions-title .el-icon {
  color: #ec4899;
  font-size: 22px;
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
  background: white;
}

.action-card:hover {
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-color: #fbcfe8;
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(236, 72, 153, 0.15);
}

.action-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
}

.action-card:hover .action-icon {
  transform: scale(1.1) rotate(-5deg);
}

.action-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.action-info p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* 返回导航 - 优化 */
.nav-section {
  margin-top: 40px;
  text-align: center;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  border-radius: 30px;
  color: white;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 25px rgba(236, 72, 153, 0.35);
}

.nav-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(236, 72, 153, 0.45);
}

/* 空状态 - 优化 */
.empty-tip {
  text-align: center;
  padding: 100px 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
}

.empty-illustration {
  width: 140px;
  height: 140px;
  margin: 0 auto 32px;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.15);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-icon {
  font-size: 56px;
  color: #ec4899;
}

.empty-text {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
}

.empty-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  border-radius: 30px;
  color: white;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.3);
}

.empty-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);
}

/* 加载动画 - 优化 */
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 100px 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.5);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(236, 72, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0);
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 24px 20px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .back-btn {
    padding: 8px 16px;
    font-size: 13px;
  }

  .detail-article {
    padding: 30px 20px;
    border-radius: 20px;
  }

  .article-title {
    font-size: 22px;
  }

  .article-meta {
    gap: 12px;
  }

  .meta-item {
    font-size: 12px;
    padding: 6px 12px;
  }

  .action-bar {
    padding: 16px;
    gap: 10px;
  }

  .action-bar .el-button {
    min-width: auto;
    flex: 1;
    height: 40px;
    font-size: 13px;
  }

  .admin-bar {
    padding: 16px;
  }

  .reply-section {
    padding: 24px 20px;
    border-radius: 16px;
  }

  .reply-title {
    font-size: 18px;
  }

  .reply-editor {
    padding: 16px;
  }

  .reply-content {
    padding-left: 0;
  }

  .reply-tools {
    padding-left: 0;
  }

  .action-cards {
    grid-template-columns: 1fr;
  }

  .related-actions {
    padding: 24px 20px;
  }

  .nav-link {
    padding: 14px 28px;
    font-size: 14px;
  }
}
</style>
