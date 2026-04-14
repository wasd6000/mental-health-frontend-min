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

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

const services = ref([
  { name: 'API 服务', desc: '后端接口', status: 'ok', statusText: '正常' },
  { name: '数据库', desc: 'MySQL', status: 'ok', statusText: '正常' },
  { name: '缓存', desc: 'Redis', status: 'warning', statusText: '偏高' },
  { name: '文件存储', desc: 'OSS', status: 'ok', statusText: '正常' },
])

const metrics = ref({
  cpu: 42,
  memory: 68,
  disk: 55,
  responseMs: 128,
})

const alerts = ref([
  {
    id: 1,
    title: 'Redis 内存使用率偏高',
    type: 'warning',
    description: '当前 Redis 内存使用率达 82%，建议关注或扩容。',
  },
])

const logs = ref([
  { id: 1, time: '2025-03-04 10:32:15', operator: 'admin', module: '用户管理', action: '编辑用户权限', ip: '192.168.1.100', result: '成功' },
  { id: 2, time: '2025-03-04 10:28:03', operator: 'center_01', module: '危机审批', action: '通过危机个案', ip: '192.168.1.101', result: '成功' },
  { id: 3, time: '2025-03-04 10:15:22', operator: 'admin', module: '系统管理', action: '修改系统参数', ip: '192.168.1.100', result: '成功' },
  { id: 4, time: '2025-03-04 09:58:40', operator: 'center_01', module: '咨询师管理', action: '新增咨询师', ip: '192.168.1.101', result: '成功' },
  { id: 5, time: '2025-03-04 09:45:12', operator: 'counselor_02', module: '个案管理', action: '提交咨询记录', ip: '192.168.1.102', result: '成功' },
  { id: 6, time: '2025-03-04 09:30:08', operator: 'admin', module: '数据管理', action: '导出报表', ip: '192.168.1.100', result: '成功' },
])

const logKeyword = ref('')
const logPage = ref(1)
const logPageSize = ref(10)

const overallStatus = computed(() => {
  const hasError = services.value.some((s) => s.status === 'error')
  const hasWarning = services.value.some((s) => s.status === 'warning')
  if (hasError) {
    return { type: 'danger', text: '异常' }
  }
  if (hasWarning) {
    return { type: 'warning', text: '部分异常' }
  }
  return { type: 'success', text: '正常' }
})

const filteredLogs = computed(() => {
  let list = logs.value
  if (logKeyword.value) {
    const k = logKeyword.value.toLowerCase()
    list = list.filter(
      (l) =>
        l.operator.toLowerCase().includes(k) ||
        l.module.toLowerCase().includes(k) ||
        l.action.toLowerCase().includes(k)
    )
  }
  return list
})

const paginatedLogs = computed(() => {
  const list = filteredLogs.value
  const start = (logPage.value - 1) * logPageSize.value
  return list.slice(start, start + logPageSize.value)
})

function getProgressColor(pct) {
  if (pct >= 80) return '#ef4444'
  if (pct >= 60) return '#f59e0b'
  return '#22c55e'
}

function filterLogs() {
  logPage.value = 1
}

function loadData() {
  // 模拟刷新：随机微调指标
  metrics.value = {
    cpu: Math.min(95, Math.max(20, metrics.value.cpu + (Math.random() - 0.5) * 20)),
    memory: Math.min(95, Math.max(30, metrics.value.memory + (Math.random() - 0.5) * 15)),
    disk: metrics.value.disk,
    responseMs: Math.round(80 + Math.random() * 100),
  }
}

let refreshTimer = null
onMounted(() => {
  refreshTimer = setInterval(loadData, 60000)
})
onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
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
