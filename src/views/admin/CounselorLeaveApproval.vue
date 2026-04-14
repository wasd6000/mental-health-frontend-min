<template>
  <div class="leave-approval-page">
    <div class="page-header">
      <h2>请假审批管理</h2>
      <p>处理咨询师的请假申请</p>
    </div>

    <el-card class="filter-card">
      <el-radio-group v-model="filterStatus" @change="loadData">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="pending">待审批</el-radio-button>
        <el-radio-button label="approved">已批准</el-radio-button>
        <el-radio-button label="rejected">已拒绝</el-radio-button>
      </el-radio-group>
    </el-card>

    <el-card class="table-card">
      <el-table :data="approvalList" v-loading="loading" stripe>
        <el-table-column prop="leaveId" label="ID" width="100" />
        <el-table-column prop="counselorName" label="咨询师" width="120" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ getLeaveTypeConfig(row.leaveType)?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="150" show-overflow-tooltip />
        <el-table-column label="时间" width="260">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }} ~ {{ formatTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="天数" width="80">{{ row.days }}天</el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getLeaveStatusConfig(row.status)?.tagType">
              {{ getLeaveStatusConfig(row.status)?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'PENDING'" type="success" link @click="handleApprove(row, 'APPROVED')">批准</el-button>
            <el-button v-if="row.status === 'PENDING'" type="danger" link @click="handleApprove(row, 'REJECTED')">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="approveVisible" title="审批意见" width="500px">
      <el-input v-model="approveReason" type="textarea" :rows="4" placeholder="请输入审批意见" />
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApprove" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getLeaveApprovalList, approveLeave, LEAVE_TYPE_MAP, LEAVE_STATUS_MAP } from '../../api/leaveApi'

const loading = ref(false)
const submitting = ref(false)
const approvalList = ref([])
const filterStatus = ref('pending')
const approveVisible = ref(false)
const approveReason = ref('')
const currentLeaveId = ref('')
const actionType = ref('')

const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'
const getLeaveTypeConfig = (t) => LEAVE_TYPE_MAP[t]
const getLeaveStatusConfig = (s) => LEAVE_STATUS_MAP[s]

const loadData = async () => {
  loading.value = true
  try {
    const res = await getLeaveApprovalList(filterStatus.value ? { status: filterStatus.value } : {})
    if (res.code === 200) approvalList.value = res.data || []
  } finally {
    loading.value = false
  }
}

const handleApprove = (row, type) => {
  currentLeaveId.value = row.leaveId
  actionType.value = type
  approveReason.value = ''
  approveVisible.value = true
}

const confirmApprove = async () => {
  submitting.value = true
  try {
    const res = await approveLeave(currentLeaveId.value, {
      status: actionType.value,
      approveReason: approveReason.value
    })
    if (res.code === 200) {
      ElMessage.success('审批成功')
      approveVisible.value = false
      loadData()
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.leave-approval-page { padding: 20px; background: #f5f7fa; min-height: 100vh; }
.page-header { margin-bottom: 20px; }
.filter-card { margin-bottom: 20px; }
</style>