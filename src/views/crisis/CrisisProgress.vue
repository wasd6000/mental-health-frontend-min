<template>
  <div class="crisis-progress-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">危机进展跟踪</span>
    </div>

    <div class="page-header">
      <div class="header-content">
        <h2>危机进展跟踪</h2>
        <p class="page-desc">记录危机处理的每个阶段，跟踪干预效果和学生状态变化</p>
      </div>
      <el-button type="primary" @click="showAddProgressDialog" :icon="Plus">
        添加进展
      </el-button>
    </div>

    <!-- 进展统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ progressList.length }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value improving">{{ improvingCount }}</div>
            <div class="stat-label">好转次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value stable">{{ stableCount }}</div>
            <div class="stat-label">稳定次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-value urgent">{{ urgentCount }}</div>
            <div class="stat-label">紧急情况</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 进展列表 -->
    <el-card class="progress-card">
      <template #header>
        <div class="card-header">
          <span>进展记录</span>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="timeline">时间轴</el-radio-button>
            <el-radio-button label="table">表格</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 时间轴视图 -->
      <el-timeline v-if="viewMode === 'timeline'" class="progress-timeline">
        <el-timeline-item
          v-for="item in progressList"
          :key="item.progressId"
          :timestamp="formatTime(item.progressTime)"
          placement="top"
          :color="getProgressTypeConfig(item.progressType)?.color"
        >
          <el-card class="progress-item-card">
            <div class="progress-item-header">
              <el-tag
                :style="{
                  backgroundColor: getProgressTypeConfig(item.progressType)?.color + '20',
                  color: getProgressTypeConfig(item.progressType)?.color
                }"
                effect="plain"
              >
                {{ getProgressTypeConfig(item.progressType)?.label }}
              </el-tag>
              <el-tag
                :type="getStatusTagType(item.currentStatus)"
                size="small"
              >
                {{ getCurrentStatusConfig(item.currentStatus)?.label }}
              </el-tag>
            </div>

            <div class="progress-content">
              <p class="description">{{ item.progressDescription }}</p>
              <div class="next-steps" v-if="item.nextSteps">
                <strong>下一步计划：</strong>
                <span>{{ item.nextSteps }}</span>
              </div>
            </div>

            <div class="progress-footer">
              <span class="recorder">记录人：{{ item.recorderName }}</span>
              <div class="actions">
                <el-button type="primary" link size="small" @click="editProgress(item)">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click="deleteProgress(item)">
                  删除
                </el-button>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- 表格视图 -->
      <el-table v-else :data="progressList" v-loading="loading" stripe>
        <el-table-column label="进展类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :style="{
                backgroundColor: getProgressTypeConfig(row.progressType)?.color + '20',
                color: getProgressTypeConfig(row.progressType)?.color
              }"
              effect="plain"
            >
              {{ getProgressTypeConfig(row.progressType)?.label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="progressDescription" label="进展描述" min-width="250" show-overflow-tooltip />

        <el-table-column label="当前状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.currentStatus)" size="small">
              {{ getCurrentStatusConfig(row.currentStatus)?.label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="nextSteps" label="下一步计划" min-width="200" show-overflow-tooltip />

        <el-table-column label="记录人" width="120">
          <template #default="{ row }">
            {{ row.recorderName }}
          </template>
        </el-table-column>

        <el-table-column label="记录时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.progressTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editProgress(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="deleteProgress(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!progressList.length && !loading" description="暂无进展记录" />
    </el-card>

    <!-- 添加/编辑进展对话框 -->
    <el-dialog
      v-model="progressDialogVisible"
      :title="isEdit ? '编辑进展记录' : '添加进展记录'"
      width="700px"
    >
      <el-form
        :model="progressForm"
        :rules="progressRules"
        ref="progressFormRef"
        label-width="120px"
      >
        <el-form-item label="进展类型" prop="progressType">
          <el-select
            v-model="progressForm.progressType"
            placeholder="请选择进展类型"
            style="width: 100%"
          >
            <el-option
              v-for="(config, key) in PROGRESS_TYPE_MAP"
              :key="key"
              :label="config.label"
              :value="key"
            >
              <span :style="{ color: config.color }">{{ config.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="当前状态" prop="currentStatus">
          <el-select
            v-model="progressForm.currentStatus"
            placeholder="请选择当前状态"
            style="width: 100%"
          >
            <el-option
              v-for="(config, key) in CURRENT_STATUS_MAP"
              :key="key"
              :label="config.label"
              :value="key"
            >
              <span :style="{ color: config.color }">{{ config.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="进展描述" prop="progressDescription">
          <el-input
            v-model="progressForm.progressDescription"
            type="textarea"
            :rows="4"
            placeholder="请详细描述进展情况"
          />
        </el-form-item>

        <el-form-item label="下一步计划" prop="nextSteps">
          <el-input
            v-model="progressForm.nextSteps"
            type="textarea"
            :rows="3"
            placeholder="请输入下一步工作计划"
          />
        </el-form-item>

        <el-form-item label="记录人ID" prop="recorderId">
          <el-input
            v-model="progressForm.recorderId"
            placeholder="请输入记录人ID"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="progressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitProgress" :loading="submitting">
          {{ isEdit ? '更新' : '添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import {
  getProgressList,
  createProgressRecord,
  updateProgressRecord,
  deleteProgressRecord,
  PROGRESS_TYPE_MAP,
  CURRENT_STATUS_MAP
} from '../../api/crisisInterventionApi'

const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const progressList = ref([])
const viewMode = ref('timeline')
const progressDialogVisible = ref(false)
const isEdit = ref(false)

const progressFormRef = ref(null)
const progressForm = ref({
  progressId: '',
  reportId: '',
  progressType: '',
  progressDescription: '',
  currentStatus: '',
  nextSteps: '',
  recorderId: ''
})

const progressRules = {
  progressType: [{ required: true, message: '请选择进展类型', trigger: 'change' }],
  currentStatus: [{ required: true, message: '请选择当前状态', trigger: 'change' }],
  progressDescription: [{ required: true, message: '请输入进展描述', trigger: 'blur' }],
  recorderId: [{ required: true, message: '请输入记录人ID', trigger: 'blur' }]
}

const improvingCount = computed(() => {
  return progressList.value.filter(item => item.currentStatus === 'IMPROVING').length
})

const stableCount = computed(() => {
  return progressList.value.filter(item => item.currentStatus === 'STABLE').length
})

const urgentCount = computed(() => {
  return progressList.value.filter(item => item.currentStatus === 'URGENT').length
})

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const getProgressTypeConfig = (type) => {
  return PROGRESS_TYPE_MAP[type] || { label: type, color: '#6b7280' }
}

const getCurrentStatusConfig = (status) => {
  return CURRENT_STATUS_MAP[status] || { label: status, color: '#6b7280' }
}

const getStatusTagType = (status) => {
  const typeMap = {
    IMPROVING: 'success',
    STABLE: 'primary',
    WORSENING: 'warning',
    URGENT: 'danger'
  }
  return typeMap[status] || 'info'
}

const loadProgressList = async () => {
  const reportId = route.query.reportId
  if (!reportId) {
    ElMessage.warning('缺少危机报告ID参数')
    return
  }

  loading.value = true
  try {
    const res = await getProgressList(reportId)
    if (res.code === 200) {
      progressList.value = res.data || []
    } else {
      ElMessage.error(res.message || '加载进展列表失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('加载进展列表失败')
  } finally {
    loading.value = false
  }
}

const showAddProgressDialog = () => {
  isEdit.value = false
  progressForm.value = {
    reportId: route.query.reportId || '',
    progressType: '',
    progressDescription: '',
    currentStatus: '',
    nextSteps: '',
    recorderId: localStorage.getItem('userId') || ''
  }
  progressDialogVisible.value = true
}

const editProgress = (row) => {
  isEdit.value = true
  progressForm.value = {
    progressId: row.progressId,
    reportId: row.reportId,
    progressType: row.progressType,
    progressDescription: row.progressDescription,
    currentStatus: row.currentStatus,
    nextSteps: row.nextSteps,
    recorderId: row.recorderId
  }
  progressDialogVisible.value = true
}

const handleSubmitProgress = async () => {
  try {
    await progressFormRef.value.validate()
    submitting.value = true

    let res
    if (isEdit.value) {
      res = await updateProgressRecord(progressForm.value.progressId, progressForm.value)
    } else {
      res = await createProgressRecord(progressForm.value)
    }

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      progressDialogVisible.value = false
      loadProgressList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const deleteProgress = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该进展记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    submitting.value = true
    const res = await deleteProgressRecord(row.progressId)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadProgressList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadProgressList()
})
</script>

<style scoped>
.crisis-progress-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #ecfdf5 100%);
  border-radius: 12px;
  border: 1px solid #a7f3d0;
}

.header-content h2 {
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
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px 0;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.stat-value.improving {
  color: #16a34a;
}

.stat-value.stable {
  color: #3b82f6;
}

.stat-value.urgent {
  color: #dc2626;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.progress-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-timeline {
  padding: 20px 0;
}

.progress-item-card {
  border: 1px solid #e2e8f0;
}

.progress-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-content {
  margin-bottom: 12px;
}

.description {
  margin: 0 0 8px 0;
  color: #334155;
  line-height: 1.6;
}

.next-steps {
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 13px;
  color: #64748b;
}

.next-steps strong {
  color: #1e293b;
}

.progress-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.recorder {
  font-size: 13px;
  color: #64748b;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>