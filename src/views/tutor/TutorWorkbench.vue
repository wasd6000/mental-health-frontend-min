<template>
  <div class="tutor-workbench">
    <div class="page-head">
      <div class="head-main">
        <h2>辅导员工作台</h2>
        <p class="page-desc">查看待办事项、风险预警与快捷操作。</p>
      </div>
      <div class="head-actions">
        <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">
          刷新数据
        </el-button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card" v-for="stat in statsData" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.color }">
          <el-icon><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ loading ? '-' : stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <div class="section-row">
      <div class="section-card">
        <div class="section-header">
          <h3>待办事项</h3>
          <el-badge :value="todoList.length" :hidden="todoList.length === 0" class="badge-wrapper">
            <el-button type="primary" link @click="viewAllTodos">查看全部</el-button>
          </el-badge>
        </div>
        <div class="todo-list" v-loading="loading">
          <div class="todo-item" v-for="todo in todoList" :key="todo.id" @click="handleTodoClick(todo)">
            <span class="todo-type" :class="todo.type">{{ todo.typeText }}</span>
            <span class="todo-content">{{ todo.content }}</span>
            <span class="todo-time">{{ todo.time }}</span>
            <el-icon class="todo-arrow"><ArrowRight /></el-icon>
          </div>
          <el-empty v-if="!loading && todoList.length === 0" description="暂无待办事项" />
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <h3>风险学生预警</h3>
          <el-badge :value="riskStudents.length" :hidden="riskStudents.length === 0" class="badge-wrapper">
            <el-button type="primary" link @click="$router.push('/admin/tutor-students')">查看全部</el-button>
          </el-badge>
        </div>
        <div class="risk-list" v-loading="loading">
          <div class="risk-item" v-for="student in riskStudents" :key="student.id">
            <el-avatar :size="36" :style="{ background: getRiskColor(student.level) }">
              {{ (student.name || '未知').slice(-2) }}
            </el-avatar>
            <div class="risk-info">
              <span class="risk-name">{{ student.name || '未知学生' }}</span>
              <span class="risk-class">{{ student.className || student.college || '未知班级' }}</span>
            </div>
            <el-tag :type="getRiskTagType(student.level)" size="small">{{ student.levelText || '未知' }}</el-tag>
            <el-button type="primary" link size="small" @click="viewStudentDetail(student)">查看</el-button>
          </div>
          <el-empty v-if="!loading && riskStudents.length === 0" description="暂无风险学生" />
        </div>
      </div>
    </div>

    <div class="section-row">
      <div class="section-card">
        <div class="section-header">
          <h3>最近动态</h3>
          <el-button type="primary" link>查看更多</el-button>
        </div>
        <div class="activity-list" v-loading="loading">
          <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
            <div class="activity-dot" :style="{ background: activity.color }"></div>
            <div class="activity-content">
              <span class="activity-text">{{ activity.text }}</span>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
          <el-empty v-if="!loading && recentActivities.length === 0" description="暂无动态" />
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <h3>快捷操作</h3>
        </div>
        <div class="quick-actions">
          <div class="action-item" v-for="action in quickActions" :key="action.label" @click="action.handler">
            <div class="action-icon" :style="{ background: action.color }">
              <el-icon><component :is="action.icon" /></el-icon>
            </div>
            <span class="action-label">{{ action.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  Warning,
  Bell,
  Document,
  Calendar,
  Edit,
  Plus,
  DataAnalysis,
  Refresh,
  ArrowRight,
} from '@element-plus/icons-vue'
import { getStatsOverview } from '../../api/statsApi'
import { getCenterApprovalList, getArchiveStudents } from '../../api/centerArchive'
import { getTutorRecentActivities } from '../../api/workbench'
import { isSuccess } from '../../utils/responseHelper'

const router = useRouter()
const loading = ref(false)


// 使用 markRaw 避免图标组件被做成响应式
const statsData = ref([
  { label: '负责学生', value: 0, color: 'linear-gradient(135deg, #1e4f9c, #2563eb)', icon: markRaw(User) },
  { label: '风险预警', value: 0, color: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: markRaw(Warning) },
  { label: '待处理事项', value: 0, color: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: markRaw(Bell) },
  { label: '本月上报', value: 0, color: 'linear-gradient(135deg, #10b981, #059669)', icon: markRaw(Document) },
])

const todoList = ref([])
const riskStudents = ref([])
const recentActivities = ref([])

const quickActions = [
  {
    label: '危机上报',
    icon: markRaw(Warning),
    color: 'linear-gradient(135deg, #ef4444, #dc2626)',
    handler: () => router.push('/admin/tutor-crisis-report'),
  },
  {
    label: '学生管理',
    icon: markRaw(User),
    color: 'linear-gradient(135deg, #1e4f9c, #2563eb)',
    handler: () => router.push('/admin/tutor-students'),
  },
  {
    label: '测评查看',
    icon: markRaw(DataAnalysis),
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    handler: () => router.push('/admin/tutor-assessment'),
  },
  {
    label: '同辈互助',
    icon: markRaw(Document),
    color: 'linear-gradient(135deg, #ec4899, #db2777)',
    handler: () => router.push('/admin/peer-forum'),
  },
  {
    label: '活动管理',
    icon: markRaw(Calendar),
    color: 'linear-gradient(135deg, #10b981, #059669)',
    handler: () => router.push('/admin/activity-manage'),
  },
  {
    label: '月报填写',
    icon: markRaw(Edit),
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    handler: () => router.push('/admin/tutor-report'),
  },
]


const getRiskTagType = (level) => {
  const map = { red: 'danger', orange: 'warning', yellow: '', green: 'success' }
  return map[level] || 'info'
}

const getRiskColor = (level) => {
  const map = {
    red: '#ef4444',
    orange: '#f97316',
    yellow: '#eab308',
    green: '#10b981',
  }
  return map[level] || '#64748b'
}

const viewStudentDetail = (student) => {
  router.push(`/admin/tutor-students/${student.id}`)
}

const viewAllTodos = () => {
  ElMessage.info('待办事项列表功能开发中')
}

const handleTodoClick = (todo) => {
  const routeMap = {
    crisis: '/admin/tutor-crisis-report',
    assessment: '/admin/tutor-assessment',
    activity: '/admin/activity-manage',
    report: '/admin/tutor-report',
  }
  const route = routeMap[todo.type]
  if (route) {
    router.push(route)
  } else {
    ElMessage.info('该功能正在开发中')
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    await loadData()
    ElMessage.success('数据已刷新')
  } catch (e) {
    ElMessage.error('刷新失败，请重试')
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    // 1. 加载统计数据
    const statsRes = await getStatsOverview()
    if (isSuccess(statsRes) && statsRes.data) {
      statsData.value[0].value = statsRes.data.totalStudents || 0
      statsData.value[1].value = statsRes.data.riskCount || 0
      statsData.value[2].value = statsRes.data.todoCount || 0
      statsData.value[3].value = statsRes.data.reportCount || 0
    }

    // 2. 加载待办事项
    const todoRes = await getCenterApprovalList({ type: 'tutor' })
    if (isSuccess(todoRes) && todoRes.data) {
      const todosArray = Array.isArray(todoRes.data) ? todoRes.data : (todoRes.data.list || todoRes.data.records || [])
      todoList.value = todosArray
          .filter(item => item && item.id)
          .slice(0, 5)
          .map(item => ({
            id: item.id,
            type: item.type || 'other',
            typeText: getTypeText(item.type),
            content: item.content || item.title || '待处理事项',
            time: formatTime(item.createTime || item.createdAt),
          }))
    }

    // 3. 加载风险学生
    const riskRes = await getArchiveStudents({ riskOnly: true, limit: 5 })
    if (isSuccess(riskRes) && riskRes.data) {
      const studentsArray = Array.isArray(riskRes.data) ? riskRes.data : (riskRes.data.list || riskRes.data.records || [])
      riskStudents.value = studentsArray
          .filter(student => student && student.id)
          .slice(0, 5)
          .map(student => ({
            id: student.id,
            name: student.name || '未知学生',
            className: student.className || student.major || '未知班级',
            college: student.college,
            level: student.riskLevel || student.level || 'green',
            levelText: getRiskLevelText(student.riskLevel || student.level),
          }))
    }

    // 4. 加载最近动态（使用真实接口）
    try {
      const activitiesRes = await getTutorRecentActivities(5)
      if (isSuccess(activitiesRes) && activitiesRes.data) {
        recentActivities.value = activitiesRes.data.map(item => ({
          id: item.id,
          text: item.content,
          time: formatTime(item.createTime),
          color: getActivityColor(item.type)
        }))
      } else {
        recentActivities.value = []
      }
    } catch (e) {
      console.warn('加载最近动态失败', e)
      recentActivities.value = []
    }
  } catch (e) {
    console.error('加载工作台数据失败:', e)
    ElMessage.warning('部分数据加载失败')

    // 清空数据，显示空状态
    statsData.value.forEach(stat => stat.value = 0)
    todoList.value = []
    riskStudents.value = []
    recentActivities.value = []
  } finally {
    loading.value = false
  }
}

const getTypeText = (type) => {
  const map = {
    crisis: '危机',
    assessment: '测评',
    activity: '活动',
    report: '报告',
    appointment: '预约',
    other: '其他',
  }
  return map[type] || '其他'
}

const getActivityColor = (type) => {
  const map = {
    crisis: '#ef4444',
    assessment: '#10b981',
    activity: '#3b82f6',
    report: '#8b5cf6',
    appointment: '#f59e0b',
  }
  return map[type] || '#64748b'
}

const getRiskLevelText = (level) => {
  const map = {
    red: '极高危',
    orange: '高危',
    yellow: '中危',
    green: '低危',
  }
  return map[level] || '未知'
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const now = new Date()
  const time = new Date(timeStr)
  const diff = now - time

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`

  return time.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>.tutor-workbench {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border-radius: 16px;
  border: 1px solid #e0f2fe;
  box-shadow: 0 2px 8px rgba(30, 79, 156, 0.06);
}

.head-main h2 {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 20px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(30, 79, 156, 0.12);
  border-color: #bae6fd;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon .el-icon {
  font-size: 26px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.section-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.section-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.section-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 2px solid #f1f5f9;
}

.section-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.badge-wrapper {
  margin-left: auto;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 180px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.todo-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(6px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.todo-type {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.todo-type.crisis {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.todo-type.assessment {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.todo-type.activity {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.todo-type.report {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.todo-type.appointment {
  background: #ede9fe;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
}

.todo-type.other {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.todo-content {
  flex: 1;
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
}

.todo-time {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
  font-weight: 500;
}

.todo-arrow {
  font-size: 16px;
  color: #cbd5e1;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.todo-item:hover .todo-arrow {
  color: #1e4f9c;
  transform: translateX(2px);
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 180px;
}

.risk-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 10px;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.risk-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.risk-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.risk-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.risk-class {
  font-size: 12px;
  color: #64748b;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 180px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  transition: all 0.2s ease;
}

.activity-item:hover {
  padding-left: 4px;
}

.activity-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
}

.activity-time {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  background: #f8fafc;
}

.action-item:hover {
  background: #ffffff;
  border-color: #e2e8f0;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.25s ease;
}

.action-item:hover .action-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.action-icon .el-icon {
  font-size: 24px;
}

.action-label {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  text-align: center;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .section-row {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .tutor-workbench {
    padding: 0 12px;
  }

  .page-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 20px;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 18px 16px;
  }

  .stat-value {
    font-size: 26px;
  }

  .section-row {
    gap: 16px;
  }

  .section-card {
    padding: 20px;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .action-item {
    padding: 16px 12px;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>