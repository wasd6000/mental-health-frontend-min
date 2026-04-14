<template>
  <div class="page-wrap">
    <div class="page-head">
      <div class="head-main">
        <h2>咨询记录</h2>
        <p class="page-desc">与 OpenAPI「咨询记录控制器」/api/record/* 对齐，支持按学生、日期筛选。</p>
      </div>
      <div class="head-actions">
        <el-button type="primary" @click="createNew">新建记录</el-button>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <div class="card-header">
        <el-form :inline="true" class="filter-form">
          <el-form-item>
            <el-input
              v-model="searchStudentId"
              placeholder="按学生ID筛选"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item>
            <el-date-picker
              v-model="searchDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 260px"
            />
          </el-form-item>
        </el-form>
      </div>
      <el-table v-loading="loading" :data="filteredList" stripe style="width: 100%">
        <el-table-column prop="appointment_date" label="记录日期" width="120" />
        <el-table-column prop="studentId" label="学生ID" width="200" />
        <el-table-column prop="student_name" label="学生姓名" width="120" />
        <el-table-column prop="appointmentId" label="预约ID" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.record_status || '')" size="small">
              {{ getStatusText(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="view(row.id)">查看</el-button>
            <el-button
              type="default"
              link
              size="small"
              :disabled="
                row.record_status === 'submitted' ||
                String(row.status || '').toUpperCase() === 'SUBMITTED'
              "
              @click="edit(row.id)"
            >
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && !filteredList.length" description="暂无咨询记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getRecordsByConsultantAsync } from '../../api/record'
import { getCounselorUserId } from '../../utils/counselorSession.js'

const list = ref([])
const loading = ref(false)
const searchStudentId = ref('')
const searchDateRange = ref(null)
const router = useRouter()
const counselorId = getCounselorUserId()

const filteredList = computed(() => {
  return list.value.filter((r) => {
    const matchStudent =
      !searchStudentId.value ||
      String(r.studentId).toLowerCase().includes(searchStudentId.value.toLowerCase())
    let matchDate = true
    const date = r.appointment_date || ''
    if (searchDateRange.value && searchDateRange.value.length === 2) {
      const [start, end] = searchDateRange.value
      matchDate = date >= start && date <= end
    }
    return matchStudent && matchDate
  })
})

function getStatusType(status) {
  const u = String(status || '').toUpperCase()
  if (status === 'submitted' || status === '已审核' || u === 'SUBMITTED') return 'success'
  if (status === 'pending' || status === 'filled' || status === '未审核' || u === 'DRAFT')
    return 'warning'
  return 'info'
}

function getStatusText(r) {
  const s = r.record_status || ''
  const u = String(s).toUpperCase()
  if (s === 'submitted' || u === 'SUBMITTED') return '已提交'
  if (s === 'pending' || u === 'DRAFT') return '草稿'
  if (s === 'filled') return '已填写'
  return s || '-'
}

function createNew() {
  router.push('/record/new')
}

function view(id) {
  router.push(`/record/${id}`)
}

function edit(id) {
  router.push(`/record/${id}/edit`)
}

onMounted(async () => {
  if (!counselorId) {
    ElMessage.warning('未获取到咨询师账号 ID，请重新登录')
    return
  }
  loading.value = true
  try {
    const res = await getRecordsByConsultantAsync(counselorId)
    list.value = res?.data || []
  } catch (e) {
    console.error(e)
    ElMessage.error('加载咨询记录失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-wrap {
  max-width: 1100px;
  padding: 0;
}
.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
  border-radius: 14px;
  border: 1px solid #bae6fd;
}
.head-main h2 {
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
.table-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}
.card-header {
  margin-bottom: 16px;
}
</style>
