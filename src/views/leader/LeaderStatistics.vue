<template>
  <div class="leader-statistics">
    <div class="filter-bar">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        @change="loadData"
      />
      <el-select v-model="filterCollege" placeholder="选择院系" clearable @change="loadData" style="width: 200px">
        <el-option v-for="c in collegeList" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button type="success" @click="exportData">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <div class="stats-cards">
      <div class="stat-card" v-for="stat in overviewData" :key="stat.label">
        <div class="stat-header">
          <span class="stat-label">{{ stat.label }}</span>
          <el-icon :style="{ color: stat.iconColor }"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-compare" v-if="stat.compare !== undefined">
          <span :class="stat.comparePositive ? (stat.compare > 0 ? 'up' : 'down') : (stat.compare > 0 ? 'down' : 'up')">
            {{ stat.compare > 0 ? '↑' : '↓' }} {{ Math.abs(stat.compare) }}%
          </span>
          <span class="compare-text">较上期</span>
        </div>
      </div>
    </div>

    <div class="chart-row">
      <el-card class="chart-card large">
        <template #header>
          <div class="card-header">
            <span>全校心理健康趋势分析</span>
            <el-radio-group v-model="timeRange">
              <el-radio-button value="week">周</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="quarter">季度</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="chart-container large" ref="trendChartRef"></div>
      </el-card>
    </div>

    <div class="chart-row">
      <el-card class="chart-card">
        <template #header>
          <span>危机等级分布</span>
        </template>
        <div class="chart-container" ref="crisisDistRef"></div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <span>咨询类型分布</span>
        </template>
        <div class="chart-container" ref="consultTypeRef"></div>
      </el-card>
    </div>

    <div class="chart-row">
      <el-card class="chart-card">
        <template #header>
          <span>各院系测评完成率</span>
        </template>
        <div class="chart-container" ref="collegeRateRef"></div>
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <span>各院系健康指数对比</span>
        </template>
        <div class="chart-container" ref="healthIndexRef"></div>
      </el-card>
    </div>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>各院系详细数据</span>
          <el-button type="primary" size="small" @click="exportCollegeData">导出</el-button>
        </div>
      </template>
      <el-table :data="collegeTableData" stripe show-summary :summary-method="getSummary">
        <el-table-column prop="name" label="院系名称" width="180" fixed />
        <el-table-column prop="studentCount" label="学生总数" width="100" sortable />
        <el-table-column label="测评完成率" width="150" sortable>
          <template #default="{ row }">
            <el-progress :percentage="row.assessmentRate" :color="getProgressColor(row.assessmentRate)" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="crisisTotal" label="危机个案" width="100" sortable />
        <el-table-column prop="crisisRed" label="红色" width="80">
          <template #default="{ row }">
            <span class="text-danger">{{ row.crisisRed }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="crisisOrange" label="橙色" width="80">
          <template #default="{ row }">
            <span class="text-warning">{{ row.crisisOrange }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="consultCount" label="咨询量" width="100" sortable />
        <el-table-column prop="activityCount" label="活动数" width="100" sortable />
        <el-table-column prop="healthIndex" label="健康指数" width="120" sortable>
          <template #default="{ row }">
            <el-tag :type="getHealthTagType(row.healthIndex)" size="small">{{ row.healthIndex }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="100">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewCollegeDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Download, User, Warning, TrendCharts, Document, School } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getStatsOverview } from '../../api/statsApi'
import { exportByApi } from '../../utils/exporter'

const dateRange = ref([])
const filterCollege = ref('')
const trendPeriod = ref('month')

const collegeList = ref([
  { label: '计算机学院', value: 'cs' },
  { label: '理学院', value: 'sci' },
  { label: '外语学院', value: 'fl' },
  { label: '文学院', value: 'lit' },
  { label: '经济管理学院', value: 'em' },
  { label: '机械工程学院', value: 'me' },
  { label: '电子信息学院', value: 'ei' },
  { label: '艺术学院', value: 'art' },
])

const overviewData = ref([
  { label: '学生总数', value: 28560, icon: User, iconColor: '#3b82f6' },
  { label: '测评完成率', value: '93.2%', icon: TrendCharts, iconColor: '#10b981', compare: 3.2, comparePositive: true },
  { label: '危机个案总数', value: 186, icon: Warning, iconColor: '#ef4444', compare: -8, comparePositive: false },
  { label: '咨询服务量', value: 1256, icon: Document, iconColor: '#8b5cf6', compare: 12, comparePositive: true },
])

const collegeTableData = ref([])

const trendChartRef = ref()
const crisisDistRef = ref()
const consultTypeRef = ref()
const collegeRateRef = ref()
const healthIndexRef = ref()

let charts = []

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

const getSummary = ({ columns, data }) => {
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    const values = data.map((item) => Number(item[column.property]))
    if (!values.every((value) => isNaN(value))) {
      sums[index] = values.reduce((prev, curr) => {
        const value = Number(curr)
        if (!isNaN(value)) {
          return prev + curr
        }
        return prev
      }, 0)
    } else {
      sums[index] = '-'
    }
  })
  return sums
}

const initCharts = () => {
  charts.forEach((c) => c.dispose())
  charts = []

  if (trendChartRef.value) {
    const chart = echarts.init(trendChartRef.value)
    let xData = ['1月', '2月', '3月', '4月', '5月', '6月']
    if (trendPeriod.value === 'week') {
      xData = ['第1周', '第2周', '第3周', '第4周']
    } else if (trendPeriod.value === 'quarter') {
      xData = ['Q1', 'Q2', 'Q3', 'Q4']
    }
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['测评完成人数', '咨询服务量', '危机个案数', '活动参与人次'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: xData },
      yAxis: [
        { type: 'value', name: '人数/次数' },
        { type: 'value', name: '危机数', max: 50 },
      ],
      series: [
        { name: '测评完成人数', type: 'bar', data: [4200, 4500, 4800, 5100, 5200, 5300] },
        { name: '咨询服务量', type: 'bar', data: [180, 195, 210, 225, 230, 216] },
        { name: '危机个案数', type: 'line', yAxisIndex: 1, data: [35, 32, 28, 25, 22, 20] },
        { name: '活动参与人次', type: 'line', data: [2800, 3200, 3500, 3800, 4000, 4200] },
      ],
    })
    charts.push(chart)
  }

  if (crisisDistRef.value) {
    const chart = echarts.init(crisisDistRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        label: { show: true, formatter: '{b}: {c}人\n({d}%)' },
        data: [
          { value: 12, name: '红色', itemStyle: { color: '#dc2626' } },
          { value: 38, name: '橙色', itemStyle: { color: '#f59e0b' } },
          { value: 86, name: '黄色', itemStyle: { color: '#eab308' } },
          { value: 50, name: '蓝色', itemStyle: { color: '#3b82f6' } },
        ],
      }],
    })
    charts.push(chart)
  }

  if (consultTypeRef.value) {
    const chart = echarts.init(consultTypeRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [{
        type: 'pie',
        radius: '60%',
        data: [
          { value: 320, name: '情绪问题', itemStyle: { color: '#3b82f6' } },
          { value: 280, name: '人际关系', itemStyle: { color: '#10b981' } },
          { value: 256, name: '学业压力', itemStyle: { color: '#f59e0b' } },
          { value: 180, name: '职业规划', itemStyle: { color: '#8b5cf6' } },
          { value: 120, name: '家庭关系', itemStyle: { color: '#ef4444' } },
          { value: 100, name: '其他', itemStyle: { color: '#94a3b8' } },
        ],
      }],
    })
    charts.push(chart)
  }

  if (collegeRateRef.value) {
    const chart = echarts.init(collegeRateRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['计算机', '理学院', '外语', '文学院', '经管', '机械', '电信', '艺术'],
        axisLabel: { rotate: 30 },
      },
      yAxis: { type: 'value', max: 100 },
      series: [{
        type: 'bar',
        data: [95, 92, 90, 88, 85, 87, 91, 86],
        itemStyle: {
          color: (params) => {
            const rate = params.data
            if (rate >= 90) {
              return '#10b981'
            }
            if (rate >= 85) {
              return '#f59e0b'
            }
            return '#ef4444'
          },
        },
        label: { show: true, position: 'top', formatter: '{c}%' },
      }],
    })
    charts.push(chart)
  }

  if (healthIndexRef.value) {
    const chart = echarts.init(healthIndexRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      radar: {
        indicator: [
          { name: '测评完成率', max: 100 },
          { name: '咨询覆盖率', max: 100 },
          { name: '活动参与率', max: 100 },
          { name: '危机处置率', max: 100 },
          { name: '满意度', max: 100 },
        ],
      },
      series: [{
        type: 'radar',
        data: [
          {
            value: [95, 85, 78, 92, 88],
            name: '计算机学院',
            areaStyle: { color: 'rgba(59, 130, 246, 0.3)' },
          },
          {
            value: [92, 80, 82, 88, 85],
            name: '理学院',
            areaStyle: { color: 'rgba(16, 185, 129, 0.3)' },
          },
        ],
      }],
    })
    charts.push(chart)
  }
}

const loadData = async () => {
  try {
    const params = {
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      college: filterCollege.value,
    }
    const res = await getStatsOverview(params)
    if (res.code === 200 && res.data) {
      if (res.data.overview) {
        overviewData.value = res.data.overview
      }
      if (res.data.collegeData) {
        collegeTableData.value = res.data.collegeData
      }
    }
  } catch (e) {
    collegeTableData.value = [
      { name: '计算机学院', studentCount: 3256, assessmentRate: 95, crisisTotal: 27, crisisRed: 2, crisisOrange: 5, consultCount: 156, activityCount: 12, healthIndex: 92 },
      { name: '理学院', studentCount: 2890, assessmentRate: 92, crisisTotal: 22, crisisRed: 1, crisisOrange: 4, consultCount: 128, activityCount: 10, healthIndex: 88 },
      { name: '外语学院', studentCount: 2450, assessmentRate: 90, crisisTotal: 18, crisisRed: 1, crisisOrange: 3, consultCount: 98, activityCount: 8, healthIndex: 85 },
      { name: '文学院', studentCount: 2120, assessmentRate: 88, crisisTotal: 15, crisisRed: 1, crisisOrange: 2, consultCount: 86, activityCount: 7, healthIndex: 82 },
      { name: '经济管理学院', studentCount: 3560, assessmentRate: 85, crisisTotal: 32, crisisRed: 3, crisisOrange: 6, consultCount: 145, activityCount: 11, healthIndex: 78 },
      { name: '机械工程学院', studentCount: 2680, assessmentRate: 87, crisisTotal: 24, crisisRed: 2, crisisOrange: 4, consultCount: 112, activityCount: 9, healthIndex: 80 },
      { name: '电子信息学院', studentCount: 3120, assessmentRate: 91, crisisTotal: 26, crisisRed: 2, crisisOrange: 5, consultCount: 135, activityCount: 10, healthIndex: 86 },
      { name: '艺术学院', studentCount: 1850, assessmentRate: 86, crisisTotal: 12, crisisRed: 0, crisisOrange: 2, consultCount: 76, activityCount: 15, healthIndex: 84 },
    ]
  }
}

const exportData = async () => {
  try {
    await exportByApi({
      url: '/api/leader/statistics/export-overview',
      params: {
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1],
        college: filterCollege.value,
      },
      filename: 'leader-stat-overview.xlsx',
      fallbackData: overviewData.value,
    })
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const exportCollegeData = async () => {
  try {
    await exportByApi({
      url: '/api/leader/statistics/export-college',
      params: {
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1],
      },
      filename: 'leader-stat-college.xlsx',
      fallbackData: collegeTableData.value,
    })
    ElMessage.success('院系明细已导出')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const viewCollegeDetail = (row) => {
  ElMessage.info(`查看 ${row.name} 详情`)
}

watch(trendPeriod, () => {
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
.leader-statistics {
  max-width: 1400px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.stat-compare {
  margin-top: 8px;
  font-size: 13px;
}

.stat-compare .up {
  color: #16a34a;
}

.stat-compare .down {
  color: #dc2626;
}

.compare-text {
  color: #94a3b8;
  margin-left: 4px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.chart-card {
  min-height: 320px;
}

.chart-card.large {
  grid-column: 1 / -1;
}

.chart-container {
  height: 250px;
}

.chart-container.large {
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-card {
  margin-bottom: 20px;
}

.text-danger {
  color: #dc2626;
}

.text-warning {
  color: #f59e0b;
}

@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style>
