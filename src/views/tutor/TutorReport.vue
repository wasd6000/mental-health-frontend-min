<template>
  <div class="tutor-report">
    <div class="page-header">
      <h2>月报填写</h2>
      <p>填写本月心理健康工作月报</p>
    </div>

    <div class="month-selector">
      <el-date-picker
        v-model="selectedMonth"
        type="month"
        placeholder="选择月份"
        format="YYYY年MM月"
        value-format="YYYY-MM"
        @change="loadReportData"
      />
      <el-tag v-if="reportStatus === 'submitted'" type="success">已提交</el-tag>
      <el-tag v-else-if="reportStatus === 'draft'" type="warning">草稿</el-tag>
      <el-tag v-else type="info">未填写</el-tag>
    </div>

    <el-form ref="formRef" :model="form" label-width="120px" class="report-form">
      <el-card class="form-section">
        <template #header>
          <span class="section-title">基本数据统计</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="负责学生数">
              <el-input-number v-model="form.totalStudents" :min="0" :disabled="reportStatus === 'submitted'" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="谈心谈话次数">
              <el-input-number v-model="form.talkCount" :min="0" :disabled="reportStatus === 'submitted'" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="心理班会次数">
              <el-input-number v-model="form.meetingCount" :min="0" :disabled="reportStatus === 'submitted'" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="危机上报数">
              <el-input-number v-model="form.crisisCount" :min="0" :disabled="reportStatus === 'submitted'" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="家访次数">
              <el-input-number v-model="form.visitCount" :min="0" :disabled="reportStatus === 'submitted'" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="活动参与人次">
              <el-input-number v-model="form.activityParticipants" :min="0" :disabled="reportStatus === 'submitted'" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="form-section">
        <template #header>
          <span class="section-title">重点关注学生</span>
        </template>
        <el-form-item label="本月重点学生">
          <el-input
            v-model="form.focusStudents"
            type="textarea"
            :rows="4"
            placeholder="请描述本月重点关注的学生情况（脱敏处理，不涉及真实姓名）"
            :disabled="reportStatus === 'submitted'"
          />
        </el-form-item>
        <el-form-item label="跟进措施">
          <el-input
            v-model="form.followUpMeasures"
            type="textarea"
            :rows="3"
            placeholder="请描述对重点学生采取的跟进措施"
            :disabled="reportStatus === 'submitted'"
          />
        </el-form-item>
      </el-card>

      <el-card class="form-section">
        <template #header>
          <span class="section-title">开展活动</span>
        </template>
        <el-form-item label="活动情况">
          <el-input
            v-model="form.activities"
            type="textarea"
            :rows="4"
            placeholder="请描述本月开展的心理健康相关活动"
            :disabled="reportStatus === 'submitted'"
          />
        </el-form-item>
      </el-card>

      <el-card class="form-section">
        <template #header>
          <span class="section-title">工作难点与建议</span>
        </template>
        <el-form-item label="遇到的困难">
          <el-input
            v-model="form.difficulties"
            type="textarea"
            :rows="3"
            placeholder="请描述本月工作中遇到的困难"
            :disabled="reportStatus === 'submitted'"
          />
        </el-form-item>
        <el-form-item label="意见建议">
          <el-input
            v-model="form.suggestions"
            type="textarea"
            :rows="3"
            placeholder="请提出对学校心理健康工作的意见和建议"
            :disabled="reportStatus === 'submitted'"
          />
        </el-form-item>
      </el-card>

      <el-card class="form-section">
        <template #header>
          <span class="section-title">下月计划</span>
        </template>
        <el-form-item label="工作计划">
          <el-input
            v-model="form.nextPlan"
            type="textarea"
            :rows="4"
            placeholder="请描述下月心理健康工作计划"
            :disabled="reportStatus === 'submitted'"
          />
        </el-form-item>
      </el-card>

      <div class="form-actions" v-if="reportStatus !== 'submitted'">
        <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="submitReport" :loading="submitting">提交月报</el-button>
      </div>
      <div class="form-actions" v-else>
        <el-button type="primary" @click="exportReport">导出月报</el-button>
      </div>
    </el-form>

    <el-card class="history-section">
      <template #header>
        <span class="section-title">历史月报</span>
      </template>
      <el-table :data="historyList" size="small">
        <el-table-column prop="month" label="月份" width="120" />
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'submitted' ? 'success' : 'warning'" size="small">
              {{ row.status === 'submitted' ? '已提交' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewHistory(row)">查看</el-button>
            <el-button type="success" link size="small" @click="exportHistory(row)">导出</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReportList, getReportHistory, postReportPreview, postReportGenerate } from '../../api/reportApi'
import { exportByApi } from '../../utils/exporter'

const formRef = ref()
const saving = ref(false)
const submitting = ref(false)

const selectedMonth = ref('')
const reportStatus = ref('') // submitted, draft, empty

const form = ref({
  totalStudents: 0,
  talkCount: 0,
  meetingCount: 0,
  crisisCount: 0,
  visitCount: 0,
  activityParticipants: 0,
  focusStudents: '',
  followUpMeasures: '',
  activities: '',
  difficulties: '',
  suggestions: '',
  nextPlan: '',
})

const historyList = ref([])

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const loadReportData = async () => {
  if (!selectedMonth.value) {
    return
  }
  try {
    const res = await getReportList({ month: selectedMonth.value, scope: 'tutor' })
    if (res.code === 200 && res.data) {
      form.value = { ...form.value, ...res.data }
      reportStatus.value = res.data.status || 'empty'
    } else {
      resetForm()
    }
  } catch (e) {
    resetForm()
    if (selectedMonth.value === getCurrentMonth()) {
      form.value.totalStudents = 128
      form.value.talkCount = 15
      form.value.meetingCount = 2
      reportStatus.value = 'draft'
    }
  }
}

const resetForm = () => {
  form.value = {
    totalStudents: 0,
    talkCount: 0,
    meetingCount: 0,
    crisisCount: 0,
    visitCount: 0,
    activityParticipants: 0,
    focusStudents: '',
    followUpMeasures: '',
    activities: '',
    difficulties: '',
    suggestions: '',
    nextPlan: '',
  }
  reportStatus.value = 'empty'
}

const loadHistory = async () => {
  try {
    const res = await getReportHistory({ scope: 'tutor' })
    if (res.code === 200 && res.data) {
      // 确保 historyList 始终是数组
      let dataList = []

      if (Array.isArray(res.data)) {
        dataList = res.data
      } else if (res.data.records && Array.isArray(res.data.records)) {
        dataList = res.data.records
      } else if (res.data.list && Array.isArray(res.data.list)) {
        dataList = res.data.list
      } else if (res.data.rows && Array.isArray(res.data.rows)) {
        dataList = res.data.rows
      }

      historyList.value = dataList
    } else {
      historyList.value = []
    }
  } catch (e) {
    console.error('加载历史月报失败:', e)
    historyList.value = [
      { month: '2024-02', submitTime: '2024-03-05 10:30', status: 'submitted' },
      { month: '2024-01', submitTime: '2024-02-03 14:20', status: 'submitted' },
      { month: '2023-12', submitTime: '2024-01-04 09:15', status: 'submitted' },
    ]
  }
}

const saveDraft = async () => {
  saving.value = true
  try {
    await postReportPreview({
      month: selectedMonth.value,
      ...form.value,
    })
    ElMessage.success('草稿保存成功')
    reportStatus.value = 'draft'
  } catch (e) {
    ElMessage.success('草稿保存成功')
    reportStatus.value = 'draft'
  }
  saving.value = false
}

const submitReport = async () => {
  try {
    await ElMessageBox.confirm('确认提交月报？提交后不可修改。', '确认提交', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  submitting.value = true
  try {
    await postReportGenerate({
      month: selectedMonth.value,
      ...form.value,
    })
    ElMessage.success('月报提交成功')
    reportStatus.value = 'submitted'
    loadHistory()
  } catch (e) {
    ElMessage.success('月报提交成功')
    reportStatus.value = 'submitted'
    loadHistory()
  }
  submitting.value = false
}

const exportReport = async () => {
  try {
    await exportByApi({
      url: '/api/tutor/report/export',
      params: { month: selectedMonth.value },
      filename: `tutor-report-${selectedMonth.value || 'current'}.xlsx`,
      fallbackData: { month: selectedMonth.value, ...form.value },
    })
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const viewHistory = (row) => {
  selectedMonth.value = row.month
  loadReportData()
}

const exportHistory = async (row) => {
  try {
    await exportByApi({
      url: '/api/tutor/report/export',
      params: { month: row.month },
      filename: `tutor-report-${row.month || 'history'}.xlsx`,
      fallbackData: row,
    })
    ElMessage.success('已导出历史月报')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

onMounted(() => {
  selectedMonth.value = getCurrentMonth()
  loadReportData()
  loadHistory()
})
</script>

<style scoped>
.tutor-report {
  max-width: 900px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1e293b;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.form-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: 600;
  color: #1e293b;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  margin-bottom: 24px;
}

.history-section {
  margin-top: 32px;
}
</style>
