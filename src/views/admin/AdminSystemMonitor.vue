<template>
  <div class="system-monitor">
    <div class="page-head">
      <h2>系统监控</h2>
      <p class="page-desc">全系统运行监控、性能指标、异常告警及日志审计。</p>
      <div class="head-actions">
        <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <!-- 服务运行状态 -->
    <el-row :gutter="20" class="section">
      <el-col :span="24">
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">服务运行状态</span>
            <el-tag :type="overallStatus.type" size="small">{{ overallStatus.text }}</el-tag>
          </template>
          <div class="service-grid">
            <div
              v-for="svc in services"
              :key="svc.name"
              class="service-item"
              :class="{ error: svc.status === 'error', warning: svc.status === 'warning' }"
            >
              <div class="service-icon">
                <el-icon v-if="svc.status === 'ok'"><CircleCheck /></el-icon>
                <el-icon v-else-if="svc.status === 'warning'"><Warning /></el-icon>
                <el-icon v-else><CircleClose /></el-icon>
              </div>
              <div class="service-info">
                <span class="service-name">{{ svc.name }}</span>
                <span class="service-desc">{{ svc.desc }}</span>
              </div>
              <span class="service-status">{{ svc.statusText }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能指标 -->
    <el-row :gutter="20" class="section">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="metric-card" shadow="never">
          <div class="metric-icon cpu"><el-icon><Cpu /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ metrics.cpu }}%</span>
            <span class="metric-label">CPU 使用率</span>
            <el-progress
              :percentage="metrics.cpu"
              :color="getProgressColor(metrics.cpu)"
              :stroke-width="8"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="metric-card" shadow="never">
          <div class="metric-icon memory"><el-icon><Monitor /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ metrics.memory }}%</span>
            <span class="metric-label">内存使用率</span>
            <el-progress
              :percentage="metrics.memory"
              :color="getProgressColor(metrics.memory)"
              :stroke-width="8"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="metric-card" shadow="never">
          <div class="metric-icon disk"><el-icon><FolderOpened /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ metrics.disk }}%</span>
            <span class="metric-label">磁盘使用率</span>
            <el-progress
              :percentage="metrics.disk"
              :color="getProgressColor(metrics.disk)"
              :stroke-width="8"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="metric-card" shadow="never">
          <div class="metric-icon latency"><el-icon><Timer /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ metrics.responseMs }}ms</span>
            <span class="metric-label">接口平均响应</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 异常告警 -->
    <el-row :gutter="20" class="section">
      <el-col :span="24">
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">异常告警</span>
            <el-badge v-if="alerts.length" :value="alerts.length" type="danger" />
          </template>
          <el-empty v-if="!alerts.length" description="暂无异常告警" />
          <div v-else class="alert-list">
            <el-alert
              v-for="a in alerts"
              :key="a.id"
              :title="a.title"
              :type="a.type"
              :description="a.description"
              show-icon
              :closable="false"
              class="alert-item"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作日志审计 -->
    <el-row :gutter="20" class="section">
      <el-col :span="24">
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header-row">
              <span class="card-title">操作日志审计</span>
              <el-input
                v-model="logKeyword"
                placeholder="搜索操作人/模块"
                clearable
                style="width: 200px"
                @input="filterLogs"
              >
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
            </div>
          </template>
          <el-table :data="paginatedLogs" stripe style="width: 100%">
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="module" label="模块" width="120" />
            <el-table-column prop="action" label="操作" min-width="140" />
            <el-table-column prop="ip" label="IP" width="130" />
            <el-table-column prop="result" label="结果" width="80">
              <template #default="{ row }">
                <el-tag :type="row.result === '成功' ? 'success' : 'danger'" size="small">
                  {{ row.result }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrap">
            <el-pagination
              v-model:current-page="logPage"
              v-model:page-size="logPageSize"
              :total="filteredLogs.length"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  CircleCheck,
  CircleClose,
  Warning,
  Cpu,
  Monitor,
  FolderOpened,
  Timer,
  Search,
} from '@element-plus/icons-vue'
import {
  getSystemHealth,
  getSystemMetrics,
  getSystemAlerts,
  getOperationLogs
} from '../../api/adminApi'

const services = ref([])
const metrics = ref({
  cpu: 0,
  memory: 0,
  disk: 0,
  responseMs: 0,
})
const alerts = ref([])
const allLogs = ref([])
const logKeyword = ref('')
const logPage = ref(1)
const logPageSize = ref(10)
const loading = ref(false)
let refreshTimer = null

const overallStatus = computed(() => {
  const hasError = services.value.some((s) => s.status === 'error')
  const hasWarning = services.value.some((s) => s.status === 'warning')
  if (hasError) return { type: 'danger', text: '异常' }
  if (hasWarning) return { type: 'warning', text: '警告' }
  return { type: 'success', text: '正常' }
})

const filteredLogs = computed(() => {
  if (!logKeyword.value) return allLogs.value
  const k = logKeyword.value.toLowerCase()
  return allLogs.value.filter(
      (l) =>
          l.operator?.toLowerCase().includes(k) ||
          l.module?.toLowerCase().includes(k)
  )
})

const paginatedLogs = computed(() => {
  const list = filteredLogs.value
  const start = (logPage.value - 1) * logPageSize.value
  return list.slice(start, start + logPageSize.value)
})

function getProgressColor(value) {
  if (value < 60) return '#22c55e'
  if (value < 80) return '#f59e0b'
  return '#dc2626'
}

function filterLogs() {
  logPage.value = 1
}

async function loadData() {
  loading.value = true
  try {
    // 并行加载所有监控数据
    const [healthRes, metricsRes, alertsRes, logsRes] = await Promise.all([
      getSystemHealth(),
      getSystemMetrics(),
      getSystemAlerts({ status: 'active' }),
      getOperationLogs({ page: 1, pageSize: 50 }),
    ])

    // 更新服务状态
    if (healthRes?.code === 200 && healthRes.data) {
      services.value = healthRes.data.services?.map(svc => ({
        name: svc.name,
        desc: svc.description || '',
        status: svc.status === 'UP' ? 'ok' : (svc.status === 'DEGRADED' ? 'warning' : 'error'),
        statusText: svc.status === 'UP' ? '正常' : (svc.status === 'DEGRADED' ? '偏高' : '异常'),
      })) || []
    }

    // 更新性能指标
    if (metricsRes?.code === 200 && metricsRes.data) {
      metrics.value = {
        cpu: metricsRes.data.cpuUsage || 0,
        memory: metricsRes.data.memoryUsage || 0,
        disk: metricsRes.data.diskUsage || 0,
        responseMs: metricsRes.data.avgResponseTime || 0,
      }
    }

    // 更新告警列表
    if (alertsRes?.code === 200 && Array.isArray(alertsRes.data)) {
      alerts.value = alertsRes.data.map(a => ({
        id: a.id,
        title: a.title,
        type: a.level === 'HIGH' ? 'error' : (a.level === 'MEDIUM' ? 'warning' : 'info'),
        description: a.message,
      }))
    }

    // 更新操作日志
    if (logsRes?.code === 200 && logsRes.data) {
      const logList = logsRes.data.list || logsRes.data.records || []
      allLogs.value = logList.map(log => ({
        time: log.createTime || log.timestamp,
        operator: log.operator || log.username,
        module: log.module,
        action: log.action,
        ip: log.ip,
        result: log.result === 'SUCCESS' ? '成功' : '失败',
      }))
    }
  } catch (e) {
    console.error('加载监控数据失败:', e)
    ElMessage.error('加载监控数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
  // 每30秒自动刷新
  refreshTimer = setInterval(loadData, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.system-monitor {
  max-width: 1200px;
}

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

.page-head h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  flex: 1;
  min-width: 200px;
}

.head-actions {
  flex-shrink: 0;
}

.section {
  margin-bottom: 20px;
}

.section-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.section-card :deep(.el-card__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-weight: 600;
  color: #1e293b;
}

.card-header-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.service-item.error {
  background: #fef2f2;
  border-color: #fecaca;
}

.service-item.warning {
  background: #fffbeb;
  border-color: #fde68a;
}

.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #16a34a;
}

.service-item.error .service-icon {
  background: #fee2e2;
  color: #dc2626;
}

.service-item.warning .service-icon {
  background: #fef3c7;
  color: #d97706;
}

.service-icon .el-icon {
  font-size: 22px;
}

.service-info {
  flex: 1;
  min-width: 0;
}

.service-name {
  display: block;
  font-weight: 600;
  color: #1e293b;
}

.service-desc {
  font-size: 12px;
  color: #64748b;
}

.service-status {
  font-size: 13px;
  color: #22c55e;
  font-weight: 500;
}

.service-item.error .service-status {
  color: #dc2626;
}

.service-item.warning .service-status {
  color: #d97706;
}

.metric-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.metric-card :deep(.el-card__body) {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-icon .el-icon {
  font-size: 24px;
  color: #fff;
}

.metric-icon.cpu {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.metric-icon.memory {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.metric-icon.disk {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.metric-icon.latency {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.metric-body {
  flex: 1;
  min-width: 0;
}

.metric-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.metric-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
  display: block;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  border-radius: 8px;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
