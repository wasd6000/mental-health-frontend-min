<template>
  <div class="page">
    <div class="page-head">
      <h2>咨询记录修改申请</h2>
      <p class="desc">
        对已提交的咨询记录申请更正或补充说明，提交后由心理中心审核；请填写原记录编号与修改原因。
      </p>
    </div>

    <el-card shadow="never" class="card">
      <el-form :model="form" label-width="120px" @submit.prevent>
        <el-form-item label="咨询记录编号" required>
          <el-input
            v-model="form.recordId"
            placeholder="可在「咨询记录」列表中查看记录 ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="修改原因" required>
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="5"
            maxlength="1000"
            show-word-limit
            placeholder="请说明需修改的内容及原因"
          />
        </el-form-item>
        <el-form-item label="补充说明">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="选填"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">提交申请</el-button>
          <el-button @click="router.push('/admin/consult-records')">查看咨询记录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { submitConsultRecordModifyRequest } from '../../api/record'

const router = useRouter()
const submitting = ref(false)
const form = ref({
  recordId: '',
  reason: '',
  remark: ''
})

async function submit() {
  if (!form.value.recordId?.trim()) {
    ElMessage.warning('请填写咨询记录编号')
    return
  }
  if (!form.value.reason?.trim()) {
    ElMessage.warning('请填写修改原因')
    return
  }
  submitting.value = true
  try {
    await submitConsultRecordModifyRequest({
      recordId: form.value.recordId.trim(),
      reason: form.value.reason.trim(),
      remark: form.value.remark?.trim() || undefined
    })
    ElMessage.success('申请已提交')
    form.value = { recordId: '', reason: '', remark: '' }
  } catch (e) {
    ElMessage.error(e?.message || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.page {
  max-width: 720px;
}
.page-head {
  margin-bottom: 20px;
}
.page-head h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #1e293b;
}
.desc {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}
.card {
  border-radius: 12px;
}
</style>
