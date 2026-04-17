<template>
  <div class="todo-list-page">
    <div class="page-header">
      <h2>待办事项</h2>
      <p class="page-desc">管理和处理所有待办事项</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card" v-for="stat in statsData" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.color }">
          <el-icon><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="待处理" value="PENDING" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="全部" value="ALL" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="全部类型" clearable style="width: 120px">
            <el-option label="危机" value="crisis" />
            <el-option label="测评" value="assessment" />
            <el-option label="活动" value="activity" />
            <el-option label="报表" value="report" />
            <el-option label="预约" value="appointment" />
            <el-option label="请假" value="leave" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="queryParams.priority" placeholder="全部优先级" clearable style="width: 120px">
            <el-option label="紧急" value="high" />
            <el-option label="重要" value="medium" />
            <el-option label="一般" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 批量操作 -->
    <div class="batch-actions" v-if="selectedIds.length > 0">
      <el-alert
        :title="`已选择 ${selectedIds.length} 项`"
        type="info"
        show-icon
        :closable="false"
      />
      <el-button type="success" size="small" @click="handleBatchComplete">批量完成</el-button>
      <el-button size="small" @click="handleClearSelection">取消选择</el-button>
    </div>

    <!-- 待办列表 -->
    <div class="todo-container" v-loading="loading">
      <div class="todo-item" v-for="todo in todoList" :key="todo.id">
        <el-checkbox
          v-model="todo.checked"
          @change="handleCheckChange(todo)"
          class="todo-checkbox"
        />
        <div class="todo-main" @click="handleTodoClick(todo)">
          <div class="todo-header">
            <span class="todo-type" :class="todo.type">{{ todo.typeText }}</span>
            <el-tag
              :type="getPriorityTagType(todo.priority)"
              size="small"
              class="priority-tag"
            >
              {{ todo.priorityText }}
            </el-tag>
            <span class="todo-time">{{ formatTime(todo.createTime) }}</span>
          </div>
          <div class="todo-content">
            <h4 class="todo-title">{{ todo.title }}</h4>
            <p class="todo-desc">{{ todo.content }}</p>
            <div class="todo-meta" v-if="todo.studentName || todo.collegeName">
              <span v-if="todo.studentName">
                <el-icon><User /></el-icon>
                {{ todo.studentName }}
              </span>
              <span v-if="todo.collegeName">
                <el-icon><School /></el-icon>
                {{ todo.collegeName }}
              </span>
            </div>
          </div>
          <div class="todo-footer" v-if="todo.deadline">
            <span class="deadline-label">截止时间:</span>
            <span class="deadline-value" :class="{ overdue: isOverdue(todo.deadline) }">
              {{ formatDeadline(todo.deadline) }}
            </span>
          </div>
        </div>
        <div class="todo-actions">
          <el-button
            v-if="todo.status === 'PENDING'"
            type="success"
            size="small"
            :icon="CircleCheck"
            @click.stop="handleComplete(todo)"
          >
            完成
          </el-button>
          <el-button
            type="primary"
            size="small"
            link
            @click.stop="handleViewDetail(todo)"
          >
            查看详情
          </el-button>
        </div>
      </div>

      <el-empty v-if="!loading && todoList.length === 0" description="暂无待办事项" />
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="total > 0">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="待办详情"
      width="600px"
    >
      <div v-if="currentTodo" class="todo-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="标题">{{ currentTodo.title }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <span class="todo-type" :class="currentTodo.type">{{ currentTodo.typeText }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTagType(currentTodo.priority)">
              {{ currentTodo.priorityText }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentTodo.status === 'PENDING' ? 'warning' : 'success'">
              {{ currentTodo.status === 'PENDING' ? '待处理' : '已完成' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="内容">{{ currentTodo.content }}</el-descriptions-item>
          <el-descriptions-item label="学生" v-if="currentTodo.studentName">
            {{ currentTodo.studentName }} ({{ currentTodo.studentId }})
          </el-descriptions-item>
          <el-descriptions-item label="院系" v-if="currentTodo.collegeName">
            {{ currentTodo.collegeName }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatFullTime(currentTodo.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="截止时间" v-if="currentTodo.deadline">
            <span :class="{ 'text-danger': isOverdue(currentTodo.deadline) }">
              {{ formatFullTime(currentTodo.deadline) }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentTodo?.status === 'PENDING'"
          type="success"
          @click="handleCompleteFromDialog"
        >
          标记为完成
        </el-button>
        <el-button
          v-if="currentTodo?.route"
          type="primary"
          @click="handleGoToDetail"
        >
          前往处理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  User,
  School,
  CircleCheck,
  Bell,
  Warning,
  Document,
  DataAnalysis,
} from '@element-plus/icons-vue'
import {
  getTodoList,
  updateTodoStatus,
  batchUpdateTodoStatus,
  getTodoStatistics,
} from '../../api/todoApi'

const router = useRouter()
const loading = ref(false)
const todoList = ref([])
const total = ref(0)
const selectedIds = ref([])
const detailDialogVisible = ref(false)
const currentTodo = ref(null)

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  status: 'PENDING',
  type: '',
  priority: '',
})

const statsData = ref([
  { label: '待处理总数', value: 0, color: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: markRaw(Bell) },
  { label: '紧急事项', value: 0, color: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: markRaw(Warning) },
  { label: '今日到期', value: 0, color: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: markRaw(Document) },
  { label: '已逾期', value: 0, color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', icon: markRaw(DataAnalysis) },
])

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTodoList(queryParams)
    if (res.code === 200 && res.data) {
      todoList.value = (res.data.list || []).map(item => ({
        ...item,
        checked: false,
      }))
      total.value = res.data.total || 0
    }
  } catch (e) {
    console.error('加载待办列表失败:', e)
    ElMessage.error('加载待办列表失败')
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const res = await getTodoStatistics()
    if (res.code === 200 && res.data) {
      statsData.value[0].value = res.data.pendingCount || 0
      statsData.value[1].value = res.data.byPriority?.high || 0
      statsData.value[2].value = res.data.todayDueCount || 0
      statsData.value[3].value = res.data.overdueCount || 0
    }
  } catch (e) {
    console.error('加载统计数据失败:', e)
  }
}

const handleSearch = () => {
  queryParams.page = 1
  loadData()
}

const handleReset = () => {
  queryParams.status = 'PENDING'
  queryParams.type = ''
  queryParams.priority = ''
  queryParams.page = 1
  loadData()
}

const handleCheckChange = (todo) => {
  if (todo.checked) {
    selectedIds.value.push(todo.id)
  } else {
    const index = selectedIds.value.indexOf(todo.id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    }
  }
}

const handleClearSelection = () => {
  todoList.value.forEach(todo => {
    todo.checked = false
  })
  selectedIds.value = []
}

const handleComplete = async (todo) => {
  try {
    await ElMessageBox.confirm('确认标记为已完成？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await updateTodoStatus(todo.id, {
      status: 'COMPLETED',
      remark: '手动标记完成',
    })

    ElMessage.success('操作成功')
    loadData()
    loadStatistics()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('更新状态失败:', e)
      ElMessage.error('操作失败')
    }
  }
}

const handleBatchComplete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择待办事项')
    return
  }

  try {
    await ElMessageBox.confirm(`确认将选中的 ${selectedIds.value.length} 项标记为已完成？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const res = await batchUpdateTodoStatus({
      ids: selectedIds.value,
      status: 'COMPLETED',
      remark: '批量标记完成',
    })

    if (res.code === 200) {
      ElMessage.success(`成功完成 ${res.data?.successCount || 0} 项`)
      handleClearSelection()
      loadData()
      loadStatistics()
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('批量更新失败:', e)
      ElMessage.error('批量操作失败')
    }
  }
}

const handleTodoClick = (todo) => {
  if (todo.route) {
    router.push(todo.route)
  } else {
    handleViewDetail(todo)
  }
}

const handleViewDetail = (todo) => {
  currentTodo.value = todo
  detailDialogVisible.value = true
}

const handleCompleteFromDialog = async () => {
  if (!currentTodo.value) return

  try {
    await updateTodoStatus(currentTodo.value.id, {
      status: 'COMPLETED',
      remark: '从详情页标记完成',
    })

    ElMessage.success('操作成功')
    detailDialogVisible.value = false
    loadData()
    loadStatistics()
  } catch (e) {
    console.error('更新状态失败:', e)
    ElMessage.error('操作失败')
  }
}

const handleGoToDetail = () => {
  if (currentTodo.value?.route) {
    router.push(currentTodo.value.route)
    detailDialogVisible.value = false
  }
}

const getPriorityTagType = (priority) => {
  const map = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }
  return map[priority] || 'info'
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

const formatFullTime = (timeStr) => {
  if (!timeStr) return ''
  const time = new Date(timeStr)
  return time.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDeadline = (deadline) => {
  if (!deadline) return ''
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate - now

  if (diff < 0) {
    return `已逾期 ${Math.abs(Math.floor(diff / (24 * 60 * 60 * 1000)))} 天`
  }

  if (diff < 24 * 60 * 60 * 1000) {
    return `今天 ${deadlineDate.getHours()}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`
  }

  if (diff < 2 * 24 * 60 * 60 * 1000) {
    return '明天到期'
  }

  return deadlineDate.toLocaleDateString('zh-CN')
}

const isOverdue = (deadline) => {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}

onMounted(() => {
  loadData()
  loadStatistics()
})
</script>

<style scoped>
.todo-list-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border-radius: 16px;
  border: 1px solid #e0f2fe;
  box-shadow: 0 2px 8px rgba(30, 79, 156, 0.06);
}

.page-header h2 {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 700;
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

.filter-bar {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #eff6ff;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #bfdbfe;
}

.todo-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 400px;
}

.todo-item {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.todo-item:hover {
  border-color: #bae6fd;
  box-shadow: 0 4px 12px rgba(30, 79, 156, 0.1);
  transform: translateY(-2px);
}

.todo-checkbox {
  display: flex;
  align-items: center;
  padding-top: 20px;
}

.todo-main {
  flex: 1;
  cursor: pointer;
}

.todo-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.todo-type {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
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

.todo-type.leave {
  background: #fce7f3;
  color: #db2777;
  border: 1px solid #fbcfe8;
}

.todo-type.other {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.priority-tag {
  font-weight: 500;
}

.todo-time {
  font-size: 12px;
  color: #94a3b8;
  margin-left: auto;
  font-weight: 500;
}

.todo-content {
  margin-bottom: 12px;
}

.todo-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.todo-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.6;
}

.todo-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #475569;
}

.todo-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.todo-meta .el-icon {
  font-size: 14px;
}

.todo-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.deadline-label {
  color: #64748b;
}

.deadline-value {
  color: #475569;
  font-weight: 500;
}

.deadline-value.overdue {
  color: #dc2626;
  font-weight: 600;
}

.todo-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  padding-left: 16px;
  border-left: 1px solid #e2e8f0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 24px 0;
  margin-top: 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.todo-detail {
  padding: 10px 0;
}

.text-danger {
  color: #dc2626;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .todo-list-page {
    padding: 0 12px;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .todo-item {
    flex-direction: column;
    gap: 12px;
  }

  .todo-checkbox {
    padding-top: 0;
  }

  .todo-actions {
    flex-direction: row;
    padding-left: 0;
    padding-top: 12px;
    border-left: none;
    border-top: 1px solid #e2e8f0;
  }

  .batch-actions {
    flex-wrap: wrap;
  }
}
</style>
