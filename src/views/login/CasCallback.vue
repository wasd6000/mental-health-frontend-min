<template>
  <div class="cas-callback">
    <el-result
      icon="info"
      title="统一身份认证回调"
      sub-title="CAS 落地后，由后端校验票据（ticket）并颁发业务 Token；当前为占位页。"
    >
      <template #extra>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </template>
    </el-result>
    <p v-if="ticketHint" class="hint">{{ ticketHint }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const ticketHint = computed(() => {
  const t = route.query.ticket || route.query.code
  if (!t) return ''
  return `已收到回调参数（示例未换票）：${String(t).slice(0, 32)}…`
})

onMounted(() => {
  const t = route.query.ticket || route.query.code
  if (t) {
    sessionStorage.setItem('cas_callback_ticket', String(t))
  }
})

function goHome() {
  router.replace('/')
}
</script>

<style scoped>
.cas-callback {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.hint {
  margin-top: 12px;
  color: #64748b;
  font-size: 13px;
  max-width: 520px;
  text-align: center;
}
</style>
