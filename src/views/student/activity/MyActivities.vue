<template>
  <div class="my-activities">
    <h2>我的活动</h2>
    
    <div class="filter-section">
      <div class="filter-item">
        <label>状态：</label>
        <select v-model="statusFilter">
          <option value="all">全部</option>
          <option value="upcoming">即将开始</option>
          <option value="ongoing">进行中</option>
          <option value="ended">已结束</option>
        </select>
      </div>
    </div>

    <div class="activity-list">
      <div v-for="activity in filteredActivities" :key="activity.id" class="activity-card">
        <div class="activity-image">
          <img :src="activity.image" :alt="activity.title" />
        </div>
        <div class="activity-content">
          <h3>{{ activity.title }}</h3>
          <div class="activity-info">
            <span class="time">{{ activity.time }}</span>
            <span class="location">{{ activity.location }}</span>
            <span :class="['status', activity.status]">{{ getStatusText(activity.status) }}</span>
          </div>
          <div class="activity-actions">
            <button class="detail-btn" @click="viewActivity(activity.id)">
              查看详情
            </button>
            <button 
              v-if="activity.status === 'upcoming'" 
              class="cancel-btn" 
              @click="cancelActivity(activity.id)"
            >
              取消报名
            </button>
            <button 
              v-else-if="activity.status === 'ongoing'" 
              class="checkin-btn" 
              @click="checkinActivity(activity.id)"
            >
              活动签到
            </button>
            <button 
              v-else-if="activity.status === 'ended' && !activity.feedbackSubmitted" 
              class="feedback-btn" 
              @click="submitFeedback(activity.id)"
            >
              提交反馈
            </button>
            <button 
              v-else-if="activity.status === 'ended' && activity.feedbackSubmitted" 
              class="view-feedback-btn" 
              @click="viewFeedback(activity.id)"
            >
              查看反馈
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredActivities.length === 0" class="empty-state">
      <p>您还没有报名任何活动</p>
      <button class="browse-btn" @click="browseActivities">浏览活动</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyActivities, cancelActivityRegistration, checkinActivity as apiCheckinActivity } from '../../../api/activity.js'
import { unwrapListPayload, unwrapMutationResponse } from '../../../api/helpers.js'
import { mapMyActivityRow } from '../../../utils/groupActivityDisplay.js'

const router = useRouter()
const statusFilter = ref('all')
const loading = ref(false)
const myActivities = ref([])

onMounted(async () => {
  await loadActivities()
})

const loadActivities = async () => {
  try {
    loading.value = true
    const res = await getMyActivities({
      page: 1,
      pageSize: 50
    })
    const records = unwrapListPayload(res?.data)
    myActivities.value = records.map(mapMyActivityRow).filter(Boolean)
  } catch (error) {
    console.error('加载活动列表失败', error)
  } finally {
    loading.value = false
  }
}

const filteredActivities = computed(() => {
  if (statusFilter.value === 'all') {
    return myActivities.value
  }
  return myActivities.value.filter(activity => activity.status === statusFilter.value)
})

const getStatusText = (status) => {
  const statusMap = {
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束'
  }
  return statusMap[status] || status
}

const viewActivity = (id) => {
  router.push(`/student/activity/${id}`)
}

const cancelActivity = async (id) => {
  if (!confirm('确定要取消报名吗？')) return
  try {
    const raw = await cancelActivityRegistration({ activityId: id })
    const { ok, msg } = unwrapMutationResponse(raw)
    if (ok) {
      ElMessage.success(msg || '取消报名成功')
      await loadActivities()
    } else {
      ElMessage.error(msg || '取消报名失败')
    }
  } catch (error) {
    console.error('取消报名失败', error)
    ElMessage.error(error?.response?.data?.msg || error?.message || '取消报名失败，请重试')
  }
}

const checkinActivity = async (id) => {
  try {
    const raw = await apiCheckinActivity({ activityId: id })
    const { ok, msg } = unwrapMutationResponse(raw)
    if (ok) {
      ElMessage.success(msg || '签到成功')
      await loadActivities()
    } else {
      ElMessage.error(msg || '签到失败')
    }
  } catch (error) {
    console.error('签到失败', error)
    ElMessage.error(error?.response?.data?.msg || error?.message || '签到失败，请重试')
  }
}

const submitFeedback = (id) => {
  ElMessageBox.prompt('请填写您对本次活动的反馈', '活动反馈', {
    confirmButtonText: '提交',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '活动体验、建议等（选填）',
  })
    .then(({ value }) => {
      const activity = myActivities.value.find((a) => a.id === id)
      if (activity) {
        activity.feedbackSubmitted = true
        activity.feedbackText = (value || '').trim() || '（已提交反馈）'
      }
      ElMessage.success('感谢您的反馈')
    })
    .catch(() => {})
}

const viewFeedback = (id) => {
  const activity = myActivities.value.find((a) => a.id === id)
  const text = activity?.feedbackText || '暂无反馈内容'
  ElMessageBox.alert(text, '我的反馈', { confirmButtonText: '知道了' })
}

const browseActivities = () => {
  router.push('/student/activity')
}
</script>

<style scoped>
.my-activities {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item label {
  font-weight: 500;
  color: #333;
}

.filter-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.activity-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.activity-image {
  height: 200px;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.activity-card:hover .activity-image img {
  transform: scale(1.05);
}

.activity-content {
  padding: 20px;
}

.activity-content h3 {
  margin: 0 0 15px;
  color: #333;
  font-size: 1.1rem;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 0.85rem;
  color: #666;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 5px;
}

.status.upcoming {
  background: #17a2b8;
  color: white;
}

.status.ongoing {
  background: #28a745;
  color: white;
}

.status.ended {
  background: #6c757d;
  color: white;
}

.activity-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-btn, .cancel-btn, .checkin-btn, .feedback-btn, .view-feedback-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.detail-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.detail-btn:hover {
  background: #e9ecef;
}

.cancel-btn {
  background: #dc3545;
  color: white;
}

.cancel-btn:hover {
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

.view-feedback-btn {
  background: #6c757d;
  color: white;
}

.view-feedback-btn:hover {
  background: #5a6268;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-top: 30px;
}

.empty-state p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 20px;
}

.browse-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.browse-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a428e 100%);
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .activity-list {
    grid-template-columns: 1fr;
  }
}
</style>
