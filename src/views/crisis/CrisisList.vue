<template>
  <div class="crisis-list-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">危机个案管理</span>
    </div>
    <div class="page-header">
      <div class="header-content">
        <h2>危机个案管理</h2>
        <p class="page-desc">全面管理危机个案，实时监控处理进度，确保学生安全</p>
      </div>
      <el-button type="primary" @click="showReportDialog" :icon="Plus">
        上报危机
      </el-button>
    </div>

    <div class="stats-overview">
      <div class="stat-card" v-for="stat in overviewStats" :key="stat.label">
        <div class="stat-icon" :style="{ backgroundColor: stat.bgColor }">
          <el-icon :style="{ color: stat.color }"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
        <div class="stat-trend" v-if="stat.trend !== undefined">
          <span :class="stat.trend > 0 ? 'up' : 'down'">
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </span>
        </div>
      </div>
    </div>

    <div class="crisis-level-distribution">
      <div class="level-bar">
        <div 
          v-for="level in levelDistribution" 
          :key="level.value"
          class="level-segment"
          :style="{ 
            width: level.percentage + '%', 
            backgroundColor: level.color 
          }"
          :title="`${level.label}: ${level.count}人 (${level.percentage}%)`"
        >
          <span v-if="level.percentage > 8">{{ level.count }}</span>
        </div>
      </div>
      <div class="level-legend">
        <div v-for="level in levelDistribution" :key="level.value" class="legend-item">
          <span class="legend-dot" :style="{ backgroundColor: level.color }"></span>
          <span class="legend-label">{{ level.label }}</span>
          <span class="legend-count">{{ level.count }}人</span>
        </div>
      </div>
    </div>

    <el-card class="filter-card">
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索学生姓名/学号/个案编号"
          prefix-icon="Search"
          clearable
          style="width: 280px"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filters.level" placeholder="危机等级" clearable style="width: 140px">
          <el-option v-for="level in CRISIS_LEVELS" :key="level.value" :label="level.shortLabel" :value="level.value">
            <span class="level-option">
              <span class="level-dot" :style="{ backgroundColor: level.color }"></span>
              {{ level.shortLabel }}
            </span>
          </el-option>
        </el-select>
        <el-select v-model="filters.status" placeholder="处理状态" clearable style="width: 140px">
          <el-option v-for="status in CRISIS_STATUS" :key="status.value" :label="status.label" :value="status.value" />
        </el-select>
        <el-select v-model="filters.type" placeholder="危机类型" clearable style="width: 140px">
          <el-option v-for="type in CRISIS_TYPES" :key="type.value" :label="type.label" :value="type.value" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px"
        />
        <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
        <el-button @click="resetFilters" :icon="Refresh">重置</el-button>
        <el-button type="success" @click="exportData" :icon="Download">导出</el-button>
      </div>
    </el-card>

    <el-card class="table-card">
      <el-table 
        :data="crisisList" 
        v-loading="loading"
        stripe
        @row-click="handleRowClick"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="caseNo" label="个案编号" width="130" fixed>
          <template #default="{ row }">
            <span class="case-no">{{ row.caseNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="学生信息" width="180">
          <template #default="{ row }">
            <div class="student-cell">
              <el-avatar :size="36" :src="row.studentInfo?.avatar">
                {{ row.studentInfo?.name?.charAt(0) }}
              </el-avatar>
              <div class="student-info">
                <span class="student-name">{{ row.studentInfo?.name }}</span>
                <span class="student-id">{{ row.studentInfo?.studentId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="studentInfo.college" label="学院" width="140" show-overflow-tooltip />
        <el-table-column label="危机等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag 
              :style="{ 
                backgroundColor: getLevelConfig(row.level)?.bgColor,
                color: getLevelConfig(row.level)?.color,
                borderColor: getLevelConfig(row.level)?.color
              }"
              effect="plain"
            >
              {{ getLevelConfig(row.level)?.shortLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="typeLabel" label="危机类型" width="110" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusConfig(row.status)?.tagType" size="small">
              {{ getStatusConfig(row.status)?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上报信息" width="160">
          <template #default="{ row }">
            <div class="reporter-cell">
              <span class="reporter-name">{{ row.reporterName }}</span>
              <span class="report-time">{{ formatTime(row.reportTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="干预团队" width="120">
          <template #default="{ row }">
            <el-avatar-group max="3" size="small">
              <el-avatar 
                v-for="member in row.interventionTeam" 
                :key="member.id"
                :title="member.name"
              >
                {{ member.name?.charAt(0) }}
              </el-avatar>
            </el-avatar-group>
          </template>
        </el-table-column>
        <el-table-column label="最近干预" width="140">
          <template #default="{ row }">
            <span class="last-intervention">
              {{ row.interventionRecords?.length ? formatTime(row.interventionRecords[0].createTime) : '暂无' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="viewDetail(row)">
              详情
            </el-button>
            <el-button type="warning" link size="small" @click.stop="adjustLevel(row)">
              调级
            </el-button>
            <el-button type="success" link size="small" @click.stop="addIntervention(row)">
              干预
            </el-button>
            <el-dropdown @command="(cmd) => handleMoreAction(cmd, row)" trigger="click" @click.stop>
              <el-button type="info" link size="small">
                更多 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="team">干预团队</el-dropdown-item>
                  <el-dropdown-item command="history">变更历史</el-dropdown-item>
                  <el-dropdown-item command="close" v-if="row.status !== 'closed'">结案</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadData"
          @size-change="loadData"
        />
      </div>
    </el-card>

    <el-drawer
      v-model="detailDrawer"
      title="危机个案详情"
      size="50%"
      direction="rtl"
    >
      <div class="crisis-detail" v-if="currentCrisis">
        <div class="detail-header">
          <div class="student-profile">
            <el-avatar :size="64" :src="currentCrisis.studentInfo?.avatar">
              {{ currentCrisis.studentInfo?.name?.charAt(0) }}
            </el-avatar>
            <div class="profile-info">
              <h3>{{ currentCrisis.studentInfo?.name }}</h3>
              <p>{{ currentCrisis.studentInfo?.studentId }} · {{ currentCrisis.studentInfo?.college }}</p>
            </div>
          </div>
          <div class="level-status">
            <el-tag 
              size="large"
              effect="dark"
              :style="{ backgroundColor: getLevelConfig(currentCrisis.level)?.color }"
            >
              {{ getLevelConfig(currentCrisis.level)?.shortLabel }}
            </el-tag>
            <el-tag :type="getStatusConfig(currentCrisis.status)?.tagType">
              {{ getStatusConfig(currentCrisis.status)?.label }}
            </el-tag>
          </div>
        </div>

        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="个案编号">{{ currentCrisis.caseNo }}</el-descriptions-item>
              <el-descriptions-item label="危机类型">{{ currentCrisis.typeLabel }}</el-descriptions-item>
              <el-descriptions-item label="发现时间">{{ currentCrisis.discoverTime }}</el-descriptions-item>
              <el-descriptions-item label="上报时间">{{ currentCrisis.reportTime }}</el-descriptions-item>
              <el-descriptions-item label="上报人">{{ currentCrisis.reporterName }} ({{ currentCrisis.reporterRole }})</el-descriptions-item>
              <el-descriptions-item label="发现来源">{{ currentCrisis.discoverSource }}</el-descriptions-item>
              <el-descriptions-item label="危机描述" :span="2">{{ currentCrisis.description }}</el-descriptions-item>
              <el-descriptions-item label="初始措施" :span="2">{{ currentCrisis.initialMeasures }}</el-descriptions-item>
            </el-descriptions>

            <h4 class="section-title">紧急联系人</h4>
            <el-table :data="currentCrisis.emergencyContacts" size="small">
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="relation" label="关系" />
              <el-table-column prop="phone" label="电话" />
              <el-table-column label="是否已通知">
                <template #default="{ row }">
                  <el-tag :type="row.isNotified ? 'success' : 'info'" size="small">
                    {{ row.isNotified ? '已通知' : '未通知' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="干预记录" name="intervention">
            <div class="intervention-header">
              <span>共 {{ currentCrisis.interventionRecords?.length || 0 }} 条记录</span>
              <el-button type="primary" size="small" @click="addIntervention(currentCrisis)">
                添加记录
              </el-button>
            </div>
            <el-timeline v-if="currentCrisis.interventionRecords?.length">
              <el-timeline-item
                v-for="record in currentCrisis.interventionRecords"
                :key="record.id"
                :timestamp="record.createTime"
                placement="top"
              >
                <div class="intervention-item">
                  <div class="intervention-head">
                    <el-tag size="small" type="info">{{ record.typeLabel }}</el-tag>
                    <span class="operator">{{ record.operator }}</span>
                  </div>
                  <p class="intervention-content">{{ record.content }}</p>
                  <p class="intervention-result" v-if="record.result">
                    <strong>结果：</strong>{{ record.result }}
                  </p>
                  <p class="intervention-plan" v-if="record.nextPlan">
                    <strong>后续计划：</strong>{{ record.nextPlan }}
                  </p>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无干预记录" />
          </el-tab-pane>

          <el-tab-pane label="等级变更" name="level">
            <el-timeline v-if="currentCrisis.levelHistory?.length">
              <el-timeline-item
                v-for="record in currentCrisis.levelHistory"
                :key="record.id"
                :timestamp="record.operateTime"
                :color="getLevelConfig(record.toLevel)?.color"
                placement="top"
              >
                <div class="level-change-item">
                  <div class="level-change">
                    <span 
                      v-if="record.fromLevel"
                      class="level-from"
                      :style="{ color: getLevelConfig(record.fromLevel)?.color }"
                    >
                      {{ getLevelConfig(record.fromLevel)?.shortLabel }}
                    </span>
                    <span v-else>初始建档</span>
                    <el-icon><Right /></el-icon>
                    <span 
                      class="level-to"
                      :style="{ 
                        backgroundColor: getLevelConfig(record.toLevel)?.color,
                        color: '#fff'
                      }"
                    >
                      {{ getLevelConfig(record.toLevel)?.shortLabel }}
                    </span>
                  </div>
                  <p class="change-reason">{{ record.reason }}</p>
                  <span class="change-operator">{{ record.operator }} · {{ record.operatorRole }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无等级变更记录" />
          </el-tab-pane>

          <el-tab-pane label="干预团队" name="team">
            <div class="team-list">
              <div v-for="member in currentCrisis.interventionTeam" :key="member.id" class="team-member">
                <el-avatar :size="48">{{ member.name?.charAt(0) }}</el-avatar>
                <div class="member-info">
                  <div class="member-name">
                    {{ member.name }}
                    <el-tag v-if="member.isLeader" size="small" type="warning">负责人</el-tag>
                  </div>
                  <div class="member-role">{{ member.role }}</div>
                  <div class="member-contact">
                    <span>{{ member.phone }}</span>
                    <span v-if="member.email">· {{ member.email }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Search, Refresh, Download, ArrowDown, Right,
  Warning, User, Document, TrendCharts, ArrowLeft 
} from '@element-plus/icons-vue'
import { getCrisisList, isApiSuccess } from '../../api/crisisApi'
import { 
  CRISIS_LEVELS, CRISIS_STATUS, CRISIS_TYPES,
  getLevelConfig, getStatusConfig, getTypeConfig
} from '../../types/crisis'
import { exportByApi } from '../../utils/exporter'

const router = useRouter()

const loading = ref(false)
const crisisList = ref([])
const detailDrawer = ref(false)
const currentCrisis = ref(null)
const activeTab = ref('basic')

const filters = ref({
  keyword: '',
  level: '',
  status: '',
  type: '',
  dateRange: []
})

const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

const overviewStats = ref([
  { label: '危机个案总数', value: 186, icon: Warning, color: '#ef4444', bgColor: '#fef2f2', trend: -5 },
  { label: '处理中', value: 42, icon: Document, color: '#1e4f9c', bgColor: '#f0f9ff' },
  { label: '本月新增', value: 18, icon: TrendCharts, color: '#f59e0b', bgColor: '#fffbeb', trend: 12 },
  { label: '本月结案', value: 24, icon: User, color: '#16a34a', bgColor: '#f0fdf4', trend: 8 }
])

const levelDistribution = computed(() => {
  const total = overviewStats.value[0].value || 1
  return [
    { value: 'red', label: '极高危', count: 12, color: '#dc2626', percentage: Math.round(12 / total * 100) },
    { value: 'orange', label: '高危', count: 38, color: '#f59e0b', percentage: Math.round(38 / total * 100) },
    { value: 'yellow', label: '中危', count: 86, color: '#eab308', percentage: Math.round(86 / total * 100) },
    { value: 'blue', label: '关注', count: 50, color: '#1e4f9c', percentage: Math.round(50 / total * 100) }
  ]
})

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getRowClassName = ({ row }) => {
  if (row.level === 'red') return 'row-danger'
  if (row.level === 'orange') return 'row-warning'
  return ''
}

const UI_TYPE_TO_API = {
  suicide: 'SUICIDAL',
  self_harm: 'SELF_HARM',
  violence: 'VIOLENT',
  depression: 'OTHER',
  anxiety: 'OTHER',
  mental: 'OTHER',
  other: 'OTHER',
}

const loadData = async () => {
  loading.value = true
  try {
    const kw = filters.value.keyword?.trim()
    const needClient =
      !!(kw || filters.value.type || filters.value.dateRange?.length === 2)
    const params = {
      page: needClient ? 1 : pagination.value.page,
      pageSize: needClient ? 500 : pagination.value.pageSize,
      level: filters.value.level || undefined,
      status: filters.value.status || undefined,
      college: kw || undefined,
    }
    const res = await getCrisisList(params)
    if (isApiSuccess(res)) {
      let list = res.data?.list || res.data?.records || []
      const serverTotal = Number(res.data?.total) || list.length
      if (kw) {
        const k = kw.toLowerCase()
        list = list.filter((row) => {
          const name = row.studentInfo?.name?.toLowerCase() || ''
          const sid = row.studentInfo?.studentId?.toLowerCase() || ''
          const col = row.studentInfo?.college?.toLowerCase() || ''
          const rid = String(row.reportId || row.caseNo || '').toLowerCase()
          return (
            name.includes(k) ||
            sid.includes(k) ||
            rid.includes(k) ||
            col.includes(k)
          )
        })
      }
      if (filters.value.type) {
        const code = UI_TYPE_TO_API[filters.value.type]
        list = list.filter((row) => {
          const rt = String(row.apiReportType || '').toUpperCase()
          return !code || rt === code
        })
      }
      if (filters.value.dateRange?.length === 2) {
        const [a, b] = filters.value.dateRange
        list = list.filter((row) => {
          const t = row.reportTime || row.discoverTime
          if (!t) return false
          const d = String(t).slice(0, 10)
          return d >= a && d <= b
        })
      }
      const filteredTotal = list.length
      if (needClient) {
        pagination.value.total = filteredTotal
        const start = (pagination.value.page - 1) * pagination.value.pageSize
        crisisList.value = list.slice(start, start + pagination.value.pageSize)
        overviewStats.value[0].value = filteredTotal
        overviewStats.value[1].value = list.filter(
          (c) => c.reportStatus !== 'closed',
        ).length
      } else {
        pagination.value.total = serverTotal
        crisisList.value = list
      }
    } else {
      ElMessage.error(res?.msg || '加载危机列表失败')
      crisisList.value = []
      pagination.value.total = 0
    }
  } catch (e) {
    console.error(e)
    ElMessage.error(e?.message || '加载失败')
    crisisList.value = []
    pagination.value.total = 0
  }
  loading.value = false
}

const generateMockData = () => {
  return [
    {
      id: '1',
      caseNo: 'CR2024031501',
      level: 'red',
      status: 'intervening',
      typeLabel: '自杀倾向',
      studentInfo: { name: '张明华', studentId: '2022001001', college: '计算机学院', avatar: '' },
      reporterName: '李辅导员',
      reporterRole: '辅导员',
      reportTime: '2024-03-15 08:30',
      discoverTime: '2024-03-15 07:45',
      discoverSource: '室友反映',
      description: '学生近期情绪极度低落，有轻生念头，室友发现其手臂有自伤痕迹。',
      initialMeasures: '已安排24小时陪护，通知家长',
      emergencyContacts: [
        { name: '张父', relation: '父亲', phone: '139****5678', isNotified: true }
      ],
      interventionTeam: [
        { id: '1', name: '王心理', role: '心理咨询师', isLeader: true, phone: '138****1111' },
        { id: '2', name: '李辅导员', role: '辅导员', isLeader: false, phone: '137****2222' }
      ],
      interventionRecords: [
        { id: '1', typeLabel: '危机干预', content: '进行紧急心理危机干预...', result: '情绪有所缓解', createTime: '2024-03-15 10:00', operator: '王心理' }
      ],
      levelHistory: [
        { id: '1', fromLevel: null, toLevel: 'red', reason: '初始评估为极高危', operator: '王心理', operatorRole: '咨询师', operateTime: '2024-03-15 09:00' }
      ]
    },
    {
      id: '2',
      caseNo: 'CR2024031002',
      level: 'orange',
      status: 'tracking',
      typeLabel: '严重抑郁',
      studentInfo: { name: '李晓红', studentId: '2022001002', college: '文学院', avatar: '' },
      reporterName: '班主任',
      reporterRole: '班主任',
      reportTime: '2024-03-10 14:20',
      discoverTime: '2024-03-10 10:00',
      discoverSource: '心理测评预警',
      description: '心理测评结果显示重度抑郁，学生情绪持续低落。',
      initialMeasures: '已联系家长，安排定期咨询',
      emergencyContacts: [
        { name: '李母', relation: '母亲', phone: '136****6789', isNotified: true }
      ],
      interventionTeam: [
        { id: '3', name: '赵咨询师', role: '心理咨询师', isLeader: true, phone: '135****3333' }
      ],
      interventionRecords: [],
      levelHistory: []
    },
    {
      id: '3',
      caseNo: 'CR2024030503',
      level: 'yellow',
      status: 'processing',
      typeLabel: '严重焦虑',
      studentInfo: { name: '王建国', studentId: '2022001003', college: '理学院', avatar: '' },
      reporterName: '自主上报',
      reporterRole: '学生',
      reportTime: '2024-03-05 16:40',
      discoverTime: '2024-03-05 16:40',
      discoverSource: '自主求助',
      description: '学业压力大，经常失眠，焦虑情绪明显。',
      initialMeasures: '已预约心理咨询',
      emergencyContacts: [],
      interventionTeam: [],
      interventionRecords: [],
      levelHistory: []
    }
  ]
}

const handleSearch = () => {
  pagination.value.page = 1
  loadData()
}

const resetFilters = () => {
  filters.value = {
    keyword: '',
    level: '',
    status: '',
    type: '',
    dateRange: []
  }
  handleSearch()
}

const exportData = async () => {
  try {
    await exportByApi({
      url: '/api/crisis/export',
      params: {
        keyword: filters.value.keyword,
        level: filters.value.level,
        status: filters.value.status,
        type: filters.value.type,
        startDate: filters.value.dateRange?.[0],
        endDate: filters.value.dateRange?.[1],
      },
      filename: 'crisis-list.xlsx',
      fallbackData: crisisList.value,
    })
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const showReportDialog = () => {
  router.push('/crisis/report')
}

const handleRowClick = (row) => {
  viewDetail(row)
}

const viewDetail = (row) => {
  currentCrisis.value = row
  activeTab.value = 'basic'
  detailDrawer.value = true
}

const adjustLevel = (row) => {
  router.push({ path: '/crisis/level', query: { id: row.id } })
}

const addIntervention = (row) => {
  router.push({ path: '/crisis/intervene', query: { id: row.id } })
}

const handleMoreAction = (command, row) => {
  switch (command) {
    case 'team':
      currentCrisis.value = row
      activeTab.value = 'team'
      detailDrawer.value = true
      break
    case 'history':
      currentCrisis.value = row
      activeTab.value = 'level'
      detailDrawer.value = true
      break
    case 'close':
      handleClose(row)
      break
  }
}

const handleClose = async (row) => {
  try {
    await ElMessageBox.prompt('请输入结案原因', '结案确认', {
      confirmButtonText: '确认结案',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '请输入结案原因'
    }).then(({ value }) => {
      ElMessage.success('结案成功')
      loadData()
    })
  } catch {}
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.crisis-list-page {
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

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
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

.stat-trend .up {
  color: #ef4444;
}

.stat-trend .down {
  color: #16a34a;
}

.crisis-level-distribution {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.level-bar {
  display: flex;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.level-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.level-segment:hover {
  filter: brightness(1.1);
}

.level-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label {
  color: #64748b;
}

.legend-count {
  font-weight: 600;
  color: #1e293b;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.level-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.table-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.case-no {
  font-family: monospace;
  font-weight: 600;
  color: #1e4f9c;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
  color: #1e293b;
}

.student-id {
  font-size: 12px;
  color: #94a3b8;
}

.reporter-cell {
  display: flex;
  flex-direction: column;
}

.reporter-name {
  color: #334155;
}

.report-time {
  font-size: 12px;
  color: #94a3b8;
}

.last-intervention {
  font-size: 13px;
  color: #64748b;
}

.pagination-bar {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.row-danger) {
  background-color: #fef2f2 !important;
}

:deep(.row-warning) {
  background-color: #fffbeb !important;
}

.crisis-detail {
  padding: 0 10px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.student-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #1e293b;
}

.profile-info p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.level-status {
  display: flex;
  gap: 8px;
}

.section-title {
  margin: 24px 0 12px;
  font-size: 15px;
  color: #1e293b;
}

.intervention-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.intervention-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.intervention-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.operator {
  font-size: 12px;
  color: #94a3b8;
}

.intervention-content {
  margin: 0 0 8px;
  color: #334155;
  line-height: 1.5;
}

.intervention-result,
.intervention-plan {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
}

.level-change-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.level-change {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.level-from {
  font-weight: 600;
}

.level-to {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.change-reason {
  margin: 0 0 8px;
  color: #475569;
  line-height: 1.5;
}

.change-operator {
  font-size: 12px;
  color: #94a3b8;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.member-info {
  flex: 1;
}

.member-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.member-role {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.member-contact {
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 1200px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-bar > * {
    width: 100% !important;
  }
}
</style>
