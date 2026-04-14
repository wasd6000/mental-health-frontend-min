<template>
  <div class="interview-manage">
    <div class="page-head">
      <h2>访谈管理</h2>
      <p class="page-desc">管理访谈预约、记录与跟进，含访谈任务分配与进度跟踪。</p>
      <div class="head-actions">
        <el-button type="primary" @click="openTaskDialog">创建访谈任务</el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="访谈任务" name="task">
        <el-card class="section-card" shadow="never">
          <el-table :data="taskList" stripe>
            <el-table-column prop="title" label="任务名称" min-width="160" />
            <el-table-column prop="targetCount" label="计划人数" width="100" />
            <el-table-column prop="completedCount" label="已完成" width="100" />
            <el-table-column prop="deadline" label="截止日期" width="120" />
            <el-table-column prop="assignee" label="负责人" width="100" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === '进行中' ? 'warning' : 'success'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewTaskDetail(row)">详情</el-button>
                <el-button type="primary" link size="small" @click="assignTask(row)">分配</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="访谈记录" name="record">
        <el-card class="section-card" shadow="never">
          <el-form :inline="true" class="filter-form">
            <el-form-item label="学生">
              <el-input v-model="recordFilter.keyword" placeholder="学号/姓名" clearable style="width: 140px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="loadRecords">查询</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="recordList" stripe>
            <el-table-column prop="studentName" label="学生" width="100" />
            <el-table-column prop="studentId" label="学号" width="120" />
            <el-table-column prop="interviewDate" label="访谈日期" width="120" />
            <el-table-column prop="interviewer" label="访谈人" width="100" />
            <el-table-column prop="summary" label="访谈摘要" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="viewRecord(row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="taskDialogVisible" title="创建访谈任务" width="480px">
      <el-form :model="taskForm" label-width="90px">
        <el-form-item label="任务名称" required>
          <el-input v-model="taskForm.title" placeholder="如 新生心理普查访谈" />
        </el-form-item>
        <el-form-item label="计划人数" required>
          <el-input-number v-model="taskForm.targetCount" :min="1" :max="1000" style="width: 140px" />
        </el-form-item>
        <el-form-item label="截止日期" required>
          <el-date-picker v-model="taskForm.deadline" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="taskForm.assignee" placeholder="请选择" style="width: 100%">
            <el-option v-for="c in counselorList" :key="c.id" :label="c.name" :value="c.name" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('task')
const taskDialogVisible = ref(false)
const taskList = ref([])
const recordList = ref([])
const counselorList = ref([{ id: 'C1', name: '张老师' }, { id: 'C2', name: '李老师' }, { id: 'C3', name: '王老师' }])
const recordFilter = reactive({ keyword: '' })

const taskForm = reactive({
  title: '',
  targetCount: 50,
  deadline: '',
  assignee: '',
})

const MOCK_TASKS = [
  { id: 1, title: '2024级新生心理普查访谈', targetCount: 120, completedCount: 85, deadline: '2025-04-15', assignee: '张老师', status: '进行中' },
  { id: 2, title: '高关怀学生跟进访谈', targetCount: 30, completedCount: 30, deadline: '2025-03-20', assignee: '李老师', status: '已完成' },
]

const MOCK_RECORDS = [
  { id: 1, studentName: '张三', studentId: '2024001001', interviewDate: '2025-03-03', interviewer: '张老师', summary: '学生近期学业压力较大，情绪稳定，建议定期跟进' },
  { id: 2, studentName: '李四', studentId: '2024001002', interviewDate: '2025-03-02', interviewer: '李老师', summary: '人际关系良好，无异常' },
]

function loadData() {
  taskList.value = [...MOCK_TASKS]
}

function loadRecords() {
  recordList.value = [...MOCK_RECORDS]
}

watch(activeTab, (val) => {
  if (val === 'record') loadRecords()
})

function openTaskDialog() {
  taskForm.title = ''
  taskForm.targetCount = 50
  taskForm.deadline = ''
  taskForm.assignee = ''
  taskDialogVisible.value = true
}

function saveTask() {
  if (!taskForm.title) {
    ElMessage.warning('请输入任务名称')
    return
  }
  taskList.value.unshift({
    id: Date.now(),
    ...taskForm,
    completedCount: 0,
    status: '进行中',
  })
  taskDialogVisible.value = false
  ElMessage.success('任务已创建')
}

function viewTaskDetail(row) {
  ElMessage.info('任务详情：' + row.title)
}

function assignTask(row) {
  ElMessage.info('分配功能需后端支持')
}

function viewRecord(row) {
  ElMessage.info('访谈记录详情：' + row.studentName)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.interview-manage { max-width: 1000px; }

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

.main-tabs { background: #fff; padding: 16px 24px; border-radius: 14px; border: 1px solid #e2e8f0; }
.section-card { border: none; box-shadow: none; margin-top: 16px; }
.filter-form { margin-bottom: 16px; }
</style>
