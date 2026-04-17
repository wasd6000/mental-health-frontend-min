<template>
  <div class="appointment-detail-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">预约详情</span>
    </div>
    <el-card>
      <div v-if="appointment">
        <el-descriptions :column="2" border style="margin-bottom:20px">
        <el-descriptions-item label="预约编号">{{ appointment.id }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ appointment.studentId }}</el-descriptions-item>
        <el-descriptions-item label="咨询师">{{ appointment.counselorName }}</el-descriptions-item>
        <el-descriptions-item label="预约日期">{{ appointment.date }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">{{ appointment.create_time }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">{{ statusText[appointment.status as AppointmentStatus] || appointment.status }}</el-descriptions-item>
      </el-descriptions>

      <!-- 操作按钮（仅咨询师可见） -->
      <div v-if="isCounselor" style="margin-bottom:20px">
        <el-button 
          v-if="canAgree" 
          type="success" 
          @click="handleAgree"
        >同意预约</el-button>
        <el-button 
          v-if="canReject" 
          type="info" 
          @click="handleReject"
        >拒绝预约</el-button>
        <el-button 
          v-if="canRenew" 
          type="warning" 
          @click="handleRenew"
        >一键续约</el-button>
      </div>

      <h3>预约流程</h3>
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in timeline"
          :key="index"
          :timestamp="item.time"
          :type="item.status === appointment?.status ? 'primary' : 'info'"
        >
          {{ statusText[item.status] }}
        </el-timeline-item>
      </el-timeline>
    </div>
      <div v-else>
        <p>加载中...</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAppointmentByIdAsync, updateAppointmentStatusAsync, createAppointmentForStudentAsync } from '../../api/appointment'
import type { Appointment, AppointmentStatus } from '../../types/appointment'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appointment = ref<Appointment | null>(null)

const statusFlow: AppointmentStatus[] = [
  'draft',
  'info_done',
  'scale_done',
  'sign_done',
  'completed',
  'confirmed',
  'checked_in',
  'report_done',
  'closed'
]

// 判断是否咨询师身份
const isCounselor = computed(() => {
  return localStorage.getItem('user_role') === 'counselor'
})

// 判断按钮可见性
// "同意预约" - 咨询师确认学生创建的预约，只在draft状态显示
const canAgree = computed(() => {
  return appointment.value?.status === 'draft'
})

// "拒绝预约" - 咨询师拒绝学生的预约，只在draft状态显示
const canReject = computed(() => {
  return appointment.value?.status === 'draft'
})

// 是否允许对未来/未完成的预约进行续约（临时开关）
const tempAllowFutureRenew = localStorage.getItem('temp_allow_future_renew') === '1'

const canRenew = computed(() => {
  if (!appointment.value) return false
  // 如果临时开关打开，则允许所有已存在预约被续约（方便测试）
  if (tempAllowFutureRenew) return true
  return ['confirmed', 'checked_in', 'completed', 'closed'].includes(appointment.value.status)
})

const timeline = computed(() => {
  if (!appointment.value) return []
  const status = appointment.value.status as AppointmentStatus
  const currentIndex = statusFlow.indexOf(status)
  return statusFlow.slice(0, currentIndex + 1).map((s, idx) => ({
    status: s,
    time: idx === currentIndex ? '当前' : ''
  }))
})

console.log('route.params.id =', route.params.id)

// 日期规范化工具（使用本地时间）
function toDay(d: string | Date) {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt.getTime())) return ''
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const statusText: Record<AppointmentStatus, string> = {
  draft: '已创建预约',
  info_done: '完成来访登记',
  scale_done: '完成前测量表',
  sign_done: '已签署知情同意书',
  completed: '预约提交成功',
  confirmed: '咨询师已确认',
  checked_in: '已签到',
  report_done: '完成咨询报告',
  closed: '已结案',
  submitted: '已提交',
  form_completed: '已完成来访登记&前测',
  consent_signed: '已签署知情同意书',
  cancelled: '已取消',
}

// 同意预约
const handleAgree = async () => {
  if (!appointment.value) return
  if (!isCounselor.value) {
    ElMessage.error('只有咨询师可执行该操作')
    return
  }
  try {
    const res = await updateAppointmentStatusAsync(appointment.value.id, 'confirmed')
    appointment.value = res.data
    ElMessage.success('已同意预约')
    try { window.dispatchEvent(new CustomEvent('mock-message', { detail: { type: 'appointment_approved', id: appointment.value.id } })) } catch(e){}
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 拒绝预约
const handleReject = async () => {
  if (!appointment.value) return
  if (!isCounselor.value) {
    ElMessage.error('只有咨询师可执行该操作')
    return
  }
  const studentId = appointment.value.studentId
  try {
    // 设置为 'closed' 表示结束（可按需改为其他状态）
    const res = await updateAppointmentStatusAsync(appointment.value.id, 'closed')
    appointment.value = res.data
    ElMessage.success('已拒绝预约')
    // 模拟通知
    try { window.dispatchEvent(new CustomEvent('mock-message', { detail: { type: 'appointment_rejected', id: appointment.value.id, studentId: studentId } })) } catch(e){}
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

// 一键续约
const handleRenew = async () => {
  if (!appointment.value) return
  if (!isCounselor.value) {
    ElMessage.error('只有咨询师可执行该操作')
    return
  }
  const scheduleId = appointment.value.scheduleId
  if (!scheduleId) {
    ElMessage.error('续约失败：当前预约缺少排班ID（scheduleId）')
    return
  }
  // 创建下周同一时间的预约
  const date = new Date(appointment.value.date)
  date.setDate(date.getDate() + 7)
  const nextWeekDate = toDay(date)

  try {
    const res = await createAppointmentForStudentAsync({
      scheduleId,
      studentId: appointment.value.studentId,
      counselorId: appointment.value.counselorId,
      counselorName: appointment.value.counselorName || '',
      date: nextWeekDate,
      create_time: appointment.value.create_time,
      end_time: appointment.value.end_time,
    })
    ElMessage.success(`已创建下周预约：${nextWeekDate} ${appointment.value.create_time}`)
    // 模拟通知
    try { window.dispatchEvent(new CustomEvent('mock-message', { detail: { type: 'appointment_renewed', oldId: appointment.value.id, newId: res.data?.id, date: nextWeekDate } })) } catch(e){}
    // 通知其他组件刷新数据（学生/咨询师都能看到新预约）
    try { window.dispatchEvent(new Event('appointments-updated')) } catch(e){}
  } catch (e) {
    console.error(e)
    ElMessage.error('续约失败')
  }
}

onMounted(async () => {
  const id = route.params.id as string
  try {
    const res = await getAppointmentByIdAsync(id)
    appointment.value = res.data
  } catch (e) {
    console.error('找不到预约', id)
    ElMessage.error('预约不存在')
  }
})
</script>

<style scoped>
.appointment-detail-page {
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
