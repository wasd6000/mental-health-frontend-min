<template>
  <div class="activity-sub-page">
    <div class="page-head">
      <el-button text type="primary" :icon="ArrowLeft" @click="goBack">返回活动列表</el-button>
      <h2>活动签到</h2>
      <p class="page-desc">
        活动编号：{{ displayId || '—' }}。后端接口为 POST /api/activity/checkin（Query：activityId），仅为当前登录用户本人签到。
      </p>
    </div>
    <el-card shadow="never" class="form-card">
      <p class="hint">确认已到场后点击按钮即可完成签到（无需重复填写表单字段）。</p>
      <el-form label-width="100px">
        <el-form-item label="备注">
          <el-input v-model="remark" type="textarea" :rows="2" placeholder="选填（仅本地记录，不上传服务器）" />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleCheckIn"
          >
            确认签到
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { checkinActivity } from '../../api/activity.js'

const route = useRoute()
const router = useRouter()
const activityId = ref('')
const submitting = ref(false)
const remark = ref('')

const displayId = computed(() => activityId.value)

function goBack() {
  router.push('/admin/activity-manage')
}

async function handleCheckIn() {
  const id = activityId.value || String(route.query.activityId || route.query.id || '').trim()
  if (!id) {
    ElMessage.warning('缺少活动编号，请从活动管理进入签到页')
    return
  }
  submitting.value = true
  try {
    const res = await checkinActivity({ activityId: id })
    if (res && res.code === 200) {
      ElMessage.success(res.msg || res.data || '签到成功')
      await router.push('/admin/activity-manage')
    } else {
      ElMessage.error(res?.msg || res?.message || '签到失败')
    }
  } catch (e) {
    const raw =
      e?.response?.data?.msg ||
      e?.response?.data?.message ||
      e?.message ||
      '签到失败'
    ElMessage.error(typeof raw === 'string' ? raw : '签到失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  activityId.value = String(route.query.activityId || route.query.id || '').trim()
})
</script>

<style scoped>
.activity-sub-page {
  max-width: 640px;
  padding: 0;
}
.page-head {
  margin-bottom: 20px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff 0%, #f0fdf4 100%);
  border-radius: 12px;
  border: 1px solid #bbf7d0;
}
.page-head h2 {
  margin: 12px 0 8px;
  font-size: 20px;
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
.hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: #64748b;
}
</style>
