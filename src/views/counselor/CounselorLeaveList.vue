<template>
  <div class="leave-list-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">我的请假</span>
    </div>

    <div class="page-header">
      <div class="header-content">
        <h2>我的请假记录</h2>
        <p class="page-desc">查看和管理您的请假申请</p>
      </div>
      <el-button type="primary" @click="goToApply" :icon="Plus">
        提交申请
      </el-button>
    </div>

    <!-- 状态筛选 -->
    <el-card class="filter-card">
      <el-radio-group v-model="filterStatus" @change="loadData">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button label="PENDING">待审批</el-radio-button>
        <el-radio-button label="APPROVED">已批准</el-radio-button>
        <el-radio-button label="REJECTED">已拒绝</el-radio-button>
        <el-radio-button label="CANCELLED">已取消</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 请假列表 -->
    <el-card class="table-card">
      <el-table :data="leaveList" v-loading="loading" stripe>
        <el-table-column prop="leaveId" label="请假ID" width="120" />

        <el-table-column label="请假类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :style="{
                backgroundColor: getLeaveTypeConfig(row.leaveType)?.color + '20',
                color: getLeaveTypeConfig(row.leaveType)?.color
              }"
              effect="plain"
            >
              {{ getLeaveTypeConfig(row.leaveType)?.label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="请假原因" min-width="200" show-overflow-tooltip />

        <el-table-column label="请假时间" width="280">
          <template #default="{ row }">
            <div class="time-range">
              <span>{{ formatTime(row.startTime) }}</span>
              <el-icon><Right /></el-icon>
              <span>{{ formatTime(row.endTime) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="天数" width="80" align="center">
          <template #default="{ row }">
            {{ row.days }}天
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getLeaveStatusConfig(row.status)?.tagType">
              {{ getLeaveStatusConfig(row.status)?.label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="审批意见" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.approveReason || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              type="warning"
              link
              size="small"
              @click="editLeave(row)"
            >
              修改
            </el-button>
            <el-button
              v-if="row.status === 'PENDING' || row.status === 'APPROVED'"
              type="danger"
              link
              size="small"
              @click="cancelLeave(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!leaveList.length && !loading" description="暂无请假记录" />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="请假详情" width="600px">
      <el-descriptions :column="1" border v-if="currentLeave">
        <el-descriptions-item label="请假ID">{{ currentLeave.leaveId }}</el-descriptions-item>
        <el-descriptions-item label="请假类型">
          <el-tag
            :style="{
              backgroundColor: getLeaveTypeConfig(currentLeave.leaveType)?.color + '20',
              color: getLeaveTypeConfig(currentLeave.leaveType)?.color
            }"
            effect="plain"
          >
            {{ getLeaveTypeConfig(currentLeave.leaveType)?.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="请假原因">{{ currentLeave.reason }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ formatTime(currentLeave.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatTime(currentLeave.endTime) }}</el-descriptions-item>
        <el-descriptions-item label="请假天数">{{ currentLeave.days }}天</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getLeaveStatusConfig(currentLeave.status)?.tagType">
            {{ getLeaveStatusConfig(currentLeave.status)?.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批意见">{{ currentLeave.approveReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="取消原因">{{ currentLeave.cancelReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ formatTime(currentLeave.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog v-model="editVisible" title="修改请假申请" width="600px">
      <el-form
        :model="editForm"
        :rules="leaveRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="editForm.leaveType" style="width: 100%">
            <el-option
              v-for="(config, key) in LEAVE_TYPE_MAP"
              :key="key"
              :label="config.label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input v-model="editForm.reason" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="editForm.startTime"
            type="datetime"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="editForm.endTime"
            type="datetime"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="天数">
          <el-input-number v-model="editForm.days" :min="0.5" :step="0.5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate" :loading="submitting">更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Right } from '@element-plus/icons-vue'
import {
  getMyLeaveList,
  updateLeave,
  cancelLeave,
  LEAVE_TYPE_MAP,
  LEAVE_STATUS_MAP
} from '../../api/leaveApi'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const leaveList = ref([])
const filterStatus = ref('')
const detailVisible = ref(false)
const editVisible = ref(false)
const currentLeave = ref(null)

const editFormRef = ref(null)
const editForm = ref({
  leaveId: '',
  leaveType: '',
  reason: '',
  startTime: '',
  endTime: '',
  days: 1
})

const leaveRules = {
  leaveType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  reason: [{ required: true, message: '请输入原因', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const getLeaveTypeConfig = (type) => LEAVE_TYPE_MAP[type] || { label: type, color: '#6b7280' }
const getLeaveStatusConfig = (status) => LEAVE_STATUS_MAP[status] || { label: status, tagType: 'info' }

const loadData = async () => {
  const counselorId = localStorage.getItem('userId')
  if (!counselorId) return

  loading.value = true
  try {
    const res = await getMyLeaveList(counselorId)
    if (res.code === 200) {
      let list = res.data || []
      if (filterStatus.value) {
        list = list.filter(item => item.status === filterStatus.value)
      }
      leaveList.value = list
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const goToApply = () => {
  router.push('/counselor/leave/apply')
}

const viewDetail = (row) => {
  currentLeave.value = row
  detailVisible.value = true
}

const editLeave = (row) => {
  editForm.value = {
    leaveId: row.leaveId,
    leaveType: row.leaveType,
    reason: row.reason,
    startTime: row.startTime,
    endTime: row.endTime,
    days: row.days
  }
  editVisible.value = true
}

const handleUpdate = async () => {
  try {
    await editFormRef.value.validate()
    submitting.value = true
    const res = await updateLeave(editForm.value.leaveId, editForm.value)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      editVisible.value = false
      loadData()
    }
  } finally {
    submitting.value = false
  }
}

const cancelLeave = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入取消原因', '取消请假', {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    const res = await cancelLeave(row.leaveId, { cancelReason: value })
    if (res.code === 200) {
      ElMessage.success('取消成功')
      loadData()
    }
  } catch {}
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.leave-list-page { padding: 20px; background: #f5f7fa; min-height: 100vh; }
.page-nav { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 12px 16px; background: #fff; border-radius: 8px; }
.page-header { display: flex; justify-content: space-between; margin-bottom: 20px; padding: 20px; background: #fff; border-radius: 12px; }
.filter-card { margin-bottom: 20px; }
.time-range { display: flex; align-items: center; gap: 8px; font-size: 13px; }
</style>