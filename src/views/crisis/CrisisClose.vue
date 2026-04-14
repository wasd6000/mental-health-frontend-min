<template>
  <div class="crisis-closure-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">危机结案管理</span>
    </div>

    <div class="page-header">
      <div class="header-content">
        <h2>危机结案管理</h2>
        <p class="page-desc">对已处理的危机个案进行结案，记录结案原因和后续建议</p>
      </div>
      <el-button
        type="primary"
        @click="showCreateClosureDialog"
        :icon="Plus"
        :disabled="!!closureInfo.closureId"
      >
        {{ closureInfo.closureId ? '已结案' : '创建结案记录' }}
      </el-button>
    </div>

    <!-- 结案信息 -->
    <el-card class="closure-info-card" v-if="closureInfo.closureId">
      <template #header>
        <div class="card-header">
          <span>结案信息</span>
          <el-tag
            :style="{
              backgroundColor: getClosureTypeConfig(closureInfo.closureType)?.color + '20',
              color: getClosureTypeConfig(closureInfo.closureType)?.color
            }"
            effect="plain"
          >
            {{ getClosureTypeConfig(closureInfo.closureType)?.label }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="结案记录ID">{{ closureInfo.closureId }}</el-descriptions-item>
        <el-descriptions-item label="危机报告ID">{{ closureInfo.reportId }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ closureInfo.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ closureInfo.studentId }}</el-descriptions-item>
        <el-descriptions-item label="结案类型">
          <el-tag
            :style="{
              backgroundColor: getClosureTypeConfig(closureInfo.closureType)?.color + '20',
              color: getClosureTypeConfig(closureInfo.closureType)?.color
            }"
            effect="plain"
          >
            {{ getClosureTypeConfig(closureInfo.closureType)?.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="结案时间">{{ formatTime(closureInfo.closureTime) }}</el-descriptions-item>
        <el-descriptions-item label="结案人">{{ closureInfo.closerName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(closureInfo.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="结案原因" :span="2">
          <div class="description-text">{{ closureInfo.closureReason }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="最终评估" :span="2">
          <div class="description-text">{{ closureInfo.finalAssessment }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="后续建议" :span="2">
          <div class="description-text">{{ closureInfo.followUpSuggestions }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <div class="action-buttons">
        <el-button type="primary" @click="editClosure" :icon="Edit">
          编辑
        </el-button>
        <el-button type="danger" @click="deleteClosure" :icon="Delete">
          删除结案
        </el-button>
      </div>
    </el-card>

    <el-empty v-else description="该危机个案尚未结案" :image-size="200">
      <el-button type="primary" @click="showCreateClosureDialog">
        立即结案
      </el-button>
    </el-empty>

    <!-- 创建/编辑结案对话框 -->
    <el-dialog
      v-model="closureDialogVisible"
      :title="isEdit ? '编辑结案记录' : '创建结案记录'"
      width="700px"
    >
      <el-form
        :model="closureForm"
        :rules="closureRules"
        ref="closureFormRef"
        label-width="120px"
      >
        <el-form-item label="危机报告ID" prop="reportId">
          <el-input
            v-model="closureForm.reportId"
            placeholder="请输入危机报告ID"
            disabled
          />
        </el-form-item>

        <el-form-item label="结案类型" prop="closureType">
          <el-select
            v-model="closureForm.closureType"
            placeholder="请选择结案类型"
            style="width: 100%"
          >
            <el-option
              v-for="(config, key) in CLOSURE_TYPE_MAP"
              :key="key"
              :label="config.label"
              :value="key"
            >
              <span :style="{ color: config.color }">{{ config.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="结案时间" prop="closureTime">
          <el-date-picker
            v-model="closureForm.closureTime"
            type="datetime"
            placeholder="选择结案时间"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="结案人ID" prop="closerId">
          <el-input
            v-model="closureForm.closerId"
            placeholder="请输入结案人ID"
          />
        </el-form-item>

        <el-form-item label="结案原因" prop="closureReason">
          <el-input
            v-model="closureForm.closureReason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明结案原因"
          />
        </el-form-item>

        <el-form-item label="最终评估" prop="finalAssessment">
          <el-input
            v-model="closureForm.finalAssessment"
            type="textarea"
            :rows="3"
            placeholder="请输入最终评估结果"
          />
        </el-form-item>

        <el-form-item label="后续建议" prop="followUpSuggestions">
          <el-input
            v-model="closureForm.followUpSuggestions"
            type="textarea"
            :rows="3"
            placeholder="请输入后续跟进建议"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closureDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitClosure" :loading="submitting">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft, Edit, Delete } from '@element-plus/icons-vue'
import {
  getClosureRecord,
  createClosureRecord,
  updateClosureRecord,
  deleteClosureRecord,
  CLOSURE_TYPE_MAP
} from '../../api/crisisInterventionApi'

const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const closureInfo = ref({})
const closureDialogVisible = ref(false)
const isEdit = ref(false)

const closureFormRef = ref(null)
const closureForm = ref({
  closureId: '',
  reportId: '',
  closureType: '',
  closureReason: '',
  finalAssessment: '',
  followUpSuggestions: '',
  closureTime: '',
  closerId: ''
})

const closureRules = {
  reportId: [{ required: true, message: '请输入危机报告ID', trigger: 'blur' }],
  closureType: [{ required: true, message: '请选择结案类型', trigger: 'change' }],
  closureReason: [{ required: true, message: '请输入结案原因', trigger: 'blur' }],
  finalAssessment: [{ required: true, message: '请输入最终评估', trigger: 'blur' }],
  closureTime: [{ required: true, message: '请选择结案时间', trigger: 'change' }],
  closerId: [{ required: true, message: '请输入结案人ID', trigger: 'blur' }]
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const getClosureTypeConfig = (type) => {
  return CLOSURE_TYPE_MAP[type] || { label: type, color: '#6b7280' }
}

const loadClosureInfo = async () => {
  const reportId = route.query.reportId
  if (!reportId) {
    ElMessage.warning('缺少危机报告ID参数')
    return
  }

  loading.value = true
  try {
    const res = await getClosureRecord(reportId)
    if (res.code === 200) {
      closureInfo.value = res.data || {}
    } else {
      // 如果没有结案记录，不显示错误
      if (res.code !== 404) {
        ElMessage.error(res.message || '加载结案信息失败')
      }
    }
  } catch (error) {
    console.error(error)
    // 404表示没有结案记录，这是正常情况
    if (error.response?.status !== 404) {
      ElMessage.error('加载结案信息失败')
    }
  } finally {
    loading.value = false
  }
}

const showCreateClosureDialog = () => {
  isEdit.value = false
  closureForm.value = {
    reportId: route.query.reportId || '',
    closureType: '',
    closureReason: '',
    finalAssessment: '',
    followUpSuggestions: '',
    closureTime: new Date().toISOString().slice(0, 19),
    closerId: localStorage.getItem('userId') || ''
  }
  closureDialogVisible.value = true
}

const editClosure = () => {
  isEdit.value = true
  closureForm.value = {
    closureId: closureInfo.value.closureId,
    reportId: closureInfo.value.reportId,
    closureType: closureInfo.value.closureType,
    closureReason: closureInfo.value.closureReason,
    finalAssessment: closureInfo.value.finalAssessment,
    followUpSuggestions: closureInfo.value.followUpSuggestions,
    closureTime: closureInfo.value.closureTime,
    closerId: closureInfo.value.closerId
  }
  closureDialogVisible.value = true
}

const handleSubmitClosure = async () => {
  try {
    await closureFormRef.value.validate()
    submitting.value = true

    let res
    if (isEdit.value) {
      res = await updateClosureRecord(closureForm.value.closureId, closureForm.value)
    } else {
      res = await createClosureRecord(closureForm.value)
    }

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '结案成功')
      closureDialogVisible.value = false
      loadClosureInfo()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const deleteClosure = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该结案记录吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })

    submitting.value = true
    const res = await deleteClosureRecord(closureInfo.value.closureId)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      closureInfo.value = {}
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
  loadClosureInfo()
})
</script>

<style scoped>
.crisis-closure-page {
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
  background: linear-gradient(135deg, #fff 0%, #fce7f3 100%);
  border-radius: 12px;
  border: 1px solid #fbcfe8;
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

.closure-info-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description-text {
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>