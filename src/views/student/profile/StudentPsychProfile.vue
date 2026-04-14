<template>
  <div class="student-psych-profile">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">学生心理档案</span>
    </div>
    <div class="profile-header">
      <div class="student-overview">
        <el-avatar :size="80" :src="studentInfo.avatar">
          {{ studentInfo.name?.charAt(0) }}
        </el-avatar>
        <div class="student-basic">
          <h2>{{ studentInfo.name }}</h2>
          <p>{{ studentInfo.studentId }} · {{ studentInfo.college }} · {{ studentInfo.className }}</p>
          <div class="risk-badge" v-if="studentInfo.riskLevel">
            <span 
              class="risk-tag"
              :style="{ 
                backgroundColor: getRiskConfig(studentInfo.riskLevel)?.bgColor,
                color: getRiskConfig(studentInfo.riskLevel)?.color
              }"
            >
              {{ getRiskConfig(studentInfo.riskLevel)?.label }}
            </span>
            <span class="risk-update">更新于 {{ studentInfo.lastUpdateTime }}</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="exportProfile" :icon="Download">导出档案</el-button>
        <el-button @click="printProfile" :icon="Printer">打印</el-button>
      </div>
    </div>

    <div class="quick-stats">
      <div class="stat-item" v-for="stat in quickStats" :key="stat.label">
        <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
          <el-icon :style="{ color: stat.color }"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="profile-tabs">
      <el-tab-pane label="综合概览" name="overview">
        <div class="overview-content">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="info-card">
                <template #header>
                  <span class="card-title">基本信息</span>
                </template>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="姓名">{{ studentInfo.name }}</el-descriptions-item>
                  <el-descriptions-item label="性别">{{ studentInfo.gender }}</el-descriptions-item>
                  <el-descriptions-item label="学号">{{ studentInfo.studentId }}</el-descriptions-item>
                  <el-descriptions-item label="年龄">{{ studentInfo.age }}岁</el-descriptions-item>
                  <el-descriptions-item label="学院">{{ studentInfo.college }}</el-descriptions-item>
                  <el-descriptions-item label="专业">{{ studentInfo.major }}</el-descriptions-item>
                  <el-descriptions-item label="班级">{{ studentInfo.className }}</el-descriptions-item>
                  <el-descriptions-item label="入学年份">{{ studentInfo.enrollYear }}</el-descriptions-item>
                  <el-descriptions-item label="宿舍">{{ studentInfo.dorm }}</el-descriptions-item>
                  <el-descriptions-item label="联系电话">{{ studentInfo.phone }}</el-descriptions-item>
                </el-descriptions>
              </el-card>

              <el-card class="info-card">
                <template #header>
                  <span class="card-title">家庭信息</span>
                </template>
                <el-descriptions :column="1" border size="small">
                  <el-descriptions-item label="家庭结构">{{ familyInfo.structure }}</el-descriptions-item>
                  <el-descriptions-item label="父亲">{{ familyInfo.father }}</el-descriptions-item>
                  <el-descriptions-item label="母亲">{{ familyInfo.mother }}</el-descriptions-item>
                  <el-descriptions-item label="家庭经济">{{ familyInfo.economic }}</el-descriptions-item>
                  <el-descriptions-item label="家庭关系">{{ familyInfo.relationship }}</el-descriptions-item>
                  <el-descriptions-item label="特殊情况" v-if="familyInfo.special">
                    {{ familyInfo.special }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-card>
            </el-col>

            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <span class="card-title">心理健康画像</span>
                </template>
                <div class="radar-chart" ref="radarChartRef"></div>
              </el-card>

              <el-card class="tags-card">
                <template #header>
                  <span class="card-title">心理特征标签</span>
                </template>
                <div class="tag-group">
                  <el-tag 
                    v-for="tag in psychTags" 
                    :key="tag.text" 
                    :type="tag.type"
                    size="large"
                    class="psych-tag"
                  >
                    {{ tag.text }}
                  </el-tag>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <el-tab-pane label="测评记录" name="assessment">
        <div class="assessment-content">
          <div class="filter-bar">
            <el-date-picker
              v-model="assessmentDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
            <el-select v-model="assessmentType" placeholder="量表类型" clearable style="width: 150px">
              <el-option label="SCL-90" value="scl90" />
              <el-option label="SDS" value="sds" />
              <el-option label="SAS" value="sas" />
              <el-option label="其他" value="other" />
            </el-select>
            <el-button type="primary" @click="loadAssessments">查询</el-button>
          </div>

          <el-table :data="assessmentList" stripe v-loading="loading">
            <el-table-column prop="scaleName" label="量表名称" width="180" />
            <el-table-column prop="completedTime" label="完成时间" width="160" />
            <el-table-column label="总分" width="100">
              <template #default="{ row }">
                <span :class="getScoreClass(row.score, row.maxScore)">{{ row.score }}</span>
              </template>
            </el-table-column>
            <el-table-column label="结果等级" width="120">
              <template #default="{ row }">
                <el-tag :type="getResultTagType(row.resultLevel)" size="small">
                  {{ row.resultLabel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="suggestion" label="建议" show-overflow-tooltip />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewAssessmentDetail(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-card class="trend-card" v-if="assessmentList.length">
            <template #header>
              <span class="card-title">测评趋势</span>
            </template>
            <div class="trend-chart" ref="trendChartRef"></div>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="咨询记录" name="consultation">
        <div class="consultation-content">
          <el-timeline v-if="consultationList.length">
            <el-timeline-item
              v-for="item in consultationList"
              :key="item.id"
              :timestamp="item.date"
              placement="top"
              :color="item.type === '危机干预' ? '#ef4444' : '#3b82f6'"
            >
              <el-card class="consultation-card">
                <div class="consultation-header">
                  <div class="consultation-info">
                    <el-tag :type="item.type === '危机干预' ? 'danger' : 'primary'" size="small">
                      {{ item.type }}
                    </el-tag>
                    <span class="consultant">{{ item.counselor }}</span>
                    <span class="duration">{{ item.duration }}分钟</span>
                  </div>
                  <el-tag :type="item.status === '已完成' ? 'success' : 'info'" size="small">
                    {{ item.status }}
                  </el-tag>
                </div>
                <div class="consultation-body">
                  <p class="topic"><strong>主题：</strong>{{ item.topic }}</p>
                  <p class="summary" v-if="item.summary"><strong>摘要：</strong>{{ item.summary }}</p>
                </div>
                <div class="consultation-footer">
                  <el-button type="primary" link size="small" @click="viewConsultationDetail(item)">
                    查看详情
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无咨询记录" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="危机记录" name="crisis">
        <div class="crisis-content">
          <div v-if="crisisList.length" class="crisis-list">
            <div v-for="crisis in crisisList" :key="crisis.id" class="crisis-item">
              <div class="crisis-header">
                <div class="level-info">
                  <span 
                    class="level-badge"
                    :style="{ backgroundColor: getLevelColor(crisis.level) }"
                  >
                    {{ getLevelLabel(crisis.level) }}
                  </span>
                  <el-tag :type="crisis.status === 'closed' ? 'success' : 'danger'" size="small">
                    {{ crisis.statusLabel }}
                  </el-tag>
                </div>
                <span class="crisis-date">{{ crisis.reportTime }}</span>
              </div>
              <div class="crisis-body">
                <p class="crisis-type"><strong>类型：</strong>{{ crisis.typeLabel }}</p>
                <p class="crisis-desc">{{ crisis.description }}</p>
              </div>
              <div class="crisis-stats">
                <span>干预次数：{{ crisis.interventionCount }}次</span>
                <span>处理周期：{{ crisis.processDays || '-' }}天</span>
                <span v-if="crisis.closeReason">结案原因：{{ crisis.closeReason }}</span>
              </div>
              <el-button type="primary" link @click="viewCrisisDetail(crisis)">查看详情</el-button>
            </div>
          </div>
          <el-empty v-else description="暂无危机记录" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="跟踪记录" name="tracking">
        <div class="tracking-content">
          <el-timeline v-if="trackingList.length">
            <el-timeline-item
              v-for="item in trackingList"
              :key="item.id"
              :timestamp="item.date"
              placement="top"
            >
              <div class="tracking-item">
                <div class="tracking-header">
                  <el-tag size="small" type="info">{{ item.type }}</el-tag>
                  <span class="operator">{{ item.operator }}</span>
                </div>
                <p class="tracking-content-text">{{ item.content }}</p>
                <p class="tracking-result" v-if="item.result">
                  <strong>结果：</strong>{{ item.result }}
                </p>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无跟踪记录" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="预警设置" name="warning">
        <div class="warning-content">
          <el-card>
            <template #header>
              <div class="card-header-with-action">
                <span class="card-title">当前预警等级</span>
                <el-button type="primary" size="small" @click="showAdjustDialog">调整等级</el-button>
              </div>
            </template>
            <div class="current-warning">
              <div 
                class="warning-level-display"
                :style="{ 
                  backgroundColor: getRiskConfig(studentInfo.riskLevel)?.bgColor,
                  borderColor: getRiskConfig(studentInfo.riskLevel)?.color
                }"
              >
                <span 
                  class="warning-level-text"
                  :style="{ color: getRiskConfig(studentInfo.riskLevel)?.color }"
                >
                  {{ getRiskConfig(studentInfo.riskLevel)?.label || '未评估' }}
                </span>
              </div>
              <div class="warning-info">
                <p><strong>设置时间：</strong>{{ studentInfo.riskSetTime || '-' }}</p>
                <p><strong>设置人员：</strong>{{ studentInfo.riskSetBy || '-' }}</p>
                <p><strong>设置原因：</strong>{{ studentInfo.riskReason || '-' }}</p>
              </div>
            </div>
          </el-card>

          <el-card class="mt-4">
            <template #header>
              <span class="card-title">预警变更历史</span>
            </template>
            <el-table :data="warningHistory" size="small">
              <el-table-column prop="date" label="变更时间" width="160" />
              <el-table-column label="原等级" width="100">
                <template #default="{ row }">
                  <span :style="{ color: getRiskConfig(row.fromLevel)?.color }">
                    {{ getRiskConfig(row.fromLevel)?.label || '无' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="新等级" width="100">
                <template #default="{ row }">
                  <span :style="{ color: getRiskConfig(row.toLevel)?.color }">
                    {{ getRiskConfig(row.toLevel)?.label }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="reason" label="变更原因" show-overflow-tooltip />
              <el-table-column prop="operator" label="操作人" width="100" />
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="consultDialogVisible"
      title="咨询详情"
      width="520px"
      destroy-on-close
    >
      <template v-if="consultDetailItem">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="咨询日期">{{ consultDetailItem.date }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ consultDetailItem.type }}</el-descriptions-item>
          <el-descriptions-item label="咨询师">{{ consultDetailItem.counselor }}</el-descriptions-item>
          <el-descriptions-item label="时长">{{ consultDetailItem.duration }} 分钟</el-descriptions-item>
          <el-descriptions-item label="状态">{{ consultDetailItem.status }}</el-descriptions-item>
          <el-descriptions-item label="主题">{{ consultDetailItem.topic }}</el-descriptions-item>
          <el-descriptions-item v-if="consultDetailItem.summary" label="摘要">
            {{ consultDetailItem.summary }}
          </el-descriptions-item>
          <el-descriptions-item v-if="consultDetailItem.note" label="备注">
            {{ consultDetailItem.note }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <el-dialog
      v-model="adjustRiskDialogVisible"
      title="调整预警等级"
      width="480px"
      destroy-on-close
      @open="onAdjustRiskDialogOpen"
    >
      <el-form label-width="100px">
        <el-form-item label="新等级">
          <el-select v-model="adjustRiskForm.level" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="(cfg, key) in riskConfigs"
              :key="key"
              :label="cfg.label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="变更原因">
          <el-input
            v-model="adjustRiskForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请简要说明调整原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustRiskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdjustRisk">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download, Printer, Document, Calendar, ChatDotRound, Warning, TrendCharts, ArrowLeft } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getArchiveStudentDetail } from '../../../api/centerArchive'
import { getLevelConfig } from '../../../types/crisis'
import { exportByApi } from '../../../utils/exporter'

const route = useRoute()
const router = useRouter()

const activeTab = ref('overview')
const loading = ref(false)

const studentInfo = ref({
  id: '',
  name: '李晓红',
  studentId: '2022001002',
  gender: '女',
  age: 20,
  college: '文学院',
  major: '汉语言文学',
  className: '汉语2201',
  enrollYear: '2022',
  dorm: '6栋205',
  phone: '137****2345',
  email: 'lixiaohong@edu.cn',
  avatar: '',
  riskLevel: 'orange',
  lastUpdateTime: '2024-03-15',
  riskSetTime: '2024-03-10',
  riskSetBy: '王心理',
  riskReason: '心理测评结果显示重度抑郁倾向'
})

const familyInfo = ref({
  structure: '双亲家庭',
  father: '李建国（务农）',
  mother: '王秀英（务农）',
  economic: '一般',
  relationship: '较为和睦',
  special: '父母长期在外务工，与祖父母生活'
})

const quickStats = ref([
  { label: '测评次数', value: 8, icon: Document, color: '#3b82f6', bgColor: '#eff6ff' },
  { label: '咨询次数', value: 5, icon: ChatDotRound, color: '#10b981', bgColor: '#f0fdf4' },
  { label: '危机记录', value: 1, icon: Warning, color: '#ef4444', bgColor: '#fef2f2' },
  { label: '活动参与', value: 12, icon: Calendar, color: '#8b5cf6', bgColor: '#f5f3ff' }
])

const psychTags = ref([
  { text: '内向型人格', type: 'info' },
  { text: '高敏感特质', type: 'warning' },
  { text: '完美主义倾向', type: '' },
  { text: '学业压力大', type: 'danger' },
  { text: '人际关系困扰', type: 'warning' }
])

const assessmentDateRange = ref([])
const assessmentType = ref('')
const assessmentList = ref([])
const consultationList = ref([])
const consultDialogVisible = ref(false)
const consultDetailItem = ref(null)
const adjustRiskDialogVisible = ref(false)
const adjustRiskForm = ref({ level: 'green', reason: '' })
const crisisList = ref([])
const trackingList = ref([])
const warningHistory = ref([])

const radarChartRef = ref()
const trendChartRef = ref()
let charts = []

const riskConfigs = {
  red: { label: '极高危', color: '#dc2626', bgColor: '#fef2f2' },
  orange: { label: '高危', color: '#f59e0b', bgColor: '#fffbeb' },
  yellow: { label: '中危', color: '#eab308', bgColor: '#fefce8' },
  blue: { label: '关注', color: '#3b82f6', bgColor: '#eff6ff' },
  green: { label: '正常', color: '#16a34a', bgColor: '#f0fdf4' }
}

const getRiskConfig = (level) => riskConfigs[level] || riskConfigs.green
const getLevelColor = (level) => getLevelConfig(level)?.color || '#94a3b8'
const getLevelLabel = (level) => getLevelConfig(level)?.shortLabel || '未知'

const getScoreClass = (score, max) => {
  const ratio = score / max
  if (ratio > 0.7) return 'score-danger'
  if (ratio > 0.4) return 'score-warning'
  return 'score-normal'
}

const getResultTagType = (level) => {
  const map = { severe: 'danger', moderate: 'warning', mild: '', normal: 'success' }
  return map[level] || 'info'
}

const initRadarChart = () => {
  if (!radarChartRef.value) return
  const chart = echarts.init(radarChartRef.value)
  chart.setOption({
    radar: {
      indicator: [
        { name: '情绪稳定', max: 100 },
        { name: '人际关系', max: 100 },
        { name: '学业适应', max: 100 },
        { name: '自我认知', max: 100 },
        { name: '压力应对', max: 100 },
        { name: '生活满意度', max: 100 }
      ]
    },
    series: [{
      type: 'radar',
      data: [{
        value: [45, 55, 40, 60, 35, 50],
        name: '当前状态',
        areaStyle: { color: 'rgba(59, 130, 246, 0.3)' },
        lineStyle: { color: '#3b82f6' },
        itemStyle: { color: '#3b82f6' }
      }]
    }]
  })
  charts.push(chart)
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['SCL-90', 'SDS', 'SAS'] },
    xAxis: {
      type: 'category',
      data: ['2023-09', '2023-12', '2024-01', '2024-02', '2024-03']
    },
    yAxis: { type: 'value', name: '分数' },
    series: [
      { name: 'SCL-90', type: 'line', data: [180, 175, 190, 185, 195], smooth: true },
      { name: 'SDS', type: 'line', data: [55, 52, 58, 60, 65], smooth: true },
      { name: 'SAS', type: 'line', data: [48, 45, 52, 55, 58], smooth: true }
    ]
  })
  charts.push(chart)
}

const loadAssessments = async () => {
  loading.value = true
  try {
    const res = await getArchiveStudentDetail({
      studentId: studentInfo.value.id,
      section: 'assessments',
      startDate: assessmentDateRange.value?.[0],
      endDate: assessmentDateRange.value?.[1],
      type: assessmentType.value
    })
    if (res.code === 200) {
      assessmentList.value = res.data || []
    }
  } catch (e) {
    assessmentList.value = [
      { id: '1', scaleName: 'SCL-90症状自评量表', completedTime: '2024-03-15 10:30', score: 195, maxScore: 450, resultLevel: 'moderate', resultLabel: '中度异常', suggestion: '建议进行心理咨询' },
      { id: '2', scaleName: '抑郁自评量表(SDS)', completedTime: '2024-03-10 14:20', score: 65, maxScore: 100, resultLevel: 'moderate', resultLabel: '中度抑郁', suggestion: '建议进一步评估' },
      { id: '3', scaleName: '焦虑自评量表(SAS)', completedTime: '2024-03-10 14:35', score: 58, maxScore: 100, resultLevel: 'mild', resultLabel: '轻度焦虑', suggestion: '继续关注' }
    ]
  }
  loading.value = false
  nextTick(() => initTrendChart())
}

const loadConsultations = async () => {
  try {
    const res = await getArchiveStudentDetail({
      studentId: studentInfo.value.id,
      section: 'consultations'
    })
    if (res.code === 200) {
      consultationList.value = res.data || []
    }
  } catch (e) {
    consultationList.value = [
      { id: '1', date: '2024-03-15', type: '个体咨询', counselor: '王心理', duration: 50, status: '已完成', topic: '学业压力与情绪调节', summary: '学生反映近期学业压力大，情绪低落...' },
      { id: '2', date: '2024-03-08', type: '危机干预', counselor: '王心理', duration: 90, status: '已完成', topic: '危机干预会谈', summary: '针对学生抑郁情绪进行危机干预...' }
    ]
  }
}

const loadCrisis = async () => {
  try {
    const res = await getArchiveStudentDetail({
      studentId: studentInfo.value.id,
      section: 'crisis'
    })
    if (res.code === 200) {
      crisisList.value = res.data || []
    }
  } catch (e) {
    crisisList.value = [
      {
        id: '1',
        level: 'orange',
        status: 'tracking',
        statusLabel: '跟踪中',
        typeLabel: '严重抑郁',
        description: '心理测评结果显示重度抑郁，学生情绪持续低落',
        reportTime: '2024-03-10',
        interventionCount: 3,
        processDays: null
      }
    ]
  }
}

const loadTracking = async () => {
  try {
    const res = await getArchiveStudentDetail({
      studentId: studentInfo.value.id,
      section: 'tracking'
    })
    if (res.code === 200) {
      trackingList.value = res.data || []
    }
  } catch (e) {
    trackingList.value = [
      { id: '1', date: '2024-03-15', type: '谈心谈话', operator: '李辅导员', content: '与学生进行了深入谈话，了解其近期状况', result: '学生情绪有所好转' },
      { id: '2', date: '2024-03-12', type: '家长沟通', operator: '李辅导员', content: '与家长电话沟通，告知学生近况', result: '家长表示会加强关注' }
    ]
  }
}

const loadWarningHistory = async () => {
  try {
    const res = await getArchiveStudentDetail({
      studentId: studentInfo.value.id,
      section: 'warning-history'
    })
    if (res.code === 200) {
      warningHistory.value = res.data || []
    }
  } catch (e) {
    warningHistory.value = [
      { date: '2024-03-10', fromLevel: 'yellow', toLevel: 'orange', reason: '测评结果显示抑郁加重', operator: '王心理' },
      { date: '2024-02-20', fromLevel: null, toLevel: 'yellow', reason: '初次筛查发现异常', operator: '系统' }
    ]
  }
}

const viewAssessmentDetail = (row) => {
  router.push({ path: '/student/assessment/result', query: { id: row.id } })
}

const viewConsultationDetail = (item) => {
  consultDetailItem.value = item
  consultDialogVisible.value = true
}

const onAdjustRiskDialogOpen = () => {
  adjustRiskForm.value = {
    level: studentInfo.value.riskLevel || 'green',
    reason: ''
  }
}

const submitAdjustRisk = () => {
  const next = adjustRiskForm.value.level
  const reason = (adjustRiskForm.value.reason || '').trim()
  if (!next) {
    ElMessage.warning('请选择预警等级')
    return
  }
  const from = studentInfo.value.riskLevel
  const today = new Date().toISOString().slice(0, 10)
  studentInfo.value.riskLevel = next
  studentInfo.value.lastUpdateTime = today
  studentInfo.value.riskSetTime = today
  studentInfo.value.riskSetBy = '当前操作员'
  studentInfo.value.riskReason = reason || '预警等级调整'
  warningHistory.value.unshift({
    date: today,
    fromLevel: from,
    toLevel: next,
    reason: reason || '预警等级调整',
    operator: '当前操作员'
  })
  adjustRiskDialogVisible.value = false
  ElMessage.success('预警等级已更新')
}

const viewCrisisDetail = (crisis) => {
  router.push({ path: '/crisis/detail', query: { id: crisis.id } })
}

const showAdjustDialog = () => {
  adjustRiskDialogVisible.value = true
}

const exportProfile = async () => {
  try {
    await exportByApi({
      url: '/api/student/profile/export',
      params: { studentId: studentInfo.value.id || route.query.id },
      filename: `student-psych-profile-${studentInfo.value.id || 'detail'}.pdf`,
      fallbackData: {
        studentInfo: studentInfo.value,
        assessments: assessmentRecords.value,
        consultations: consultationList.value,
        crises: crisisRecords.value,
      },
    })
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const printProfile = () => {
  window.print()
}

watch(activeTab, (val) => {
  if (val === 'assessment') {
    loadAssessments()
  } else if (val === 'consultation') {
    loadConsultations()
  } else if (val === 'crisis') {
    loadCrisis()
  } else if (val === 'tracking') {
    loadTracking()
  } else if (val === 'warning') {
    loadWarningHistory()
  }
})

onMounted(() => {
  nextTick(() => initRadarChart())
})
</script>

<style scoped>
.student-psych-profile {
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

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.student-overview {
  display: flex;
  gap: 20px;
  align-items: center;
}

.student-basic h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  color: #1e293b;
}

.student-basic p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #64748b;
}

.risk-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.risk-tag {
  padding: 6px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.risk-update {
  font-size: 12px;
  color: #94a3b8;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
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
}

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.profile-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.card-title {
  font-weight: 600;
  color: #1e293b;
}

.info-card,
.chart-card,
.tags-card,
.trend-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.radar-chart {
  height: 280px;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.psych-tag {
  font-size: 14px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.score-danger {
  color: #dc2626;
  font-weight: 600;
}

.score-warning {
  color: #f59e0b;
  font-weight: 600;
}

.score-normal {
  color: #16a34a;
  font-weight: 600;
}

.trend-card {
  margin-top: 20px;
}

.trend-chart {
  height: 300px;
}

.consultation-card {
  border-radius: 8px;
}

.consultation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.consultation-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.consultant {
  font-weight: 500;
  color: #1e293b;
}

.duration {
  font-size: 13px;
  color: #64748b;
}

.consultation-body {
  margin-bottom: 12px;
}

.topic,
.summary {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
}

.crisis-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.crisis-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #f59e0b;
}

.crisis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-badge {
  padding: 4px 12px;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
}

.crisis-date {
  font-size: 13px;
  color: #94a3b8;
}

.crisis-type {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #475569;
}

.crisis-desc {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
}

.crisis-stats {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
}

.tracking-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.tracking-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.operator {
  font-size: 12px;
  color: #94a3b8;
}

.tracking-content-text {
  margin: 0 0 8px 0;
  color: #334155;
  line-height: 1.5;
}

.tracking-result {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.card-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.current-warning {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.warning-level-display {
  padding: 24px 32px;
  border-radius: 12px;
  border: 2px solid;
  text-align: center;
}

.warning-level-text {
  font-size: 20px;
  font-weight: 700;
}

.warning-info p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #475569;
}

.mt-4 {
  margin-top: 16px;
}

@media (max-width: 1200px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 16px;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }

  .overview-content .el-row {
    flex-direction: column;
  }

  .overview-content .el-col {
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
}
</style>
