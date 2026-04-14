<template>
  <div class="dashboard">
    <el-page-header content="咨询师工作台（备用页）" @back="router.push('/admin')" />
    <p class="hint">主工作台请使用「管理端 → 咨询师工作」路由，已对接 /api/appointment/list 与 /api/record/list。</p>
    <el-button type="primary" @click="router.push('/admin/counselor-work')">进入工作概览</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.dashboard {
  padding: 24px;
}
.hint {
  margin: 16px 0;
  color: #64748b;
  font-size: 14px;
}
</style>
