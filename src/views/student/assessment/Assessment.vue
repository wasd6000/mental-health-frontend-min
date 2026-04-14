<template>
  <div class="assessment-page" v-loading="loading">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">心理测评</span>
    </div>

    <el-alert v-if="loadError" type="error" :title="loadError" show-icon class="mb-alert" />

    <template v-else-if="!loading && totalQuestions > 0">
      <h2>{{ assessment.title }}</h2>
      <p class="description">{{ assessment.description }}</p>
      <p class="info">预计时长：{{ assessment.duration }}分钟</p>

      <div class="progress-bar">
        <div
          class="progress"
          :style="{ width: ((currentQuestionIndex + 1) / totalQuestions) * 100 + '%' }"
        ></div>
      </div>
      <p class="progress-text">{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</p>

      <div class="question-container">
        <h3 class="question-text">{{ currentQuestion.text }}</h3>
        <div class="options">
          <div
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            :class="['option', { selected: selectedOption === index }]"
            @click="selectOption(index)"
          >
            {{ option.label }}
          </div>
        </div>
      </div>

      <div class="navigation">
        <button v-if="currentQuestionIndex > 0" class="nav-btn prev-btn" @click="prevQuestion">上一题</button>
        <button
          v-if="currentQuestionIndex < totalQuestions - 1"
          class="nav-btn next-btn"
          @click="nextQuestion"
        >
          下一题
        </button>
        <button
          v-if="currentQuestionIndex === totalQuestions - 1"
          class="nav-btn submit-btn"
          :disabled="submitting"
          @click="submitAssessment"
        >
          {{ submitting ? '提交中…' : '提交测评' }}
        </button>
      </div>
    </template>

    <el-empty v-else-if="!loading && totalQuestions === 0 && !loadError" description="暂无题目，请返回列表" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getAssessmentDetail,
  startAssessment,
  submitAssessment as submitAssessmentApi,
} from '@/api/assessment.js'

const router = useRouter()
const route = useRoute()
const assessmentId = route.params.id

const loading = ref(true)
const submitting = ref(false)
const loadError = ref('')

const assessment = ref({
  title: '',
  description: '',
  duration: 20,
  questions: [],
})

const sessionId = ref('')

const currentQuestionIndex = ref(0)
const selectedOptions = ref([])
const selectedOption = ref(null)

const totalQuestions = computed(() => assessment.value.questions.length)
const currentQuestion = computed(() => assessment.value.questions[currentQuestionIndex.value] || { text: '', options: [] })

function normalizeOptions(raw) {
  if (!raw || !Array.isArray(raw) || raw.length === 0) return []
  if (typeof raw[0] === 'string') {
    return raw.map((t, i) => ({ label: t, value: i }))
  }
  return raw.map((o, i) => {
    if (o == null) return { label: '', value: i }
    const label = o.label ?? o.text ?? String(o)
    const value = o.value != null ? o.value : o.id != null ? o.id : i
    return { label, value }
  })
}

function normalizeQuestions(rawList) {
  if (!rawList || !Array.isArray(rawList)) return []
  return rawList.map((q, idx) => {
    const id = q.id ?? q.questionId ?? idx + 1
    const text = q.content ?? q.text ?? q.title ?? q.question ?? ''
    const options = normalizeOptions(q.options)
    return { id, text, options }
  })
}

function extractPayload(res) {
  if (res == null) return null
  if (typeof res === 'object' && 'data' in res && res.data !== undefined) return res.data
  return res
}

onMounted(async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getAssessmentDetail(assessmentId)
    const raw = extractPayload(res) || {}
    const qRaw = raw.questions || raw.questionList || []
    const questions = normalizeQuestions(qRaw)

    assessment.value = {
      title: raw.title || raw.scaleName || '心理测评',
      description: raw.description || raw.intro || '',
      duration: raw.duration || raw.estimatedMinutes || raw.timeLimit || 20,
      questions,
    }

    selectedOptions.value = new Array(questions.length).fill(null)
    selectedOption.value = null

    if (questions.length === 0) {
      loadError.value = '未获取到题目，请确认测评 ID 或后端量表接口是否正常'
      return
    }

    try {
      const startRes = await startAssessment({ assessmentId, scaleId: assessmentId })
      const startData = extractPayload(startRes)
      sessionId.value =
        startData?.sessionId ||
        startData?.session_id ||
        startData?.recordId ||
        ''
    } catch (e) {
      console.warn('[assessment] startAssessment 失败，仍可本地作答', e)
    }
  } catch (e) {
    console.error(e)
    loadError.value = e?.message || '加载测评失败，请稍后重试'
  } finally {
    loading.value = false
  }
})

const selectOption = (index) => {
  selectedOption.value = index
  selectedOptions.value[currentQuestionIndex.value] = index
}

const nextQuestion = () => {
  if (selectedOptions.value[currentQuestionIndex.value] == null) {
    ElMessage.warning('请选择一项')
    return
  }
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++
    selectedOption.value = selectedOptions.value[currentQuestionIndex.value]
  }
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedOption.value = selectedOptions.value[currentQuestionIndex.value]
  }
}

const submitAssessment = async () => {
  if (selectedOptions.value.includes(null)) {
    ElMessage.warning('请回答所有问题')
    return
  }

  const qs = assessment.value.questions
  const answers = qs.map((q, i) => {
    const optIdx = selectedOptions.value[i]
    const opt = q.options[optIdx]
    return {
      questionId: q.id,
      optionIndex: optIdx,
      value: opt?.value ?? optIdx,
    }
  })

  submitting.value = true
  try {
    await submitAssessmentApi({
      assessmentId,
      scaleId: assessmentId,
      sessionId: sessionId.value || undefined,
      answers,
    })
    ElMessage.success('提交成功')
    router.push(`/student/assessment/${assessmentId}/result`)
  } catch (e) {
    ElMessage.error(e?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.mb-alert {
  margin-bottom: 16px;
}

.assessment-page {
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

.description {
  color: #555;
  margin: 10px 0 20px;
  line-height: 1.5;
}

.info {
  color: #666;
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: right;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 30px;
}

.question-container {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.question-text {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.4;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option {
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  line-height: 1.4;
}

.option:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.option.selected {
  border-color: #667eea;
  background: #f0f5ff;
  color: #667eea;
  font-weight: 500;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prev-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.prev-btn:hover {
  background: #e9ecef;
}

.next-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.next-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a428e 100%);
  transform: translateY(-1px);
}

.submit-btn {
  background: #28a745;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .assessment-page {
    padding: 15px;
  }

  .question-container {
    padding: 20px;
  }

  .nav-btn {
    padding: 10px 20px;
  }
}
</style>
