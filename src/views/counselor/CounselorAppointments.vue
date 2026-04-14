<template>
  <div class="counselor-appointments">
    <h2>预约管理</h2>
    <p class="page-hint">
      数据来自 <code>GET /api/appointment/list</code>，查询参数仅使用后端
      <code>PageQueryDTO</code>：<code>page</code>、<code>pageSize</code>、<code>counselorId</code>（与 JWT
      <code>userId</code>、表 <code>counselor_schedule.counselor_id</code> 一致）；不传
      <code>userId</code>，以免按学生条件过滤后结果为空。
    </p>

    <!-- 今日预约时间轴 -->
    <section class="card today-section">
      <h3>今日预约</h3>
      <div class="timeline">
        <div v-for="a in todayList" :key="a.id" class="timeline-item">
          <span class="time">{{ a.appointmentTime || '—' }}</span>
          <span class="student">
            {{ a.studentName || '学生' }}
            <span class="sid">({{ shortId(a.studentId) }})</span>
          </span>
          <span class="status-tag" :class="a.status">{{ statusLabel(a.status) }}</span>
          <el-button type="primary" size="small" @click="goDetail(a.id)">详情</el-button>
          <el-button v-if="canRenew(a)" size="small" @click="renew(a)">一键续约</el-button>
        </div>
        <div v-if="todayList.length === 0" class="empty">今日暂无预约</div>
      </div>
    </section>

    <!-- 全部预约列表 -->
    <section class="card">
      <div class="card-head">
        <h3>全部预约</h3>
        <el-button size="small" :loading="loading" @click="load">刷新</el-button>
      </div>
      <el-table :data="list" v-loading="loading" style="width: 100%">
        <el-table-column prop="appointmentDate" label="日期" width="120" />
        <el-table-column prop="appointmentTime" label="时段" width="140" show-overflow-tooltip />
        <el-table-column prop="studentName" label="学生姓名" width="120" show-overflow-tooltip />
        <el-table-column label="学生ID" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ shortId(row.studentId) }}</template>
        </el-table-column>
        <el-table-column prop="consultationMode" label="方式" width="90" />
        <el-table-column prop="location" label="地点" min-width="120" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="row.status">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="goDetail(row.id)">详情</el-button>
            <template v-if="canConfirmOrReject(row)">
              <el-button
                type="success"
                size="small"
                link
                :loading="actingId === row.id && actionKind === 'confirm'"
                @click="confirm(row.id)"
              >
                同意
              </el-button>
              <el-button
                type="danger"
                size="small"
                link
                :loading="actingId === row.id && actionKind === 'reject'"
                @click="reject(row)"
              >
                拒绝
              </el-button>
            </template>
            <el-button v-if="canRenew(row)" size="small" link @click="renew(row)">续约</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="load"
          @current-change="load"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCounselorAppointmentsAsync, updateAppointmentStatusAsync } from '../../api/appointment'
import { getCounselorIdForScheduleFilter } from '../../utils/counselorSession.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const counselorId = getCounselorIdForScheduleFilter()
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const actingId = ref('')
const actionKind = ref('')

const today = new Date()
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

function normalizeDateKey(d) {
  if (d == null || d === '') return ''
  const s = String(d)
  if (s.length >= 10) return s.slice(0, 10)
  return s
}

const todayList = computed(() =>
  list.value.filter((a) => {
    const key = normalizeDateKey(a.appointmentDate)
    if (key !== todayStr) return false
    return !['cancelled', 'rejected'].includes(a.status)
  }),
)

const statusMap = {
  submitted: '待确认',
  draft: '草稿',
  confirmed: '已确认',
  cancelled: '已取消',
  rejected: '已拒绝',
  completed: '已完成',
  no_show: '爽约',
  closed: '已结案',
  checked_in: '已签到',
  report_done: '已写报告',
}

function statusLabel(s) {
  return statusMap[s] || s || '—'
}

function shortId(id) {
  if (!id) return '—'
  const s = String(id)
  return s.length > 12 ? `${s.slice(0, 8)}…` : s
}

function canRenew(row) {
  return ['confirmed', 'checked_in', 'report_done', 'closed', 'completed'].includes(row.status)
}

/** 后端 PENDING 映射为 submitted */
function canConfirmOrReject(row) {
  return row.status === 'submitted' || row.status === 'draft'
}

async function load() {
  if (!counselorId) {
    ElMessage.warning(
      '未获取到咨询师 ID：请重新登录，并确保 localStorage 中 userId 与库表 counselor_id 一致',
    )
    list.value = []
    total.value = 0
    return
  }
  loading.value = true
  try {
    const res = await getCounselorAppointmentsAsync(counselorId, {
      page: page.value,
      pageSize: pageSize.value,
    })
    if (res?.code === 200) {
      list.value = Array.isArray(res.data) ? res.data : []
      total.value = Number(res.total) || list.value.length
    } else {
      list.value = []
      total.value = 0
      ElMessage.error(res?.msg || res?.message || '加载失败')
    }
  } catch (e) {
    list.value = []
    total.value = 0
    const msg = e?.response?.data?.msg || e?.message || '加载失败'
    ElMessage.error(typeof msg === 'string' ? msg : '加载失败')
  } finally {
    loading.value = false
  }
}

async function confirm(id) {
  actingId.value = id
  actionKind.value = 'confirm'
  try {
    await updateAppointmentStatusAsync(id, 'confirmed')
    ElMessage.success('已确认预约')
    await load()
  } catch (e) {
    const msg = e?.response?.data?.msg || e?.message || '操作失败'
    ElMessage.error(typeof msg === 'string' ? msg : '操作失败')
  } finally {
    actingId.value = ''
    actionKind.value = ''
  }
}

async function reject(row) {
  try {
    const { value } = await ElMessageBox.prompt('可选填写拒绝原因', '拒绝预约', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '原因',
    })
    actingId.value = row.id
    actionKind.value = 'reject'
    await updateAppointmentStatusAsync(row.id, 'closed', {
      reason: value || '咨询师拒绝',
    })
    ElMessage.success('已拒绝')
    await load()
  } catch (e) {
    if (e !== 'cancel') {
      const msg = e?.response?.data?.msg || e?.message || '操作失败'
      ElMessage.error(typeof msg === 'string' ? msg : '操作失败')
    }
  } finally {
    actingId.value = ''
    actionKind.value = ''
  }
}

function goDetail(id) {
  router.push(`/appointment/${id}/detail`)
}

function renew(row) {
  router.push({ path: '/appointment/select', query: { studentId: row.studentId, renew: '1' } })
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.counselor-appointments {
  padding: 0 0 20px 0;
  max-width: 1200px;
}

.counselor-appointments h2 {
  margin: 0 0 8px 0;
}

.page-hint {
  margin: 0 0 16px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.page-hint code {
  font-size: 12px;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card h3 {
  margin: 0;
  font-size: 16px;
}

.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #fafafa;
  border-radius: 6px;
  flex-wrap: wrap;
}

.timeline-item .time {
  min-width: 100px;
  font-weight: 500;
}

.timeline-item .student {
  flex: 1;
  min-width: 120px;
}

.sid {
  color: #94a3b8;
  font-size: 12px;
  margin-left: 4px;
}

.status-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-tag.submitted,
.status-tag.draft {
  background: #e6f7ff;
  color: #1890ff;
}

.status-tag.confirmed {
  background: #f6ffed;
  color: #52c41a;
}

.status-tag.rejected,
.status-tag.cancelled,
.status-tag.closed {
  background: #f0f0f0;
  color: #666;
}

.status-tag.completed {
  background: #e6fffb;
  color: #08979c;
}

.empty {
  color: #8c8c8c;
  padding: 16px;
  text-align: center;
}
</style>
