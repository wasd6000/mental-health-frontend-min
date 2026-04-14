<template>
  <div class="leave-list-page">
    <div class="page-head">
      <div class="head-main">
        <h2>我的请假</h2>
        <p class="page-desc">
          数据来自 GET /api/leave/list（分页）；撤销使用 POST /api/leave/cancel?leaveId=。审批请在「请假审批」菜单操作。
        </p>
      </div>
      <div v-if="isCounselor" class="head-actions">
        <el-button type="primary" :icon="Plus" @click="goApply">申请请假</el-button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-value">{{ stats.pending }}</span>
        <span class="stat-label">待审批（本页）</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.approved }}</span>
        <span class="stat-label">已通过（本页）</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.rejected }}</span>
        <span class="stat-label">已拒绝（本页）</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.cancelled }}</span>
        <span class="stat-label">已撤销（本页）</span>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <div class="card-header">
        <el-form :inline="true" :model="filter" class="filter-form">
          <el-form-item label="状态">
            <el-select
              v-model="filter.status"
              placeholder="全部"
              clearable
              style="width: 140px"
              @change="onFilterChange"
            >
              <el-option label="待审批" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="已撤销" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">刷新</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="rows" stripe v-loading="loading">
        <el-table-column prop="leaveId" label="请假单号" min-width="200" show-overflow-tooltip />
        <el-table-column prop="leaveType" label="类型" width="100" />
        <el-table-column prop="leaveDate" label="开始日期" width="120" />
        <el-table-column prop="leaveTime" label="时间段" width="180" show-overflow-tooltip />
        <el-table-column prop="reason" label="原因" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="isCounselor && row.status === 'pending'"
              type="warning"
              link
              size="small"
              :loading="cancellingId === row.leaveId"
              @click="onCancel(row)"
            >
              撤销
            </el-button>
            <el-button
              v-if="isCounselor && ['rejected', 'cancelled'].includes(row.status)"
              type="primary"
              link
              size="small"
              @click="reapply(row)"
            >
              重新申请
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!rows.length && !loading" description="暂无请假记录" />

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLeaveList, cancelLeave, parseLeavePage } from '../../api/leaveApi'

const router = useRouter()
const loading = ref(false)
const leaves = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filter = reactive({ status: '' })
const cancellingId = ref('')

const isCounselor = computed(() => {
  const r = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_role') : ''
  return r === 'counselor'
})

/** 后端 leave_request.status 大写 */
const STATUS_API = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
}

const STATUS_UI_TO_API = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  cancelled: 'CANCELLED',
}

const STATUS_MAP = {
  pending: { type: 'warning', text: '待审批' },
  approved: { type: 'success', text: '已通过' },
  rejected: { type: 'info', text: '已拒绝' },
  cancelled: { type: 'info', text: '已撤销' },
}

const rows = computed(() => leaves.value)

const stats = computed(() => {
  const list = leaves.value
  return {
    pending: list.filter((l) => l.status === 'pending').length,
    approved: list.filter((l) => l.status === 'approved').length,
    rejected: list.filter((l) => l.status === 'rejected').length,
    cancelled: list.filter((l) => l.status === 'cancelled').length,
  }
})

function getStatusType(status) {
  return STATUS_MAP[status]?.type || 'info'
}

function getStatusText(status) {
  return STATUS_MAP[status]?.text || status
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDateTime(v) {
  if (v == null || v === '') return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function formatDateOnly(v) {
  if (v == null || v === '') return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function formatTimeRange(start, end) {
  if (!start && !end) return '—'
  return `${formatDateTime(start)} ~ ${formatDateTime(end)}`
}

function mapApiStatus(s) {
  if (!s) return 'pending'
  const u = String(s).toUpperCase()
  return STATUS_API[u] || String(s).toLowerCase()
}

function normalizeItem(vo) {
  const status = mapApiStatus(vo.status)
  return {
    leaveId: vo.leaveId || vo.id,
    leaveType: vo.leaveType || '—',
    leaveDate: formatDateOnly(vo.startTime),
    leaveTime: formatTimeRange(vo.startTime, vo.endTime),
    reason: vo.reason || '—',
    status,
    applyTime: formatDateTime(vo.createdAt),
    raw: vo,
  }
}

function buildQueryParams() {
  const params = {
    page: page.value,
    pageSize: pageSize.value,
  }
  if (filter.status && STATUS_UI_TO_API[filter.status]) {
    params.statusFilter = STATUS_UI_TO_API[filter.status]
  }
  return params
}

async function loadData() {
  loading.value = true
  try {
    const res = await getLeaveList(buildQueryParams())
    if (res?.code !== 200) {
      leaves.value = []
      total.value = 0
      ElMessage.error(res?.msg || res?.message || '加载失败')
      return
    }
    const { records, total: t } = parseLeavePage(res)
    total.value = Number(t) || 0
    leaves.value = (records || []).filter(Boolean).map(normalizeItem)
  } catch (e) {
    leaves.value = []
    total.value = 0
    const msg = e?.response?.data?.msg || e?.message || '加载失败'
    ElMessage.error(typeof msg === 'string' ? msg : '加载失败')
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  page.value = 1
  loadData()
}

function goApply() {
  router.push('/leave/apply')
}

async function onCancel(row) {
  if (!row?.leaveId) return
  try {
    await ElMessageBox.confirm('确定撤销该请假申请？', '撤销确认', { type: 'warning' })
  } catch {
    return
  }
  cancellingId.value = row.leaveId
  try {
    const res = await cancelLeave({ leaveId: row.leaveId })
    if (res?.code === 200) {
      ElMessage.success(res?.msg || '已撤销')
      await loadData()
    } else {
      ElMessage.error(res?.msg || '撤销失败')
    }
  } catch (e) {
    const msg = e?.response?.data?.msg || e?.message || '撤销失败'
    ElMessage.error(typeof msg === 'string' ? msg : '撤销失败')
  } finally {
    cancellingId.value = ''
  }
}

function reapply(row) {
  router.push({
    path: '/leave/apply',
    query: { fromId: row.leaveId },
  })
}

onMounted(() => {
  const role = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_role') : ''
  if (role === 'center' || role === 'admin') {
    router.replace('/admin/leave')
    return
  }
  loadData()
})
</script>

<style scoped>
.leave-list-page {
  max-width: 1100px;
  padding: 20px 0;
}

.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #fffbeb 100%);
  border-radius: 14px;
  border: 1px solid #fde68a;
}

.head-main h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.table-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.card-header {
  margin-bottom: 16px;
}

.filter-form {
  margin-bottom: 0;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
