<template>
  <div class="page-wrap">
    <div class="page-head">
      <div class="head-main">
        <h2>个案列表</h2>
        <p class="page-desc">管理心理咨询个案，查看个案详情与跟进进度。</p>
      </div>
      <div class="head-actions">
        <el-button type="primary" @click="openCreateDialog">新增个案</el-button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-value">{{ cases.length }}</span>
        <span class="stat-label">全部个案</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ openCount }}</span>
        <span class="stat-label">进行中</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ closedCount }}</span>
        <span class="stat-label">已结案</span>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="cases" stripe v-loading="loading" style="width: 100%">
        <template #empty>
          <el-empty v-if="!loading" description="暂无个案" />
        </template>
        <el-table-column prop="id" label="个案编号" width="120" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="caseTitle" label="个案标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="problemType" label="问题类型" width="130" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
            <el-button type="primary" link size="small" @click="openEditDialog(row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="createDialogVisible" title="新增个案" width="560px" destroy-on-close>
      <el-form label-width="92px" :model="createForm">
        <el-form-item label="学生ID" required>
          <el-input v-model="createForm.studentId" placeholder="请输入学生ID" />
        </el-form-item>
        <el-form-item label="咨询师ID" required>
          <el-input v-model="createForm.counselorId" placeholder="请输入咨询师ID" />
        </el-form-item>
        <el-form-item label="个案标题">
          <el-input v-model="createForm.caseTitle" placeholder="请输入个案标题" />
        </el-form-item>
        <el-form-item label="问题类型">
          <el-input v-model="createForm.problemType" placeholder="如：情绪困扰/学业压力" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="createForm.startDate"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="个案描述">
          <el-input v-model="createForm.caseDescription" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="修改个案" width="560px" destroy-on-close>
      <el-form label-width="92px" :model="editForm">
        <el-form-item label="个案ID">
          <el-input v-model="editForm.caseId" disabled />
        </el-form-item>
        <el-form-item label="个案标题">
          <el-input v-model="editForm.caseTitle" placeholder="请输入个案标题" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.caseStatus" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="ONGOING" />
            <el-option label="已结案" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题类型">
          <el-input v-model="editForm.problemType" placeholder="如：情绪困扰/学业压力" />
        </el-form-item>
        <el-form-item label="结案日期">
          <el-date-picker
            v-model="editForm.closeDate"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="状态为已结案时建议填写"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="个案描述">
          <el-input v-model="editForm.caseDescription" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="updating" @click="submitUpdate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createCase, getCounselorCases, updateCase } from '../../api/case'
import { useRouter } from 'vue-router'

const cases = ref<any[]>([])
const loading = ref(false)
const router = useRouter()
const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const creating = ref(false)
const updating = ref(false)

const createForm = ref({
  studentId: '',
  counselorId: '',
  caseTitle: '',
  problemType: '',
  caseDescription: '',
  startDate: '',
})

const editForm = ref({
  caseId: '',
  caseTitle: '',
  caseStatus: 'ONGOING',
  problemType: '',
  caseDescription: '',
  closeDate: '',
})

function normalizeCaseRow(raw: any) {
  if (!raw || typeof raw !== 'object') return {}
  return {
    ...raw,
    id: raw.id ?? raw.caseId ?? raw.case_id ?? '',
    studentId: raw.studentId ?? raw.student_id ?? '',
    studentName: raw.studentName ?? raw.student_name ?? '',
    counselorId: raw.counselorId ?? raw.counselor_id ?? '',
    counselorName: raw.counselorName ?? raw.counselor_name ?? '',
    caseTitle: raw.caseTitle ?? raw.case_title ?? '',
    status: raw.status ?? raw.caseStatus ?? raw.case_status ?? '',
    problemType: raw.problemType ?? raw.problem_type ?? '',
    description: raw.description ?? raw.caseDescription ?? raw.case_description ?? '',
    startDate: raw.startDate ?? raw.start_date ?? '',
    closeDate: raw.closeDate ?? raw.close_date ?? '',
    totalSessions: raw.totalSessions ?? raw.total_sessions ?? 0,
    createTime: raw.createTime ?? raw.created_at ?? '',
    updateTime: raw.updateTime ?? raw.updated_at ?? '',
  }
}

function resolveCurrentCounselorId() {
  return (
    localStorage.getItem('user_id') ||
    localStorage.getItem('userId') ||
    localStorage.getItem('counselor_id') ||
    localStorage.getItem('counselorId') ||
    ''
  )
}

const openCount = computed(() =>
  cases.value.filter((c) => c.status !== 'CLOSED' && c.status !== '已结案' && c.status !== 'closed').length
)
const closedCount = computed(() =>
  cases.value.filter((c) => c.status === 'CLOSED' || c.status === '已结案' || c.status === 'closed').length
)

function getStatusText(status: string) {
  if (!status) return '-'
  if (status === 'ONGOING') return '进行中'
  if (status === 'CLOSED') return '已结案'
  return status
}

function getStatusType(status: string) {
  if (!status) return 'info'
  if (status === 'CLOSED' || status === '已结案' || status === 'closed') return 'info'
  return 'primary'
}

function viewDetail(row: any) {
  router.push(`/case/${row.id}`)
}

function openCreateDialog() {
  createForm.value = {
    studentId: '',
    counselorId: resolveCurrentCounselorId(),
    caseTitle: '',
    problemType: '',
    caseDescription: '',
    startDate: '',
  }
  createDialogVisible.value = true
}

function openEditDialog(row: any) {
  editForm.value = {
    caseId: row.id,
    caseTitle: row.caseTitle || '',
    caseStatus: row.status || 'ONGOING',
    problemType: row.problemType || '',
    caseDescription: row.description || '',
    closeDate: row.closeDate || '',
  }
  editDialogVisible.value = true
}

async function loadCases() {
  loading.value = true
  try {
    const res = await getCounselorCases()
    const data = res?.data
    const list = Array.isArray(data) ? data : (data?.records || data?.list || [])
    cases.value = list.map((item: any) => normalizeCaseRow(item))
  } catch {
    cases.value = []
    ElMessage.error('加载个案列表失败')
  } finally {
    loading.value = false
  }
}

async function submitCreate() {
  if (!createForm.value.studentId.trim()) {
    ElMessage.warning('请填写学生ID')
    return
  }
  if (!createForm.value.counselorId.trim()) {
    ElMessage.warning('请填写咨询师ID')
    return
  }
  creating.value = true
  try {
    await createCase({
      studentId: createForm.value.studentId.trim(),
      counselorId: createForm.value.counselorId.trim(),
      caseTitle: createForm.value.caseTitle.trim(),
      problemType: createForm.value.problemType.trim(),
      caseDescription: createForm.value.caseDescription.trim(),
      startDate: createForm.value.startDate || undefined,
    })
    ElMessage.success('新增个案成功')
    createDialogVisible.value = false
    await loadCases()
  } catch (e) {
    ElMessage.error('新增个案失败')
  } finally {
    creating.value = false
  }
}

async function submitUpdate() {
  if (!editForm.value.caseId) {
    ElMessage.warning('缺少个案ID')
    return
  }
  updating.value = true
  try {
    await updateCase({
      caseId: editForm.value.caseId,
      caseTitle: editForm.value.caseTitle.trim() || null,
      caseStatus: editForm.value.caseStatus || null,
      problemType: editForm.value.problemType.trim() || null,
      caseDescription: editForm.value.caseDescription.trim() || null,
      closeDate: editForm.value.closeDate || null,
    })
    ElMessage.success('修改个案成功')
    editDialogVisible.value = false
    await loadCases()
  } catch (e) {
    ElMessage.error('修改个案失败')
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  loadCases()
})
</script>

<style scoped>
.page-wrap {
  max-width: 1000px;
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

.head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e4f9c;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.table-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}
</style>
