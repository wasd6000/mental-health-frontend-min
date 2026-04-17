<template>
  <div class="case-detail-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">个案详情</span>
    </div>
    <el-card v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="个案编号">{{ caseData.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="个案标题">{{ caseData.caseTitle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ caseData.studentId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ caseData.studentName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="咨询师ID">{{ caseData.counselorId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="咨询师姓名">{{ caseData.counselorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="问题类型">{{ caseData.problemType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ caseData.status || '-' }}</el-descriptions-item>
        <el-descriptions-item label="开始日期">{{ caseData.startDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="结案日期">{{ caseData.closeDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="总咨询次数">{{ caseData.totalSessions ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ caseData.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ caseData.updateTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最新进展">{{ caseData.progress || '-' }}</el-descriptions-item>
        <el-descriptions-item label="个案描述" :span="2">{{ caseData.description || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCaseDetail } from '../../api/case'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const caseData = ref<any>({})
const loading = ref(false)

function normalizeCaseDetail(raw: any) {
  if (!raw || typeof raw !== 'object') return {}
  return {
    ...raw,
    id: raw.id ?? raw.caseId ?? '',
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
    progress: raw.progress ?? '',
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const res: any = await getCaseDetail(String(route.params.id))
    caseData.value = normalizeCaseDetail(res?.data)
  } catch (e) {
    caseData.value = {}
    ElMessage.error('获取个案详情失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.case-detail-page {
  padding: 20px;
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

</style>
