<template>
  <div class="activity-create-page">
    <div class="page-head">
      <div class="head-main">
        <el-button @click="cancel" :icon="ArrowLeft" text>返回活动列表</el-button>
        <h2>创建团体活动</h2>
        <p class="page-desc">填写活动名称、时间与描述，创建新的团体心理活动。</p>
      </div>
    </div>
    <el-card class="form-card" shadow="never">
      <el-form :model="form" label-width="120px">
        <el-form-item label="活动名称" required>
          <el-input v-model="form.name" placeholder="请输入活动名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="活动时间" required>
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="请选择活动时间"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="活动地点">
          <el-input v-model="form.location" placeholder="请输入活动地点（可选）" maxlength="200" />
        </el-form-item>
        <el-form-item label="最大参与人数">
          <el-input-number
            v-model="form.maxParticipants"
            :min="1"
            :max="999"
            placeholder="请输入最大参与人数（可选）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入活动描述（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submit">创建</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { createActivity } from '../../api/activity'

const router = useRouter()
const form = ref({
  name: '',
  date: '',
  location: '',
  maxParticipants: undefined as number | undefined,
  description: ''
})
const submitting = ref(false)

function cancel() {
  router.push('/admin/activity-manage')
}

async function submit() {
  if (!form.value.name?.trim()) {
    ElMessage.warning('请填写活动名称')
    return
  }
  if (!form.value.date) {
    ElMessage.warning('请选择活动时间')
    return
  }

  submitting.value = true
  try {
    const res: any = await createActivity({
      name: form.value.name.trim(),
      date: form.value.date,
      location: form.value.location?.trim() || undefined,
      maxParticipants: form.value.maxParticipants,
      description: form.value.description?.trim() || undefined,
    })

    if (res?.code === 200) {
      ElMessage.success('活动创建成功')
      router.push('/admin/activity-manage')
    } else {
      ElMessage.error(res?.msg || '活动创建失败')
    }
  } catch (error: any) {
    console.error('创建活动失败:', error)
    const errorMsg = error?.response?.data?.msg || error?.message || '活动创建失败，请稍后重试'
    ElMessage.error(errorMsg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.activity-create-page {
  padding: 0;
  max-width: 800px;
}

.page-head {
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
  border-radius: 14px;
  border: 1px solid #bae6fd;
}

.head-main h2 {
  margin: 12px 0 8px 0;
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
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}
</style>
