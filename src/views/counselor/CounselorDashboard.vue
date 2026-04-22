<template>
  <div class="dashboard">
    <!-- 页面头部 -->
    <div class="page-head">
      <div class="head-main">
        <h2>工作概览</h2>
        <p class="page-desc">快捷进入预约、咨询记录、危机管理等工作模块。</p>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="stats-row">
      <div class="stat-item" @click="goShortcut({ path: '/admin/appointments' })">
        <span class="stat-value">{{ todayCount }}</span>
        <span class="stat-label">今日预约</span>
      </div>
      <div class="stat-item" @click="goShortcut({ path: '/admin/appointments' })">
        <span class="stat-value">{{ pendingCount }}</span>
        <span class="stat-label">待处理预约</span>
      </div>
      <div class="stat-item" @click="goShortcut({ path: '/records' })">
        <span class="stat-value">{{ unwrittenCount }}</span>
        <span class="stat-label">未写咨询记录</span>
      </div>
      <div class="stat-item" @click="goShortcut({ path: '/case' })">
        <span class="stat-value">{{ caseCount }}</span>
        <span class="stat-label">当前个案</span>
      </div>
    </div>

    <!-- 快捷应用区 -->
    <section class="card shortcuts">
      <div class="section-title">快捷入口</div>
      <div class="shortcut-grid">
        <div
          v-for="item in shortcuts"
          :key="item.label"
          class="shortcut-card"
          @click="goShortcut(item)"
        >
          <el-icon class="shortcut-icon"><component :is="item.icon" /></el-icon>
          <span class="shortcut-label">{{ item.label }}</span>
        </div>
      </div>
    </section>

    <!-- 日历与日程 -->
    <section class="card timeline">
      <div class="section-title">日历日程</div>
      <el-calendar v-model="selectedDate" class="calendar-wrap" />
      <div class="day-list">
        <h4 class="day-list-title">当天项目 ({{ selectedStr }})</h4>
        <el-timeline v-if="dailyItems.length > 0">
          <el-timeline-item
            v-for="item in sortedDailyItems"
            :key="item.id"
            placement="top"
          >
            <span v-if="item.type === 'appointment'">
              <a class="appointment-link" href="javascript:;" @click.prevent="goAppointment(item.id)">{{ item.title }}</a>
            </span>
            <span v-else>{{ item.title }}</span>
          </el-timeline-item>
        </el-timeline>
        <p v-else class="day-list-empty">暂无安排</p>
      </div>
    </section>

    <!-- 待办快捷入口 -->
    <section class="card todos">
      <div class="section-title">待办提醒</div>
      <div class="todo-grid">
        <div class="todo-item" @click="goShortcut({ path: '/admin/appointments' })">
          <el-badge :value="pendingCount" :hidden="pendingCount === 0" class="todo-badge">
            <span class="todo-text">待处理预约</span>
          </el-badge>
        </div>
        <div class="todo-item" @click="goShortcut({ path: '/records' })">
          <el-badge :value="unwrittenCount" :hidden="unwrittenCount === 0" class="todo-badge">
            <span class="todo-text">未写咨询记录</span>
          </el-badge>
        </div>
        <div class="todo-item" @click="goShortcut({ path: '/crisis' })">
          <el-badge :value="crisisPendingCount" :hidden="crisisPendingCount === 0" class="todo-badge">
            <span class="todo-text">危机待处理</span>
          </el-badge>
        </div>
        <div class="todo-item" @click="goShortcut({ path: '/leave/list' })">
          <el-badge :value="longLeaveCount" :hidden="longLeaveCount === 0" class="todo-badge">
            <span class="todo-text">长程申请待审批</span>
          </el-badge>
        </div>
        <div class="todo-item" @click="goShortcut({ path: '/assessment/list' })">
          <el-badge :value="assessmentWarningCount" :hidden="assessmentWarningCount === 0" class="todo-badge">
            <span class="todo-text">测评预警</span>
          </el-badge>
        </div>
      </div>
    </section>

    <!-- 数据图表区 -->
    <section class="card charts">
      <div class="section-title">工作数据</div>
      <el-radio-group v-model="statsType">
        <el-radio-button value="累计" />
        <el-radio-button value="年" />
        <el-radio-button value="月" />
      </el-radio-group>
      <div id="work-chart" class="chart-container"></div>
    </section>

    <section class="card charts">
      <div class="section-title">未完事项分布</div>
      <div id="unfinished-chart" class="chart-container"></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import {
  Document,
  Clock,
  List,
  Warning,
  User,
  EditPen,
  ChatDotRound,
} from '@element-plus/icons-vue'
import { getCounselorAppointmentsAsync } from '../../api/appointment'
import { getCounselorRecords } from '../../api/record'
import { getCounselorUserId } from '../../utils/counselorSession.js'
import { getCounselorCases } from '../../api/case'
import { getCrisesByConsultantAsync } from '../../api/crisis'
import type { Appointment } from '../../types/appointment'
import type { Case } from '../../types/case'
import { CrisisCase } from '../../types/crisis'

const router = useRouter()
const userRole = localStorage.getItem('user_role')
const counselorId = getCounselorUserId()

const appointments = ref<Appointment[]>([])
const records = ref<any[]>([])
const casesList = ref<Case[]>([])
const crises = ref<CrisisCase[]>([])

// 图表维度选择
const statsType = ref<'累计'|'年'|'月'>('累计')

const today = toDay(new Date())

function toDay(d: string | Date) {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt.getTime())) return ''
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function goShortcut(item: { path: string }) {
  if (!item.path || item.path === '#') return
  router.push(item.path).catch((err) => {
    console.warn('导航失败', err)
  })
}

const shortcuts = [
  { label: '长程申请', path: '/leave/list', icon: List },
  { label: '危机上报', path: '/crisis', icon: Warning },
  { label: '咨询记录', path: '/records', icon: Document },
  { label: '个案转介', path: '/case', icon: User },
  { label: '团体活动管理', path: '/admin/activity-manage', icon: ChatDotRound },
  { label: '排班管理', path: '/counselor/schedule', icon: Clock },
  { label: '咨询记录修改申请', path: '/admin/consult-record-change', icon: EditPen },
]

const selectedDate = ref<Date | string>(new Date())
const selectedStr = computed(() => toDay(selectedDate.value))

const groupActivities = ref<Array<{id:string;date:string;title:string}>>([])
const personalTasks = ref<Array<{id:string;date:string;title:string}>>([])

const dailyItems = computed<any[]>(() => {
  const appts = appointments.value
    .filter(a => toDay(a.date) === selectedStr.value)
    .map(a => ({
      id: a.id,
      type: 'appointment',
      title: `${a.create_time}-${a.end_time} 学生${a.studentId}`,
      time: a.create_time
    }))
  const groups = groupActivities.value.filter(g => toDay(g.date) === selectedStr.value)
  const personals = personalTasks.value.filter(p => toDay(p.date) === selectedStr.value)
  return [...appts, ...groups, ...personals]
})

const sortedDailyItems = computed<any[]>(() => {
  return [...dailyItems.value].sort((a: any, b: any) => {
    const timeA = (a.time || '99:99') as string
    const timeB = (b.time || '99:99') as string
    return timeA.localeCompare(timeB)
  })
})

const chartDimension = ref<'累计'|'年'|'月'>('累计')
let workChart: any = null
let unfinishedChart: any = null

async function initWorkChart() {
  const chart = (workChart = echarts.init(
    document.getElementById('work-chart') as HTMLElement
  ))
  const update = () => {
    const total = totalConsultations.value
    const year = yearConsultations.value
    const month = monthConsultations.value
    const data =
      chartDimension.value === '累计'
        ? total
        : chartDimension.value === '年'
        ? year
        : month
    chart.setOption({
      title: { text: '咨询人数', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['当前'] },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [data],
        itemStyle: { color: '#1e4f9c' },
      }]
    })
  }
  watch(chartDimension, update)
  watch([totalConsultations, yearConsultations, monthConsultations], update)
  update()
}

async function initUnfinishedChart() {
  const chart = (unfinishedChart = echarts.init(
    document.getElementById('unfinished-chart') as HTMLElement
  ))
  const update = () => {
    const todayUn = todayUnfinished.value
    const weekUn = weekUnfinished.value
    const monthUn = monthUnfinished.value
    chart.setOption({
      title: { text: '未完事项', left: 'center' },
      tooltip: { trigger: 'item' },
      color: ['#1e4f9c', '#3b82f6', '#60a5fa'],
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { name: '今日', value: todayUn },
            { name: '本周', value: weekUn },
            { name: '本月', value: monthUn },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    })
  }
  watch([todayUnfinished, weekUnfinished, monthUnfinished], update)
  update()
}

const totalConsultations = computed(() => appointments.value.length)
const yearConsultations = computed(() =>
  appointments.value.filter(a => new Date(a.date).getFullYear() === new Date().getFullYear()).length
)
const monthConsultations = computed(() =>
  appointments.value.filter(a => {
    const d = new Date(a.date)
    return (
      d.getFullYear() === new Date().getFullYear() &&
      d.getMonth() === new Date().getMonth()
    )
  }).length
)
const todayUnfinished = computed(() =>
  appointments.value.filter(a => a.status !== 'closed' && toDay(a.date) === today).length
)
const weekUnfinished = computed(() => todayUnfinished.value)
const monthUnfinished = computed(() =>
  appointments.value.filter(a => {
    const d = new Date(a.date)
    return (
      d.getFullYear() === new Date().getFullYear() &&
      d.getMonth() === new Date().getMonth() &&
      a.status !== 'closed'
    )
  }).length
)

async function fetchAllData() {
  if (!(userRole === 'counselor' && counselorId)) {
    return
  }
  try {
    const [apptRes, rres, cres, cris] = await Promise.all([
      getCounselorAppointmentsAsync(counselorId),
      getCounselorRecords({ counselorId }),
      getCounselorCases({ counselorId }),
      getCrisesByConsultantAsync(counselorId),
    ])

    // 处理分页响应格式
    const recordsData = rres?.data
    records.value = Array.isArray(recordsData)
        ? recordsData
        : (recordsData?.list || recordsData?.records || [])

    const casesData = cres?.data
    casesList.value = Array.isArray(casesData)
        ? casesData
        : (casesData?.list || casesData?.records || [])

    appointments.value = apptRes?.data || []
    crises.value = cris?.data || []

    groupActivities.value = [
      { id: 'g1', date: selectedStr.value, title: '团体活动：心理讲座' }
    ]
    personalTasks.value = [
      { id: 'p1', date: selectedStr.value, title: '个人事务：整理档案' }
    ]

    if (workChart == null || unfinishedChart == null) {
      await nextTick()
      await initWorkChart()
      await initUnfinishedChart()
    }
  } catch (e) {
    console.error('加载咨询师数据失败:', e)
  }
}

let updateHandler: any = null
let visibilityHandler: any = null

onMounted(() => {
  fetchAllData()

  updateHandler = async () => {
    await fetchAllData()
  }
  window.addEventListener('appointments-updated', updateHandler)

  visibilityHandler = async () => {
    if (document.visibilityState === 'visible') {
      await fetchAllData()
    }
  }
  document.addEventListener('visibilitychange', visibilityHandler)
})

onUnmounted(() => {
  if (updateHandler) window.removeEventListener('appointments-updated', updateHandler)
  if (visibilityHandler) document.removeEventListener('visibilitychange', visibilityHandler)
})

const todayCount = computed(() =>
  appointments.value.filter(a => toDay(a.date as any) === today).length
)

const pendingStatuses = ['draft', 'submitted', 'info_done']
const pendingCount = computed(() =>
  appointments.value.filter(a => pendingStatuses.includes(a.status)).length
)

const unwrittenCount = computed(() =>
  appointments.value.filter(a =>
    ['confirmed', 'completed', 'checked_in'].includes(a.status) &&
    !records.value.some((r: any) => {
      const aid = r.appointmentId ?? r.appointment_id
      return aid && aid === a.id
    })
  ).length
)

const caseCount = computed(() =>
    casesList.value.filter((c: any) => !c.status || c.status !== 'closed').length
)

const crisisPendingCount = computed(() =>
  crises.value.filter((c: any) => {
    const st = c?.status ?? c?.reportStatus
    return st !== 'closed'
  }).length
)

const longLeaveCount = ref(0)
const assessmentWarningCount = ref(0)

function goAppointment(id: string) {
  router.push(`/admin/appointment/${id}`)
}
</script>

<style scoped>
.dashboard {
  padding: 0;
  max-width: 1200px;
}

.page-head {
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
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stat-item {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.stat-item:hover {
  background: #f8fafc;
  border-color: #1e4f9c;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e4f9c;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.card {
  margin-bottom: 24px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.shortcut-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  border: 1px solid transparent;
}

.shortcut-card:hover {
  background: #f0f9ff;
  border-color: #1e4f9c;
}

.shortcut-icon {
  font-size: 22px;
  color: #1e4f9c;
  flex-shrink: 0;
}

.shortcut-label {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.calendar-wrap {
  --el-calendar-border: 1px solid #e2e8f0;
}

.day-list {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.day-list-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

.appointment-link {
  color: #1e4f9c;
  text-decoration: none;
}

.appointment-link:hover {
  text-decoration: underline;
}

.day-list-empty {
  margin: 10px 0 0 0;
  color: #94a3b8;
  font-size: 14px;
}

.todo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.todo-item {
  flex: 1;
  min-width: 120px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #f0f9ff;
}

.todo-text {
  font-size: 13px;
  color: #475569;
}

.chart-tabs {
  margin-bottom: 12px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.charts {
  min-height: 350px;
}

@media (max-width: 768px) {
  .shortcut-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
