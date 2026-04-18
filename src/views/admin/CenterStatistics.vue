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
import { ref, onMounted, onUnmounted, markRaw } from 'vue'
import { Refresh, User, Document, Warning, Calendar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  getStatsOverview,
  getConsultTrend,
  getAssessmentRate,
  getCrisisDistribution,
  getSlotDistribution
} from '../../api/adminApi'

const dateRange = ref([])
const overviewData = ref([
  { label: '本月咨询量', value: 0, icon: markRaw(User), color: '#2563eb' },
  { label: '测评完成数', value: 0, icon: markRaw(Document), color: '#7c3aed' },
  { label: '危机个案数', value: 0, icon: markRaw(Warning), color: '#dc2626' },
  { label: '预约总数', value: 0, icon: markRaw(Calendar), color: '#059669' },
])

const consultTrendRef = ref(null)
const assessmentRateRef = ref(null)
const crisisDistRef = ref(null)
const slotDistRef = ref(null)
let charts = []
const loading = ref(false)

// 保存 resize 处理函数引用，用于正确移除监听器
const handleResize = () => {
  charts.forEach((c) => {
    if (c && !c.isDisposed()) {
      c.resize()
    }
  })
}

function initCharts() {
  charts.forEach((c) => {
    if (c && !c.isDisposed()) {
      c.dispose()
    }
  })
  charts = []

  if (consultTrendRef.value) {
    const chart = echarts.init(consultTrendRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [], smooth: true }],
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
        data: [],
      }],
    })
    charts.push(chart)
  }

  if (crisisDistRef.value) {
    const chart = echarts.init(crisisDistRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [] }],
    })
    charts.push(chart)
  }

  if (slotDistRef.value) {
    const chart = echarts.init(slotDistRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [] }],
    })
    charts.push(chart)
  }
}

async function loadData() {
  loading.value = true

  try {
    const params = {}
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    // 并行加载所有统计数据（API层已做降级处理）
    const [overviewRes, trendRes, rateRes, crisisRes, slotRes] = await Promise.all([
      getStatsOverview(params),
      getConsultTrend(params),
      getAssessmentRate(params),
      getCrisisDistribution(params),
      getSlotDistribution(params),
    ])

    // 更新概览数据
    if (overviewRes?.code === 200 && overviewRes.data) {
      overviewData.value = [
        { label: '本月咨询量', value: overviewRes.data.consultCount || 0, icon: markRaw(User), color: '#2563eb' },
        { label: '测评完成数', value: overviewRes.data.assessmentCount || 0, icon: markRaw(Document), color: '#7c3aed' },
        { label: '危机个案数', value: overviewRes.data.crisisCount || 0, icon: markRaw(Warning), color: '#dc2626' },
        { label: '预约总数', value: overviewRes.data.appointmentCount || 0, icon: markRaw(Calendar), color: '#059669' },
      ]
    }

    // 更新咨询趋势图
    if (trendRes?.code === 200 && trendRes.data && consultTrendRef.value) {
      const chart = charts[0]
      chart?.setOption({
        xAxis: { data: trendRes.data.dates || [] },
        series: [{ data: trendRes.data.values || [] }],
      })
    }

    // 更新测评完成率图
    if (rateRes?.code === 200 && rateRes.data && assessmentRateRef.value) {
      const chart = charts[1]
      chart?.setOption({
        series: [{
          data: [
            { value: rateRes.data.completed || 0, name: '已完成', itemStyle: { color: '#22c55e' } },
            { value: rateRes.data.incomplete || 0, name: '未完成', itemStyle: { color: '#e2e8f0' } },
          ],
        }],
      })
    }

    // 更新危机分布图
    if (crisisRes?.code === 200 && crisisRes.data && crisisDistRef.value) {
      const chart = charts[2]
      const levels = Array.isArray(crisisRes.data.levels) ? crisisRes.data.levels : []
      const values = Array.isArray(crisisRes.data.values) ? crisisRes.data.values : []

      chart?.setOption({
        xAxis: { data: levels },
        series: [{
          data: values,
          itemStyle: {
            color: (params) => ['#dc2626', '#f59e0b', '#22c55e'][params.dataIndex],
          },
        }],
      })
    }

    // 更新时段分布图
    if (slotRes?.code === 200 && slotRes.data && slotDistRef.value) {
      const chart = charts[3]
      const slots = Array.isArray(slotRes.data.slots) ? slotRes.data.slots : []
      const values = Array.isArray(slotRes.data.values) ? slotRes.data.values : []

      chart?.setOption({
        xAxis: { data: slots },
        series: [{ data: values }],
      })
    }
  } catch (e) {
    ElMessage.error('统计数据加载失败')
    console.error('统计数据加载异常:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initCharts()
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach((c) => {
    if (c && !c.isDisposed()) {
      c.dispose()
    }
  })
  charts = []
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
