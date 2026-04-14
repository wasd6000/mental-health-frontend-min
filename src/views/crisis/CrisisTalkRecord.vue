<template>
  <div class="crisis-talk-record-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">谈话记录管理</span>
    </div>

    <div class="page-header">
      <div class="header-content">
        <h2>谈话记录管理</h2>
        <p class="page-desc">记录辅导员与危机学生的谈话内容，跟踪学生心理状态变化</p>
      </div>
      <el-button type="primary" @click="showAddTalkDialog" :icon="Plus">
        添加谈话记录
      </el-button>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="查询方式">
          <el-radio-group v-model="queryType" @change="handleQueryTypeChange">
            <el-radio label="report">按危机报告</el-radio>
            <el-radio label="student">按学生</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="queryType === 'report'" label="危机报告ID">
          <el-input
            v-model="filters.reportId"
            placeholder="请输入危机报告ID"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item v-else label="学生ID">
          <el-input
            v-model="filters.studentId"
            placeholder="请输入学生ID"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadTalkRecords" :icon="Search">
            查询
          </el-button>
          <el-button @click="resetFilters" :icon="Refresh">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 谈话记录列表 -->
    <el-card class="talk-card">
      <template #header>
        <div class="card-header">
          <span>谈话记录 ({{ talkList.length }})</span>
        </div>
      </template>

      <el-table :data="talkList" v-loading="loading" stripe>
        <el-table-column label="学生信息" width="180">
          <template #default="{ row }">
            <div class="student-cell">
              <el-avatar :size="36">{{ row.studentName?.charAt(0) }}</el-avatar>
              <div class="student-info">
                <span class="student-name">{{ row.studentName }}</span>
                <span class="student-id">{{ row.studentId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="谈话人" width="150">
          <template #default="{ row }">
            <div class="talker-cell">
              <el-avatar :size="32">{{ row.talkerName?.charAt(0) }}</el-avatar>
              <span>{{ row.talkerName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="谈话类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :style="{
                backgroundColor: getTalkTypeConfig(row.talkType)?.color + '20',
                color: getTalkTypeConfig(row.talkType)?.color
              }"
              effect="plain"
            >
              {{ getTalkTypeConfig(row.talkType)?.label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="谈话时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.talkTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="talkLocation" label="谈话地点" width="140" show-overflow-tooltip />

        <el-table-column prop="contentSummary" label="内容摘要" min-width="250" show-overflow-tooltip />

        <el-table-column label="学生情绪" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" v-if="row.studentEmotion">
              {{ row.studentEmotion }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="风险评估" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getRiskLevelType(row.riskAssessment)"
              size="small"
              v-if="row.riskAssessment"
            >
              {{ row.riskAssessment }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editTalkRecord(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="deleteTalkRecord(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!talkList.length && !loading" description="暂无谈话记录" />
    </el-card>

    <!-- 添加/编辑谈话记录对话框 -->
    <el-dialog
      v-model="talkDialogVisible"
      :title="isEdit ? '编辑谈话记录' : '添加谈话记录'"
      width="800px"
    >
      <el-form
        :model="talkForm"
        :rules="talkRules"
        ref="talkFormRef"
        label-width="120px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="危机报告ID" prop="reportId">
              <el-input
                v-model="talkForm.reportId"
                placeholder="请输入危机报告ID"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学生ID" prop="studentId">
              <el-input
                v-model="talkForm.studentId"
                placeholder="请输入学生ID"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="谈话人ID" prop="talkerId">
              <el-input
                v-model="talkForm.talkerId"
                placeholder="请输入谈话人ID"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="谈话类型" prop="talkType">
              <el-select
                v-model="talkForm.talkType"
                placeholder="请选择谈话类型"
                style="width: 100%"
              >
                <el-option
                  v-for="(config, key) in TALK_TYPE_MAP"
                  :key="key"
                  :label="config.label"
                  :value="key"
                >
                  <span :style="{ color: config.color }">{{ config.label }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="谈话时间" prop="talkTime">
              <el-date-picker
                v-model="talkForm.talkTime"
                type="datetime"
                placeholder="选择谈话时间"
                style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="谈话地点" prop="talkLocation">
              <el-input
                v-model="talkForm.talkLocation"
                placeholder="请输入谈话地点"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="内容摘要" prop="contentSummary">
          <el-input
            v-model="talkForm.contentSummary"
            type="textarea"
            :rows="4"
            placeholder="请详细描述谈话内容"
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学生情绪" prop="studentEmotion">
              <el-input
                v-model="talkForm.studentEmotion"
                placeholder="如：焦虑、平静、激动等"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="风险评估" prop="riskAssessment">
              <el-input
                v-model="talkForm.riskAssessment"
                placeholder="如：低风险、中等风险、高风险"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="后续跟进计划" prop="followUpPlan">
          <el-input
            v-model="talkForm.followUpPlan"
            type="textarea"
            :rows="3"
            placeholder="请输入后续跟进计划"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="talkDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitTalk" :loading="submitting">
          {{ isEdit ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft, Search, Refresh } from '@element-plus/icons-vue'
import {
  getTalkRecordsByReport,
  getTalkRecordsByStudent,
  createTalkRecord,
  updateTalkRecord,
  deleteTalkRecord,
  TALK_TYPE_MAP
} from '../../api/crisisInterventionApi'

const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const talkList = ref([])
const queryType = ref('report')
const talkDialogVisible = ref(false)
const isEdit = ref(false)

const filters = ref({
  reportId: '',
  studentId: ''
})

const talkFormRef = ref(null)
const talkForm = ref({
  talkRecordId: '',
  reportId: '',
  studentId: '',
  talkerId: '',
  talkType: '',
  talkTime: '',
  talkLocation: '',
  contentSummary: '',
  studentEmotion: '',
  riskAssessment: '',
  followUpPlan: ''
})

const talkRules = {
  reportId: [{ required: true, message: '请输入危机报告ID', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学生ID', trigger: 'blur' }],
  talkerId: [{ required: true, message: '请输入谈话人ID', trigger: 'blur' }],
  talkType: [{ required: true, message: '请选择谈话类型', trigger: 'change' }],
  talkTime: [{ required: true, message: '请选择谈话时间', trigger: 'change' }],
  contentSummary: [{ required: true, message: '请输入内容摘要', trigger: 'blur' }]
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const getTalkTypeConfig = (type) => {
  return TALK_TYPE_MAP[type] || { label: type, color: '#6b7280' }
}

const getRiskLevelType = (level) => {
  if (!level) return 'info'
  const lower = level.toLowerCase()
  if (lower.includes('低') || lower.includes('low')) return 'success'
  if (lower.includes('中') || lower.includes('moderate')) return 'warning'
  if (lower.includes('高') || lower.includes('high')) return 'danger'
  return 'info'
}

const handleQueryTypeChange = () => {
  filters.value = { reportId: '', studentId: '' }
  talkList.value = []
}

const loadTalkRecords = async () => {
  if (queryType.value === 'report') {
    if (!filters.value.reportId) {
      ElMessage.warning('请输入危机报告ID')
      return
    }
    await loadByReport(filters.value.reportId)
  } else {
    if (!filters.value.studentId) {
      ElMessage.warning('请输入学生ID')
      return
    }
    await loadByStudent(filters.value.studentId)
  }
}

const loadByReport = async (reportId) => {
  loading.value = true
  try {
    const res = await getTalkRecordsByReport(reportId)
    if (res.code === 200) {
      talkList.value = res.data || []
    } else {
      ElMessage.error(res.message || '加载谈话记录失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('加载谈话记录失败')
  } finally {
    loading.value = false
  }
}

const loadByStudent = async (studentId) => {
  loading.value = true
  try {
    const res = await getTalkRecordsByStudent(studentId)
    if (res.code === 200) {
      talkList.value = res.data || []
    } else {
      ElMessage.error(res.message || '加载谈话记录失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('加载谈话记录失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.value = { reportId: '', studentId: '' }
  talkList.value = []
}

const showAddTalkDialog = () => {
  isEdit.value = false
  talkForm.value = {
    reportId: filters.value.reportId || route.query.reportId || '',
    studentId: '',
    talkerId: localStorage.getItem('userId') || '',
    talkType: '',
    talkTime: new Date().toISOString().slice(0, 19),
    talkLocation: '',
    contentSummary: '',
    studentEmotion: '',
    riskAssessment: '',
    followUpPlan: ''
  }
  talkDialogVisible.value = true
}

const editTalkRecord = (row) => {
  isEdit.value = true
  talkForm.value = {
    talkRecordId: row.talkRecordId,
    reportId: row.reportId,
    studentId: row.studentId,
    talkerId: row.talkerId,
    talkType: row.talkType,
    talkTime: row.talkTime,
    talkLocation: row.talkLocation,
    contentSummary: row.contentSummary,
    studentEmotion: row.studentEmotion,
    riskAssessment: row.riskAssessment,
    followUpPlan: row.followUpPlan
  }
  talkDialogVisible.value = true
}

const handleSubmitTalk = async () => {
  try {
    await talkFormRef.value.validate()
    submitting.value = true

    let res
    if (isEdit.value) {
      res = await updateTalkRecord(talkForm.value.talkRecordId, talkForm.value)
    } else {
      res = await createTalkRecord(talkForm.value)
    }

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      talkDialogVisible.value = false
      loadTalkRecords()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const deleteTalkRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该谈话记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    submitting.value = true
    const res = await deleteTalkRecord(row.talkRecordId)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadTalkRecords()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 如果有reportId参数，自动加载
  if (route.query.reportId) {
    filters.value.reportId = route.query.reportId
    queryType.value = 'report'
    loadTalkRecords()
  }
})
</script>

<style scoped>
.crisis-talk-record-page {
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
  background: linear-gradient(135deg, #fff 0%, #fef3c7 100%);
  border-radius: 12px;
  border: 1px solid #fde68a;
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

.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.talk-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.talker-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>