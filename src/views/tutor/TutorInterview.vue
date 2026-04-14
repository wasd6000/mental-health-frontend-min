<template>
  <div class="tutor-page">
    <div class="page-head">
      <h2>访谈管理</h2>
      <p class="page-desc">访谈任务与记录（可与心理中心「访谈管理」流程对齐；接口就绪后替换下方请求）。</p>
      <el-button type="primary" :icon="Plus" @click="openCreate">新建访谈</el-button>
      <el-button :icon="Refresh" @click="loadAll">刷新</el-button>
    </div>

    <el-tabs v-model="tab">
      <el-tab-pane label="访谈任务" name="task">
        <el-table :data="tasks" stripe border empty-text="暂无任务">
          <el-table-column prop="title" label="主题" min-width="160" />
          <el-table-column prop="studentName" label="学生" width="100" />
          <el-table-column prop="planTime" label="计划时间" width="170" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'done' ? 'success' : 'warning'" size="small">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default>
              <el-button type="primary" link size="small" @click="onTaskDetail">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="访谈记录" name="record">
        <el-table :data="records" stripe border empty-text="暂无记录">
          <el-table-column prop="studentName" label="学生" width="100" />
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="summary" label="摘要" min-width="200" show-overflow-tooltip />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dlg" title="新建访谈任务" width="480px" @close="resetForm">
      <el-form :model="form" label-width="96px">
        <el-form-item label="主题" required>
          <el-input v-model="form.title" placeholder="如：学业压力随访" />
        </el-form-item>
        <el-form-item label="学生学号" required>
          <el-input v-model="form.studentNo" />
        </el-form-item>
        <el-form-item label="计划时间">
          <el-date-picker v-model="form.planTime" type="datetime" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存到本地列表</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const tab = ref('task')
const tasks = ref([])
const records = ref([])
const dlg = ref(false)
const form = ref({ title: '', studentNo: '', planTime: '' })

function loadAll() {
  if (!tasks.value.length) {
    tasks.value = [
      {
        title: '新生适应访谈',
        studentName: '（示例）',
        planTime: '—',
        status: 'pending',
        statusText: '待执行',
      },
    ]
  }
  if (!records.value.length) {
    records.value = [
      { studentName: '（示例）', date: '—', summary: '接口对接后展示真实记录' },
    ]
  }
  ElMessage.success('已刷新')
}

function openCreate() {
  dlg.value = true
}

function resetForm() {
  form.value = { title: '', studentNo: '', planTime: '' }
}

function onTaskDetail() {
  ElMessage.info('详情接口对接后展示')
}

function saveTask() {
  if (!form.value.title || !form.value.studentNo) {
    ElMessage.warning('请填写主题与学号')
    return
  }
  tasks.value.unshift({
    title: form.value.title,
    studentName: form.value.studentNo,
    planTime: form.value.planTime || '待定',
    status: 'pending',
    statusText: '待执行',
  })
  dlg.value = false
  resetForm()
  ElMessage.success('已添加（本地示例，待接 GET/POST /api/tutor/interview/*）')
}

onMounted(() => {
  loadAll()
})
</script>

<style scoped>
.tutor-page {
  padding: 0 4px 24px;
}
.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.page-head h2 {
  margin: 0;
  font-size: 20px;
}
.page-desc {
  margin: 0;
  flex: 1;
  min-width: 220px;
  color: #64748b;
  font-size: 14px;
}
</style>
