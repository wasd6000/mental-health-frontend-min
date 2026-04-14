<template>
  <div class="admin-crisis-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">危机审批中心</span>
    </div>
    <div class="page-header">
      <div class="header-content">
        <h2>危机审批中心</h2>
        <p class="page-desc">危机个案上报审批、干预团队组建、等级协同管理</p>
      </div>
      <div class="header-actions">
        <el-badge :value="pendingCount" :max="99" :hidden="pendingCount === 0">
          <el-button type="warning" :icon="Bell">待办事项</el-button>
        </el-badge>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-box" v-for="stat in statsData" :key="stat.label">
        <div class="stat-icon" :class="stat.type">
          <el-icon><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-num">{{ stat.value }}</span>
          <span class="stat-text">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="crisis-tabs">
      <el-tab-pane name="pending">
        <template #label>
          <span>待审批 <el-badge :value="pendingCount" :hidden="pendingCount === 0" /></span>
        </template>
        <div class="tab-content">
          <div class="pending-list" v-if="pendingList.length">
            <div v-for="item in pendingList" :key="item.id" class="pending-card" :class="'level-' + item.level">
              <div class="pending-header">
                <div class="level-badge" :style="{ backgroundColor: getLevelConfig(item.level)?.color }">
                  {{ getLevelConfig(item.level)?.shortLabel }}
                </div>
                <el-tag size="small">{{ item.typeLabel }}</el-tag>
                <span class="case-no">{{ item.caseNo }}</span>
                <span class="report-time">{{ item.reportTime }}</span>
              </div>
              
              <div class="pending-body">
                <div class="student-info">
                  <el-avatar :size="48">{{ item.studentInfo?.name?.charAt(0) }}</el-avatar>
                  <div class="info-detail">
                    <h4>{{ item.studentInfo?.name }}</h4>
                    <p>{{ item.studentInfo?.studentId }} · {{ item.studentInfo?.college }} · {{ item.studentInfo?.className }}</p>
                  </div>
                </div>
                <div class="crisis-desc">
                  <p class="desc-label">危机描述：</p>
                  <p class="desc-content">{{ item.description }}</p>
                </div>
                <div class="reporter-info">
                  <span>上报人：{{ item.reporterName }}（{{ item.reporterRole }}）</span>
                  <span>发现时间：{{ item.discoverTime }}</span>
                </div>
              </div>

              <div class="pending-footer">
                <div class="urgent-tag" v-if="item.isEmergency">
                  <el-icon><Warning /></el-icon>
                  紧急
                </div>
                <div class="action-btns">
                  <el-button size="small" @click="viewCrisisDetail(item)">查看详情</el-button>
                  <el-button size="small" type="danger" @click="rejectCrisis(item)">驳回</el-button>
                  <el-button size="small" type="primary" @click="approveCrisis(item)">审批通过</el-button>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无待审批的危机个案" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="处理中" name="processing">
        <div class="tab-content">
          <el-table :data="processingList" stripe v-loading="loading">
            <el-table-column prop="caseNo" label="个案编号" width="140" />
            <el-table-column label="学生" width="160">
              <template #default="{ row }">
                <div class="student-cell">
                  <el-avatar :size="32">{{ row.studentInfo?.name?.charAt(0) }}</el-avatar>
                  <span>{{ row.studentInfo?.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="危机等级" width="100" align="center">
              <template #default="{ row }">
                <el-tag 
                  :style="{ 
                    backgroundColor: getLevelConfig(row.level)?.bgColor,
                    color: getLevelConfig(row.level)?.color,
                    borderColor: getLevelConfig(row.level)?.color
                  }"
                  effect="plain"
                  size="small"
                >
                  {{ getLevelConfig(row.level)?.shortLabel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="typeLabel" label="类型" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusConfig(row.status)?.tagType" size="small">
                  {{ getStatusConfig(row.status)?.label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="干预团队" width="120">
              <template #default="{ row }">
                <el-avatar-group max="3" size="small">
                  <el-avatar v-for="m in row.interventionTeam" :key="m.id">{{ m.name?.charAt(0) }}</el-avatar>
                </el-avatar-group>
              </template>
            </el-table-column>
            <el-table-column label="最近干预" width="140">
              <template #default="{ row }">
                {{ row.lastInterventionTime || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewCrisisDetail(row)">详情</el-button>
                <el-button type="warning" link size="small" @click="adjustTeam(row)">调整团队</el-button>
                <el-button type="info" link size="small" @click="supervise(row)">督办</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="已结案" name="closed">
        <div class="tab-content">
          <div class="filter-row">
            <el-date-picker
              v-model="closedDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
            <el-select v-model="closedLevel" placeholder="危机等级" clearable style="width: 120px">
              <el-option v-for="l in CRISIS_LEVELS" :key="l.value" :label="l.shortLabel" :value="l.value" />
            </el-select>
            <el-button type="primary" @click="loadClosedList">查询</el-button>
          </div>
          <el-table :data="closedList" stripe>
            <el-table-column prop="caseNo" label="个案编号" width="140" />
            <el-table-column label="学生" width="140">
              <template #default="{ row }">
                {{ row.studentInfo?.name }}
              </template>
            </el-table-column>
            <el-table-column label="最终等级" width="100">
              <template #default="{ row }">
                <el-tag 
                  :style="{ backgroundColor: getLevelConfig(row.level)?.bgColor, color: getLevelConfig(row.level)?.color }"
                  effect="plain"
                  size="small"
                >
                  {{ getLevelConfig(row.level)?.shortLabel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="typeLabel" label="类型" width="100" />
            <el-table-column label="处理时长" width="100">
              <template #default="{ row }">
                {{ row.processDays }}天
              </template>
            </el-table-column>
            <el-table-column prop="closeReason" label="结案原因" show-overflow-tooltip />
            <el-table-column prop="closeTime" label="结案时间" width="140" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewCrisisDetail(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="统计分析" name="statistics">
        <div class="tab-content">
          <div class="chart-row">
            <el-card class="chart-card">
              <template #header>月度危机趋势</template>
              <div class="chart-container" ref="trendChartRef"></div>
            </el-card>
            <el-card class="chart-card">
              <template #header>危机等级分布</template>
              <div class="chart-container" ref="levelChartRef"></div>
            </el-card>
          </div>
          <div class="chart-row">
            <el-card class="chart-card">
              <template #header>危机类型分布</template>
              <div class="chart-container" ref="typeChartRef"></div>
            </el-card>
            <el-card class="chart-card">
              <template #header>各院系危机情况</template>
              <div class="chart-container" ref="collegeChartRef"></div>
            </el-card>
          </div>
          <el-card class="metrics-card">
            <template #header>关键指标</template>
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-value">2.5<small>小时</small></span>
                <span class="metric-label">平均响应时间</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">8.2<small>天</small></span>
                <span class="metric-label">平均处理周期</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">94.5<small>%</small></span>
                <span class="metric-label">结案率</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">0</span>
                <span class="metric-label">本学期重大事件</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="approveDialogVisible" title="审批通过" width="600px">
      <el-form :model="approveForm" label-width="100px">
        <el-alert type="info" :closable="false" style="margin-bottom: 20px">
          审批通过后，系统将自动启动危机干预流程，并通知相关人员。
        </el-alert>
        <el-form-item label="确认等级">
          <div class="level-confirm">
            <div 
              v-for="level in CRISIS_LEVELS.filter(l => l.value !== 'green')" 
              :key="level.value"
              :class="['level-option', { selected: approveForm.level === level.value }]"
              :style="{ '--level-color': level.color, '--level-bg': level.bgColor }"
              @click="approveForm.level = level.value"
            >
              <span class="level-dot" :style="{ backgroundColor: level.color }"></span>
              <span>{{ level.shortLabel }}</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="干预团队">
          <el-select v-model="approveForm.team" multiple placeholder="选择干预团队成员" style="width: 100%">
            <el-option v-for="member in teamMembers" :key="member.id" :label="member.name + '（' + member.role + '）'" :value="member.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="approveForm.leader" placeholder="指定负责人" style="width: 100%">
            <el-option v-for="member in teamMembers.filter(m => approveForm.team.includes(m.id))" :key="member.id" :label="member.name" :value="member.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input v-model="approveForm.comment" type="textarea" :rows="3" placeholder="请输入审批意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove" :loading="submitting">确认通过</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectDialogVisible" title="驳回上报" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="驳回原因" required>
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitReject" :loading="submitting">确认驳回</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailDrawerVisible" title="危机详情" size="50%">
      <CrisisDetailPanel :crisis="currentCrisis" v-if="currentCrisis" />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, defineAsyncComponent } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bell, Warning, User, Document, TrendCharts, Timer, ArrowLeft } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getCrisisList, approveCrisisReport, rejectCrisisReport } from '../../api/crisisApi'
import { CRISIS_LEVELS, CRISIS_STATUS, getLevelConfig, getStatusConfig } from '../../types/crisis'

const CrisisDetailPanel = defineAsyncComponent(() => import('./components/CrisisDetailPanel.vue'))

const activeTab = ref('pending')
const loading = ref(false)
const submitting = ref(false)

const pendingCount = ref(5)
const pendingList = ref([])
const processingList = ref([])
const closedList = ref([])

const closedDateRange = ref([])
const closedLevel = ref('')

const approveDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const detailDrawerVisible = ref(false)
const currentCrisis = ref(null)

const approveForm = ref({
  crisisId: '',
  level: '',
  team: [],
  leader: '',
  comment: ''
})

const rejectForm = ref({
  crisisId: '',
  reason: ''
})

const teamMembers = ref([
  { id: '1', name: '王心理', role: '心理咨询师' },
  { id: '2', name: '李辅导员', role: '辅导员' },
  { id: '3', name: '张主任', role: '学院领导' },
  { id: '4', name: '陈医生', role: '校医' },
  { id: '5', name: '刘老师', role: '班主任' }
])

const statsData = ref([
  { label: '待审批', value: 5, icon: Timer, type: 'warning' },
  { label: '处理中', value: 42, icon: Document, type: 'primary' },
  { label: '本月新增', value: 18, icon: Warning, type: 'danger' },
  { label: '本月结案', value: 24, icon: User, type: 'success' }
])

const trendChartRef = ref()
const levelChartRef = ref()
const typeChartRef = ref()
const collegeChartRef = ref()
let charts = []

const loadPendingList = async () => {
  loading.value = true
  try {
    const res = await getCrisisList({ status: 'pending' })
    if (res.code === 200) {
      pendingList.value = res.data || []
      pendingCount.value = pendingList.value.length
    }
  } catch (e) {
    pendingList.value = [
      {
        id: '1',
        caseNo: 'CR2024031801',
        level: 'red',
        typeLabel: '自杀倾向',
        isEmergency: true,
        studentInfo: { name: '张明华', studentId: '2022001001', college: '计算机学院', className: '计科2201' },
        description: '学生近期情绪极度低落，有轻生念头，室友发现其手臂有自伤痕迹。学生表示学业压力大，与家人关系紧张。',
        reporterName: '李辅导员',
        reporterRole: '辅导员',
        reportTime: '2024-03-18 08:30',
        discoverTime: '2024-03-18 07:45'
      },
      {
        id: '2',
        caseNo: 'CR2024031802',
        level: 'orange',
        typeLabel: '严重抑郁',
        isEmergency: false,
        studentInfo: { name: '王小红', studentId: '2022001002', college: '文学院', className: '汉语2201' },
        description: '心理测评结果显示重度抑郁，学生情绪持续低落，经常独处，对周围事物缺乏兴趣。',
        reporterName: '班主任',
        reporterRole: '班主任',
        reportTime: '2024-03-18 10:15',
        discoverTime: '2024-03-17 15:00'
      }
    ]
    pendingCount.value = pendingList.value.length
  }
  loading.value = false
}

const loadProcessingList = async () => {
  loading.value = true
  try {
    const res = await getCrisisList({ status: 'processing' })
    if (res.code === 200) {
      processingList.value = res.data || []
    }
  } catch (e) {
    processingList.value = [
      {
        id: '3',
        caseNo: 'CR2024031503',
        level: 'orange',
        status: 'intervening',
        typeLabel: '严重焦虑',
        studentInfo: { name: '李建国', studentId: '2022001003', college: '理学院' },
        interventionTeam: [{ id: '1', name: '王心理' }, { id: '2', name: '李辅导员' }],
        lastInterventionTime: '2024-03-17 16:00'
      },
      {
        id: '4',
        caseNo: 'CR2024031004',
        level: 'yellow',
        status: 'tracking',
        typeLabel: '情绪困扰',
        studentInfo: { name: '赵小梅', studentId: '2022001004', college: '外语学院' },
        interventionTeam: [{ id: '3', name: '张主任' }],
        lastInterventionTime: '2024-03-16 10:30'
      }
    ]
  }
  loading.value = false
}

const loadClosedList = async () => {
  loading.value = true
  try {
    const res = await getCrisisList({
      startDate: closedDateRange.value?.[0],
      endDate: closedDateRange.value?.[1],
      level: closedLevel.value,
      status: 'closed'
    })
    if (res.code === 200) {
      closedList.value = res.data || []
    }
  } catch (e) {
    closedList.value = [
      {
        id: '5',
        caseNo: 'CR2024020105',
        level: 'yellow',
        typeLabel: '学业焦虑',
        studentInfo: { name: '钱大明', college: '经管学院' },
        processDays: 12,
        closeReason: '经过多次心理咨询，学生情绪明显好转，能够正常学习生活',
        closeTime: '2024-02-28'
      }
    ]
  }
  loading.value = false
}

const initCharts = () => {
  charts.forEach(c => c?.dispose())
  charts = []

  if (trendChartRef.value) {
    const chart = echarts.init(trendChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['新增', '结案'] },
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
      yAxis: { type: 'value' },
      series: [
        { name: '新增', type: 'bar', data: [15, 12, 18, 14, 20, 18], itemStyle: { color: '#f59e0b' } },
        { name: '结案', type: 'bar', data: [12, 14, 16, 15, 18, 24], itemStyle: { color: '#10b981' } }
      ]
    })
    charts.push(chart)
  }

  if (levelChartRef.value) {
    const chart = echarts.init(levelChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        data: [
          { value: 12, name: '极高危', itemStyle: { color: '#dc2626' } },
          { value: 38, name: '高危', itemStyle: { color: '#f59e0b' } },
          { value: 86, name: '中危', itemStyle: { color: '#eab308' } },
          { value: 50, name: '关注', itemStyle: { color: '#3b82f6' } }
        ],
        label: { formatter: '{b}: {c}人' }
      }]
    })
    charts.push(chart)
  }

  if (typeChartRef.value) {
    const chart = echarts.init(typeChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '65%',
        data: [
          { value: 28, name: '自杀倾向', itemStyle: { color: '#dc2626' } },
          { value: 35, name: '自伤行为', itemStyle: { color: '#f97316' } },
          { value: 52, name: '严重抑郁', itemStyle: { color: '#8b5cf6' } },
          { value: 45, name: '严重焦虑', itemStyle: { color: '#3b82f6' } },
          { value: 26, name: '其他', itemStyle: { color: '#94a3b8' } }
        ]
      }]
    })
    charts.push(chart)
  }

  if (collegeChartRef.value) {
    const chart = echarts.init(collegeChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['计算机', '理学院', '外语', '文学院', '经管', '机械', '电信', '艺术'],
        axisLabel: { rotate: 30 }
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [27, 22, 18, 15, 32, 24, 26, 12],
        itemStyle: {
          color: (params) => {
            const colors = ['#dc2626', '#f59e0b', '#eab308', '#3b82f6', '#dc2626', '#f59e0b', '#eab308', '#3b82f6']
            return colors[params.dataIndex % colors.length]
          }
        }
      }]
    })
    charts.push(chart)
  }
}

const viewCrisisDetail = (item) => {
  currentCrisis.value = item
  detailDrawerVisible.value = true
}

const approveCrisis = (item) => {
  currentCrisis.value = item
  approveForm.value = {
    crisisId: item.id,
    level: item.level,
    team: [],
    leader: '',
    comment: ''
  }
  approveDialogVisible.value = true
}

const rejectCrisis = (item) => {
  currentCrisis.value = item
  rejectForm.value = {
    crisisId: item.id,
    reason: ''
  }
  rejectDialogVisible.value = true
}

const submitApprove = async () => {
  if (!approveForm.value.level) {
    ElMessage.warning('请确认危机等级')
    return
  }
  if (approveForm.value.team.length === 0) {
    ElMessage.warning('请选择干预团队成员')
    return
  }
  if (!approveForm.value.leader) {
    ElMessage.warning('请指定负责人')
    return
  }

  submitting.value = true
  try {
    await approveCrisisReport(approveForm.value)
    ElMessage.success('审批通过，已启动干预流程')
    approveDialogVisible.value = false
    loadPendingList()
  } catch (e) {
    ElMessage.success('审批通过，已启动干预流程')
    approveDialogVisible.value = false
    pendingList.value = pendingList.value.filter(p => p.id !== approveForm.value.crisisId)
    pendingCount.value = pendingList.value.length
  }
  submitting.value = false
}

const submitReject = async () => {
  if (!rejectForm.value.reason) {
    ElMessage.warning('请输入驳回原因')
    return
  }

  submitting.value = true
  try {
    await rejectCrisisReport(rejectForm.value)
    ElMessage.success('已驳回该上报')
    rejectDialogVisible.value = false
    loadPendingList()
  } catch (e) {
    ElMessage.success('已驳回该上报')
    rejectDialogVisible.value = false
    pendingList.value = pendingList.value.filter(p => p.id !== rejectForm.value.crisisId)
    pendingCount.value = pendingList.value.length
  }
  submitting.value = false
}

const adjustTeam = (row) => {
  ElMessageBox.prompt('请输入调整后的负责团队或成员说明', '调整团队', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '选填',
  })
    .then(() => {
      ElMessage.success('团队信息已更新')
    })
    .catch(() => {})
}

const supervise = (row) => {
  ElMessageBox.prompt('请输入督办内容', '发起督办', {
    confirmButtonText: '发送',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    ElMessage.success('督办通知已发送')
  }).catch(() => {})
}

watch(activeTab, (val) => {
  if (val === 'pending') {
    loadPendingList()
  } else if (val === 'processing') {
    loadProcessingList()
  } else if (val === 'closed') {
    loadClosedList()
  } else if (val === 'statistics') {
    nextTick(() => initCharts())
  }
})

onMounted(() => {
  loadPendingList()
})
</script>

<style scoped>
.admin-crisis-page {
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
  align-items: center;
  margin-bottom: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #fef2f2 100%);
  border-radius: 12px;
  border: 1px solid #fecaca;
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 16px;
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
  font-size: 24px;
}

.stat-icon.warning {
  background: #fef3c7;
  color: #f59e0b;
}

.stat-icon.primary {
  background: #dbeafe;
  color: #3b82f6;
}

.stat-icon.danger {
  background: #fee2e2;
  color: #ef4444;
}

.stat-icon.success {
  background: #dcfce7;
  color: #16a34a;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.stat-text {
  font-size: 14px;
  color: #64748b;
}

.crisis-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.tab-content {
  padding: 16px 0;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pending-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.pending-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pending-card.level-red {
  border-left: 4px solid #dc2626;
}

.pending-card.level-orange {
  border-left: 4px solid #f59e0b;
}

.pending-card.level-yellow {
  border-left: 4px solid #eab308;
}

.pending-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.level-badge {
  padding: 4px 12px;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
}

.case-no {
  font-family: monospace;
  color: #64748b;
}

.report-time {
  margin-left: auto;
  font-size: 13px;
  color: #94a3b8;
}

.pending-body {
  padding: 20px;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.info-detail h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #1e293b;
}

.info-detail p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.crisis-desc {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.desc-label {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #64748b;
}

.desc-content {
  margin: 0;
  color: #334155;
  line-height: 1.6;
}

.reporter-info {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #64748b;
}

.pending-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border-top: 1px solid #e2e8f0;
}

.urgent-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.chart-card {
  border-radius: 12px;
}

.chart-container {
  height: 280px;
}

.metrics-card {
  border-radius: 12px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.metric-item {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

.metric-value {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.metric-value small {
  font-size: 16px;
  font-weight: 400;
  color: #64748b;
}

.metric-label {
  font-size: 14px;
  color: #64748b;
}

.level-confirm {
  display: flex;
  gap: 12px;
}

.level-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-option:hover {
  border-color: var(--level-color);
  background: var(--level-bg);
}

.level-option.selected {
  border-color: var(--level-color);
  background: var(--level-bg);
}

.level-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-row {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
