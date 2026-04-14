<template>
  <div class="college-statistics">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">数据统计分析</span>
    </div>
    <div class="page-header">
      <div class="header-content">
        <h2>数据统计分析</h2>
        <p class="page-desc">{{ collegeName }}心理健康数据综合分析与可视化</p>
      </div>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="loadData"
        />
        <el-select v-model="filterDept" placeholder="选择专业" clearable @change="loadData" style="width: 180px">
          <el-option v-for="d in deptList" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
        <el-button type="primary" @click="loadData" :icon="Refresh">刷新</el-button>
        <el-dropdown @command="handleExport">
          <el-button type="success">
            <el-icon><Download /></el-icon>
            导出报表
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="excel">导出Excel</el-dropdown-item>
              <el-dropdown-item command="pdf">导出PDF</el-dropdown-item>
              <el-dropdown-item command="word">导出Word报告</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="stats-overview">
      <div class="stat-card primary" v-for="stat in overviewData" :key="stat.label">
        <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
          <el-icon :style="{ color: stat.color }"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
          <div class="stat-extra" v-if="stat.extra">
            <span class="extra-label">{{ stat.extra.label }}</span>
            <span class="extra-value" :class="stat.extra.type">{{ stat.extra.value }}</span>
          </div>
        </div>
        <div class="stat-trend" v-if="stat.trend !== undefined">
          <span :class="getTrendClass(stat.trend, stat.trendPositive)">
            <el-icon v-if="stat.trend > 0"><Top /></el-icon>
            <el-icon v-else><Bottom /></el-icon>
            {{ Math.abs(stat.trend) }}%
          </span>
          <span class="trend-label">环比</span>
        </div>
      </div>
    </div>

    <div class="alert-section" v-if="alertData.length">
      <el-alert 
        v-for="alert in alertData" 
        :key="alert.id"
        :title="alert.title"
        :type="alert.type"
        :description="alert.description"
        show-icon
        :closable="false"
        class="alert-item"
      />
    </div>

    <div class="health-index-section">
      <el-card class="health-index-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">心理健康综合指数</span>
            <el-tooltip content="综合测评完成率、危机处置率、咨询覆盖率等指标计算得出" placement="top">
              <el-icon class="info-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </template>
        <div class="health-index-content">
          <div class="index-gauge" ref="healthGaugeRef"></div>
          <div class="index-details">
            <div class="index-item" v-for="item in healthIndexItems" :key="item.label">
              <div class="index-label">{{ item.label }}</div>
              <div class="index-progress">
                <el-progress 
                  :percentage="item.value" 
                  :color="item.color"
                  :stroke-width="10"
                  :format="() => item.value + '%'"
                />
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="chart-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">测评完成趋势</span>
                <el-radio-group v-model="assessmentChartType" size="small">
                  <el-radio-button label="week">周</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                  <el-radio-button label="quarter">季度</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div class="chart-container" ref="assessmentTrendRef"></div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">危机等级分布</span>
                <el-tag size="small" type="info">共{{ crisisTotal }}例</el-tag>
              </div>
            </template>
            <div class="chart-container" ref="crisisDistRef"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-4">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">各专业测评完成率</span>
              </div>
            </template>
            <div class="chart-container" ref="deptRateRef"></div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span class="card-title">咨询服务分析</span>
                <el-select v-model="consultChartType" size="small" style="width: 100px">
                  <el-option label="趋势" value="trend" />
                  <el-option label="类型" value="type" />
                </el-select>
              </div>
            </template>
            <div class="chart-container" ref="consultChartRef"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-4">
        <el-col :span="16">
          <el-card class="chart-card large">
            <template #header>
              <div class="card-header">
                <span class="card-title">学生心理健康画像分布</span>
              </div>
            </template>
            <div class="chart-container large" ref="profileDistRef"></div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="chart-card">
            <template #header>
              <span class="card-title">预警学生Top问题</span>
            </template>
            <div class="problem-list">
              <div v-for="(problem, index) in topProblems" :key="problem.name" class="problem-item">
                <div class="problem-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
                <div class="problem-info">
                  <span class="problem-name">{{ problem.name }}</span>
                  <span class="problem-count">{{ problem.count }}人</span>
                </div>
                <el-progress 
                  :percentage="problem.percentage" 
                  :show-text="false"
                  :stroke-width="6"
                  :color="getProblemColor(index)"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-card class="table-section">
      <template #header>
        <div class="card-header">
          <span class="card-title">各专业心理健康数据明细</span>
          <el-button type="primary" size="small" @click="exportDeptData">导出</el-button>
        </div>
      </template>
      <el-table :data="deptTableData" stripe show-summary :summary-method="getSummary">
        <el-table-column prop="name" label="专业名称" width="180" fixed />
        <el-table-column prop="studentCount" label="学生总数" width="100" sortable />
        <el-table-column label="测评完成率" width="160" sortable sort-by="assessmentRate">
          <template #default="{ row }">
            <div class="rate-cell">
              <el-progress 
                :percentage="row.assessmentRate" 
                :color="getProgressColor(row.assessmentRate)" 
                :stroke-width="8"
              />
              <span class="rate-text">{{ row.assessedCount }}/{{ row.studentCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="危机个案" width="160">
          <template #default="{ row }">
            <div class="crisis-cell">
              <span class="total">{{ row.crisisCount }}</span>
              <div class="crisis-detail">
                <el-tag size="small" type="danger" v-if="row.crisisRed">红{{ row.crisisRed }}</el-tag>
                <el-tag size="small" type="warning" v-if="row.crisisOrange">橙{{ row.crisisOrange }}</el-tag>
                <el-tag size="small" v-if="row.crisisYellow">黄{{ row.crisisYellow }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="consultCount" label="咨询服务" width="100" sortable />
        <el-table-column prop="activityCount" label="活动参与" width="100" sortable />
        <el-table-column prop="healthIndex" label="健康指数" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="getHealthTagType(row.healthIndex)" effect="plain">
              {{ row.healthIndex }}分
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDeptDetail(row)">
              详情
            </el-button>
            <el-button type="success" link size="small" @click="generateReport(row)">
              报告
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { 
  Download, Refresh, ArrowDown, Top, Bottom, QuestionFilled,
  User, Warning, TrendCharts, Document, Calendar, Timer, ArrowLeft
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getStatsOverview } from '../../api/statsApi'
import { exportByApi } from '../../utils/exporter'

const collegeName = ref('计算机学院')
const dateRange = ref([])
const filterDept = ref('')
const assessmentChartType = ref('month')
const consultChartType = ref('trend')

const deptList = ref([
  { label: '计算机科学与技术', value: 'cs' },
  { label: '软件工程', value: 'se' },
  { label: '信息安全', value: 'is' },
  { label: '物联网工程', value: 'iot' },
  { label: '数据科学与大数据', value: 'ds' }
])

const overviewData = ref([
  { 
    label: '学生总数', 
    value: '3,256', 
    icon: User, 
    color: '#3b82f6', 
    bgColor: '#eff6ff',
    extra: { label: '已测评', value: '2,979', type: '' }
  },
  { 
    label: '测评完成率', 
    value: '91.5%', 
    icon: TrendCharts, 
    color: '#10b981', 
    bgColor: '#f0fdf4',
    trend: 5.2,
    trendPositive: true
  },
  { 
    label: '危机个案数', 
    value: 27, 
    icon: Warning, 
    color: '#ef4444', 
    bgColor: '#fef2f2',
    trend: -12,
    trendPositive: false,
    extra: { label: '处理中', value: '8', type: 'warning' }
  },
  { 
    label: '咨询服务量', 
    value: 156, 
    icon: Document, 
    color: '#8b5cf6', 
    bgColor: '#f5f3ff',
    trend: 8.5,
    trendPositive: true,
    extra: { label: '本月', value: '+23', type: 'success' }
  },
  { 
    label: '活动参与人次', 
    value: '1,280', 
    icon: Calendar, 
    color: '#f59e0b', 
    bgColor: '#fffbeb',
    trend: 15,
    trendPositive: true
  },
  { 
    label: '平均响应时间', 
    value: '2.5h', 
    icon: Timer, 
    color: '#06b6d4', 
    bgColor: '#ecfeff',
    trend: -18,
    trendPositive: false
  }
])

const alertData = ref([
  { id: 1, type: 'warning', title: '测评完成率预警', description: '物联网工程专业测评完成率低于85%，请关注并督促完成' },
  { id: 2, type: 'error', title: '危机个案提醒', description: '有2例红色危机个案处理中，请确保干预措施到位' }
])

const healthIndexItems = ref([
  { label: '测评完成率', value: 91.5, color: '#10b981' },
  { label: '危机处置率', value: 96, color: '#3b82f6' },
  { label: '咨询覆盖率', value: 78, color: '#8b5cf6' },
  { label: '活动参与率', value: 85, color: '#f59e0b' },
  { label: '满意度', value: 92, color: '#06b6d4' }
])

const crisisTotal = computed(() => {
  return deptTableData.value.reduce((sum, row) => sum + (row.crisisCount || 0), 0)
})

const topProblems = ref([
  { name: '学业压力', count: 45, percentage: 100 },
  { name: '人际关系', count: 38, percentage: 84 },
  { name: '情绪困扰', count: 32, percentage: 71 },
  { name: '家庭问题', count: 25, percentage: 56 },
  { name: '职业迷茫', count: 18, percentage: 40 }
])

const deptTableData = ref([])

const healthGaugeRef = ref()
const assessmentTrendRef = ref()
const crisisDistRef = ref()
const deptRateRef = ref()
const consultChartRef = ref()
const profileDistRef = ref()

let charts = []

const getTrendClass = (trend, positive) => {
  if (positive) {
    return trend > 0 ? 'trend-up' : 'trend-down'
  }
  return trend > 0 ? 'trend-down' : 'trend-up'
}

const getProgressColor = (rate) => {
  if (rate >= 90) return '#10b981'
  if (rate >= 80) return '#f59e0b'
  return '#ef4444'
}

const getHealthTagType = (index) => {
  if (index >= 85) return 'success'
  if (index >= 70) return ''
  return 'danger'
}

const getProblemColor = (index) => {
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#3b82f6', '#94a3b8']
  return colors[index] || colors[4]
}

const getSummary = ({ columns, data }) => {
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    const values = data.map(item => Number(item[column.property]))
    if (!values.every(value => isNaN(value))) {
      sums[index] = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!isNaN(value)) return prev + curr
        return prev
      }, 0)
    } else {
      sums[index] = '-'
    }
  })
  return sums
}

const initCharts = () => {
  charts.forEach(c => c?.dispose())
  charts = []

  if (healthGaugeRef.value) {
    const chart = echarts.init(healthGaugeRef.value)
    chart.setOption({
      series: [{
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: { color: '#3b82f6' },
        progress: {
          show: true,
          width: 20
        },
        pointer: { show: false },
        axisLine: {
          lineStyle: { width: 20, color: [[1, '#e5e7eb']] }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '-5%'],
          fontSize: 36,
          fontWeight: 'bolder',
          formatter: '{value}',
          color: '#1e293b'
        },
        data: [{ value: 88 }]
      }]
    })
    charts.push(chart)
  }

  if (assessmentTrendRef.value) {
    const chart = echarts.init(assessmentTrendRef.value)
    let xData = ['1月', '2月', '3月', '4月', '5月', '6月']
    let seriesData = [450, 520, 680, 720, 850, 920]
    if (assessmentChartType.value === 'week') {
      xData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      seriesData = [120, 180, 150, 220, 280, 350, 410]
    } else if (assessmentChartType.value === 'quarter') {
      xData = ['Q1', 'Q2', 'Q3', 'Q4']
      seriesData = [1650, 2100, 2450, 2979]
    }
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: xData, boundaryGap: false },
      yAxis: { type: 'value' },
      series: [{
        type: 'line',
        smooth: true,
        data: seriesData,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
          ])
        },
        lineStyle: { color: '#3b82f6', width: 3 },
        itemStyle: { color: '#3b82f6' },
        symbol: 'circle',
        symbolSize: 8
      }]
    })
    charts.push(chart)
  }

  if (crisisDistRef.value) {
    const chart = echarts.init(crisisDistRef.value)
    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
      legend: { bottom: 10, itemWidth: 12, itemHeight: 12 },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: { show: true, formatter: '{b}\n{c}人' },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: [
          { value: 2, name: '极高危', itemStyle: { color: '#dc2626' } },
          { value: 5, name: '高危', itemStyle: { color: '#f59e0b' } },
          { value: 12, name: '中危', itemStyle: { color: '#eab308' } },
          { value: 8, name: '关注', itemStyle: { color: '#3b82f6' } }
        ]
      }]
    })
    charts.push(chart)
  }

  if (deptRateRef.value) {
    const chart = echarts.init(deptRateRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['计科', '软工', '信安', '物联网', '数据科学'],
        axisLabel: { interval: 0 }
      },
      yAxis: { type: 'value', max: 100 },
      series: [{
        type: 'bar',
        data: [
          { value: 95, itemStyle: { color: '#10b981' } },
          { value: 88, itemStyle: { color: '#f59e0b' } },
          { value: 92, itemStyle: { color: '#10b981' } },
          { value: 85, itemStyle: { color: '#ef4444' } },
          { value: 90, itemStyle: { color: '#10b981' } }
        ],
        barWidth: '50%',
        label: { show: true, position: 'top', formatter: '{c}%' }
      }]
    })
    charts.push(chart)
  }

  if (consultChartRef.value) {
    const chart = echarts.init(consultChartRef.value)
    if (consultChartType.value === 'trend') {
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: [25, 32, 28, 45, 38, 52],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: '#a78bfa' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '40%'
        }]
      })
    } else {
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 10 },
        series: [{
          type: 'pie',
          radius: '60%',
          center: ['50%', '45%'],
          data: [
            { value: 45, name: '情绪问题', itemStyle: { color: '#3b82f6' } },
            { value: 38, name: '人际关系', itemStyle: { color: '#10b981' } },
            { value: 32, name: '学业压力', itemStyle: { color: '#f59e0b' } },
            { value: 25, name: '家庭问题', itemStyle: { color: '#ef4444' } },
            { value: 16, name: '其他', itemStyle: { color: '#94a3b8' } }
          ]
        }]
      })
    }
    charts.push(chart)
  }

  if (profileDistRef.value) {
    const chart = echarts.init(profileDistRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['正常', '关注', '中危', '高危', '极高危'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: ['计科', '软工', '信安', '物联网', '数据科学'] },
      yAxis: { type: 'value' },
      series: [
        { name: '正常', type: 'bar', stack: 'total', data: [680, 620, 420, 550, 390], itemStyle: { color: '#10b981' } },
        { name: '关注', type: 'bar', stack: 'total', data: [85, 78, 62, 80, 58], itemStyle: { color: '#3b82f6' } },
        { name: '中危', type: 'bar', stack: 'total', data: [35, 32, 25, 35, 28], itemStyle: { color: '#eab308' } },
        { name: '高危', type: 'bar', stack: 'total', data: [15, 15, 10, 12, 8], itemStyle: { color: '#f59e0b' } },
        { name: '极高危', type: 'bar', stack: 'total', data: [5, 5, 3, 3, 2], itemStyle: { color: '#dc2626' } }
      ]
    })
    charts.push(chart)
  }
}

const loadData = async () => {
  try {
    const params = {
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      dept: filterDept.value
    }
    const res = await getStatsOverview(params)
    if (res.code === 200 && res.data) {
      if (res.data.overview) overviewData.value = res.data.overview
      if (res.data.deptData) deptTableData.value = res.data.deptData
    }
  } catch (e) {
    deptTableData.value = [
      { name: '计算机科学与技术', studentCount: 820, assessedCount: 779, assessmentRate: 95, crisisCount: 8, crisisRed: 1, crisisOrange: 2, crisisYellow: 5, consultCount: 45, activityCount: 320, healthIndex: 92 },
      { name: '软件工程', studentCount: 750, assessedCount: 660, assessmentRate: 88, crisisCount: 6, crisisRed: 1, crisisOrange: 1, crisisYellow: 4, consultCount: 38, activityCount: 280, healthIndex: 85 },
      { name: '信息安全', studentCount: 520, assessedCount: 478, assessmentRate: 92, crisisCount: 5, crisisRed: 0, crisisOrange: 1, crisisYellow: 4, consultCount: 28, activityCount: 195, healthIndex: 88 },
      { name: '物联网工程', studentCount: 680, assessedCount: 578, assessmentRate: 85, crisisCount: 5, crisisRed: 0, crisisOrange: 1, crisisYellow: 4, consultCount: 25, activityCount: 210, healthIndex: 78 },
      { name: '数据科学与大数据', studentCount: 486, assessedCount: 437, assessmentRate: 90, crisisCount: 3, crisisRed: 0, crisisOrange: 0, crisisYellow: 3, consultCount: 20, activityCount: 175, healthIndex: 90 }
    ]
  }
  nextTick(() => initCharts())
}

const handleExport = async (command) => {
  try {
    await exportByApi({
      url: '/api/college/statistics/export',
      params: {
        format: command,
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1],
        dept: filterDept.value,
      },
      filename: `college-statistics-${String(command || 'xlsx').toLowerCase()}.xlsx`,
      fallbackData: { overview: overviewData.value, deptData: deptTableData.value },
    })
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const exportDeptData = async () => {
  try {
    await exportByApi({
      url: '/api/college/statistics/export-dept',
      params: {
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1],
      },
      filename: 'college-statistics-dept.xlsx',
      fallbackData: deptTableData.value,
    })
    ElMessage.success('院系明细已导出')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const viewDeptDetail = (row) => {
  ElMessage.info(`查看 ${row.name} 详情`)
}

const generateReport = (row) => {
  ElMessage.info(`生成 ${row.name} 心理健康报告`)
}

watch([assessmentChartType, consultChartType], () => {
  nextTick(() => initCharts())
})

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  charts.forEach(c => c?.dispose())
})
</script>

<style scoped>
.college-statistics {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
  border-radius: 12px;
  border: 1px solid #bae6fd;
}

.header-content h2 {
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

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon .el-icon {
  font-size: 20px;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.stat-extra {
  margin-top: 6px;
  font-size: 11px;
}

.extra-label {
  color: #94a3b8;
  margin-right: 4px;
}

.extra-value {
  font-weight: 600;
}

.extra-value.success {
  color: #16a34a;
}

.extra-value.warning {
  color: #f59e0b;
}

.stat-trend {
  position: absolute;
  top: 12px;
  right: 12px;
  text-align: right;
}

.stat-trend span {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
}

.trend-up {
  color: #16a34a;
}

.trend-down {
  color: #dc2626;
}

.trend-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 400 !important;
}

.alert-section {
  margin-bottom: 20px;
}

.alert-item {
  margin-bottom: 12px;
}

.alert-item:last-child {
  margin-bottom: 0;
}

.health-index-section {
  margin-bottom: 20px;
}

.health-index-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  color: #1e293b;
}

.info-icon {
  color: #94a3b8;
  cursor: help;
}

.health-index-content {
  display: flex;
  align-items: center;
  gap: 40px;
}

.index-gauge {
  width: 200px;
  height: 180px;
  flex-shrink: 0;
}

.index-details {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.index-item {
  text-align: center;
}

.index-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 12px;
  margin-bottom: 0;
}

.chart-container {
  height: 280px;
}

.chart-container.large {
  height: 320px;
}

.problem-list {
  padding: 8px 0;
}

.problem-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.problem-item:last-child {
  border-bottom: none;
}

.problem-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
}

.problem-rank.rank-1 {
  background: #fef2f2;
  color: #dc2626;
}

.problem-rank.rank-2 {
  background: #fffbeb;
  color: #f59e0b;
}

.problem-rank.rank-3 {
  background: #fefce8;
  color: #eab308;
}

.problem-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.problem-name {
  font-size: 14px;
  color: #334155;
}

.problem-count {
  font-size: 13px;
  color: #64748b;
}

.problem-item :deep(.el-progress) {
  width: 80px;
}

.table-section {
  border-radius: 12px;
}

.rate-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rate-text {
  font-size: 11px;
  color: #94a3b8;
}

.crisis-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crisis-cell .total {
  font-weight: 600;
  color: #1e293b;
}

.crisis-detail {
  display: flex;
  gap: 4px;
}

.crisis-detail .el-tag {
  padding: 0 6px;
  font-size: 11px;
}

.mt-4 {
  margin-top: 16px;
}

@media (max-width: 1400px) {
  .stats-overview {
    grid-template-columns: repeat(3, 1fr);
  }

  .index-details {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .health-index-content {
    flex-direction: column;
    align-items: stretch;
  }

  .index-gauge {
    margin: 0 auto;
  }
}

@media (max-width: 992px) {
  .chart-section .el-row .el-col {
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  .chart-card {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions > * {
    width: 100%;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .index-details {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
