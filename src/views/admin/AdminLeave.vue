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
            <el-table-column prop="leaveDate" label="请假日期" width="120" />
            <el-table-column prop="leaveTime" label="时间段" width="120" />
            <el-table-column prop="reason" label="请假原因" min-width="200" show-overflow-tooltip />
            <el-table-column prop="applyTime" label="申请时间" width="160" />
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
            <el-table-column prop="leaveDate" label="请假日期" width="120" />
            <el-table-column prop="leaveTime" label="时间段" width="120" />
            <el-table-column prop="reason" label="请假原因" min-width="180" show-overflow-tooltip />
            <el-table-column prop="status" label="审批结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'approved' ? 'success' : 'info'" size="small">
                  {{ row.status === 'approved' ? '已通过' : '已拒绝' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="approveTime" label="审批时间" width="160" />
            <el-table-column prop="approver" label="审批人" width="100" />
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
import { getLeaveApprovalList, approveLeave, rejectLeave } from '../../api/leaveApi'

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
      processedList.value = res.data
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
  ElMessageBox.confirm('通过后将自动关闭该时段排班，学生无法预约。确定通过？', '确认通过', {
    type: 'info',
  })
      .then(async () => {
        try {
          const res = await approveLeave({ id: row.id })
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

  try {
    const res = await rejectLeave({ id: row.id, reason: rejectReason.value })
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
