<template>
  <div class="activity-detail">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">活动详情</span>
    </div>

    <div v-if="loading" class="loading-wrap">
      <el-icon class="is-loading" :size="28"><Loading /></el-icon>
      <span>加载活动详情中…</span>
    </div>

    <template v-else-if="loadError">
      <el-alert type="error" :title="loadError" show-icon :closable="false" class="mb-alert" />
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </template>

    <template v-else>
    <div class="activity-header">
      <img :src="activity.image" :alt="activity.title" class="activity-banner" />
      <div class="activity-info">
        <h2>{{ activity.title }}</h2>
        <div class="meta-info">
          <span class="type">{{ getTypeText(activity.type) }}</span>
          <span :class="['status', activity.status]">{{ getStatusText(activity.status) }}</span>
        </div>
        <div class="details">
          <div class="detail-item">
            <span class="label">时间：</span>
            <span class="value">{{ activity.time }}</span>
          </div>
          <div class="detail-item">
            <span class="label">地点：</span>
            <span class="value">{{ activity.location }}</span>
          </div>
          <div class="detail-item">
            <span class="label">人数限制：</span>
            <span class="value">{{ activity.maxParticipants }}人</span>
          </div>
          <div class="detail-item">
            <span class="label">已报名：</span>
            <span class="value">{{ activity.currentParticipants }}人</span>
          </div>
        </div>
      </div>
    </div>

    <div class="activity-body">
      <div class="section">
        <h3>活动介绍</h3>
        <p v-if="activity.description" class="description">{{ activity.description }}</p>
        <div class="content" v-html="activity.content || '<p>暂无正文</p>'"></div>
      </div>

      <div v-if="activity.speaker" class="section">
        <h3>主讲人</h3>
        <div class="speaker">
          <div class="speaker-avatar">
            <img :src="activity.speaker.avatar" :alt="activity.speaker.name" />
          </div>
          <div class="speaker-info">
            <h4>{{ activity.speaker.name }}</h4>
            <p class="speaker-title">{{ activity.speaker.title }}</p>
            <p class="speaker-bio">{{ activity.speaker.bio }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="activity-footer">
      <button
        v-if="activity.status === 'upcoming' && !activity.joined"
        class="join-btn"
        @click="onJoin"
      >
        立即报名
      </button>
      <button
        v-else-if="activity.joined && activity.status === 'upcoming'"
        class="joined-btn"
        @click="onCancelJoin"
      >
        取消报名
      </button>
      <button
        v-else-if="activity.joined && activity.status === 'ongoing' && !activity.checkedIn"
        class="checkin-btn"
        @click="onCheckin"
      >
        活动签到
      </button>
      <button
        v-else-if="activity.joined && activity.status === 'ongoing' && activity.checkedIn"
        class="back-btn"
        disabled
      >
        已签到
      </button>
      <button
        v-else-if="activity.joined && activity.status === 'ended'"
        class="feedback-btn"
        @click="showFeedbackDialog = true"
      >
        提交反馈
      </button>
      <button type="button" class="back-btn" @click="goBack">返回列表</button>
    </div>
    </template>

    <el-dialog
      v-model="showFeedbackDialog"
      title="活动反馈"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="feedbackForm" label-width="80px">
        <el-form-item label="活动评分">
          <el-rate v-model="feedbackForm.rating" :max="5" show-text />
        </el-form-item>
        <el-form-item label="活动内容">
          <el-rate v-model="feedbackForm.contentRating" :max="5" show-text />
        </el-form-item>
        <el-form-item label="主讲人">
          <el-rate v-model="feedbackForm.speakerRating" :max="5" show-text />
        </el-form-item>
        <el-form-item label="活动组织">
          <el-rate v-model="feedbackForm.organizationRating" :max="5" show-text />
        </el-form-item>
        <el-form-item label="收获程度">
          <el-rate v-model="feedbackForm.gainRating" :max="5" show-text />
        </el-form-item>
        <el-form-item label="反馈意见">
          <el-input
            v-model="feedbackForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入您的反馈意见..."
          />
        </el-form-item>
        <el-form-item label="建议改进">
          <el-input
            v-model="feedbackForm.suggestion"
            type="textarea"
            :rows="3"
            placeholder="请输入您的改进建议..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFeedbackDialog = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getActivityDetail,
  joinActivity as apiJoin,
  cancelActivityRegistration as apiCancel,
  checkinActivity as apiCheckin,
} from '@/api/activity.js'
import { unwrapMutationResponse } from '@/api/helpers.js'
import { mapDetailVoToView } from '@/utils/groupActivityDisplay.js'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const loadError = ref('')
const activity = ref({
  id: '',
  activityId: '',
  title: '',
  description: '',
  content: '',
  type: 'group',
  status: 'upcoming',
  time: '',
  location: '',
  maxParticipants: 0,
  currentParticipants: 0,
  image: '',
  joined: false,
  checkedIn: false,
  speaker: null,
})

const showFeedbackDialog = ref(false)
const feedbackForm = ref({
  rating: 5,
  contentRating: 5,
  speakerRating: 5,
  organizationRating: 5,
  gainRating: 5,
  comment: '',
  suggestion: ''
})

async function loadDetail() {
  const id = route.params.id
  if (!id) {
    loadError.value = '缺少活动 ID'
    loading.value = false
    return
  }
  loading.value = true
  loadError.value = ''
  try {
    const res = await getActivityDetail(id)
    const ok = res && (Number(res.code) === 200 || res.code === 200)
    if (!ok || res.data == null) {
      loadError.value = res?.msg || '未找到该活动'
      return
    }
    const mapped = mapDetailVoToView(res.data)
    if (!mapped?.activityId) {
      loadError.value = '活动数据无效'
      return
    }
    activity.value = mapped
  } catch (e) {
    console.error(e)
    loadError.value = e?.response?.data?.msg || e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
watch(
  () => route.params.id,
  (next, prev) => {
    if (next && next !== prev) loadDetail()
  },
)

const getTypeText = (type) => {
  const typeMap = {
    lecture: '讲座',
    workshop: '工作坊',
    group: '小组活动'
  }
  return typeMap[type] || type
}

const getStatusText = (status) => {
  const statusMap = {
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束'
  }
  return statusMap[status] || status
}

async function onJoin() {
  const aid = activity.value.activityId
  if (!aid) return
  if (
    activity.value.maxParticipants > 0 &&
    activity.value.currentParticipants >= activity.value.maxParticipants
  ) {
    ElMessage.warning('活动人数已满')
    return
  }
  try {
    const raw = await apiJoin({ activityId: aid })
    const { ok, msg } = unwrapMutationResponse(raw)
    if (ok) {
      ElMessage.success(msg || '报名成功')
      await loadDetail()
    } else {
      ElMessage.error(msg || '报名失败')
    }
  } catch (e) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '报名失败')
  }
}

async function onCancelJoin() {
  const aid = activity.value.activityId
  if (!aid) return
  try {
    await ElMessageBox.confirm('确定取消报名吗？', '取消报名', { type: 'warning' })
    const raw = await apiCancel({ activityId: aid })
    const { ok, msg } = unwrapMutationResponse(raw)
    if (ok) {
      ElMessage.success(msg || '已取消报名')
      await loadDetail()
    } else {
      ElMessage.error(msg || '取消失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error(e?.response?.data?.msg || e?.message || '取消失败')
    }
  }
}

async function onCheckin() {
  const aid = activity.value.activityId
  if (!aid) return
  try {
    const raw = await apiCheckin({ activityId: aid })
    const { ok, msg } = unwrapMutationResponse(raw)
    if (ok) {
      ElMessage.success(msg || '签到成功')
      await loadDetail()
    } else {
      ElMessage.error(msg || '签到失败')
    }
  } catch (e) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '签到失败')
  }
}

const submitFeedback = () => {
  if (!feedbackForm.value.comment.trim()) {
    alert('请填写反馈意见')
    return
  }
  
  // 模拟提交反馈
  console.log('提交反馈:', feedbackForm.value)
  alert('反馈提交成功！感谢您的参与')
  showFeedbackDialog.value = false
  
  // 重置表单
  feedbackForm.value = {
    rating: 5,
    contentRating: 5,
    speakerRating: 5,
    organizationRating: 5,
    gainRating: 5,
    comment: '',
    suggestion: ''
  }
}

const goBack = () => {
  router.push('/student/activity')
}
</script>

<style scoped>
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  color: #64748b;
}

.mb-alert {
  margin-bottom: 16px;
}

.activity-detail {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.activity-header {
  margin-bottom: 30px;
}

.activity-banner {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 20px;
}

.activity-info h2 {
  margin: 0 0 10px;
  color: #333;
}

.meta-info {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.type, .status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.type {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.status {
  color: white;
}

.status.upcoming {
  background: #17a2b8;
}

.status.ongoing {
  background: #28a745;
}

.status.ended {
  background: #6c757d;
}

.details {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.detail-item .label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.detail-item .value {
  color: #333;
}

.activity-body {
  margin-bottom: 30px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.section h3 {
  margin: 0 0 15px;
  color: #333;
  font-size: 1.1rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.description {
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
}

.content {
  color: #555;
  line-height: 1.6;
}

.content p {
  margin-bottom: 15px;
}

.content ul {
  margin-bottom: 15px;
  padding-left: 20px;
}

.content li {
  margin-bottom: 8px;
}

.speaker {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.speaker-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.speaker-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.speaker-info {
  flex: 1;
}

.speaker-info h4 {
  margin: 0 0 5px;
  color: #333;
}

.speaker-title {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 10px;
}

.speaker-bio {
  color: #555;
  line-height: 1.5;
  margin: 0;
  font-size: 0.9rem;
}

.activity-footer {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.join-btn, .joined-btn, .checkin-btn, .feedback-btn, .back-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.join-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.join-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a428e 100%);
  transform: translateY(-1px);
}

.joined-btn {
  background: #dc3545;
  color: white;
}

.joined-btn:hover {
  background: #c82333;
}

.checkin-btn {
  background: #28a745;
  color: white;
}

.checkin-btn:hover {
  background: #218838;
}

.feedback-btn {
  background: #ffc107;
  color: #333;
}

.feedback-btn:hover {
  background: #e0a800;
}

.back-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.back-btn:hover {
  background: #e9ecef;
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

@media (max-width: 768px) {
  .activity-detail {
    padding: 15px;
  }

  .activity-banner {
    height: 200px;
  }

  .details {
    flex-direction: column;
    gap: 10px;
  }

  .speaker {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .activity-footer {
    flex-direction: column;
  }

  .join-btn, .joined-btn, .checkin-btn, .feedback-btn, .back-btn {
    width: 100%;
  }
}
</style>
