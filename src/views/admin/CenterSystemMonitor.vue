<template>
  <div class="center-system-monitor">
    <div class="page-head">
      <h2>系统状态监控</h2>
      <p class="page-desc">监控心理中心业务系统运行状态，含预约、测评、危机处置等模块可用性。</p>
      <div class="head-actions">
        <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-row :gutter="20" class="section">
      <el-col :span="24">
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">业务模块状态</span>
            <el-tag :type="overallStatus.type" size="small">{{ overallStatus.text }}</el-tag>
          </template>
          <div class="service-grid">
            <div
              v-for="svc in modules"
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

    <el-row :gutter="20" class="section">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="metric-card" shadow="never">
          <div class="metric-icon"><el-icon><Calendar /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ todayAppointments }}</span>
            <span class="metric-label">今日预约数</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="metric-card" shadow="never">
          <div class="metric-icon"><el-icon><Document /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ pendingCrisis }}</span>
            <span class="metric-label">待处置危机</span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="metric-card" shadow="never">
          <div class="metric-icon"><el-icon><List /></el-icon></div>
          <div class="metric-body">
            <span class="metric-value">{{ todayAssessments }}</span>
            <span class="metric-label">今日测评完成</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="section">
      <el-col :span="24">
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">业务异常</span>
            <el-badge v-if="businessAlerts.length" :value="businessAlerts.length" type="warning" />
          </template>
          <el-empty v-if="!businessAlerts.length" description="暂无业务异常" />
          <el-alert
            v-else
            v-for="a in businessAlerts"
            :key="a.id"
            :title="a.title"
            :type="a.type"
            :description="a.description"
            show-icon
            :closable="false"
            class="alert-item"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Refresh,
  CircleCheck,
  CircleClose,
  Warning,
  Calendar,
  Document,
  List,
} from '@element-plus/icons-vue'

const modules = ref([
  { name: '预约系统', desc: '咨询预约与排班', status: 'ok', statusText: '正常' },
  { name: '测评系统', desc: '心理测评与量表', status: 'ok', statusText: '正常' },
  { name: '危机处置', desc: '危机上报与审批', status: 'ok', statusText: '正常' },
  { name: '个案管理', desc: '咨询记录与档案', status: 'ok', statusText: '正常' },
])

const todayAppointments = ref(12)
const pendingCrisis = ref(0)
const todayAssessments = ref(28)

const businessAlerts = ref([])

const overallStatus = computed(() => {
  const hasError = modules.value.some((s) => s.status === 'error')
  const hasWarning = modules.value.some((s) => s.status === 'warning')
  if (hasError) return { type: 'danger', text: '异常' }
  if (hasWarning) return { type: 'warning', text: '部分异常' }
  return { type: 'success', text: '正常' }
})

function loadData() {
  todayAppointments.value = Math.max(0, todayAppointments.value + Math.floor((Math.random() - 0.5) * 4))
  todayAssessments.value = Math.max(0, todayAssessments.value + Math.floor((Math.random() - 0.5) * 6))
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.center-system-monitor {
  max-width: 1000px;
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
  align-items: center;
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
  background: linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%);
  color: #fff;
}

.metric-icon .el-icon {
  font-size: 24px;
}

.metric-body {
  flex: 1;
}

.metric-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.metric-label {
  font-size: 13px;
  color: #64748b;
}

.alert-item {
  margin-bottom: 12px;
  border-radius: 8px;
}

.alert-item:last-child {
  margin-bottom: 0;
}
</style>
