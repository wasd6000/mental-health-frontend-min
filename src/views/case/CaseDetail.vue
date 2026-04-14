<template>
  <div class="case-detail-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">个案详情</span>
    </div>
    <el-card>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="个案编号">{{ caseData.id }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ caseData.student_name }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ caseData.status }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ caseData.created_at }}</el-descriptions-item>
        <el-descriptions-item label="最新进展">{{ caseData.progress }}</el-descriptions-item>
      </el-descriptions>
      <div class="action-bar">
        <el-button type="primary" @click="operateCase">操作</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchCaseDetail } from '../../api/case'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const caseData = ref<any>({})

onMounted(async () => {
  caseData.value = await fetchCaseDetail(String(route.params.id))
})

function operateCase() {
  router.push(`/case/${route.params.id}/operate`)
}
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

.action-bar {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
