<template>
  <div class="page-wrap">
    <div class="page-head">
      <div class="head-main">
        <h2>测评管理</h2>
        <p class="page-desc">查看心理测评方案列表与方案说明。</p>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table v-loading="surveyLoading" :data="surveyList" stripe style="width: 100%">
        <el-table-column prop="id" label="方案编号" width="140" show-overflow-tooltip />
        <el-table-column prop="name" label="方案名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="date" label="时间" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ row.status || '—' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.id"
              type="primary"
              link
              @click="goDetail(row.id)"
            >
              查看详情
            </el-button>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="surveyTotal > 0" class="pager-wrap">
        <el-pagination
          v-model:current-page="surveyPage"
          v-model:page-size="surveyPageSize"
          :total="surveyTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="onSurveyPageChange"
          @size-change="onSurveySizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSurveyList } from '../../api/assessment.js'

const router = useRouter()

const surveyList = ref<{ id: string; name: string; date: string; status: string }[]>([])
const surveyLoading = ref(false)
const surveyPage = ref(1)
const surveyPageSize = ref(20)
const surveyTotal = ref(0)

function statusTagType(status: string) {
  if (status === '已结束') return 'info'
  if (status === '进行中') return 'success'
  if (status === '草稿') return 'warning'
  if (status === '已完成') return 'success'
  return 'primary'
}

function goDetail(planId: string) {
  router.push({ name: 'AdminAssessmentPlanDetail', params: { planId } })
}

function onSurveyPageChange() {
  loadSurvey()
}

function onSurveySizeChange() {
  surveyPage.value = 1
  loadSurvey()
}

async function loadSurvey() {
  surveyLoading.value = true
  try {
    const { records, total } = await getSurveyList({
      page: surveyPage.value,
      pageSize: surveyPageSize.value,
    })
    surveyList.value = records
    surveyTotal.value = total
  } catch (_) {
    surveyList.value = []
    surveyTotal.value = 0
  } finally {
    surveyLoading.value = false
  }
}

onMounted(() => loadSurvey())
</script>

<style scoped>
.page-wrap {
  max-width: 1000px;
  padding: 0;
}

.page-head {
  margin-bottom: 24px;
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
  font-size: 14px;
  color: #64748b;
}

.table-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.pager-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.text-muted {
  color: #94a3b8;
  font-size: 13px;
}
</style>
