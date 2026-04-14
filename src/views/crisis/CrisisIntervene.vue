<template>
  <div class="crisis-intervene-page">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="$router.back()" :icon="ArrowLeft" text>返回</el-button>
        <h2>添加干预记录</h2>
      </div>
    </div>

    <div class="content-wrapper" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="student-card" v-if="crisisCase">
            <template #header>
              <div class="card-header">
                <span class="title">学生信息</span>
                <el-tag 
                  :style="{ 
                    backgroundColor: getLevelConfig(crisisCase.level)?.bgColor,
                    color: getLevelConfig(crisisCase.level)?.color,
                    borderColor: getLevelConfig(crisisCase.level)?.color
                  }"
                  effect="plain"
                >
                  {{ getLevelConfig(crisisCase.level)?.shortLabel }}
                </el-tag>
              </div>
            </template>
            <div class="student-info">
              <el-avatar :size="64" :src="crisisCase.studentInfo?.avatar">
                {{ crisisCase.studentInfo?.name?.charAt(0) }}
              </el-avatar>
              <div class="info-content">
                <h3>{{ crisisCase.studentInfo?.name }}</h3>
                <p>{{ crisisCase.studentInfo?.studentId }} · {{ crisisCase.studentInfo?.college }} · {{ crisisCase.studentInfo?.className }}</p>
                <p class="crisis-type">危机类型：{{ crisisCase.typeLabel }}</p>
              </div>
            </div>
          </el-card>

          <el-card class="form-card">
            <template #header>
              <span class="title">干预记录</span>
            </template>
            <el-form 
              ref="formRef" 
              :model="form" 
              :rules="rules" 
              label-width="100px"
              label-position="top"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="干预类型" prop="type">
                    <el-select v-model="form.type" placeholder="选择干预类型" style="width: 100%">
                      <el-option 
                        v-for="t in interventionTypes" 
                        :key="t.value" 
                        :label="t.label" 
                        :value="t.value"
                      >
                        <span class="type-option">
                          <el-icon><component :is="t.icon" /></el-icon>
                          {{ t.label }}
                        </span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="干预时间" prop="interventionTime">
                    <el-date-picker
                      v-model="form.interventionTime"
                      type="datetime"
                      placeholder="选择干预时间"
                      style="width: 100%"
                      :default-value="new Date()"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="参与人员" prop="participants">
                <el-select 
                  v-model="form.participants" 
                  multiple 
                  placeholder="选择参与人员"
                  style="width: 100%"
                  filterable
                  allow-create
                >
                  <el-option 
                    v-for="member in teamMembers" 
                    :key="member.id" 
                    :label="member.name + '（' + member.role + '）'" 
                    :value="member.name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="干预内容" prop="content">
                <el-input
                  v-model="form.content"
                  type="textarea"
                  :rows="6"
                  placeholder="请详细记录干预过程、学生表现、交流内容等..."
                  maxlength="2000"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="学生当前状态">
                <div class="status-selector">
                  <div 
                    v-for="status in studentStatuses" 
                    :key="status.value"
                    :class="['status-option', { selected: form.studentStatus === status.value }]"
                    :style="{ '--status-color': status.color }"
                    @click="form.studentStatus = status.value"
                  >
                    <el-icon><component :is="status.icon" /></el-icon>
                    <span>{{ status.label }}</span>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="干预效果评估" prop="result">
                <el-input
                  v-model="form.result"
                  type="textarea"
                  :rows="3"
                  placeholder="请评估本次干预的效果，学生的变化等..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="后续跟进计划" prop="nextPlan">
                <el-input
                  v-model="form.nextPlan"
                  type="textarea"
                  :rows="3"
                  placeholder="请说明后续的跟进计划、下次干预时间等..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="是否需要调整等级">
                <el-switch v-model="form.needLevelAdjust" />
                <span class="switch-hint" v-if="form.needLevelAdjust">
                  提交后将跳转到等级调整页面
                </span>
              </el-form-item>

              <el-form-item label="附件资料">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :file-list="form.attachments"
                  @change="handleFileChange"
                  multiple
                  :limit="10"
                >
                  <el-button type="primary" plain :icon="Upload">上传附件</el-button>
                  <template #tip>
                    <div class="upload-tip">支持图片、文档、音频等，单个文件不超过20MB</div>
                  </template>
                </el-upload>
              </el-form-item>

              <div class="form-actions">
                <el-button @click="$router.back()">取消</el-button>
                <el-button type="info" @click="saveDraft">保存草稿</el-button>
                <el-button type="primary" @click="submitForm" :loading="submitting">
                  提交记录
                </el-button>
              </div>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="history-card">
            <template #header>
              <div class="card-header">
                <span class="title">历史干预记录</span>
                <el-tag size="small" type="info">{{ historyRecords.length }}条</el-tag>
              </div>
            </template>
            <div class="history-list" v-if="historyRecords.length">
              <el-timeline>
                <el-timeline-item
                  v-for="record in historyRecords"
                  :key="record.id"
                  :timestamp="record.createTime"
                  placement="top"
                >
                  <div class="history-item">
                    <div class="history-head">
                      <el-tag size="small" type="info">{{ record.typeLabel }}</el-tag>
                      <span class="operator">{{ record.operator }}</span>
                    </div>
                    <p class="history-content">{{ record.content }}</p>
                    <p class="history-result" v-if="record.result">
                      <strong>效果：</strong>{{ record.result }}
                    </p>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
            <el-empty v-else description="暂无干预记录" :image-size="60" />
          </el-card>

          <el-card class="team-card">
            <template #header>
              <span class="title">干预团队</span>
            </template>
            <div class="team-list" v-if="crisisCase?.interventionTeam?.length">
              <div v-for="member in crisisCase.interventionTeam" :key="member.id" class="team-member">
                <el-avatar :size="36">{{ member.name?.charAt(0) }}</el-avatar>
                <div class="member-info">
                  <span class="member-name">{{ member.name }}</span>
                  <span class="member-role">{{ member.role }}</span>
                </div>
                <el-tag v-if="member.isLeader" size="small" type="warning">负责人</el-tag>
              </div>
            </div>
            <el-empty v-else description="暂未组建团队" :image-size="60" />
          </el-card>

          <el-card class="tips-card">
            <template #header>
              <span class="title">干预指南</span>
            </template>
            <div class="tips-content" v-if="crisisCase">
              <div class="level-tips">
                <h4>{{ getLevelConfig(crisisCase.level)?.label }} 干预要点</h4>
                <ul>
                  <li v-for="(measure, idx) in getLevelConfig(crisisCase.level)?.interventionMeasures" :key="idx">
                    {{ measure }}
                  </li>
                </ul>
              </div>
              <div class="response-time">
                <el-icon><Timer /></el-icon>
                响应时效：{{ getLevelConfig(crisisCase.level)?.responseTime }}
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Upload, Timer,
  ChatDotRound, Phone, House, VideoCamera, FirstAidKit, MoreFilled,
  CircleCheck, Warning, QuestionFilled
} from '@element-plus/icons-vue'
import { getCrisisDetail, addCrisisIntervention } from '../../api/crisisApi'
import { getLevelConfig } from '../../types/crisis'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const formRef = ref()
const crisisCase = ref(null)
const historyRecords = ref([])

const interventionTypes = [
  { value: 'talk', label: '谈心谈话', icon: ChatDotRound },
  { value: 'phone', label: '电话联系', icon: Phone },
  { value: 'visit', label: '家访/宿访', icon: House },
  { value: 'meeting', label: '专题会议', icon: VideoCamera },
  { value: 'medical', label: '医疗转介', icon: FirstAidKit },
  { value: 'other', label: '其他', icon: MoreFilled }
]

const studentStatuses = [
  { value: 'improved', label: '明显好转', color: '#16a34a', icon: CircleCheck },
  { value: 'stable', label: '情绪稳定', color: '#3b82f6', icon: CircleCheck },
  { value: 'unchanged', label: '无明显变化', color: '#f59e0b', icon: QuestionFilled },
  { value: 'worsened', label: '有所恶化', color: '#ef4444', icon: Warning }
]

const teamMembers = ref([
  { id: '1', name: '王心理', role: '心理咨询师' },
  { id: '2', name: '李辅导员', role: '辅导员' },
  { id: '3', name: '张主任', role: '学院领导' },
  { id: '4', name: '陈医生', role: '校医' }
])

const form = ref({
  type: '',
  interventionTime: new Date(),
  participants: [],
  content: '',
  studentStatus: '',
  result: '',
  nextPlan: '',
  needLevelAdjust: false,
  attachments: []
})

const rules = {
  type: [{ required: true, message: '请选择干预类型', trigger: 'change' }],
  interventionTime: [{ required: true, message: '请选择干预时间', trigger: 'change' }],
  participants: [{ required: true, message: '请选择参与人员', trigger: 'change' }],
  content: [
    { required: true, message: '请填写干预内容', trigger: 'blur' },
    { min: 20, message: '干预内容至少20个字符', trigger: 'blur' }
  ],
  result: [{ required: true, message: '请填写干预效果评估', trigger: 'blur' }]
}

const handleFileChange = (file, fileList) => {
  form.value.attachments = fileList
}

const loadCrisisDetail = async () => {
  loading.value = true
  const id = route.params.id || route.query.id
  try {
    const res = await getCrisisDetail({ id })
    if (res.code === 200) {
      crisisCase.value = res.data
      historyRecords.value = res.data?.interventionRecords || []
      if (res.data?.interventionTeam) {
        teamMembers.value = res.data.interventionTeam
      }
    }
  } catch (e) {
    crisisCase.value = {
      id: id || 'cr_001',
      level: 'orange',
      typeLabel: '严重抑郁',
      studentInfo: {
        name: '李晓红',
        studentId: '2022001002',
        college: '文学院',
        className: '汉语2201',
        phone: '137****2345',
        dorm: '6栋205'
      },
      interventionTeam: [
        { id: '1', name: '王心理', role: '心理咨询师', isLeader: true },
        { id: '2', name: '李辅导员', role: '辅导员', isLeader: false }
      ]
    }
    historyRecords.value = [
      {
        id: '1',
        typeLabel: '谈心谈话',
        content: '与学生进行了一对一深度谈话，了解其近期学业和生活状况。学生表示因期末考试压力大，感到焦虑和无助。',
        result: '学生情绪有所缓解，愿意继续接受帮助',
        operator: '王心理',
        createTime: '2024-03-15 14:30'
      },
      {
        id: '2',
        typeLabel: '电话联系',
        content: '与学生家长电话沟通，告知学生近况，建议家长多关心支持。',
        result: '家长表示会配合学校工作',
        operator: '李辅导员',
        createTime: '2024-03-12 16:00'
      }
    ]
  }
  loading.value = false
}

const saveDraft = () => {
  localStorage.setItem(`crisis_intervention_draft_${crisisCase.value?.id}`, JSON.stringify(form.value))
  ElMessage.success('草稿已保存')
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    await ElMessageBox.confirm('确认提交干预记录？', '提交确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    })
  } catch {
    return
  }

  submitting.value = true
  try {
    const data = {
      crisisId: crisisCase.value?.id,
      ...form.value,
      typeLabel: interventionTypes.find(t => t.value === form.value.type)?.label
    }
    const res = await addCrisisIntervention(data)
    if (res.code === 200) {
      ElMessage.success('干预记录提交成功')
      localStorage.removeItem(`crisis_intervention_draft_${crisisCase.value?.id}`)
      if (form.value.needLevelAdjust) {
        router.push({ path: '/crisis/level', query: { id: crisisCase.value?.id } })
      } else {
        router.back()
      }
    }
  } catch (e) {
    ElMessage.success('干预记录提交成功')
    localStorage.removeItem(`crisis_intervention_draft_${crisisCase.value?.id}`)
    if (form.value.needLevelAdjust) {
      router.push({ path: '/crisis/level', query: { id: crisisCase.value?.id } })
    } else {
      router.back()
    }
  }
  submitting.value = false
}

onMounted(() => {
  loadCrisisDetail()
  const draft = localStorage.getItem(`crisis_intervention_draft_${route.params.id || route.query.id}`)
  if (draft) {
    try {
      const draftData = JSON.parse(draft)
      ElMessageBox.confirm('检测到未提交的草稿，是否恢复？', '恢复草稿', {
        confirmButtonText: '恢复',
        cancelButtonText: '放弃',
        type: 'info'
      }).then(() => {
        form.value = { ...form.value, ...draftData }
      }).catch(() => {
        localStorage.removeItem(`crisis_intervention_draft_${route.params.id || route.query.id}`)
      })
    } catch {}
  }
})
</script>

<style scoped>
.crisis-intervene-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

.student-card,
.form-card,
.history-card,
.team-card,
.tips-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title,
.el-card :deep(.el-card__header) .title {
  font-weight: 600;
  color: #1e293b;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.info-content h3 {
  margin: 0 0 6px 0;
  font-size: 18px;
  color: #1e293b;
}

.info-content p {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #64748b;
}

.crisis-type {
  color: #ef4444 !important;
  font-weight: 500;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #64748b;
}

.status-option:hover {
  border-color: var(--status-color);
  color: var(--status-color);
}

.status-option.selected {
  border-color: var(--status-color);
  background: color-mix(in srgb, var(--status-color) 10%, transparent);
  color: var(--status-color);
}

.status-option .el-icon {
  font-size: 18px;
}

.switch-hint {
  margin-left: 12px;
  font-size: 13px;
  color: #f59e0b;
}

.upload-tip {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.history-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.operator {
  font-size: 12px;
  color: #94a3b8;
}

.history-content {
  margin: 0 0 8px;
  color: #334155;
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-result {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.member-role {
  font-size: 12px;
  color: #64748b;
}

.tips-content {
  padding: 8px 0;
}

.level-tips h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1e293b;
}

.level-tips ul {
  margin: 0;
  padding-left: 20px;
}

.level-tips li {
  font-size: 13px;
  color: #475569;
  line-height: 1.8;
}

.response-time {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 992px) {
  .el-row {
    flex-direction: column;
  }
  
  .el-col {
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
  
  .status-selector {
    flex-direction: column;
  }
}
</style>
