<template>
  <div class="admin-peer-forum">
    <div class="page-header">
      <h2>朋辈互助论坛管理</h2>
      <p class="desc">处理待审核帖子与举报内容</p>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="待审核帖子" name="pending">
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

      <el-tab-pane label="举报处理" name="reports">
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
          <el-table-column prop="targetType" label="对象" width="90" />
          <el-table-column prop="reason" label="原因" width="120" />
          <el-table-column prop="detail" label="说明" min-width="220" />
          <el-table-column label="关联" width="180">
            <template #default="{ row }">
              <el-button size="small" @click="goDetail(row.postId)">打开帖子</el-button>
              <span v-if="row.replyId" class="minor">reply: {{ row.replyId }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90" />
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.status !== 'handled'"
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminListPendingPosts, adminReviewPost, adminListReports, adminHandleReport } from '@/api/peerForumApi.js'
import type { ForumPost, ForumReport } from '@/types/peerForum.js'

const router = useRouter()
const activeTab = ref<'pending' | 'reports'>('pending')

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

function goDetail(id: string) {
  router.push(`/student/peer-support/${id}`)
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
  await loadPending()
  await loadReports()
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
</style>

