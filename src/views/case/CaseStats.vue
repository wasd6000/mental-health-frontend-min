<template>
  <el-card>
    <h2>个案统计</h2>
    <el-table :data="stats" style="width:100%">
      <el-table-column prop="status" label="状态" />
      <el-table-column prop="count" label="数量" />
    </el-table>
  </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchCaseStats } from '../../api/case'
const stats = ref<any[]>([])
onMounted(async () => {
  stats.value = await fetchCaseStats()
})
</script>
