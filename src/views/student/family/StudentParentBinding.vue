<template>
  <div class="page">
    <header class="page-head">
      <h1>关联家长</h1>
      <p class="sub">家长发起绑定后，请在本页或登录后的提示框中确认或拒绝。状态：-1 未绑定 · 0 待确认 · 1 已绑定 · 2 已拒绝。</p>
    </header>

    <el-card v-loading="loading" shadow="never" class="mb">
      <template #header>
        <span>当前绑定状态</span>
      </template>
      <el-empty v-if="!bindUserId" description="未获取到学生账号 ID，请使用学校统一登录（JWT 中会写入 userId）" />
      <template v-else>
        <div class="status-row">
          <span class="label">状态：</span>
          <el-tag :type="statusTagType(statusCode)" size="large">{{ statusText(statusCode) }}</el-tag>
        </div>
        <p v-if="statusCode === 0" class="pending-tip">有家长申请与您关联，请确认对方身份后选择「接受」或「拒绝」。</p>
        <div v-if="statusCode === 0" class="actions">
          <el-button type="primary" :loading="acting" @click="onConfirm">接受绑定</el-button>
          <el-button type="danger" plain :loading="acting" @click="onReject">拒绝</el-button>
          <el-button link type="primary" @click="refresh">刷新状态</el-button>
        </div>
        <div v-else class="actions">
          <el-button link type="primary" @click="refresh">刷新状态</el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBindStatus, confirmStudentBind, rejectStudentBind } from '@/api/studentBind.js'
import { getStudentBindUserId } from '@/utils/studentBindSession.js'

function parseBindStatusPayload(data) {
  if (data == null) return null
  if (typeof data === 'number' && !Number.isNaN(data)) return data
  if (typeof data === 'string' && data.trim() !== '') {
    const n = Number(data)
    return Number.isNaN(n) ? null : n
  }
  if (typeof data === 'object') {
    const v =
      data.verificationStatus ??
      data.verification_status ??
      data.status
    if (v != null && v !== '') {
      const n = Number(v)
      return Number.isNaN(n) ? null : n
    }
  }
  return null
}

const loading = ref(false)
const acting = ref(false)
const bindStatus = ref(null)
const bindUserId = ref('')

/** 后端返回整数状态，统一成数字以免 string 与 === 0 比较失败 */
const statusCode = computed(() => {
  const raw = bindStatus.value
  if (raw === null || raw === undefined || raw === '') return null
  const n = Number(raw)
  return Number.isNaN(n) ? null : n
})

function statusText(v) {
  if (v === null || v === undefined) return '未查询'
  const n = Number(v)
  if (Number.isNaN(n)) return '未知'
  if (n === -1) return '未绑定'
  if (n === 0) return '待确认'
  if (n === 1) return '已绑定'
  if (n === 2) return '已拒绝'
  return `状态码 ${n}`
}

function statusTagType(v) {
  if (v === null || v === undefined) return 'info'
  const n = Number(v)
  if (Number.isNaN(n)) return 'info'
  if (n === 1) return 'success'
  if (n === 0) return 'warning'
  if (n === 2) return 'info'
  if (n === -1) return 'info'
  return 'info'
}

async function refresh() {
  const sid = getStudentBindUserId()
  bindUserId.value = sid
  if (!sid) {
    bindStatus.value = null
    return
  }
  loading.value = true
  try {
    const res = await getBindStatus(sid)
    if (res.code == null ? false : Number(res.code) === 200) {
      bindStatus.value = parseBindStatusPayload(res.data)
    } else {
      ElMessage.error(res.msg || '查询失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

async function onConfirm() {
  const sid = bindUserId.value
  if (!sid) return
  try {
    await ElMessageBox.confirm('确认后将与家长建立关联，是否继续？', '接受绑定', { type: 'warning' })
    acting.value = true
    const res = await confirmStudentBind(sid)
    if (res.code === 200) {
      ElMessage.success(res.msg || '已确认')
      await refresh()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
      ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
    }
  } finally {
    acting.value = false
  }
}

async function onReject() {
  const sid = bindUserId.value
  if (!sid) return
  try {
    await ElMessageBox.confirm('拒绝后家长需重新发起绑定，是否拒绝？', '拒绝绑定', { type: 'warning' })
    acting.value = true
    const res = await rejectStudentBind(sid)
    if (res.code === 200) {
      ElMessage.success(res.msg || '已拒绝')
      await refresh()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
      ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
    }
  } finally {
    acting.value = false
  }
}

onMounted(refresh)
</script>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}
.page-head h1 {
  margin: 0 0 8px;
  font-size: 1.35rem;
}
.sub {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
}
.mb {
  margin-bottom: 20px;
}
.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.status-row .label {
  color: #64748b;
  font-size: 14px;
}
.pending-tip {
  margin: 0 0 16px;
  color: #92400e;
  font-size: 14px;
  line-height: 1.5;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
