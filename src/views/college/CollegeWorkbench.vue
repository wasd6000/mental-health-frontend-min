<template>
  <div class="college-workbench">
    <div class="stats-row">
      <div class="stat-card" v-for="stat in statsData" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.color }">
          <el-icon><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-trend" v-if="stat.trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </span>
        </div>
      </div>
    </div>

    <div class="section-row">
      <div class="section-card">
        <div class="section-header">
          <h3>待处理事项</h3>
          <el-button type="primary" link @click="$router.push('/admin/todo-list')">查看全部</el-button>
        </div>
        <div class="todo-list">
          <div class="todo-item" v-for="todo in todoList" :key="todo.id" @click="handleTodo(todo)">
            <span class="todo-type" :class="todo.type">{{ todo.typeText }}</span>
            <span class="todo-content">{{ todo.content }}</span>
            <span class="todo-time">{{ todo.time }}</span>
            <el-icon class="todo-arrow"><ArrowRight /></el-icon>
          </div>
          <el-empty v-if="todoList.length === 0" description="暂无待处理事项" />
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <h3>危机预警</h3>
          <el-button type="primary" link @click="$router.push('/admin/college-crisis')">查看全部</el-button>
        </div>
        <div class="crisis-list">
          <div class="crisis-item" v-for="crisis in crisisList" :key="crisis.id">
            <div class="crisis-level" :class="crisis.level"></div>
            <div class="crisis-info">
              <span class="crisis-name">{{ crisis.studentName }}</span>
              <span class="crisis-desc">{{ crisis.description }}</span>
            </div>
            <el-tag :type="getCrisisTagType(crisis.level)" size="small">{{ crisis.levelText }}</el-tag>
            <el-button type="primary" link size="small" @click="viewCrisis(crisis)">处理</el-button>
          </div>
          <el-empty v-if="crisisList.length === 0" description="暂无危机预警" />
        </div>
      </div>
    </div>

    <div class="section-row">
      <div class="section-card chart-card">
        <div class="section-header">
          <h3>测评完成情况</h3>
        </div>
        <div class="chart-container" ref="assessmentChartRef"></div>
      </div>

      <div class="section-card chart-card">
        <div class="section-header">
          <h3>危机等级分布</h3>
        </div>
        <div class="chart-container" ref="crisisChartRef"></div>
      </div>
    </div>

    <div class="section-row">
      <div class="section-card full">
        <div class="section-header">
          <h3>快捷操作</h3>
        </div>
        <div class="quick-actions">
          <div class="action-item" v-for="action in quickActions" :key="action.label" @click="action.handler">
            <div class="action-icon" :style="{ background: action.color }">
              <el-icon><component :is="action.icon" /></el-icon>
            </div>
            <span class="action-label">{{ action.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  Warning,
  DataAnalysis,
  Document,
  TrendCharts,
  UserFilled,
  ArrowRight,
  School,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getStatsOverview } from '../../api/statsApi'
import { getCenterApprovalList } from '../../api/centerArchive'
import { getCrisisList } from '../../api/crisisApi'

const router = useRouter()

const statsData = ref([
  { label: '院系学生总数', value: 0, color: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: markRaw(User) },
  { label: '危机个案数', value: 0, color: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: markRaw(Warning), trend: -12 },
  { label: '测评完成率', value: '0%', color: 'linear-gradient(135deg, #10b981, #059669)', icon: markRaw(DataAnalysis), trend: 5 },
  { label: '本月咨询量', value: 0, color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', icon: markRaw(Document) },
])

const todoList = ref([])
const crisisList = ref([])

const assessmentChartRef = ref()
const crisisChartRef = ref()
let assessmentChart = null
let crisisChart = null

const quickActions = [
  {
    label: '数据统计',
    icon: markRaw(TrendCharts),
    color: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    handler: () => router.push('/admin/college-statistics'),
  },
  {
    label: '报表查看',
    icon: markRaw(Document),
    color: 'linear-gradient(135deg, #10b981, #059669)',
    handler: () => router.push('/admin/college-report'),
  },
  {
    label: '危机管理',
    icon: markRaw(Warning),
    color: 'linear-gradient(135deg, #ef4444, #dc2626)',
    handler: () => router.push('/admin/college-crisis'),
  },
  {
    label: '学生管理',
    icon: markRaw(UserFilled),
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    handler: () => router.push('/admin/college-students'),
  },
  {
    label: '院系管理',
    icon: markRaw(School),
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    handler: () => router.push('/admin/college-manage'),
  },
  {
    label: '辅导员管理',
    icon: markRaw(User),
    color: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    handler: () => router.push('/admin/college-tutors'),
  },
]

const getCrisisTagType = (level) => {
  const map = { red: 'danger', orange: 'warning', yellow: '', blue: 'info' }
  return map[level] || 'info'
}

const handleTodo = (todo) => {
  if (todo.route) {
    router.push(todo.route)
  }
}

const viewCrisis = (crisis) => {
  router.push(`/crisis/${crisis.id}`)
}

const initCharts = () => {
  if (assessmentChartRef.value) {
    assessmentChart = echarts.init(assessmentChartRef.value)
    assessmentChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['计科', '软工', '信安', '物联网', '数据科学'],
      },
      yAxis: { type: 'value', max: 100 },
      series: [{
        type: 'bar',
        data: [95, 88, 92, 85, 90],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#2563eb' },
          ]),
        },
      }],
    })
  }

  if (crisisChartRef.value) {
    crisisChart = echarts.init(crisisChartRef.value)
    crisisChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 2, name: '红色', itemStyle: { color: '#dc2626' } },
          { value: 5, name: '橙色', itemStyle: { color: '#f59e0b' } },
          { value: 12, name: '黄色', itemStyle: { color: '#eab308' } },
          { value: 8, name: '蓝色', itemStyle: { color: '#3b82f6' } },
        ],
      }],
    })
  }
}

const loadData = async () => {
  // 加载统计数据
  try {
    const res = await getStatsOverview()
    if (res.code === 200 && res.data) {
      statsData.value[0].value = res.data.totalStudents || 0
      statsData.value[1].value = res.data.crisisCount || 0
      statsData.value[2].value = `${res.data.assessmentRate || 0}%`
      statsData.value[3].value = res.data.consultationCount || 0
    }
  } catch (e) {
    console.warn('⚠️ 统计数据接口暂不可用，使用演示数据:', e.message)
    // 使用演示数据
    statsData.value[0].value = 3256
    statsData.value[1].value = 27
    statsData.value[2].value = '91.5%'
    statsData.value[3].value = 156
  }

  // 加载待处理事项
  try {
    const res = await getCenterApprovalList({ status: 'pending' })
    if (res.code === 200) {
      todoList.value = res.data || []
    }
  } catch (e) {
    console.warn('⚠️ 待处理事项接口暂不可用，使用演示数据:', e.message)
    todoList.value = [
      { id: 1, type: 'crisis', typeText: '危机', content: '红色预警个案待审批', time: '30分钟前', route: '/admin/college-crisis' },
      { id: 2, type: 'report', typeText: '报表', content: '3月份心理健康月报待查阅', time: '今天', route: '/admin/college-report' },
      { id: 3, type: 'assessment', typeText: '测评', content: '新生心理普查完成率待提升', time: '本周', route: '/admin/college-statistics' },
    ]
  }

  // 加载危机预警
  try {
    const res = await getCrisisList({ status: 'pending' })
    if (res.code === 200) {
      const list = res.data?.list ?? res.data?.records ?? (Array.isArray(res.data) ? res.data : [])
      crisisList.value = Array.isArray(list) ? list : []
    }
  } catch (e) {
    console.warn('⚠️ 危机预警接口暂不可用，使用演示数据:', e.message)
    crisisList.value = [
      { id: 1, studentName: '张某某', level: 'red', levelText: '极高危', description: '存在自杀倾向，需紧急干预' },
      { id: 2, studentName: '李某某', level: 'orange', levelText: '高危', description: '严重抑郁，已安排心理咨询' },
      { id: 3, studentName: '王某某', level: 'yellow', levelText: '中危', description: '学业压力大，情绪不稳定' },
    ]
  }
}

onMounted(() => {
  loadData()
  setTimeout(initCharts, 100)
})

onUnmounted(() => {
  assessmentChart?.dispose()
  crisisChart?.dispose()
})
</script>

<style scoped>
.college-workbench {
  max-width: 1200px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-trend {
  font-size: 12px;
  margin-top: 2px;
}

.stat-trend.up {
  color: #16a34a;
}

.stat-trend.down {
  color: #dc2626;
}

.section-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-card.full {
  grid-column: 1 / -1;
}

.section-card.chart-card {
  min-height: 300px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.chart-container {
  height: 220px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #f1f5f9;
}

.todo-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.todo-type.crisis {
  background: #fef2f2;
  color: #dc2626;
}

.todo-type.report {
  background: #f0fdf4;
  color: #16a34a;
}

.todo-type.assessment {
  background: #eff6ff;
  color: #2563eb;
}

.todo-content {
  flex: 1;
  font-size: 14px;
  color: #334155;
}

.todo-time {
  font-size: 12px;
  color: #94a3b8;
}

.todo-arrow {
  color: #94a3b8;
}

.crisis-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.crisis-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.crisis-level {
  width: 8px;
  height: 40px;
  border-radius: 4px;
}

.crisis-level.red {
  background: #dc2626;
}

.crisis-level.orange {
  background: #f59e0b;
}

.crisis-level.yellow {
  background: #eab308;
}

.crisis-level.blue {
  background: #3b82f6;
}

.crisis-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.crisis-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.crisis-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-item:hover {
  background: #f1f5f9;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.action-icon .el-icon {
  font-size: 24px;
}

.action-label {
  font-size: 13px;
  color: #475569;
}

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .section-row {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
