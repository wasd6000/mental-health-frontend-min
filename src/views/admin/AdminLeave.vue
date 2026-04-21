<template>
  <div class="admin-leave">
    <div class="page-head">
      <div class="head-main">
        <h2>请假审批</h2>
        <p class="page-desc">咨询师提交请假后，由系统管理员或心理中心审批；通过后相关咨询时段将关闭或调整。</p>
      </div>
      <div class="head-actions">
        <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane name="pending">
        <template #label>
          <span>待审批</span>
          <el-badge v-if="pendingList.length" :value="pendingList.length" type="danger" class="tab-badge" />
        </template>
        <el-card class="section-card" shadow="never">
          <el-empty v-if="!pendingList.length" description="暂无待审批的请假申请" />
          <el-table v-else :data="pendingList" stripe>
            <el-table-column prop="counselorName" label="咨询师" width="100" />
            <el-table-column label="请假日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column label="时间段" width="180">
              <template #default="{ row }">
                {{ formatTime(row.startTime) }} - {{ formatTime(row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="请假原因" min-width="200" show-overflow-tooltip />
            <el-table-column label="申请时间" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="success" link size="small" @click="approve(row)">通过</el-button>
                <el-button type="danger" link size="small" @click="reject(row)">拒绝</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="已处理" name="processed">
        <el-card class="section-card" shadow="never">
          <el-form :inline="true" class="filter-form">
            <el-form-item label="状态">
              <el-select v-model="filterStatus" placeholder="全部" clearable style="width: 100px">
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="loadProcessed">查询</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="processedList" stripe>
            <el-table-column prop="counselorName" label="咨询师" width="100" />
            <el-table-column label="请假日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column label="时间段" width="180">
              <template #default="{ row }">
                {{ formatTime(row.startTime) }} - {{ formatTime(row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="请假原因" min-width="180" show-overflow-tooltip />
            <el-table-column prop="status" label="审批结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'APPROVED' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'APPROVED' ? '已通过' : '已拒绝' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="审批时间" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.updatedAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="approverName" label="审批人" width="100" />
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="rejectVisible" title="拒绝原因" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因（选填）" />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>import { ref, onMounted, watch } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getLeaveApprovalList,
  getProcessedLeaveList,
  approveLeave,
  rejectLeave
} from '../../api/leaveApi'

// 日期格式化工具
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatTime(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const activeTab = ref('pending')
const filterStatus = ref('')
const pendingList = ref([])
const processedList = ref([])
const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectTarget = ref(null)

async function loadData() {
  try {
    const res = await getLeaveApprovalList({ status: 'pending' })
    if (res?.code === 200 && Array.isArray(res.data)) {
      pendingList.value = res.data
      // 调试：查看第一条数据的结构
      if (res.data.length > 0) {
        console.log('📋 请假数据结构示例:', res.data[0])
        console.log('🔑 可用的ID字段:', {
          id: res.data[0].id,
          leaveId: res.data[0].leaveId,
          leave_id: res.data[0].leave_id
        })
      }
    } else {
      pendingList.value = []
      ElMessage.warning('获取待审批列表失败')
    }
  } catch (e) {
    console.error('加载待审批列表失败:', e)
    pendingList.value = []
    ElMessage.error('加载数据失败，请稍后重试')
  }
}

async function loadProcessed() {
  try {
    const params = {}
    if (filterStatus.value) {
      params.status = filterStatus.value
    }
    const res = await getLeaveApprovalList(params)
    if (res?.code === 200 && Array.isArray(res.data)) {
      // 已处理标签页只显示 APPROVED 和 REJECTED 状态
      // 当筛选"全部"时，后端返回所有状态，需要前端过滤
      const processedStatuses = ['APPROVED', 'REJECTED']
      processedList.value = res.data.filter(item => processedStatuses.includes(item.status))
    } else {
      processedList.value = []
      ElMessage.warning('获取已处理列表失败')
    }
  } catch (e) {
    console.error('加载已处理列表失败:', e)
    processedList.value = []
    ElMessage.error('加载数据失败，请稍后重试')
  }
}

watch(activeTab, (val) => {
  if (val === 'processed') {
    loadProcessed()
  }
})

function approve(row) {
  // 兼容不同的ID字段名
  const leaveId = row.id || row.leaveId || row.leave_id

  if (!leaveId) {
    console.error('❌ 错误：无法获取请假ID', row)
    ElMessage.error('数据异常：缺少请假ID')
    return
  }

  ElMessageBox.confirm('通过后将自动关闭该时段排班，学生无法预约。确定通过？', '确认通过', {
    type: 'info',
  })
      .then(async () => {
        try {
          console.log('✅ 审批请假ID:', leaveId)
          const res = await approveLeave(leaveId, {})
          if (res?.code === 200) {
            ElMessage.success('已通过')
            await loadData()
          } else {
            ElMessage.error(res?.msg || '审批失败')
          }
        } catch (e) {
          console.error('审批失败:', e)
          ElMessage.error(e?.response?.data?.msg || e?.message || '审批失败')
        }
      })
      .catch(() => {})
}

function reject(row) {
  rejectTarget.value = row
  rejectReason.value = ''
  rejectVisible.value = true
}

async function confirmReject() {
  const row = rejectTarget.value
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写拒绝原因')
    return
  }

  // 兼容不同的ID字段名
  const leaveId = row.id || row.leaveId || row.leave_id

  if (!leaveId) {
    console.error('❌ 错误：无法获取请假ID', row)
    ElMessage.error('数据异常：缺少请假ID')
    return
  }

  try {
    console.log('✅ 拒绝请假ID:', leaveId)
    const res = await rejectLeave(leaveId, { reason: rejectReason.value })
    if (res?.code === 200) {
      ElMessage.success('已拒绝')
      rejectVisible.value = false
      await loadData()
    } else {
      ElMessage.error(res?.msg || '拒绝失败')
    }
  } catch (e) {
    console.error('拒绝失败:', e)
    ElMessage.error(e?.response?.data?.msg || e?.message || '拒绝失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-leave { max-width: 1000px; }

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

.head-main h2 { margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #1e293b; }
.page-desc { margin: 0; font-size: 14px; color: #64748b; }

.main-tabs {
  background: #fff;
  padding: 20px 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.tab-badge { margin-left: 6px; }

.section-card { border: none; box-shadow: none; margin-top: 16px; }
.filter-form { margin-bottom: 16px; }
</style>
