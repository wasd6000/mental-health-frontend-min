<template>
  <div class="crisis-visit-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">来访登记</span>
    </div>

    <div class="page-header">
      <div class="header-content">
        <h2>来访登记表</h2>
        <p class="page-desc">记录学生首次来访的基本信息和主要问题</p>
      </div>
    </div>

    <!-- 已登记状态 -->
    <el-card v-if="visitInfo.registrationId" class="visit-card">
      <template #header>
        <div class="card-header">
          <span>来访登记信息</span>
          <el-tag type="success" :icon="Check">已登记</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="登记ID">{{ visitInfo.registrationId }}</el-descriptions-item>
        <el-descriptions-item label="预约ID">{{ visitInfo.appointmentId }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ visitInfo.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ visitInfo.studentNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="来访日期">{{ visitInfo.visitDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="来访时间">{{ visitInfo.visitTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="咨询主题" :span="2">{{ visitInfo.consultationTopic || '-' }}</el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="2">
          <div class="description-text">{{ visitInfo.problemDescription || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="既往咨询史" :span="2">
          <div class="description-text">{{ visitInfo.previousConsultation || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="当前用药情况" :span="2">
          <div class="description-text">{{ visitInfo.currentMedication || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="紧急联系人">{{ visitInfo.emergencyContact || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ visitInfo.emergencyPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          <div class="description-text">{{ visitInfo.remarks || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <div class="action-buttons">
        <el-button type="primary" @click="editVisit" :icon="Edit">
          修改
        </el-button>
      </div>
    </el-card>

    <!-- 未登记状态 - 登记表单 -->
    <el-card v-else class="visit-form-card">
      <template #header>
        <div class="card-header">
          <span>填写来访登记</span>
        </div>
      </template>

      <el-form
        :model="visitForm"
        :rules="visitRules"
        ref="visitFormRef"
        label-width="120px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="预约ID" prop="appointmentId">
              <el-input
                v-model="visitForm.appointmentId"
                placeholder="请输入预约ID"
                disabled
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学生ID" prop="studentId">
              <el-input
                v-model="visitForm.studentId"
                placeholder="请输入学生ID"
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="来访日期" prop="visitDate">
              <el-date-picker
                v-model="visitForm.visitDate"
                type="date"
                placeholder="选择来访日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来访时间" prop="visitTime">
              <el-time-picker
                v-model="visitForm.visitTime"
                placeholder="选择来访时间"
                style="width: 100%"
                value-format="HH:mm"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="咨询主题" prop="consultationTopic">
          <el-input
            v-model="visitForm.consultationTopic"
            placeholder="请输入咨询主题，如：学业压力、人际关系等"
          />
        </el-form-item>

        <el-form-item label="问题描述" prop="problemDescription">
          <el-input
            v-model="visitForm.problemDescription"
            type="textarea"
            :rows="4"
            placeholder="请详细描述学生目前面临的主要问题"
          />
        </el-form-item>

        <el-form-item label="既往咨询史" prop="previousConsultation">
          <el-input
            v-model="visitForm.previousConsultation"
            type="textarea"
            :rows="3"
            placeholder="是否有过心理咨询经历，如有请详细说明"
          />
        </el-form-item>

        <el-form-item label="当前用药情况" prop="currentMedication">
          <el-input
            v-model="visitForm.currentMedication"
            type="textarea"
            :rows="2"
            placeholder="是否正在服用精神类药物，如有请说明药名和剂量"
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input
                v-model="visitForm.emergencyContact"
                placeholder="姓名（关系）"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="emergencyPhone">
              <el-input
                v-model="visitForm.emergencyPhone"
                placeholder="请输入联系电话"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="visitForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="其他需要说明的信息"
          />
        </el-form-item>
      </el-form>

      <div class="form-actions">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="handleSubmitVisit" :loading="submitting" size="large">
          提交登记
        </el-button>
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改来访登记" width="700px">
      <el-form
        :model="editForm"
        :rules="visitRules"
        ref="editFormRef"
        label-width="120px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="来访日期" prop="visitDate">
              <el-date-picker
                v-model="editForm.visitDate"
                type="date"
                placeholder="选择来访日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来访时间" prop="visitTime">
              <el-time-picker
                v-model="editForm.visitTime"
                placeholder="选择来访时间"
                style="width: 100%"
                value-format="HH:mm"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="咨询主题" prop="consultationTopic">
          <el-input
            v-model="editForm.consultationTopic"
            placeholder="请输入咨询主题"
          />
        </el-form-item>

        <el-form-item label="问题描述" prop="problemDescription">
          <el-input
            v-model="editForm.problemDescription"
            type="textarea"
            :rows="4"
            placeholder="请详细描述问题"
          />
        </el-form-item>

        <el-form-item label="既往咨询史" prop="previousConsultation">
          <el-input
            v-model="editForm.previousConsultation"
            type="textarea"
            :rows="3"
            placeholder="既往咨询史"
          />
        </el-form-item>

        <el-form-item label="当前用药情况" prop="currentMedication">
          <el-input
            v-model="editForm.currentMedication"
            type="textarea"
            :rows="2"
            placeholder="用药情况"
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input
                v-model="editForm.emergencyContact"
                placeholder="姓名（关系）"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="emergencyPhone">
              <el-input
                v-model="editForm.emergencyPhone"
                placeholder="联系电话"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="editForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateVisit" :loading="submitting">
          更新
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, Edit } from '@element-plus/icons-vue'
import {
  getVisitRegistration,
  registerVisit,
  updateVisitRegistration
} from '../../api/consentVisitApi'

const route = useRoute()
const submitting = ref(false)
const visitInfo = ref({})
const editDialogVisible = ref(false)

const visitFormRef = ref(null)
const visitForm = ref({
  appointmentId: '',
  studentId: '',
  visitDate: '',
  visitTime: '',
  consultationTopic: '',
  problemDescription: '',
  previousConsultation: '',
  currentMedication: '',
  emergencyContact: '',
  emergencyPhone: '',
  remarks: ''
})

const visitRules = {
  appointmentId: [{ required: true, message: '请输入预约ID', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学生ID', trigger: 'blur' }]
}

const editFormRef = ref(null)
const editForm = ref({
  registrationId: '',
  visitDate: '',
  visitTime: '',
  consultationTopic: '',
  problemDescription: '',
  previousConsultation: '',
  currentMedication: '',
  emergencyContact: '',
  emergencyPhone: '',
  remarks: ''
})

const loadVisitInfo = async () => {
  const appointmentId = route.query.appointmentId
  if (!appointmentId) {
    ElMessageBox.confirm(
        '未检测到预约ID，您可以手动输入或返回上一页',
        '提示',
        {
          confirmButtonText: '手动输入',
          cancelButtonText: '返回',
          type: 'warning'
        }
    ).then(() => {
      // 用户选择手动输入，启用表单
      visitFormRef.value?.clearValidate(['appointmentId'])
    }).catch(() => {
      router.back()
    })
    return
  }

  try {
    const res = await getVisitRegistration(appointmentId)
    if (res.code === 200 && res.data) {
      visitInfo.value = res.data
    }
  } catch (error) {
    console.error(error)
  }
}

const resetForm = () => {
  visitFormRef.value?.resetFields()
}

const handleSubmitVisit = async () => {
  try {
    await visitFormRef.value.validate()
    submitting.value = true

    const res = await registerVisit(visitForm.value)

    if (res.code === 200) {
      ElMessage.success('登记成功')
      loadVisitInfo()
    } else {
      ElMessage.error(res.message || '登记失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const editVisit = () => {
  editForm.value = {
    registrationId: visitInfo.value.registrationId,
    visitDate: visitInfo.value.visitDate,
    visitTime: visitInfo.value.visitTime,
    consultationTopic: visitInfo.value.consultationTopic,
    problemDescription: visitInfo.value.problemDescription,
    previousConsultation: visitInfo.value.previousConsultation,
    currentMedication: visitInfo.value.currentMedication,
    emergencyContact: visitInfo.value.emergencyContact,
    emergencyPhone: visitInfo.value.emergencyPhone,
    remarks: visitInfo.value.remarks
  }
  editDialogVisible.value = true
}

const handleUpdateVisit = async () => {
  try {
    await editFormRef.value.validate()
    submitting.value = true

    const res = await updateVisitRegistration(editForm.value.registrationId, editForm.value)

    if (res.code === 200) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      loadVisitInfo()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 从路由参数获取预约ID和学生ID
  visitForm.value.appointmentId = route.query.appointmentId || ''
  visitForm.value.studentId = route.query.studentId || localStorage.getItem('userId') || ''

  loadVisitInfo()
})
</script>

<style scoped>
.crisis-visit-page {
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
  background: linear-gradient(135deg, #fff 0%, #dbeafe 100%);
  border-radius: 12px;
  border: 1px solid #bfdbfe;
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

.visit-card,
.visit-form-card {
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
  justify-content: flex-end;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>