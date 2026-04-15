<template>
  <div class="tutor-activity-manage">
    <div class="page-header">
      <h1>活动管理</h1>
      <el-button type="primary" @click="handleCreate">发布新活动</el-button>
    </div>

    <el-card class="list-card" shadow="never" v-loading="loading">
      <div class="filter-bar">
        <el-input
          v-model="searchTitle"
          placeholder="搜索活动标题"
          clearable
          style="width: 240px"
          @clear="loadList"
          @keyup.enter="loadList"
        />
        <el-select
          v-model="statusFilter"
          placeholder="活动状态"
          clearable
          style="width: 140px"
          @change="loadList"
        >
          <el-option label="全部" value="" />
          <el-option label="草稿" value="DRAFT" />
          <el-option label="已发布" value="PUBLISHED" />
          <el-option label="已结束" value="FINISHED" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
        <el-button type="primary" @click="loadList">查询</el-button>
      </div>

      <el-table :data="list" stripe style="width: 100%">
        <el-table-column prop="title" label="活动标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="location" label="活动地点" width="140" />
        <el-table-column label="活动时间" width="200">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }} ~ {{ formatTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="报名时间" width="200">
          <template #default="{ row }">
            {{ formatTime(row.joinStartTime) }} ~ {{ formatTime(row.joinEndTime) }}
          </template>
        </el-table-column>
        <el-table-column label="报名人数" width="120" align="center">
          <template #default="{ row }">
            {{ row.joinedCount || 0 }}{{ row.capacity ? `/${row.capacity}` : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === 'PUBLISHED'"
              type="warning"
              link
              size="small"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && list.length === 0" description="暂无活动" />

      <div v-if="total > pageSize" class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="loadList"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTutorActivities,
  deleteTutorActivity,
  cancelTutorActivity
} from '../../api/tutorApi'

const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchTitle = ref('')
const statusFilter = ref('')

async function loadList() {
  loading.value = true
  try {
    const res = await getTutorActivities({
      page: currentPage.value,
      pageSize: pageSize.value,
      title: searchTitle.value || undefined,
      status: statusFilter.value || undefined,
    })

    if (res?.code === 200 && res.data) {
      list.value = res.data.list || res.data.records || []
      total.value = res.data.total || 0
    } else {
      list.value = []
      total.value = 0
      ElMessage.warning('获取数据失败')
    }
  } catch (e) {
    console.error('加载活动列表失败:', e)
    ElMessage.error('加载活动列表失败')
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onSizeChange() {
  currentPage.value = 1
  loadList()
}

function handleCreate() {
  router.push('/admin/activity-create')
}

function handleView(row) {
  router.push(`/student/activity/${row.activityId}`)
}

function handleEdit(row) {
  router.push(`/admin/activity-edit/${row.activityId}`)
}

async function handleCancel(row) {
  try {
    await ElMessageBox.confirm('确定要取消该活动吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await cancelTutorActivity(row.activityId)
    if (res?.code === 200) {
      ElMessage.success('活动已取消')
      await loadList()
    } else {
      ElMessage.error(res?.msg || '取消失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('取消活动失败:', e)
      ElMessage.error(e?.response?.data?.msg || e?.message || '取消失败')
    }
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定要删除该活动吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })

    const res = await deleteTutorActivity(row.activityId)
    if (res?.code === 200) {
      ElMessage.success('活动已删除')
      await loadList()
    } else {
      ElMessage.error(res?.msg || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除活动失败:', e)
      ElMessage.error(e?.response?.data?.msg || e?.message || '删除失败')
    }
  }
}

function getStatusType(status) {
  const map = {
    DRAFT: 'info',
    PUBLISHED: 'success',
    FINISHED: '',
    CANCELLED: 'danger'
  }
  return map[status] || ''
}

function getStatusText(status) {
  const map = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    FINISHED: '已结束',
    CANCELLED: '已取消'
  }
  return map[status] || status
}

function formatTime(time) {
  if (!time) return '-'
  const d = new Date(time)
  if (isNaN(d.getTime())) return time
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.tutor-activity-manage {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 22px;
  color: #1f2937;
}

.list-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
