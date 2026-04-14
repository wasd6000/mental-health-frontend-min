<template>
  <div class="leave-apply-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">请假申请</span>
    </div>

    <div class="page-header">
      <div class="header-content">
        <h2>提交请假申请</h2>
        <p class="page-desc">填写请假信息，提交后等待审批</p>
      </div>
    </div>

    <el-card class="form-card">
      <el-form
        :model="leaveForm"
        :rules="leaveRules"
        ref="leaveFormRef"
        label-width="120px"
      >
        <el-form-item label="咨询师ID" prop="counselorId">
          <el-input
            v-model="leaveForm.counselorId"
            placeholder="请输入咨询师ID"
            disabled
          />
        </el-form-item>

        <el-form-item label="请假类型" prop="leaveType">
          <el-select
            v-model="leaveForm.leaveType"
            placeholder="请选择请假类型"
            style="width: 100%"
          >
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

        <el-form-item label="请假原因" prop="reason">
          <el-input
            v-model="leaveForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明请假原因"
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="leaveForm.startTime"
                type="datetime"
                placeholder="选择开始时间"
                style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="leaveForm.endTime"
                type="datetime"
                placeholder="选择结束时间"
                style="width: 100%"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="请假天数" prop="days">
          <el-input-number
            v-model="leaveForm.days"
            :min="0.5"
            :max="30"
            :step="0.5"
            :precision="1"
            style="width: 200px"
          />
          <span class="input-tip">天</span>
        </el-form-item>
      </el-form>

      <div class="form-actions">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
          提交申请
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { submitLeave, LEAVE_TYPE_MAP } from '../../api/leaveApi'

const router = useRouter()
const submitting = ref(false)

const leaveFormRef = ref(null)
const leaveForm = ref({
  counselorId: '',
  leaveType: '',
  reason: '',
  startTime: '',
  endTime: '',
  days: 1
})

const leaveRules = {
  counselorId: [{ required: true, message: '请输入咨询师ID', trigger: 'blur' }],
  leaveType: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
  reason: [{ required: true, message: '请输入请假原因', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const resetForm = () => {
  leaveFormRef.value?.resetFields()
  leaveForm.value.days = 1
}

const handleSubmit = async () => {
  try {
    await leaveFormRef.value.validate()

    if (!leaveForm.value.startTime || !leaveForm.value.endTime) {
      ElMessage.warning('请选择开始和结束时间')
      return
    }

    const start = new Date(leaveForm.value.startTime)
    const end = new Date(leaveForm.value.endTime)

    if (end <= start) {
      ElMessage.warning('结束时间必须晚于开始时间')
      return
    }

    submitting.value = true
    const res = await submitLeave(leaveForm.value)

    if (res.code === 200) {
      ElMessage.success('申请提交成功')
      router.push('/counselor/leave/list')
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch (error) {
    console.error(error)
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #dbeafe 100%);
  border-radius: 12px;
  border: 1px solid #bfdbfe;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
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
}

.input-tip {
  margin-left: 8px;
  color: #64748b;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>