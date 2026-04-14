<template>
  <el-card v-loading="loading">
    <h2>我的排班</h2>
    <div v-if="!canView">
      <el-alert type="warning" title="请以咨询师身份登录后查看排班" />
    </div>
    <div v-else>
      <p class="hint">数据来自 GET /api/schedule/list（与 OpenAPI 中 Consulate 排班查询一致）。</p>
      <el-table :data="mySchedule" stripe style="width: 100%">
        <el-table-column prop="schedule_id" label="排班ID" min-width="140" show-overflow-tooltip />
        <el-table-column prop="counselor_id" label="咨询师ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="schedule_date" label="日期/星期" width="110" />
        <el-table-column prop="start_time" label="开始" width="100" />
        <el-table-column prop="end_time" label="结束" width="100" />
        <el-table-column prop="slot_duration" label="时长" width="90" />
        <el-table-column prop="available_slots" label="可约" width="80" />
        <el-table-column prop="schedule_type" label="类型" width="100" />
      </el-table>
      <el-empty v-if="!loading && !mySchedule.length" description="暂无排班数据" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import request from '../../api/request.js'
import { unwrapPageResult } from '../../api/psychPlatformAppointment.js'
import { getCounselorUserId } from '../../utils/counselorSession.js'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const userRole = (localStorage.getItem('user_role') || '').toLowerCase()
const canView = computed(() => userRole === 'counselor')

const mySchedule = ref<any[]>([])

onMounted(async () => {
  if (!canView.value) return
  const uid = getCounselorUserId()
  if (!uid) {
    ElMessage.warning('未获取到咨询师 ID')
    return
  }
  loading.value = true
  try {
    const res: any = await request.get('/api/schedule/list', {
      params: { page: 1, pageSize: 200, counselorId: uid },
    })
    const { records } = unwrapPageResult(res)
    const rows = (Array.isArray(records) ? records : []).filter(Boolean)
    mySchedule.value = rows.filter(
      (r: any) => !r.counselor_id || r.counselor_id === uid || r.userId === uid,
    )
    if (mySchedule.value.length === 0 && rows.length) {
      mySchedule.value = rows
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('加载排班失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.hint {
  color: #64748b;
  font-size: 13px;
  margin: 0 0 12px;
}
h2 {
  margin: 0 0 12px;
}
</style>
