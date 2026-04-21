<template>
  <div class="leave-apply-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">请假申请</span>
    </div>

    <div class="page-header">
      <div class="header-content">
        <h2>提交请假申请</h2>
        <p class="page-desc">填写请假信息，提交后等待管理员审批</p>
      </div>
    </div>

    <el-card class="form-card">
      <el-form
        :model="leaveForm"
        :rules="leaveRules"
        ref="leaveFormRef"
        label-width="100px"
        class="leave-form"
      >
        <!-- 请假类型 -->
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="leaveForm.leaveType" placeholder="请选择请假类型" style="width: 100%">
            <el-option
              v-for="(config, key) in LEAVE_TYPE_MAP"
              :key="key"
              :label="config.label"
              :value="key"
            >
              <span :style="{ color: config.color }">{{ config.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 请假时间 -->
        <el-form-item label="请假时间" required>
          <div class="time-range-wrapper">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DDTHH:mm:ss"
              format="MM-DD HH:mm"
              :default-time="['09:00:00', '17:00:00']"
              style="width: 100%"
              @change="handleDateRangeChange"
            />
          </div>
        </el-form-item>

        <!-- 请假时长 -->
        <el-form-item label="请假时长">
          <div class="duration-display">
            <el-tag type="primary" size="large">{{ calculatedDays }} 天</el-tag>
            <span v-if="calculatedHours > 0 && calculatedHours < 24" class="hours-tip">
              约 {{ calculatedHours }} 小时
            </span>
          </div>
        </el-form-item>

        <!-- 请假原因 -->
        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="leaveForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明请假原因，方便管理员审批..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 排班冲突提示 -->
        <el-alert
          v-if="conflictSchedules.length > 0"
          type="warning"
          :closable="false"
          show-icon
          class="conflict-alert"
        >
          <template #title>
            <span>排班冲突提醒</span>
          </template>
          <p>您在以下日期有排班，请假审批通过后请手动调整排班：</p>
          <p class="conflict-dates">{{ conflictDates }}</p>
        </el-alert>
      </el-form>

      <div class="form-actions">
        <el-button @click="resetForm" size="large">重置</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
          提交申请
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { submitLeave, LEAVE_TYPE_MAP } from '../../api/leaveApi'
import { getScheduleList } from '../../api/scheduleApi'

const router = useRouter()
const submitting = ref(false)
const conflictSchedules = ref([])

const leaveFormRef = ref(null)
const leaveForm = ref({
  counselorId: '',
  leaveType: '',
  reason: '',
  startTime: '',
  endTime: '',
  days: 0
})

// 日期范围选择器绑定值
const dateRange = ref([])

// 计算请假天数
const calculatedDays = computed(() => {
  if (!leaveForm.value.startTime || !leaveForm.value.endTime) return 0
  const start = new Date(leaveForm.value.startTime)
  const end = new Date(leaveForm.value.endTime)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  const diffMs = end - start
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.ceil(diffDays * 2) / 2) // 按0.5天取整
})

// 计算小时数（用于显示）
const calculatedHours = computed(() => {
  if (!leaveForm.value.startTime || !leaveForm.value.endTime) return 0
  const start = new Date(leaveForm.value.startTime)
  const end = new Date(leaveForm.value.endTime)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  const diffMs = end - start
  return Math.round(diffMs / (1000 * 60 * 60))
})

// 冲突日期显示文本
const conflictDates = computed(() => {
  const dates = [...new Set(conflictSchedules.value.map(s => s.date))]
  return dates.join('、')
})

const leaveRules = {
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  reason: [{ required: true, message: '请输入请假原因', trigger: 'blur', min: 5, max: 500 }]
}

// 监听日期范围变化
watch(dateRange, (val) => {
  if (val && val.length === 2) {
    leaveForm.value.startTime = val[0]
    leaveForm.value.endTime = val[1]
    leaveForm.value.days = calculatedDays.value
    checkScheduleConflict()
  } else {
    leaveForm.value.startTime = ''
    leaveForm.value.endTime = ''
    leaveForm.value.days = 0
    conflictSchedules.value = []
  }
})

const handleDateRangeChange = (val) => {
  if (val && val.length === 2) {
    const start = new Date(val[0])
    const end = new Date(val[1])
    if (end <= start) {
      ElMessage.warning('结束时间必须晚于开始时间')
      dateRange.value = []
      return
    }
  }
}

const resetForm = () => {
  leaveFormRef.value?.resetFields()
  dateRange.value = []
  leaveForm.value.counselorId = localStorage.getItem('userId') || ''
  leaveForm.value.days = 0
  conflictSchedules.value = []
}

// 检查排班冲突
const checkScheduleConflict = async () => {
  if (!leaveForm.value.startTime || !leaveForm.value.endTime) return

  const counselorId = leaveForm.value.counselorId
  const startDate = leaveForm.value.startTime.slice(0, 10)
  const endDate = leaveForm.value.endTime.slice(0, 10)

  try {
    const scheduleRes = await getScheduleList({
      counselorId,
      startDate,
      endDate,
      page: 1,
      pageSize: 500
    })

    if (scheduleRes?.code === 200) {
      const schedules = scheduleRes.data?.list || scheduleRes.data?.records || []
      const start = new Date(leaveForm.value.startTime)
      const end = new Date(leaveForm.value.endTime)

      conflictSchedules.value = schedules.filter(s => {
        const scheduleStart = new Date(`${s.date}T${s.startTime || '00:00:00'}`)
        const scheduleEnd = new Date(`${s.date}T${s.endTime || '23:59:59'}`)
        return start < scheduleEnd && end > scheduleStart
      })
    }
  } catch (e) {
    console.warn('检查排班失败:', e)
    conflictSchedules.value = []
  }
}

const handleSubmit = async () => {
  try {
    await leaveFormRef.value.validate()

    if (!leaveForm.value.startTime || !leaveForm.value.endTime) {
      ElMessage.warning('请选择请假时间')
      return
    }

    const start = new Date(leaveForm.value.startTime)
    const end = new Date(leaveForm.value.endTime)

    if (end <= start) {
      ElMessage.warning('结束时间必须晚于开始时间')
      return
    }

    // 有冲突时二次确认
    if (conflictSchedules.value.length > 0) {
      await ElMessageBox.confirm(
        `您在以下日期有排班：${conflictDates.value}。\n\n请假审批通过后，请手动调整排班，避免学生预约冲突。`,
        '排班冲突提醒',
        {
          confirmButtonText: '继续提交',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    }

    submitting.value = true
    const res = await submitLeave({
      ...leaveForm.value,
      days: calculatedDays.value
    })

    if (res.code === 200) {
      ElMessage.success('申请提交成功')
      router.push('/counselor/leave/list')
    } else {
      ElMessage.error(res.message || '提交失败')
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
  leaveForm.value.counselorId = localStorage.getItem('userId') || ''
})
</script>

<style scoped>
.leave-apply-page {
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
  margin-bottom: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #fff 0%, #dbeafe 100%);
  border-radius: 12px;
  border: 1px solid #bfdbfe;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.form-card {
  border-radius: 12px;
  max-width: 700px;
}

.leave-form {
  padding: 20px 0;
}

.time-range-wrapper {
  width: 100%;
}

.duration-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hours-tip {
  color: #64748b;
  font-size: 14px;
}

.conflict-alert {
  margin-top: 20px;
  margin-bottom: 10px;
}

.conflict-dates {
  margin-top: 8px;
  font-weight: 500;
  color: #f59e0b;
}

.form-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

:deep(.el-date-editor--datetimerange) {
  width: 100%;
}
</style>
