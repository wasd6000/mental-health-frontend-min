<template>
  <div class="activity-view">
    <h2>活动记录查看</h2>
    
    <!-- 子女切换器 -->
    <div class="child-selector">
      <label>选择子女：</label>
      <select v-model="selectedChild" @change="switchChild">
        <option v-for="child in children" :key="child.id" :value="child.id">
          {{ child.name }} ({{ child.studentId }})
        </option>
      </select>
    </div>

    <!-- 活动记录 -->
    <div class="activity-records">
      <h3>活动记录</h3>
      <div v-if="currentActivities.length === 0" class="empty-state">
        <p>暂无活动记录</p>
      </div>
      <div v-else class="records-grid">
        <div v-for="activity in currentActivities" :key="activity.id" class="activity-card">
          <div class="activity-image">
            <img :src="activity.image" :alt="activity.title" />
          </div>
          <div class="activity-content">
            <h4>{{ activity.title }}</h4>
            <div class="activity-info">
              <p><span class="label">时间：</span>{{ activity.time }}</p>
              <p><span class="label">地点：</span>{{ activity.location }}</p>
              <p><span class="label">状态：</span><span :class="['status', activity.status]">{{ activity.status }}</span></p>
            </div>
            <div class="activity-actions">
              <button class="action-btn view-btn" @click="viewActivity(activity)">
                查看详情
              </button>
              <button 
                v-if="activity.status === '已报名'" 
                class="action-btn cancel-btn" 
                @click="cancelActivity(activity.id)"
              >
                取消报名
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="activity-stats">
      <h3>活动统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ currentActivities.length }}</span>
          <span class="stat-label">总参与活动</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ registeredActivities }}</span>
          <span class="stat-label">已报名</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ completedActivities }}</span>
          <span class="stat-label">已完成</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ feedbackSubmittedActivities }}</span>
          <span class="stat-label">已提交反馈</span>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      :title="detailActivity?.title || '活动详情'"
      width="min(520px, 92vw)"
      destroy-on-close
      class="parent-activity-detail-dialog"
    >
      <template v-if="detailActivity">
        <div class="detail-cover">
          <img :src="detailActivity.image" :alt="detailActivity.title" />
        </div>
        <el-descriptions :column="1" border size="small" class="detail-desc">
          <el-descriptions-item label="活动时间">{{ detailActivity.time }}</el-descriptions-item>
          <el-descriptions-item label="活动地点">{{ detailActivity.location }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="['status', detailActivity.status]">{{ detailActivity.status }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="detailActivity.organizer" label="主办单位">
            {{ detailActivity.organizer }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detailActivity.description" label="活动说明">
            {{ detailActivity.description }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getChildrenList, getChildActivities } from '../../../api/parent.js'

const selectedChild = ref('1')
const loading = ref(false)
const children = ref([])
const activities = ref([])
const detailVisible = ref(false)
const detailActivity = ref(null)

onMounted(async () => {
  await loadChildren()
  await loadActivities()
})

watch(selectedChild, async () => {
  await loadActivities()
})

const loadChildren = async () => {
  try {
    loading.value = true
    const res = await getChildrenList()
    children.value = res.data || []
    if (children.value.length > 0) {
      selectedChild.value = String(children.value[0].id)
    }
  } catch (error) {
    console.error('加载子女列表失败', error)
  } finally {
    loading.value = false
  }
}

const loadActivities = async () => {
  try {
    loading.value = true
    const child = children.value.find(c => String(c.id) === String(selectedChild.value))
    if (child) {
      const res = await getChildActivities(child.studentId)
      activities.value = res.data || []
    }
  } catch (error) {
    console.error('加载活动记录失败', error)
  } finally {
    loading.value = false
  }
}

const currentActivities = computed(() => {
  return activities.value.filter(activity => String(activity.childId) === String(selectedChild.value))
})

const registeredActivities = computed(() => {
  return currentActivities.value.filter(activity => activity.status === '已报名').length
})

const completedActivities = computed(() => {
  return currentActivities.value.filter(activity => activity.status === '已完成').length
})

const feedbackSubmittedActivities = computed(() => {
  // 模拟已提交反馈的活动数量
  return Math.floor(completedActivities.value * 0.7)
})

const switchChild = () => {
  // 切换子女逻辑
  console.log('切换到子女：', selectedChild.value)
}

const viewActivity = (activity) => {
  detailActivity.value = activity ? { ...activity } : null
  detailVisible.value = !!detailActivity.value
}

const cancelActivity = (id) => {
  if (confirm('确定要取消报名该活动吗？')) {
    const activity = activities.value.find(a => a.id === id)
    if (activity) {
      activity.status = '已取消'
      alert('报名已取消')
    }
  }
}
</script>

<style scoped>
.activity-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 子女切换器 */
.child-selector {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.child-selector label {
  font-weight: 500;
  color: #333;
  font-size: 1rem;
}

.child-selector select {
  flex: 1;
  max-width: 400px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.activity-records {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.activity-records h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.2rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.activity-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.activity-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
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

.activity-content h4 {
  margin: 0 0 15px;
  color: #333;
  font-size: 1.1rem;
}

.activity-info {
  margin-bottom: 20px;
}

.activity-info p {
  margin: 8px 0;
  color: #555;
  font-size: 0.95rem;
}

.activity-info .label {
  font-weight: 500;
  color: #666;
}

.status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
}

.status.已报名 {
  background: #17a2b8;
}

.status.已完成 {
  background: #28a745;
}

.status.已取消 {
  background: #6c757d;
}

.activity-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.view-btn:hover {
  background: #e9ecef;
}

.cancel-btn {
  background: #dc3545;
  color: white;
}

.cancel-btn:hover {
  background: #c82333;
}

.activity-stats {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.activity-stats h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.2rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
}

.detail-cover {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  max-height: 220px;
  background: #f0f0f0;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  max-height: 220px;
  object-fit: cover;
  display: block;
}

.detail-desc {
  margin-top: 0;
}

@media (max-width: 768px) {
  .activity-view {
    padding: 15px;
  }

  .child-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .child-selector select {
    max-width: none;
  }

  .activity-records,
  .activity-stats {
    padding: 20px;
  }

  .records-grid {
    grid-template-columns: 1fr;
  }

  .activity-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
