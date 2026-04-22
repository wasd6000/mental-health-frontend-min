<template>
  <div class="my-appointment-page">
    <h2>我的预约</h2>

    <el-button
      type="primary"
      style="margin-bottom: 12px"
      @click="createNew"
    >
      + 新建预约
    </el-button>

    <!-- 字段与 psychological_platform AppointmentDetailVO / listAppointments 对齐 -->
    <el-table :data="list" style="width: 100%" stripe border>
      <el-table-column prop="id" label="预约编号" min-width="200" show-overflow-tooltip />
      <el-table-column label="预约日期" min-width="120">
        <template #default="{ row }">
          {{ row.appointmentDate || row.date || '—' }}
        </template>
      </el-table-column>
      <el-table-column label="预约时段" min-width="140">
        <template #default="{ row }">
          {{ row.appointmentTime || row.create_time || '—' }}
        </template>
      </el-table-column>
      <el-table-column prop="counselorName" label="咨询师" min-width="100" />
      <el-table-column prop="appointmentType" label="咨询类型" min-width="110" />
      <el-table-column prop="consultationMode" label="咨询方式" min-width="100" />
      <el-table-column prop="location" label="地点" min-width="120" show-overflow-tooltip />
      <el-table-column label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="go(row.id)">
            填写
          </el-button>
          <el-button size="small" @click="$router.push(`/appointment/${row.id}/detail`)">
            查看进度
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && list.length === 0" description="暂无预约记录" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyAppointmentsAsync } from '../../api/appointment'
import { resolveBackendUserIdForAppointmentApi } from '../../api/appointmentEnv'
import type { Appointment } from '../../types/appointment'

const list = ref<Appointment[]>([])
const loading = ref(false)

const router = useRouter()

// 状态文本映射
function getStatusText(status: string): string {
  const map: Record<string, string> = {
    'draft': '草稿',
    'submitted': '待确认',
    'confirmed': '已确认',
    'info_done': '已登记',
    'scale_done': '已测表',
    'sign_done': '已签署',
    'completed': '已完成',
    'cancelled': '已取消',
    'rejected': '已拒绝',
    'no_show': '爽约',
  }
  return map[status] || status
}

// 状态标签类型
function getStatusType(status: string): string {
  const map: Record<string, string> = {
    'draft': 'info',
    'submitted': 'warning',
    'confirmed': 'success',
    'info_done': 'success',
    'scale_done': 'success',
    'sign_done': 'success',
    'completed': 'success',
    'cancelled': 'danger',
    'rejected': 'danger',
    'no_show': 'danger',
  }
  return map[status] || 'info'
}

onMounted(async () => {
  const uid = resolveBackendUserIdForAppointmentApi()
  if (!uid) {
    list.value = []
    return
  }
  loading.value = true
  try {
    const res = await getMyAppointmentsAsync(uid)
    list.value = Array.isArray(res.data) ? res.data : []
  } finally {
    loading.value = false
  }
})

function createNew() {
  router.push('/appointment/select')
}

function go(id: string) {
  if (!id) return
  router.push(`/appointment/${id}`)
}
</script>

<style scoped>
.my-appointment-page {
  padding: 16px;
}
</style>
