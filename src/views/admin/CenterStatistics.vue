<template>
  <div class="center-statistics">
    <div class="page-head">
      <h2>数据统计</h2>
      <p class="page-desc">心理中心级数据综合统计与分析，含咨询量、测评完成率、危机趋势等。</p>
      <div class="head-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="loadData"
        />
        <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <div class="stats-overview">
      <div
        v-for="stat in overviewData"
        :key="stat.label"
        class="stat-card"
        :style="{ '--stat-color': stat.color }"
      >
        <div class="stat-icon">
          <el-icon><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="card-title">咨询量趋势</span></template>
          <div class="chart-container" ref="consultTrendRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="card-title">测评完成率</span></template>
          <div class="chart-container" ref="assessmentRateRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="card-title">危机等级分布</span></template>
          <div class="chart-container" ref="crisisDistRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header><span class="card-title">预约时段分布</span></template>
          <div class="chart-container" ref="slotDistRef"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Refresh, User, Document, Warning, Calendar } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const dateRange = ref([])
const overviewData = ref([
  { label: '本月咨询量', value: 156, icon: User, color: '#2563eb' },
  { label: '测评完成数', value: 892, icon: Document, color: '#7c3aed' },
  { label: '危机个案数', value: 3, icon: Warning, color: '#dc2626' },
  { label: '预约总数', value: 234, icon: Calendar, color: '#059669' },
])

const consultTrendRef = ref(null)
const assessmentRateRef = ref(null)
const crisisDistRef = ref(null)
const slotDistRef = ref(null)
let charts = []

function initCharts() {
  charts.forEach((c) => c?.dispose())
  charts = []

  if (consultTrendRef.value) {
    const chart = echarts.init(consultTrendRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [22, 18, 25, 28, 24, 15, 12], smooth: true }],
      color: ['#2563eb'],
    })
    charts.push(chart)
  }

  if (assessmentRateRef.value) {
    const chart = echarts.init(assessmentRateRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 85, name: '已完成', itemStyle: { color: '#22c55e' } },
          { value: 15, name: '未完成', itemStyle: { color: '#e2e8f0' } },
        ],
      }],
    })
    charts.push(chart)
  }

  if (crisisDistRef.value) {
    const chart = echarts.init(crisisDistRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['一级', '二级', '三级'] },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [1, 1, 1],
        itemStyle: {
          color: (params) => ['#dc2626', '#f59e0b', '#22c55e'][params.dataIndex],
        },
      }],
    })
    charts.push(chart)
  }

  if (slotDistRef.value) {
    const chart = echarts.init(slotDistRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['8-10', '10-12', '14-16', '16-18'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [35, 58, 72, 45], itemStyle: { color: '#2563eb' } }],
    })
    charts.push(chart)
  }
}

function loadData() {
  overviewData.value = [
    { label: '本月咨询量', value: 156 + Math.floor(Math.random() * 20), icon: User, color: '#2563eb' },
    { label: '测评完成数', value: 892 + Math.floor(Math.random() * 50), icon: Document, color: '#7c3aed' },
    { label: '危机个案数', value: Math.max(0, 3 + Math.floor((Math.random() - 0.7) * 2)), icon: Warning, color: '#dc2626' },
    { label: '预约总数', value: 234 + Math.floor(Math.random() * 30), icon: Calendar, color: '#059669' },
  ]
  initCharts()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', () => charts.forEach((c) => c?.resize()))
})
onUnmounted(() => {
  window.removeEventListener('resize', () => {})
  charts.forEach((c) => c?.dispose())
})
</script>

<style scoped>
.center-statistics { max-width: 1200px; }

.page-head {
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.page-head h2 { margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #1e293b; }
.page-desc { margin: 0; font-size: 14px; color: #64748b; flex: 1; }

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.12);
  color: var(--stat-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .el-icon { font-size: 24px; }

.stat-value { display: block; font-size: 24px; font-weight: 700; color: #1e293b; }
.stat-label { font-size: 13px; color: #64748b; }

.chart-section { margin-bottom: 20px; }
.chart-card { border-radius: 12px; border: 1px solid #e2e8f0; }
.chart-card :deep(.el-card__header) { font-weight: 600; color: #1e293b; }
.chart-container { height: 260px; }
</style>
