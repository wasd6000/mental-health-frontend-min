<template>
  <div class="result-page">
    <div class="page-nav">
      <el-button @click="goBack" :icon="ArrowLeft" text>返回测评列表</el-button>
      <span class="nav-title">测评结果</span>
    </div>
    <h3>{{ assessment.title }}</h3>
    
    <div class="result-card">
      <div class="result-header">
        <div class="score-container">
          <div class="score-circle">
            <span class="score">{{ result.score }}</span>
            <span class="score-label">总分</span>
          </div>
          <div class="level" :class="result.level">{{ getLevelText(result.level) }}</div>
        </div>
        <div class="result-info">
          <p>测评时间：{{ result.date }}</p>
          <p>用时：{{ result.duration }}分钟</p>
        </div>
      </div>
      
      <div class="result-body">
        <h4>结果分析</h4>
        <p class="analysis">{{ result.analysis }}</p>
        
        <h4>建议</h4>
        <ul class="suggestions">
          <li v-for="(suggestion, index) in result.suggestions" :key="index">
            {{ suggestion }}
          </li>
        </ul>
      </div>
    </div>

    <div class="actions">
      <button class="action-btn" @click="goBack">返回测评列表</button>
      <button class="action-btn" @click="downloadReport">下载报告</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { exportByApi } from '../../../utils/exporter'

const router = useRouter()
const route = useRoute()
const assessmentId = route.params.id

const assessment = ref({
  title: '心理健康状况评估'
})

const result = ref({
  score: 75,
  level: 'normal',
  date: '2026-02-26 14:30',
  duration: 15,
  analysis: '你的心理健康状况总体良好，情绪稳定，能够较好地应对生活中的压力。你具有良好的人际关系和自我调节能力，但在某些方面仍有提升空间。',
  suggestions: [
    '保持规律的作息时间，确保充足的睡眠',
    '继续保持积极的社交活动，与朋友和家人保持良好的沟通',
    '适当进行体育锻炼，有助于缓解压力',
    '学习一些放松技巧，如深呼吸、冥想等',
    '当感到压力过大时，及时寻求心理咨询帮助'
  ]
})

const getLevelText = (level) => {
  const levelMap = {
    excellent: '优秀',
    normal: '良好',
    warning: '需关注',
    danger: '需干预'
  }
  return levelMap[level] || level
}

const goBack = () => {
  router.push('/student/assessment')
}

const downloadReport = async () => {
  try {
    await exportByApi({
      url: '/api/assessment/report/download',
      params: { id: assessmentId },
      filename: `assessment-report-${assessmentId || 'result'}.pdf`,
      fallbackData: { assessment: assessment.value, result: result.value },
    })
    ElMessage.success('报告下载成功')
  } catch (e) {
    ElMessage.error(e?.message || '下载失败')
  }
}
</script>

<style scoped>
.result-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
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

.result-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.score-container {
  display: flex;
  align-items: center;
  gap: 30px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.score {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.score-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.level {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.level.excellent {
  background: #28a745;
}

.level.normal {
  background: #17a2b8;
}

.level.warning {
  background: #ffc107;
  color: #333;
}

.level.danger {
  background: #dc3545;
}

.result-info {
  text-align: right;
  font-size: 0.9rem;
  opacity: 0.9;
}

.result-info p {
  margin: 5px 0;
}

.result-body {
  padding: 30px;
}

.result-body h4 {
  color: #333;
  margin: 20px 0 10px;
  font-size: 1.1rem;
}

.analysis {
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
}

.suggestions {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions li {
  color: #555;
  line-height: 1.5;
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
}

.suggestions li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
  font-size: 1.2rem;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:first-child {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.action-btn:first-child:hover {
  background: #e9ecef;
}

.action-btn:last-child {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn:last-child:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a428e 100%);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .result-page {
    padding: 15px;
  }

  .result-header {
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
  }

  .score-container {
    flex-direction: column;
    gap: 20px;
  }

  .result-info {
    text-align: center;
  }

  .result-body {
    padding: 20px;
  }

  .actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
