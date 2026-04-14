<template>
  <div class="crisis-consent-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">知情同意书</span>
    </div>

    <div class="page-header">
      <div class="header-content">
        <h2>知情同意书签署</h2>
        <p class="page-desc">阅读并签署心理咨询知情同意书，保障双方权益</p>
      </div>
    </div>

    <!-- 已签署状态 -->
    <el-card v-if="consentInfo.consentId" class="consent-card">
      <template #header>
        <div class="card-header">
          <span>知情同意书信息</span>
          <el-tag type="success" :icon="Check">已签署</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="同意书ID">{{ consentInfo.consentId }}</el-descriptions-item>
        <el-descriptions-item label="预约ID">{{ consentInfo.appointmentId }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ consentInfo.studentName }}</el-descriptions-item>
        <el-descriptions-item label="学生ID">{{ consentInfo.studentId }}</el-descriptions-item>
        <el-descriptions-item label="咨询师姓名">{{ consentInfo.counselorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="咨询师ID">{{ consentInfo.counselorId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="是否阅读条款">
          <el-tag :type="consentInfo.hasReadTerms ? 'success' : 'danger'">
            {{ consentInfo.hasReadTerms ? '已阅读' : '未阅读' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否同意">
          <el-tag :type="consentInfo.hasAgreed ? 'success' : 'danger'">
            {{ consentInfo.hasAgreed ? '已同意' : '未同意' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="签署时间" :span="2">
          {{ formatTime(consentInfo.signTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="电子签名" :span="2" v-if="consentInfo.signatureUrl">
          <el-image
            :src="consentInfo.signatureUrl"
            :preview-src-list="[consentInfo.signatureUrl]"
            fit="contain"
            style="max-width: 300px; max-height: 150px;"
          />
        </el-descriptions-item>
      </el-descriptions>

      <div class="action-buttons">
        <el-button type="primary" @click="editConsent" :icon="Edit">
          修改
        </el-button>
      </div>
    </el-card>

    <!-- 未签署状态 - 签署表单 -->
    <el-card v-else class="consent-form-card">
      <template #header>
        <div class="card-header">
          <span>签署知情同意书</span>
        </div>
      </template>

      <el-alert
        title="重要提示"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px;"
      >
        <p>请在签署前仔细阅读以下条款，确保您已完全理解并同意所有内容。</p>
      </el-alert>

      <div class="consent-terms">
        <h3>心理咨询知情同意书</h3>
        <div class="terms-content">
          <p><strong>一、咨询性质</strong></p>
          <p>心理咨询是一种专业的心理帮助过程，旨在帮助您解决心理困扰，促进个人成长。</p>

          <p><strong>二、保密原则</strong></p>
          <p>咨询师将对您的个人信息和咨询内容严格保密，但以下情况除外：</p>
          <ul>
            <li>您有明确的自杀或伤害他人的风险</li>
            <li>涉及未成年人受虐待的情况</li>
            <li>法律要求披露的情况</li>
          </ul>

          <p><strong>三、咨询责任</strong></p>
          <p>您需要按时参加咨询，如实提供信息，积极配合咨询过程。</p>

          <p><strong>四、知情权</strong></p>
          <p>您有权了解咨询师的资质、咨询方法、收费标准等信息。</p>

          <p><strong>五、自愿原则</strong></p>
          <p>您可以随时终止咨询，但建议提前与咨询师沟通。</p>
        </div>
      </div>

      <el-form
        :model="consentForm"
        :rules="consentRules"
        ref="consentFormRef"
        label-width="120px"
        style="margin-top: 20px;"
      >
        <el-form-item label="预约ID" prop="appointmentId">
          <el-input
            v-model="consentForm.appointmentId"
            placeholder="请输入预约ID"
            disabled
          />
        </el-form-item>

        <el-form-item label="学生ID" prop="studentId">
          <el-input
            v-model="consentForm.studentId"
            placeholder="请输入学生ID"
            disabled
          />
        </el-form-item>

        <el-form-item label="咨询师ID" prop="counselorId">
          <el-input
            v-model="consentForm.counselorId"
            placeholder="请输入咨询师ID（可选）"
          />
        </el-form-item>

        <el-form-item label="是否阅读条款" prop="hasReadTerms">
          <el-radio-group v-model="consentForm.hasReadTerms">
            <el-radio :label="1">是，我已仔细阅读</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否同意" prop="hasAgreed">
          <el-radio-group v-model="consentForm.hasAgreed">
            <el-radio :label="1">是，我同意以上条款</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="电子签名" prop="signatureUrl">
          <el-upload
            class="signature-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleSignatureChange"
            :show-file-list="false"
            accept="image/*"
          >
            <img v-if="signaturePreview" :src="signaturePreview" class="signature-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">请上传您的电子签名图片</div>
        </el-form-item>

        <el-form-item label="签署时间" prop="signTime">
          <el-date-picker
            v-model="consentForm.signTime"
            type="datetime"
            placeholder="选择签署时间"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
      </el-form>

      <div class="form-actions">
        <el-button type="primary" @click="handleSubmitConsent" :loading="submitting" size="large">
          确认签署
        </el-button>
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改知情同意书" width="600px">
      <el-form
        :model="editForm"
        :rules="consentRules"
        ref="editFormRef"
        label-width="120px"
      >
        <el-form-item label="是否阅读条款" prop="hasReadTerms">
          <el-radio-group v-model="editForm.hasReadTerms">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否同意" prop="hasAgreed">
          <el-radio-group v-model="editForm.hasAgreed">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="电子签名" prop="signatureUrl">
          <el-upload
            class="signature-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleEditSignatureChange"
            :show-file-list="false"
            accept="image/*"
          >
            <img v-if="editSignaturePreview" :src="editSignaturePreview" class="signature-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="签署时间" prop="signTime">
          <el-date-picker
            v-model="editForm.signTime"
            type="datetime"
            placeholder="选择签署时间"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateConsent" :loading="submitting">
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
import { ArrowLeft, Check, Edit, Plus } from '@element-plus/icons-vue'
import {
  getConsent,
  signConsent,
  updateConsent
} from '../../api/consentVisitApi'

const route = useRoute()
const submitting = ref(false)
const consentInfo = ref({})
const editDialogVisible = ref(false)

const consentFormRef = ref(null)
const consentForm = ref({
  appointmentId: '',
  studentId: '',
  counselorId: '',
  hasReadTerms: 1,
  hasAgreed: 1,
  signatureUrl: '',
  signTime: new Date().toISOString().slice(0, 19)
})

const signaturePreview = ref('')

const editFormRef = ref(null)
const editForm = ref({
  consentId: '',
  hasReadTerms: 1,
  hasAgreed: 1,
  signatureUrl: '',
  signTime: ''
})

const editSignaturePreview = ref('')

const consentRules = {
  appointmentId: [{ required: true, message: '请输入预约ID', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学生ID', trigger: 'blur' }],
  hasReadTerms: [{ required: true, message: '请选择是否阅读条款', trigger: 'change' }],
  hasAgreed: [{ required: true, message: '请选择是否同意', trigger: 'change' }]
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const loadConsentInfo = async () => {
  const appointmentId = route.query.appointmentId
  if (!appointmentId) {
    ElMessage.warning('缺少预约ID参数')
    return
  }

  try {
    const res = await getConsent(appointmentId)
    if (res.code === 200 && res.data) {
      consentInfo.value = res.data
    }
  } catch (error) {
    console.error(error)
  }
}

const handleSignatureChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    signaturePreview.value = e.target.result
    consentForm.value.signatureUrl = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleEditSignatureChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    editSignaturePreview.value = e.target.result
    editForm.value.signatureUrl = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const handleSubmitConsent = async () => {
  try {
    await consentFormRef.value.validate()

    if (!consentForm.value.hasReadTerms || !consentForm.value.hasAgreed) {
      ElMessage.warning('请确认已阅读并同意条款')
      return
    }

    submitting.value = true
    const res = await signConsent(consentForm.value)

    if (res.code === 200) {
      ElMessage.success('签署成功')
      loadConsentInfo()
    } else {
      ElMessage.error(res.message || '签署失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const editConsent = () => {
  editForm.value = {
    consentId: consentInfo.value.consentId,
    hasReadTerms: consentInfo.value.hasReadTerms,
    hasAgreed: consentInfo.value.hasAgreed,
    signatureUrl: consentInfo.value.signatureUrl,
    signTime: consentInfo.value.signTime
  }
  editSignaturePreview.value = consentInfo.value.signatureUrl
  editDialogVisible.value = true
}

const handleUpdateConsent = async () => {
  try {
    await editFormRef.value.validate()
    submitting.value = true

    const res = await updateConsent(editForm.value.consentId, editForm.value)

    if (res.code === 200) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      loadConsentInfo()
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
  consentForm.value.appointmentId = route.query.appointmentId || ''
  consentForm.value.studentId = route.query.studentId || localStorage.getItem('userId') || ''
  consentForm.value.counselorId = route.query.counselorId || ''

  loadConsentInfo()
})
</script>

<style scoped>
.crisis-consent-page {
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
  background: linear-gradient(135deg, #fff 0%, #fef3c7 100%);
  border-radius: 12px;
  border: 1px solid #fde68a;
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

.consent-card,
.consent-form-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.consent-terms {
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  max-height: 400px;
  overflow-y: auto;
}

.consent-terms h3 {
  margin: 0 0 16px 0;
  color: #1e293b;
}

.terms-content p {
  margin: 8px 0;
  line-height: 1.8;
  color: #475569;
}

.terms-content ul {
  margin: 8px 0;
  padding-left: 24px;
}

.terms-content li {
  margin: 4px 0;
  color: #475569;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.signature-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.signature-uploader:hover {
  border-color: #409eff;
}

.signature-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
}
</style>