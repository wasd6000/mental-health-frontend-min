<template>
  <div class="page-wrap">
    <div class="toolbar">
      <el-button link type="primary" @click="goBack">
        <el-icon class="el-icon--left"><ArrowLeft /></el-icon>返回列表
      </el-button>
    </div>

    <div class="page-head">
      <div class="head-main">
        <h2>测评方案详情</h2>
        <p v-if="plan" class="page-desc">{{ plan.planName }}</p>
      </div>
    </div>

    <el-card v-loading="loading" class="detail-card" shadow="never">
      <template v-if="errorMsg">
        <el-alert type="error" :title="errorMsg" show-icon :closable="false" />
      </template>
      <template v-else-if="plan">
        <dl class="detail-grid">
          <dt>方案编号</dt>
          <dd>{{ plan.planId || '—' }}</dd>
          <dt>方案名称</dt>
          <dd>{{ plan.planName || '—' }}</dd>
          <dt>量表模板</dt>
          <dd>{{ plan.templateId || '—' }}</dd>
          <dt>量表类型</dt>
          <dd>{{ plan.scaleType || '—' }}</dd>
          <dt>量表名称</dt>
          <dd>{{ plan.scaleName || '—' }}</dd>
          <dt>适用对象</dt>
          <dd>{{ plan.targetRole || '—' }}</dd>
          <dt>开始时间</dt>
          <dd>{{ formatDateTime(plan.startTime) }}</dd>
          <dt>结束时间</dt>
          <dd>{{ formatDateTime(plan.endTime) }}</dd>
          <dt>最多作答次数</dt>
          <dd>{{ plan.maxAttempts != null ? plan.maxAttempts : '—' }}</dd>
          <dt>状态</dt>
          <dd>
            <el-tag :type="statusTagType(plan.status)" size="small">{{ statusLabel(plan.status) }}</el-tag>
          </dd>
          <dt>我已作答次数</dt>
          <dd>{{ plan.myAttemptCount != null ? plan.myAttemptCount : '—' }}</dd>
          <dt>题目数量</dt>
          <dd>{{ questionCount != null ? questionCount : '—' }}</dd>
        </dl>
        <div v-if="plan.description" class="desc-block">
          <h3>说明</h3>
          <p>{{ plan.description }}</p>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getAssessmentPlanDetail } from '../../api/assessment.js'
import { isApiSuccess } from '../../api/helpers.js'

const PLAN_STATUS_LABEL: Record<number, string> = {
  0: '草稿',
  1: '进行中',
  2: '已结束',
}

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const errorMsg = ref('')
const plan = ref<Record<string, unknown> | null>(null)
const questionCount = ref<number | null>(null)

const planIdParam = computed(() => String(route.params.planId || route.query.planId || ''))

function statusLabel(status: unknown) {
  if (status == null || status === '') return '—'
  if (typeof status === 'number') return PLAN_STATUS_LABEL[status] ?? String(status)
  return String(status)
}

function statusTagType(status: unknown) {
  if (status === 1) return 'success'
  if (status === 2) return 'info'
  if (status === 0) return 'warning'
  return 'primary'
}

function formatDateTime(v: unknown) {
  if (v == null || v === '') return '—'
  const s = typeof v === 'string' ? v : String(v)
  return s.length >= 16 ? s.slice(0, 16).replace('T', ' ') : s
}

function goBack() {
  router.push('/admin/assessment-list')
}

async function load() {
  const id = planIdParam.value.trim()
  if (!id) {
    errorMsg.value = '缺少方案编号'
    plan.value = null
    questionCount.value = null
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getAssessmentPlanDetail(id)
    if (!isApiSuccess(res)) {
      throw new Error((res as { msg?: string })?.msg ?? '加载失败')
    }
    const data = (res as { data?: Record<string, unknown> }).data
    if (!data || typeof data !== 'object') {
      throw new Error('暂无数据')
    }
    const p = data.plan
    plan.value = p != null && typeof p === 'object' ? (p as Record<string, unknown>) : null
    const qc = data.questionCount
    questionCount.value = typeof qc === 'number' ? qc : qc != null ? Number(qc) : null
  } catch (e: unknown) {
    plan.value = null
    questionCount.value = null
    errorMsg.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

watch(planIdParam, () => load(), { immediate: true })
</script>

<style scoped>
.page-wrap {
  max-width: 880px;
  padding: 0;
}

.toolbar {
  margin-bottom: 12px;
}

.page-head {
  margin-bottom: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
  border-radius: 14px;
  border: 1px solid #bae6fd;
}

.head-main h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.page-desc {
  margin: 0;
  font-size: 15px;
  color: #475569;
  font-weight: 500;
}

.detail-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px 20px;
  margin: 0;
  font-size: 14px;
}

.detail-grid dt {
  margin: 0;
  color: #64748b;
  font-weight: 500;
}

.detail-grid dd {
  margin: 0;
  color: #1e293b;
}

.desc-block {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.desc-block h3 {
  margin: 0 0 10px 0;
  font-size: 15px;
  color: #334155;
}

.desc-block p {
  margin: 0;
  line-height: 1.65;
  color: #475569;
  white-space: pre-wrap;
}
</style>
