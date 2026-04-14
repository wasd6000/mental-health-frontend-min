<template>
  <div class="join-landing">
    <h2>活动报名</h2>
    <p v-if="!activityId" class="hint error">缺少参数 <code>activityId</code>，请从活动列表进入或使用完整链接。</p>
    <p v-else-if="pending" class="hint">正在提交报名…</p>
    <p v-else-if="done && resultOk" class="hint ok">{{ resultMsg }}</p>
    <p v-else-if="done" class="hint error">{{ resultMsg }}</p>
    <div class="actions">
      <el-button type="primary" @click="goList">返回活动列表</el-button>
      <el-button v-if="activityId" @click="goDetail">查看活动详情</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { joinActivity } from '@/api/activity.js'
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
  runJoin()
})

async function runJoin() {
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
    const raw = await joinActivity({ activityId: id })
    const { ok, msg } = unwrapMutationResponse(raw)
    resultOk.value = ok
    resultMsg.value = msg || (ok ? '报名成功' : '报名失败')
    if (ok) {
      ElMessage.success(resultMsg.value)
      router.replace({ path: `/student/activity/${id}` })
    } else {
      ElMessage.error(resultMsg.value)
    }
  } catch (e) {
    resultOk.value = false
    resultMsg.value = e?.response?.data?.msg || e?.message || '报名请求失败'
    ElMessage.error(resultMsg.value)
  } finally {
    pending.value = false
    done.value = true
  }
}

function goList() {
  router.push('/student/activity')
}

function goDetail() {
  const id = activityId.value
  if (id) router.push(`/student/activity/${id}`)
  else goList()
}
</script>

<style scoped>
.join-landing {
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
