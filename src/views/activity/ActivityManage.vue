<template>
  <div class="activity-manage-page">
    <div class="page-head">
      <div class="head-main">
        <h2>团体活动管理</h2>
        <p class="page-desc">
          对接后端活动列表、我的活动、报名/取消/签到；详情与报名时间与后端一致。
        </p>
      </div>
      <div class="head-actions">
        <el-button type="primary" :icon="Plus" @click="goCreate">创建活动</el-button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-value">{{ stats.ongoing }}</span>
        <span class="stat-label">进行中（本页）</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.finished }}</span>
        <span class="stat-label">已结束（本页）</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.myJoined }}</span>
        <span class="stat-label">我已报名</span>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" @submit.prevent="loadData">
        <el-form-item label="关键词">
          <el-input
            v-model="keyword"
            placeholder="标题/简介"
            clearable
            style="width: 200px"
            @clear="loadData"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="activities" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="activityId" label="活动编号" min-width="200" show-overflow-tooltip />
        <el-table-column prop="title" label="活动名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="timeText" label="时间" width="200" show-overflow-tooltip />
        <el-table-column prop="location" label="地点" width="120" show-overflow-tooltip />
        <el-table-column label="名额" width="100">
          <template #default="{ row }">
            {{ row.joinedCount }} / {{ row.capacity || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="阶段" width="100">
          <template #default="{ row }">
            <el-tag :type="phaseTagType(row.phase)" size="small">
              {{ row.phase.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="报名" width="88">
          <template #default="{ row }">
            <el-tag v-if="row.joined" type="success" size="small">已报名</el-tag>
            <el-tag v-else type="info" size="small">未报名</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签到" width="88">
          <template #default="{ row }">
            <el-tag v-if="row.checkedIn" type="success" size="small">已签到</el-tag>
            <el-tag v-else type="info" size="small">未签到</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDetail(row)">详情</el-button>
            <el-button
              v-if="canSignup(row)"
              type="primary"
              link
              size="small"
              :loading="actionId === row.activityId && actionKind === 'signup'"
              @click="onSignup(row)"
            >
              报名
            </el-button>
            <el-button
              v-if="canCancel(row)"
              type="warning"
              link
              size="small"
              :loading="actionId === row.activityId && actionKind === 'cancel'"
              @click="onCancel(row)"
            >
              取消报名
            </el-button>
            <el-button
              v-if="canCheckin(row)"
              type="success"
              link
              size="small"
              @click="goCheckin(row)"
            >
              签到
            </el-button>
            <el-button type="default" link size="small" @click="goSummary(row)">总结</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!activities.length && !loading" description="暂无活动" />

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

    <el-drawer v-model="detailVisible" title="活动详情" size="420px" destroy-on-close>
      <template v-if="detail">
        <p><strong>编号</strong>：{{ detail.activityId }}</p>
        <p><strong>标题</strong>：{{ detail.title }}</p>
        <p><strong>地点</strong>：{{ detail.location || '—' }}</p>
        <p><strong>时间</strong>：{{ formatRange(detail.startTime, detail.endTime) }}</p>
        <p><strong>报名窗口</strong>：{{ formatRange(detail.joinStartTime, detail.joinEndTime) }}</p>
        <p><strong>名额</strong>：{{ detail.joinedCount }} / {{ detail.capacity ?? '—' }}</p>
        <p><strong>状态</strong>：{{ detail.status || '—' }}</p>
        <p><strong>已报名</strong>：{{ detail.joined ? '是' : '否' }}</p>
        <p><strong>已签到</strong>：{{ detail.checkedIn ? '是' : '否' }}</p>
        <h4 class="detail-sub">简介</h4>
        <p class="detail-text">{{ detail.summary || '—' }}</p>
        <h4 class="detail-sub">内容</h4>
        <div class="detail-content">{{ detail.content || '—' }}</div>
      </template>
      <p v-else-if="detailLoading" class="muted">加载中…</p>
      <p v-else class="muted">暂无数据</p>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getActivityList,
  getActivityDetail,
  getMyActivities,
  joinActivity,
  cancelActivity,
} from '../../api/activity.js'

// 解析分页数据的辅助函数
function parseActivityPage(res: any) {
  const data = res?.data || res
  if (!data) return { records: [], total: 0 }

  // 兼容多种返回格式
  if (Array.isArray(data)) {
    return { records: data, total: data.length }
  }

  return {
    records: data?.records || data?.list || [],
    total: data?.total || 0
  }
}

// 报名活动的包装函数
async function signupActivity(params: { activityId: string }) {
  return joinActivity(params.activityId)
}

// 取消报名的包装函数
async function cancelActivityRegistration(params: { activityId: string }) {
  return cancelActivity(params.activityId)
}

const router = useRouter()
const loading = ref(false)
const activities = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const myById = ref<Map<string, any>>(new Map())

const actionId = ref<string | null>(null)
const actionKind = ref<'signup' | 'cancel' | null>(null)

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<any | null>(null)

const stats = computed(() => ({
  ongoing: activities.value.filter((a) => a.phase.key === 'ongoing').length,
  finished: activities.value.filter((a) => a.phase.key === 'finished').length,
  myJoined: activities.value.filter((a) => a.joined).length,
}))

function formatDt(v: unknown): string {
  if (v == null || v === '') return '—'
  const d = new Date(String(v))
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleString('zh-CN', { hour12: false })
}

function formatRange(a: unknown, b: unknown) {
  return `${formatDt(a)} ~ ${formatDt(b)}`
}

function derivePhase(start: unknown, end: unknown) {
  const now = Date.now()
  const s = start != null && String(start) !== '' ? new Date(String(start)).getTime() : null
  const e = end != null && String(end) !== '' ? new Date(String(end)).getTime() : null
  if (s != null && !Number.isNaN(s) && now < s) return { key: 'upcoming', label: '未开始' }
  if (e != null && !Number.isNaN(e) && now > e) return { key: 'finished', label: '已结束' }
  return { key: 'ongoing', label: '进行中' }
}

function phaseTagType(phase: { key: string }) {
  if (phase.key === 'ongoing') return 'success'
  if (phase.key === 'finished') return 'info'
  return 'warning'
}

function normalizeRow(vo: any, myMap: Map<string, any>) {
  const id = vo.activityId || vo.id
  const my = id ? myMap.get(id) : undefined
  const joined = Boolean(vo.joined ?? (my && my.joinStatus === 'JOINED'))
  const checkedIn = Boolean(my && Number(my.checkinStatus) === 1)
  const start = vo.startTime
  const end = vo.endTime
  const phase = derivePhase(start, end)
  return {
    activityId: id,
    title: vo.title || '—',
    location: vo.location || '—',
    startTime: start,
    endTime: end,
    timeText: `${formatDt(start)} ~ ${formatDt(end)}`,
    capacity: vo.capacity,
    joinedCount: vo.joinedCount ?? 0,
    joined,
    checkedIn,
    phase,
    raw: vo,
  }
}

function inJoinWindow(d: any): boolean {
  if (!d?.joinStartTime && !d?.joinEndTime) return true
  const now = Date.now()
  const js = d.joinStartTime ? new Date(String(d.joinStartTime)).getTime() : null
  const je = d.joinEndTime ? new Date(String(d.joinEndTime)).getTime() : null
  if (js != null && !Number.isNaN(js) && now < js) return false
  if (je != null && !Number.isNaN(je) && now > je) return false
  return true
}

function canSignup(row: any) {
  return !row.joined && row.phase.key !== 'finished'
}

function canCancel(row: any) {
  return row.joined && !row.checkedIn && row.phase.key !== 'finished'
}

function canCheckin(row: any) {
  return row.joined && !row.checkedIn && row.phase.key === 'ongoing'
}

async function loadData() {
  loading.value = true
  try {
    const [listRes, myRes] = await Promise.all([
      getActivityList({
        page: page.value,
        pageSize: pageSize.value,
        keyword: keyword.value?.trim() || undefined,
      }),
      getMyActivities({ page: 1, pageSize: 500 }),
    ])
    const { total: t, records } = parseActivityPage(listRes)
    total.value = Number(t) || 0
    const { records: myRecords } = parseActivityPage(myRes)
    const mmap = new Map<string, any>()
    for (const r of myRecords || []) {
      if (r && r.activityId) mmap.set(r.activityId, r)
    }
    myById.value = mmap
    activities.value = (records || []).filter(Boolean).map((vo: any) => normalizeRow(vo, mmap))
  } catch (e: any) {
    activities.value = []
    total.value = 0
    const msg =
        e?.response?.data?.msg || e?.response?.data?.message || e?.message || '加载失败'
    ElMessage.error(typeof msg === 'string' ? msg : '加载失败')
  } finally {
    loading.value = false
  }
}

async function openDetail(row: any) {
  if (!row?.activityId) return
  detailVisible.value = true
  detail.value = null
  detailLoading.value = true
  try {
    const res: any = await getActivityDetail(row.activityId)
    if (res?.code === 200 && res.data) {
      detail.value = res.data
    } else {
      ElMessage.error(res?.msg || res?.message || '获取详情失败')
    }
  } catch (e: any) {
    const msg = e?.response?.data?.msg || e?.message || '获取详情失败'
    ElMessage.error(typeof msg === 'string' ? msg : '获取详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function onSignup(row: any) {
  let d = detail.value?.activityId === row.activityId ? detail.value : null
  if (!d) {
    try {
      const res: any = await getActivityDetail(row.activityId)
      if (res?.code === 200) d = res.data
    } catch {
      /* 忽略，仅用于判断报名窗口 */
    }
  }
  if (d && !inJoinWindow(d)) {
    ElMessage.warning('当前不在报名时间内')
    return
  }
  actionId.value = row.activityId
  actionKind.value = 'signup'
  try {
    const res: any = await signupActivity({ activityId: row.activityId })
    if (res?.code === 200) {
      ElMessage.success(res?.data || res?.msg || '报名成功')
      await loadData()
    } else {
      ElMessage.error(res?.msg || res?.message || '报名失败')
    }
  } catch (e: any) {
    const msg = e?.response?.data?.msg || e?.response?.data?.message || e?.message || '报名失败'
    ElMessage.error(typeof msg === 'string' ? msg : '报名失败')
  } finally {
    actionId.value = null
    actionKind.value = null
  }
}

async function onCancel(row: any) {
  try {
    await ElMessageBox.confirm('确定取消该活动的报名吗？', '取消报名', { type: 'warning' })
  } catch {
    return
  }
  actionId.value = row.activityId
  actionKind.value = 'cancel'
  try {
    const res: any = await cancelActivityRegistration({ activityId: row.activityId })
    if (res?.code === 200) {
      ElMessage.success(res?.data || res?.msg || '已取消报名')
      await loadData()
    } else {
      ElMessage.error(res?.msg || res?.message || '取消失败')
    }
  } catch (e: any) {
    const msg = e?.response?.data?.msg || e?.response?.data?.message || e?.message || '取消失败'
    ElMessage.error(typeof msg === 'string' ? msg : '取消失败')
  } finally {
    actionId.value = null
    actionKind.value = null
  }
}

function goCheckin(row: any) {
  router.push({
    path: '/admin/activity-sign',
    query: { id: row.activityId, activityId: row.activityId },
  })
}

function goSummary(row: any) {
  router.push({
    path: '/admin/activity-summary',
    query: { id: row.activityId, activityId: row.activityId },
  })
}

function goCreate() {
  router.push('/admin/activity-create')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.activity-manage-page {
  max-width: 1200px;
  padding: 0;
}

.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
  border-radius: 14px;
  border: 1px solid #bae6fd;
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

.filter-card {
  margin-bottom: 16px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.table-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.detail-sub {
  margin: 16px 0 8px;
  font-size: 14px;
  color: #334155;
}

.detail-text,
.detail-content {
  font-size: 14px;
  color: #475569;
  white-space: pre-wrap;
  word-break: break-word;
}

.muted {
  color: #94a3b8;
  font-size: 14px;
}
</style>
