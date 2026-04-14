<template>
  <div class="tutor-page">
    <div class="page-head">
      <h2>谈心谈话管理</h2>
      <p class="page-desc">记录辅导员与学生谈心谈话（待对接 <code>/api/tutor/conversation/*</code> 或学工系统接口）。</p>
      <el-button type="primary" :icon="Plus" @click="openAdd">新增记录</el-button>
    </div>

    <el-form :inline="true" class="filter-form">
      <el-form-item label="关键词">
        <el-input v-model="keyword" placeholder="学号/姓名" clearable style="width: 160px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="filterLocal">筛选</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="filteredRows" stripe border empty-text="暂无谈心谈话记录">
      <el-table-column prop="studentName" label="学生" width="100" />
      <el-table-column prop="studentNo" label="学号" width="130" />
      <el-table-column prop="talkTime" label="谈话时间" width="170" />
      <el-table-column prop="topic" label="主题" min-width="140" show-overflow-tooltip />
      <el-table-column prop="summary" label="要点" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="90" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="onView(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="visible" title="新增谈心谈话" width="520px" destroy-on-close @close="reset">
      <el-form :model="form" label-width="100px">
        <el-form-item label="学生学号" required>
          <el-input v-model="form.studentNo" />
        </el-form-item>
        <el-form-item label="学生姓名">
          <el-input v-model="form.studentName" />
        </el-form-item>
        <el-form-item label="谈话时间" required>
          <el-date-picker v-model="form.talkTime" type="datetime" value-format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="主题" required>
          <el-input v-model="form.topic" />
        </el-form-item>
        <el-form-item label="谈话要点">
          <el-input v-model="form.summary" type="textarea" rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const rows = ref([])
const keyword = ref('')
const visible = ref(false)
const form = ref({
  studentNo: '',
  studentName: '',
  talkTime: '',
  topic: '',
  summary: '',
})

const filteredRows = computed(() => {
  const k = keyword.value.trim()
  if (!k) return rows.value
  return rows.value.filter(
    (r) =>
      (r.studentName && r.studentName.includes(k)) ||
      (r.studentNo && r.studentNo.includes(k)) ||
      (r.topic && r.topic.includes(k))
  )
})

function loadLocal() {
  if (!rows.value.length) {
    rows.value = [
      {
        studentName: '示例',
        studentNo: '20260000',
        talkTime: '—',
        topic: '学业预警随访',
        summary: '接口就绪后从服务端加载',
      },
    ]
  }
}

function filterLocal() {
  /* computed 已处理 */
}

function onView(row) {
  ElMessage.info(row.summary || '无摘要')
}

function openAdd() {
  visible.value = true
}

function reset() {
  form.value = { studentNo: '', studentName: '', talkTime: '', topic: '', summary: '' }
}

function save() {
  if (!form.value.studentNo || !form.value.topic || !form.value.talkTime) {
    ElMessage.warning('请填写学号、主题与时间')
    return
  }
  rows.value.unshift({
    studentName: form.value.studentName || '—',
    studentNo: form.value.studentNo,
    talkTime: form.value.talkTime,
    topic: form.value.topic,
    summary: form.value.summary || '—',
  })
  visible.value = false
  reset()
  ElMessage.success('已保存到本地列表（待对接后端）')
}

onMounted(() => {
  loadLocal()
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
  gap: 12px;
  margin-bottom: 16px;
}
.page-head h2 {
  margin: 0;
  font-size: 20px;
}
.page-desc {
  margin: 0;
  flex: 1;
  color: #64748b;
  font-size: 14px;
}
.filter-form {
  margin-bottom: 12px;
}
</style>
