<template>
  <div class="assessment-container">
    <h2>心理测评</h2>
    
    <div class="filter-section">
      <div class="filter-item">
        <label>状态筛选：</label>
        <select v-model="statusFilter">
          <option value="all">全部</option>
          <option value="pending">待完成</option>
          <option value="completed">已完成</option>
          <option value="expired">已过期</option>
        </select>
      </div>
    </div>

    <div class="assessment-list">
      <div v-for="assessment in filteredAssessments" :key="assessment.id" class="assessment-card">
        <div class="assessment-header">
          <h3>{{ assessment.title }}</h3>
          <span :class="['status', assessment.status]">{{ getStatusText(assessment.status) }}</span>
        </div>
        <div class="assessment-body">
          <p class="description">{{ assessment.description }}</p>
          <div class="info">
            <span class="deadline">截止时间：{{ assessment.deadline }}</span>
            <span class="duration">预计时长：{{ assessment.duration }}分钟</span>
          </div>
        </div>
        <div class="assessment-footer">
          <button 
            v-if="assessment.status === 'pending'" 
            class="start-btn" 
            @click="startAssessment(assessment.id)"
          >
            开始测评
          </button>
          <button 
            v-else-if="assessment.status === 'completed'" 
            class="result-btn" 
            @click="viewResult(assessment.id)"
          >
            查看结果
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyAssessments } from '../../../api/assessment.js'

const router = useRouter()
const statusFilter = ref('all')
const loading = ref(false)
const assessments = ref([])

onMounted(async () => {
  await loadAssessments()
})

const loadAssessments = async () => {
  try {
    loading.value = true
    const res = await getMyAssessments({
      page: 1,
      pageSize: 20
    })
    const raw = res?.data !== undefined ? res.data : res
    const list = Array.isArray(raw) ? raw : raw?.records || raw?.list || raw?.data || []
    assessments.value = list
  } catch (error) {
    console.error('加载测评列表失败', error)
  } finally {
    loading.value = false
  }
}

const filteredAssessments = computed(() => {
  if (statusFilter.value === 'all') {
    return assessments.value
  }
  return assessments.value.filter(item => item.status === statusFilter.value)
})

const getStatusText = (status) => {
  const statusMap = {
    pending: '待完成',
    completed: '已完成',
    expired: '已过期'
  }
  return statusMap[status] || status
}

const startAssessment = (id) => {
  router.push(`/student/assessment/${id}`)
}

const viewResult = (id) => {
  router.push(`/student/assessment/${id}/result`)
}
</script>

<style scoped>
.assessment-container {
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

.assessment-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.assessment-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.assessment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.assessment-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status.pending {
  background: rgba(255, 255, 255, 0.2);
}

.status.completed {
  background: #28a745;
}

.status.expired {
  background: #dc3545;
}

.assessment-body {
  padding: 20px;
}

.description {
  color: #555;
  line-height: 1.5;
  margin-bottom: 15px;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
}

.assessment-footer {
  padding: 0 20px 20px;
}

.start-btn, .result-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.start-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a428e 100%);
}

.result-btn {
  background: #28a745;
  color: white;
}

.result-btn:hover {
  background: #218838;
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .assessment-list {
    grid-template-columns: 1fr;
  }
}
</style>
