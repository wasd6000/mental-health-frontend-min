<template>
  <div class="leader-workbench">
    <el-alert
      class="doc-hint"
      type="info"
      show-icon
      :closable="false"
      title="分管校领导端"
      description="全校统计、报表与危机概览等依赖后端聚合接口；联调前部分数据为占位，以实际接口为准。"
    />
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
          <h3>重要待办</h3>
          <el-button type="primary" link @click="$router.push('/admin/todo-list')">查看全部</el-button>
        </div>
        <div class="todo-list">
          <div class="todo-item" v-for="todo in todoList" :key="todo.id" @click="handleTodo(todo)">
            <span class="todo-priority" :class="todo.priority">{{ todo.priorityText }}</span>
            <span class="todo-content">{{ todo.content }}</span>
            <span class="todo-time">{{ todo.time }}</span>
            <el-icon class="todo-arrow"><ArrowRight /></el-icon>
          </div>
          <el-empty v-if="todoList.length === 0" description="暂无待办事项" />
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <h3>危机预警总览</h3>
          <el-button type="primary" link @click="$router.push('/admin/leader-crisis')">查看详情</el-button>
        </div>
        <div class="crisis-overview">
          <div class="crisis-stat" v-for="item in crisisStats" :key="item.level">
            <div class="crisis-dot" :class="item.level"></div>
            <div class="crisis-info">
              <span class="crisis-label">{{ item.label }}</span>
              <span class="crisis-count">{{ item.count }}</span>
            </div>
            <span class="crisis-trend" :class="item.trend > 0 ? 'up' : 'down'" v-if="item.trend !== 0">
              {{ item.trend > 0 ? '+' : '' }}{{ item.trend }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-row">
      <div class="section-card chart-card">
        <div class="section-header">
          <h3>全校心理健康趋势</h3>
          <el-radio-group v-model="timeRange">
            <el-radio-button value="month">月度</el-radio-button>
            <el-radio-button value="quarter">季度</el-radio-button>
          </el-radio-group>
        </div>
        <div class="chart-container" ref="trendChartRef"></div>
      </div>

      <div class="section-card chart-card">
        <div class="section-header">
          <h3>院系健康指数排名</h3>
        </div>
        <div class="chart-container" ref="rankChartRef"></div>
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

    <div class="section-row">
      <div class="section-card full">
        <div class="section-header">
          <h3>各院系心理健康概况</h3>
          <el-button type="primary" link @click="$router.push('/admin/leader-colleges')">查看详情</el-button>
        </div>
        <el-table :data="collegeOverview" stripe size="small">
          <el-table-column prop="name" label="院系名称" width="180" />
          <el-table-column prop="studentCount" label="学生总数" width="100" />
          <el-table-column label="测评完成率" width="150">
            <template #default="{ row }">
              <el-progress :percentage="row.assessmentRate" :color="getProgressColor(row.assessmentRate)" :stroke-width="6" />
            </template>
          </el-table-column>
          <el-table-column label="危机个案" width="100">
            <template #default="{ row }">
              <span :class="row.crisisCount > 10 ? 'text-danger' : ''">{{ row.crisisCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="consultCount" label="咨询量" width="100" />
          <el-table-column label="健康指数" width="120">
            <template #default="{ row }">
              <el-tag :type="getHealthTagType(row.healthIndex)" size="small">{{ row.healthIndex }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="趋势" width="80">
            <template #default="{ row }">
              <span :class="row.trend > 0 ? 'text-success' : 'text-danger'">
                {{ row.trend > 0 ? '↑' : '↓' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  Warning,
  DataAnalysis,
  Document,
  TrendCharts,
  School,
  ArrowRight,
  Calendar,
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getStatsOverview } from '../../api/statsApi'
import { getCenterApprovalList } from '../../api/centerArchive'
import { getCollegeOptions } from '../../api/commonApi'

const router = useRouter()

const statsData = ref([
  { label: '全校学生总数', value: 0, color: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: User },
  { label: '危机个案总数', value: 0, color: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: Warning, trend: -8 },
  { label: '全校测评完成率', value: '0%', color: 'linear-gradient(135deg, #10b981, #059669)', icon: DataAnalysis, trend: 3.2 },
  { label: '本月咨询服务量', value: 0, color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', icon: Calendar, trend: 12 },
])

const todoList = ref([])

const crisisStats = ref([
  { level: 'red', label: '红色预警', count: 0, trend: 0 },
  { level: 'orange', label: '橙色预警', count: 0, trend: 0 },
  { level: 'yellow', label: '黄色预警', count: 0, trend: 0 },
  { level: 'blue', label: '蓝色预警', count: 0, trend: 0 },
])

const collegeOverview = ref([])
const trendType = ref('month')

const trendChartRef = ref()
const rankChartRef = ref()
let charts = []

const quickActions = [
  {
    label: '数据统计',
    icon: TrendCharts,
    color: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    handler: () => router.push('/admin/leader-statistics'),
  },
  {
    label: '报表查看',
    icon: Document,
    color: 'linear-gradient(135deg, #10b981, #059669)',
    handler: () => router.push('/admin/leader-report'),
  },
  {
    label: '危机管理',
    icon: Warning,
    color: 'linear-gradient(135deg, #ef4444, #dc2626)',
    handler: () => router.push('/admin/leader-crisis'),
  },
  {
    label: '院系管理',
    icon: School,
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    handler: () => router.push('/admin/leader-colleges'),
  },
]

const getProgressColor = (rate) => {
  if (rate >= 90) {
    return '#10b981'
  }
  if (rate >= 70) {
    return '#f59e0b'
  }
  return '#ef4444'
}

const getHealthTagType = (index) => {
  if (index >= 85) {
    return 'success'
  }
  if (index >= 70) {
    return ''
  }
  return 'danger'
}

const handleTodo = (todo) => {
  if (todo.route) {
    router.push(todo.route)
  }
}

const initCharts = () => {
  if (trendChartRef.value) {
    const chart = echarts.init(trendChartRef.value)
    const xData = trendType.value === 'month'
      ? ['1月', '2月', '3月', '4月', '5月', '6月']
      : ['Q1', 'Q2', 'Q3', 'Q4']
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['测评完成率', '健康指数', '危机率'] },
      xAxis: { type: 'category', data: xData },
      yAxis: { type: 'value', max: 100 },
      series: [
        {
          name: '测评完成率',
          type: 'line',
          smooth: true,
          data: trendType.value === 'month' ? [88, 90, 91, 92, 93, 94] : [89, 91, 93, 94],
          itemStyle: { color: '#3b82f6' },
        },
        {
          name: '健康指数',
          type: 'line',
          smooth: true,
          data: trendType.value === 'month' ? [82, 83, 84, 85, 86, 87] : [82, 84, 86, 87],
          itemStyle: { color: '#10b981' },
        },
        {
          name: '危机率',
          type: 'line',
          smooth: true,
          data: trendType.value === 'month' ? [2.5, 2.3, 2.1, 1.9, 1.8, 1.6] : [2.4, 2.0, 1.8, 1.6],
          itemStyle: { color: '#ef4444' },
        },
      ],
    })
    charts.push(chart)
  }

  if (rankChartRef.value) {
    const chart = echarts.init(rankChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value', max: 100 },
      yAxis: {
        type: 'category',
        data: ['经济管理', '文学院', '外语学院', '理学院', '计算机学院'],
        inverse: true,
      },
      series: [{
        type: 'bar',
        data: [78, 82, 85, 88, 92],
        itemStyle: {
          color: (params) => {
            const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#3b82f6']
            return colors[params.dataIndex]
          },
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}分',
        },
      }],
    })
    charts.push(chart)
  }
}

const loadData = async () => {
  try {
    const res = await getStatsOverview()
    if (res.code === 200 && res.data) {
      statsData.value[0].value = res.data.totalStudents || 0
      statsData.value[1].value = res.data.crisisCount || 0
      statsData.value[2].value = `${res.data.assessmentRate || 0}%`
      statsData.value[3].value = res.data.consultCount || 0
      if (res.data.crisisStats) {
        crisisStats.value = res.data.crisisStats
      }
    }
  } catch (e) {
    statsData.value[0].value = 28560
    statsData.value[1].value = 186
    statsData.value[2].value = '93.2%'
    statsData.value[3].value = 1256
    crisisStats.value = [
      { level: 'red', label: '红色预警', count: 12, trend: -2 },
      { level: 'orange', label: '橙色预警', count: 38, trend: -5 },
      { level: 'yellow', label: '黄色预警', count: 86, trend: 3 },
      { level: 'blue', label: '蓝色预警', count: 50, trend: 0 },
    ]
  }

  try {
    const res = await getCenterApprovalList({ status: 'pending' })
    if (res.code === 200) {
      todoList.value = res.data || []
    }
  } catch (e) {
    todoList.value = [
      { id: 1, priority: 'high', priorityText: '紧急', content: '红色预警个案需校级审批', time: '30分钟前', route: '/admin/leader-crisis' },
      { id: 2, priority: 'medium', priorityText: '重要', content: '3月份全校心理健康月报待审阅', time: '今天', route: '/admin/leader-report' },
      { id: 3, priority: 'low', priorityText: '一般', content: '心理健康教育工作会议安排', time: '本周', route: '' },
    ]
  }

  try {
    const res = await getCollegeOptions()
    if (res.code === 200) {
      collegeOverview.value = res.data || []
    }
  } catch (e) {
    collegeOverview.value = [
      { name: '计算机学院', studentCount: 3256, assessmentRate: 95, crisisCount: 27, consultCount: 156, healthIndex: 92, trend: 1 },
      { name: '理学院', studentCount: 2890, assessmentRate: 92, crisisCount: 22, consultCount: 128, healthIndex: 88, trend: 1 },
      { name: '外语学院', studentCount: 2450, assessmentRate: 90, crisisCount: 18, consultCount: 98, healthIndex: 85, trend: -1 },
      { name: '文学院', studentCount: 2120, assessmentRate: 88, crisisCount: 15, consultCount: 86, healthIndex: 82, trend: 1 },
      { name: '经济管理学院', studentCount: 3560, assessmentRate: 85, crisisCount: 32, consultCount: 145, healthIndex: 78, trend: -1 },
    ]
  }
}

watch(trendType, () => {
  charts.forEach((c) => c.dispose())
  charts = []
  setTimeout(initCharts, 100)
})

onMounted(() => {
  loadData()
  setTimeout(initCharts, 100)
})

onUnmounted(() => {
  charts.forEach((c) => c.dispose())
})
</script>

<style scoped>
.leader-workbench {
  max-width: 1400px;
}

.doc-hint {
  margin-bottom: 16px;
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
  min-height: 320px;
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
  height: 240px;
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

.todo-priority {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.todo-priority.high {
  background: #fef2f2;
  color: #dc2626;
}

.todo-priority.medium {
  background: #fef3c7;
  color: #d97706;
}

.todo-priority.low {
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

.crisis-overview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.crisis-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.crisis-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.crisis-dot.red {
  background: #dc2626;
}

.crisis-dot.orange {
  background: #f59e0b;
}

.crisis-dot.yellow {
  background: #eab308;
}

.crisis-dot.blue {
  background: #3b82f6;
}

.crisis-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.crisis-label {
  font-size: 13px;
  color: #64748b;
}

.crisis-count {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.crisis-trend {
  font-size: 14px;
  font-weight: 500;
}

.crisis-trend.up {
  color: #dc2626;
}

.crisis-trend.down {
  color: #16a34a;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-item:hover {
  background: #f1f5f9;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.action-icon .el-icon {
  font-size: 28px;
}

.action-label {
  font-size: 14px;
  color: #475569;
}

.text-danger {
  color: #dc2626;
  font-weight: 600;
}

.text-success {
  color: #16a34a;
}

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .section-row {
    grid-template-columns: 1fr;
  }
}
</style>
