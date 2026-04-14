<template>
  <div class="crisis-assess-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">危机评估</span>
    </div>
    <el-card>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="危机编号">{{ crisis.id }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ crisis.student_name }}</el-descriptions-item>
        <el-descriptions-item label="危机等级">{{ crisis.level }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ crisis.status }}</el-descriptions-item>
      </el-descriptions>
      <div class="action-bar">
        <el-button type="primary" @click="intervene">开始干预</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchCrisisDetail } from '../../api/crisis'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const crisis = ref<any>({})

onMounted(async () => {
  crisis.value = await fetchCrisisDetail(String(route.params.id))
})

function intervene() {
  router.push(`/crisis/${route.params.id}/intervene`)
}
</script>

<style scoped>
.crisis-assess-page {
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
