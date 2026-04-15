<template>
  <div class="page-wrap">
    <div class="page-head">
      <div class="head-main">
        <h2>个案列表</h2>
        <p class="page-desc">管理心理咨询个案，查看个案详情与跟进进度。</p>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-value">{{ cases.length }}</span>
        <span class="stat-label">全部个案</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ openCount }}</span>
        <span class="stat-label">进行中</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ closedCount }}</span>
        <span class="stat-label">已结案</span>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="cases" stripe v-loading="loading" style="width: 100%">
        <template #empty>
          <el-empty v-if="!loading" description="暂无个案" />
        </template>
        <el-table-column prop="id" label="个案编号" width="120" />
        <el-table-column prop="student_name" label="学生姓名" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">import { ref, computed, onMounted } from 'vue'
import { getCounselorCases } from '../../api/case'
import { useRouter } from 'vue-router'

const cases = ref<any[]>([])
const loading = ref(false)
const router = useRouter()

const openCount = computed(() =>
    cases.value.filter((c) => c.status && c.status !== '已结案' && c.status !== 'closed').length
)
const closedCount = computed(() =>
    cases.value.filter((c) => c.status === '已结案' || c.status === 'closed').length
)

function getStatusType(status: string) {
  if (!status) return 'info'
  if (status === '已结案' || status === 'closed') return 'info'
  return 'primary'
}

function viewDetail(row: any) {
  router.push(`/case/${row.id}`)
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getCounselorCases()
    // 处理分页响应格式
    const data = res?.data || res
    cases.value = Array.isArray(data) ? data : (data?.list || data?.records || [])
  } catch {
    cases.value = []
  }
  loading.value = false
})
</script>

<style scoped>
.page-wrap {
  max-width: 1000px;
  padding: 0;
}

.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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

.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e4f9c;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.table-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}
</style>
