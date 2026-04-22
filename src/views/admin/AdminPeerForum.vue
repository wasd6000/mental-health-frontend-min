<template>
  <div class="admin-peer-forum">
    <div class="page-header">
      <h2>{{ getPageTitle }}</h2>
      <p class="desc">{{ getPageDesc }}</p>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="所有帖子" name="posts">
        <div class="toolbar">
          <el-input v-model="postKeyword" placeholder="搜索标题..." clearable style="width: 240px" @keyup.enter="loadPosts" />
          <el-select v-model="postCategory" placeholder="板块" clearable style="width: 160px" @change="loadPosts">
            <el-option label="全部" value="" />
            <el-option label="话题讨论" value="话题讨论" />
            <el-option label="经验分享" value="经验分享" />
            <el-option label="互助知识" value="互助知识" />
            <el-option label="朋辈咨询" value="朋辈咨询" />
            <el-option label="心理委员值班" value="心理委员值班" />
            <el-option label="志愿服务" value="志愿服务" />
          </el-select>
          <el-button type="primary" @click="loadPosts">刷新</el-button>
        </div>

        <el-table :data="postList" style="width: 100%" v-loading="loadingPosts">
          <el-table-column prop="createdAt" label="时间" width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="category" label="板块" width="120" />
          <el-table-column prop="title" label="标题" min-width="240" />
          <el-table-column prop="authorDisplay" label="作者" width="140" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'approved' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'">
                {{ row.status === 'approved' ? '已通过' : row.status === 'pending' ? '待审核' : '已驳回' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="goDetail(row.id)">查看</el-button>
              <el-button v-if="canAudit && row.status !== 'approved'" size="small" type="success" @click="approve(row.id)">通过</el-button>
              <el-button v-if="canAudit && row.status !== 'rejected'" size="small" type="danger" plain @click="reject(row.id)">驳回</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pager" v-if="postTotal > postPageSize">
          <el-pagination
              v-model:current-page="postPage"
              v-model:page-size="postPageSize"
              layout="prev, pager, next"
              :total="postTotal"
              @current-change="loadPosts"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane v-if="canShowPending" label="待审核帖子" name="pending">
        <div class="toolbar">
          <el-button type="primary" @click="loadPending">刷新</el-button>
        </div>

        <el-table :data="pendingList" style="width: 100%" v-loading="loadingPending">
          <el-table-column prop="createdAt" label="时间" width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="category" label="板块" width="120" />
          <el-table-column prop="title" label="标题" min-width="240" />
          <el-table-column prop="authorDisplay" label="作者" width="140" />
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="goDetail(row.id)">查看</el-button>
              <el-button size="small" type="success" @click="approve(row.id)">通过</el-button>
              <el-button size="small" type="danger" plain @click="reject(row.id)">驳回</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pager" v-if="pendingTotal > pendingPageSize">
          <el-pagination
              v-model:current-page="pendingPage"
              v-model:page-size="pendingPageSize"
              layout="prev, pager, next"
              :total="pendingTotal"
              @current-change="loadPending"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane v-if="canShowReports" label="举报处理" name="reports">
        <div class="toolbar">
          <el-select v-model="reportStatus" style="width: 160px" @change="loadReports">
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="handled" />
            <el-option label="全部" value="all" />
          </el-select>
          <el-button type="primary" @click="loadReports">刷新</el-button>
        </div>

        <el-table :data="reportList" style="width: 100%" v-loading="loadingReports">
          <el-table-column prop="createdAt" label="时间" width="170">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="targetType" label="对象" width="90">
            <template #default="{ row }">
              {{ row.targetType === 'POST' ? '帖子' : row.targetType === 'REPLY' ? '回复' : row.targetType }}
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="原因" width="120">
            <template #default="{ row }">
              {{ formatReportReason(row.reason) }}
            </template>
          </el-table-column>
          <el-table-column prop="detail" label="说明" min-width="220" />
          <el-table-column label="关联" width="180">
            <template #default="{ row }">
              <el-button size="small" @click="goDetail(row.postId)">打开帖子</el-button>
              <span v-if="row.replyId" class="minor">reply: {{ row.replyId }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 'HANDLED' ? 'success' : 'warning'">
                {{ row.status === 'HANDLED' ? '已处理' : row.status === 'PENDING' ? '待处理' : row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button
                  v-if="canAudit && row.status !== 'HANDLED'"
                  size="small"
                  type="success"
                  @click="markReportHandled(row.id)"
              >
                标记已处理
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pager" v-if="reportTotal > reportPageSize">
          <el-pagination
              v-model:current-page="reportPage"
              v-model:page-size="reportPageSize"
              layout="prev, pager, next"
              :total="reportTotal"
              @current-change="loadReports"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 帖子详情对话框 -->
    <el-dialog v-model="postDetailVisible" title="帖子详情" width="700px" destroy-on-close>
      <div v-if="postDetailLoading" class="detail-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <template v-else-if="postDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题" :span="2">{{ postDetail.title }}</el-descriptions-item>
          <el-descriptions-item label="板块">{{ postDetail.category }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ postDetail.authorDisplay }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ formatDateTime(postDetail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="postDetail.status === 'approved' ? 'success' : 'warning'">
              {{ postDetail.status === 'approved' ? '已通过' : '待审核' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div class="post-content">
          <h4>帖子内容</h4>
          <div class="content-text">{{ postDetail.content || '暂无内容' }}</div>
        </div>
      </template>
      <el-empty v-else description="加载失败" />
      <template #footer>
        <el-button @click="postDetailVisible = false">关闭</el-button>
        <el-button v-if="canAudit && postDetail && postDetail.status !== 'approved'" type="success" @click="approveAndClose(postDetail.id)">通过</el-button>
        <el-button v-if="canAudit && postDetail && postDetail.status !== 'approved'" type="danger" plain @click="rejectAndClose(postDetail.id)">驳回</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectVisible" title="驳回原因" width="520px" :close-on-click-modal="false">
      <el-input v-model="rejectReason" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入驳回原因（可留空）" />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="rejectSubmitting" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { listPosts, adminListPendingPosts, adminReviewPost, adminListReports, adminHandleReport, getPostDetail } from '@/api/peerForumApi.js'
import type { ForumPost, ForumReport } from '@/types/peerForum.js'

const router = useRouter()
const route = useRoute()

// 判断是否为领导角色（只读权限）
const isLeaderRole = computed(() => {
  const role = localStorage.getItem('admin_role') || localStorage.getItem('user_role')
  return ['leader', 'school_leader', 'college', 'college_leader'].includes(role)
})

// 判断是否为审核模式（根据路由路径）
const isAuditMode = computed(() => {
  const path = route.path
  return path.includes('audit') || path.includes('pending') || path.includes('posts') || path.includes('reports')
})

// 是否可以执行审核操作（非领导角色且是审核模式）
const canAudit = computed(() => !isLeaderRole.value && isAuditMode.value)

// 是否显示待审核标签页（审核模式下且非领导角色）
const canShowPending = computed(() => isAuditMode.value && !isLeaderRole.value)

// 是否显示举报处理标签页（审核模式下）
const canShowReports = computed(() => isAuditMode.value)

// 页面标题
const getPageTitle = computed(() => {
  if (isLeaderRole.value) return '同辈互助查看'
  if (isAuditMode.value) return '同辈互助审核'
  return '同辈互助管理'
})

// 页面描述
const getPageDesc = computed(() => {
  if (isLeaderRole.value) return '查看所有已通过的朋辈互助帖子'
  if (isAuditMode.value) return '审核待处理的帖子与举报内容'
  return '处理待审核帖子与举报内容'
})

// 根据路由路径确定默认激活的标签页
const getDefaultTab = () => {
  const path = route.path
  if (path.includes('/pending')) return 'pending'
  if (path.includes('/reports')) return 'reports'
  if (path.includes('/posts')) return 'posts'
  // 如果是审核模式，默认显示待审核
  if (isAuditMode.value && !isLeaderRole.value) return 'pending'
  // 如果是领导角色或非审核模式，默认显示所有帖子
  return 'posts'
}

const activeTab = ref<'pending' | 'reports' | 'posts'>(getDefaultTab())

// 监听路由变化，自动切换标签页
watch(() => route.path, (newPath) => {
  if (newPath.includes('/pending')) {
    activeTab.value = 'pending'
  } else if (newPath.includes('/reports')) {
    activeTab.value = 'reports'
  } else if (newPath.includes('/posts')) {
    activeTab.value = 'posts'
  } else if (newPath.includes('audit')) {
    // 审核模式，默认显示待审核
    if (!isLeaderRole.value) {
      activeTab.value = 'pending'
    } else {
      activeTab.value = 'posts'
    }
  } else if (newPath.includes('peer-support')) {
    // 查看模式，只显示所有帖子
    activeTab.value = 'posts'
  }
})

function formatDateTime(iso: string) {
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

// 格式化举报原因
function formatReportReason(reason: string) {
  const reasonMap: Record<string, string> = {
    'abuse': '辱骂/攻击',
    'sensitive': '敏感信息',
    'spam': '垃圾广告',
    'other': '其他',
    'ABUSE': '辱骂/攻击',
    'SENSITIVE': '敏感信息',
    'SPAM': '垃圾广告',
    'OTHER': '其他'
  }
  return reasonMap[reason] || reason || '-'
}

// 帖子详情对话框
const postDetailVisible = ref(false)
const postDetailLoading = ref(false)
const postDetail = ref<ForumPost | null>(null)

async function goDetail(id: string) {
  postDetailVisible.value = true
  postDetailLoading.value = true
  postDetail.value = null

  try {
    const detail = await getPostDetail(id)
    postDetail.value = detail
  } catch (e: any) {
    ElMessage.error(e?.message || '加载帖子详情失败')
  } finally {
    postDetailLoading.value = false
  }
}

// 在对话框中通过
async function approveAndClose(id: string) {
  try {
    await adminReviewPost(id, { action: 'approve' })
    ElMessage.success('已通过')
    postDetailVisible.value = false
    await loadPending()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

// 在对话框中驳回
async function rejectAndClose(id: string) {
  rejectId.value = id
  rejectReason.value = ''
  postDetailVisible.value = false
  rejectVisible.value = true
}

// pending posts
const loadingPending = ref(false)
const pendingList = ref<ForumPost[]>([])
const pendingTotal = ref(0)
const pendingPage = ref(1)
const pendingPageSize = ref(10)

async function loadPending() {
  loadingPending.value = true
  try {
    const res = await adminListPendingPosts({ page: pendingPage.value, pageSize: pendingPageSize.value })
    pendingList.value = res.list
    pendingTotal.value = res.total
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loadingPending.value = false
  }
}

async function approve(id: string) {
  try {
    await adminReviewPost(id, { action: 'approve' })
    ElMessage.success('已通过')
    await loadPending()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectSubmitting = ref(false)
const rejectId = ref<string | null>(null)

function reject(id: string) {
  rejectId.value = id
  rejectReason.value = ''
  rejectVisible.value = true
}

async function confirmReject() {
  if (!rejectId.value) return
  rejectSubmitting.value = true
  try {
    await adminReviewPost(rejectId.value, { action: 'reject', comment: rejectReason.value })
    ElMessage.success('已驳回')
    rejectVisible.value = false
    await loadPending()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    rejectSubmitting.value = false
  }
}

// all posts
const loadingPosts = ref(false)
const postList = ref<ForumPost[]>([])
const postTotal = ref(0)
const postPage = ref(1)
const postPageSize = ref(10)
const postKeyword = ref('')
const postCategory = ref('')

async function loadPosts() {
  loadingPosts.value = true
  try {
    const res = await listPosts({
      page: postPage.value,
      pageSize: postPageSize.value,
      keyword: postKeyword.value || undefined,
      category: postCategory.value || undefined,
      status: undefined, // 不限制状态，显示所有帖子
    })
    postList.value = res.list
    postTotal.value = res.total
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loadingPosts.value = false
  }
}

// reports
const loadingReports = ref(false)
const reportList = ref<ForumReport[]>([])
const reportTotal = ref(0)
const reportPage = ref(1)
const reportPageSize = ref(10)
const reportStatus = ref<'pending' | 'handled' | 'all'>('pending')

async function loadReports() {
  loadingReports.value = true
  try {
    const res = await adminListReports({
      page: reportPage.value,
      pageSize: reportPageSize.value,
      status: reportStatus.value,
    })
    reportList.value = res.list
    reportTotal.value = res.total
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loadingReports.value = false
  }
}

async function markReportHandled(id: string) {
  try {
    await adminHandleReport(id, { handled: true })
    ElMessage.success('已标记处理')
    await loadReports()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

onMounted(async () => {
  // 根据当前激活的标签页加载对应数据
  if (activeTab.value === 'posts') {
    await loadPosts()
  } else if (activeTab.value === 'pending') {
    await loadPending()
  } else if (activeTab.value === 'reports') {
    await loadReports()
  }

  // 预加载其他两个标签页的数据（可选，提升用户体验）
  if (activeTab.value !== 'pending') {
    loadPending().catch(() => {})
  }
  if (activeTab.value !== 'reports') {
    loadReports().catch(() => {})
  }
})
</script>

<style scoped>
.admin-peer-forum {
  padding: 20px;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.desc {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.pager {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.minor {
  margin-left: 8px;
  color: #94a3b8;
  font-size: 12px;
}

.detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #909399;
}

.post-content {
  margin-top: 20px;
}

.post-content h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.content-text {
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  min-height: 100px;
}
</style>
