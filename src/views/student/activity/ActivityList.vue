<template>
  <div class="activity-container">
    <h2>团体活动</h2>

    <div class="filter-section">
      <div class="filter-item">
        <label>活动类型：</label>
        <select v-model="typeFilter">
          <option value="all">全部</option>
          <option value="lecture">讲座</option>
          <option value="workshop">工作坊</option>
          <option value="group">小组活动</option>
        </select>
      </div>
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

    <p class="list-hint">以下为平台已发布的团体活动，点击卡片可查看详情（对接后端 <code>/api/activity/list</code>）。</p>

    <p v-if="loading" class="loading-tip">正在加载活动列表…</p>
    <div v-else class="activity-list">
      <div
        v-for="activity in filteredActivities"
        :key="activity.id"
        class="activity-card"
        role="button"
        tabindex="0"
        @click="viewActivity(activity.id)"
        @keydown.enter="viewActivity(activity.id)"
      >
        <div class="activity-image">
          <img :src="activity.image" :alt="activity.title" />
        </div>
        <div class="activity-content">
          <h3>{{ activity.title }}</h3>
          <p class="description">{{ activity.description }}</p>
          <div class="activity-info">
            <span class="time">{{ activity.time }}</span>
            <span class="location">{{ activity.location }}</span>
            <span :class="['status', activity.status]">{{ getStatusText(activity.status) }}</span>
          </div>
          <div class="activity-footer">
            <button
              v-if="activity.status === 'upcoming' && !activity.joined"
              class="join-btn"
              @click.stop="signup(activity.id)"
            >
              立即报名
            </button>
            <button
              v-else-if="activity.status === 'upcoming' && activity.joined"
              class="detail-btn"
              @click.stop="viewActivity(activity.id)"
            >
              已报名 · 查看详情
            </button>
            <button v-else class="detail-btn" @click.stop="viewActivity(activity.id)">查看详情</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && filteredActivities.length === 0" class="empty-tip">
      暂无活动，请稍后再试或调整筛选条件。
    </div>

    <div class="my-activities-link">
      <button type="button" class="my-activities-btn" @click="goToMyActivities">查看我的活动</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getActivityList, joinActivity as apiJoinActivity } from '../../../api/activity.js'
import { unwrapListPayload, unwrapMutationResponse } from '../../../api/helpers.js'
import { mapListItemToCard } from '../../../utils/groupActivityDisplay.js'

const router = useRouter()
const typeFilter = ref('all')
const statusFilter = ref('all')
const loading = ref(false)
const activities = ref([])

onMounted(() => {
  loadActivities()
})

async function loadActivities() {
  try {
    loading.value = true
    const res = await getActivityList({
      page: 1,
      pageSize: 500,
    })
    const ok = res && (Number(res.code) === 200 || res.code === 200)
    if (!ok) {
      activities.value = []
      ElMessage.error(res?.msg || '加载失败')
      return
    }
    const records = unwrapListPayload(res?.data)
    activities.value = records.map(mapListItemToCard).filter(Boolean)
  } catch (error) {
    console.error('加载活动列表失败', error)
    activities.value = []
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const filteredActivities = computed(() => {
  return activities.value.filter((activity) => {
    const typeMatch = typeFilter.value === 'all' || activity.type === typeFilter.value
    const statusMatch = statusFilter.value === 'all' || activity.status === statusFilter.value
    return typeMatch && statusMatch
  })
})

function getStatusText(status) {
  const statusMap = {
    upcoming: '即将开始',
    ongoing: '进行中',
    ended: '已结束',
  }
  return statusMap[status] || status
}

async function signup(id) {
  try {
    const raw = await apiJoinActivity({ activityId: id })
    const { ok, msg } = unwrapMutationResponse(raw)
    if (ok) {
      ElMessage.success(msg || '报名成功')
      await loadActivities()
      router.push(`/student/activity/${id}`)
    } else {
      ElMessage.error(msg || '报名失败')
    }
  } catch (error) {
    console.error('报名失败', error)
    ElMessage.error(error?.response?.data?.msg || error?.message || '报名失败，请稍后重试')
  }
}

function viewActivity(id) {
  if (!id) return
  router.push(`/student/activity/${id}`)
}

function goToMyActivities() {
  router.push('/student/activity/my')
}
</script>

<style scoped>
.activity-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.list-hint {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 16px;
  line-height: 1.5;
}

.list-hint code {
  font-size: 0.8rem;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}

.loading-tip {
  color: #64748b;
  padding: 24px;
  text-align: center;
}

.empty-tip {
  color: #94a3b8;
  text-align: center;
  padding: 32px 16px;
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
  cursor: pointer;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.activity-card:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
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
  margin: 0 0 10px;
  color: #333;
  font-size: 1.1rem;
}

.description {
  color: #555;
  line-height: 1.5;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
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

.activity-footer {
  margin-top: 15px;
}

.join-btn,
.detail-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.join-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.join-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a428e 100%);
}

.detail-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.detail-btn:hover {
  background: #e9ecef;
}

.my-activities-link {
  text-align: center;
}

.my-activities-btn {
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.my-activities-btn:hover {
  background: #218838;
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
