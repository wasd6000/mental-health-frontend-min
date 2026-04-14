<template>
  <div class="checkin-landing">
    <h2>活动签到</h2>
    <p v-if="!activityId" class="hint error">
      缺少参数 <code>activityId</code>（或 <code>id</code>）。请扫码完整链接，或从我的活动进入。
    </p>
    <p v-else-if="pending" class="hint">正在签到…</p>
    <p v-else-if="done && resultOk" class="hint ok">{{ resultMsg }}</p>
    <p v-else-if="done" class="hint error">{{ resultMsg }}</p>
    <div class="actions">
      <el-button type="primary" @click="goMy">我的活动</el-button>
      <el-button v-if="activityId" @click="goDetail">活动详情</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { checkinActivity } from '@/api/activity.js'
import { unwrapMutationResponse } from '@/api/helpers.js'

const route = useRoute()
const router = useRouter()

const activityId = computed(() => {
  const q = route.query.activityId ?? route.query.id
  return q ? String(q).trim() : ''
})

const pending = ref(false)
const done = ref(false)
const resultOk = ref(false)
const resultMsg = ref('')

onMounted(() => {
  runCheckin()
})

async function runCheckin() {
  const id = activityId.value
  if (!id) {
    done.value = true
    resultOk.value = false
    resultMsg.value = '未提供活动 ID'
    return
  }
  pending.value = true
  done.value = false
  try {
    const raw = await checkinActivity({ activityId: id })
    const { ok, msg, data } = unwrapMutationResponse(raw)
    resultOk.value = ok
    /** activityId 在请求 Query；R 多为 msg，一般不回传 activityId */
    resultMsg.value =
      msg ||
      (ok ? '签到成功' : '签到失败') ||
      (data != null ? String(data) : '')
    if (ok) {
      ElMessage.success(resultMsg.value)
      router.replace({ path: `/student/activity/${id}` })
    } else {
      ElMessage.error(resultMsg.value)
    }
  } catch (e) {
    resultOk.value = false
    resultMsg.value = e?.response?.data?.msg || e?.message || '签到请求失败'
    ElMessage.error(resultMsg.value)
  } finally {
    pending.value = false
    done.value = true
  }
}

function goMy() {
  router.push('/student/activity/my')
}

function goDetail() {
  const id = activityId.value
  if (id) router.push(`/student/activity/${id}`)
  else goMy()
}
</script>

<style scoped>
.checkin-landing {
  max-width: 560px;
  margin: 40px auto;
  padding: 24px;
}
.hint {
  color: #64748b;
  line-height: 1.6;
  margin: 16px 0;
}
.hint.ok {
  color: #047857;
}
.hint.error {
  color: #b91c1c;
}
.hint code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
</style>
