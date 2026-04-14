<template>
  <div class="leave-apply-page">
    <div class="page-nav">
      <el-button @click="goBack" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">提交请假申请</span>
    </div>
    <el-card>
      <p class="form-tip">
        与后端 LeaveApplyDTO 一致：<code>leaveType</code>、<code>reason</code>、<code>startTime</code>、<code>endTime</code>（ISO 本地时间，如
        2026-04-10T09:00:00）。
      </p>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="form.leaveType" placeholder="请选择" style="width: 100%">
            <el-option label="事假" value="PERSONAL" />
            <el-option label="病假" value="SICK" />
            <el-option label="年假" value="ANNUAL" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input v-model="form.reason" type="textarea" :rows="4" placeholder="请输入请假原因" />
        </el-form-item>
        <el-form-item label="起止时间" prop="range">
          <el-date-picker
            v-model="form.range"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { submitLeave } from '../../api/leaveApi'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = ref({
  leaveType: 'PERSONAL',
  reason: '',
  range: [] as string[] | undefined,
})

const rules: FormRules = {
  leaveType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  reason: [{ required: true, message: '请输入请假原因', trigger: 'blur' }],
  range: [
    {
      required: true,
      validator: (_rule, val, cb) => {
        if (Array.isArray(val) && val.length === 2 && val[0] && val[1]) {
          cb()
        } else {
          cb(new Error('请选择起止时间'))
        }
      },
      trigger: 'change',
    },
  ],
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/admin/leave-list')
}

async function submit() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return
  const range = form.value.range
  if (!Array.isArray(range) || range.length !== 2) {
    ElMessage.warning('请选择起止时间')
    return
  }
  const startTime = String(range[0]).trim()
  const endTime = String(range[1]).trim()
  if (startTime >= endTime) {
    ElMessage.warning('结束时间须晚于开始时间')
    return
  }
  const payload = {
    leaveType: form.value.leaveType,
    reason: form.value.reason.trim(),
    startTime,
    endTime,
  }
  submitting.value = true
  try {
    const res: any = await submitLeave(payload)
    if (res?.code === 200) {
      ElMessage.success(res.msg || '提交成功，请等待审批')
      await router.push('/admin/leave-list')
    } else {
      ElMessage.error(res?.msg || res?.message || '提交失败')
    }
  } catch (e: any) {
    const msg =
      e?.response?.data?.msg ||
      e?.response?.data?.message ||
      e?.message ||
      '提交失败'
    ElMessage.error(typeof msg === 'string' ? msg : '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  const fromId = route.query.fromId
  if (fromId) {
    /* 重新申请：仅作提示，不假设能拉取详情接口 */
    ElMessage.info('请重新填写时间并提交（重新申请）')
  }
})
</script>

<style scoped>
.leave-apply-page {
  padding: 20px;
  max-width: 800px;
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

.form-tip {
  margin: 0 0 16px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.form-tip code {
  font-size: 12px;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
