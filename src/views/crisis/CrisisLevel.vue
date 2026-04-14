<template>
  <div class="crisis-level-page">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="$router.back()" :icon="ArrowLeft" text>返回</el-button>
        <h2>危机等级管理</h2>
      </div>
      <div class="header-right">
        <el-tag :type="getLevelTagType(currentCase?.level)" size="large" effect="dark">
          当前等级：{{ getLevelLabel(currentCase?.level) }}
        </el-tag>
      </div>
    </div>

    <div class="content-wrapper" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="student-card">
            <template #header>
              <div class="card-header">
                <span class="title">学生信息</span>
                <el-tag :type="getLevelTagType(currentCase?.level)" size="small">
                  {{ getLevelLabel(currentCase?.level) }}
                </el-tag>
              </div>
            </template>
            <div class="student-info" v-if="currentCase">
              <div class="info-avatar">
                <el-avatar :size="80" :src="currentCase.studentInfo?.avatar">
                  {{ currentCase.studentInfo?.name?.charAt(0) }}
                </el-avatar>
              </div>
              <div class="info-details">
                <el-descriptions :column="3" border size="small">
                  <el-descriptions-item label="姓名">{{ currentCase.studentInfo?.name }}</el-descriptions-item>
                  <el-descriptions-item label="学号">{{ currentCase.studentInfo?.studentId }}</el-descriptions-item>
                  <el-descriptions-item label="性别">{{ currentCase.studentInfo?.gender }}</el-descriptions-item>
                  <el-descriptions-item label="学院">{{ currentCase.studentInfo?.college }}</el-descriptions-item>
                  <el-descriptions-item label="专业">{{ currentCase.studentInfo?.major }}</el-descriptions-item>
                  <el-descriptions-item label="班级">{{ currentCase.studentInfo?.className }}</el-descriptions-item>
                  <el-descriptions-item label="联系电话">{{ currentCase.studentInfo?.phone }}</el-descriptions-item>
                  <el-descriptions-item label="宿舍">{{ currentCase.studentInfo?.dorm }}</el-descriptions-item>
                  <el-descriptions-item label="危机类型">{{ currentCase.typeLabel }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-card>

          <el-card class="level-adjust-card">
            <template #header>
              <span class="title">等级调整</span>
            </template>
            <el-form ref="formRef" :model="adjustForm" :rules="rules" label-width="100px">
              <el-form-item label="当前等级">
                <div class="current-level-display">
                  <div 
                    class="level-badge"
                    :style="{ backgroundColor: getLevelColor(currentCase?.level), color: '#fff' }"
                  >
                    {{ getLevelLabel(currentCase?.level) }}
                  </div>
                  <span class="level-desc">{{ getLevelDescription(currentCase?.level) }}</span>
                </div>
              </el-form-item>

              <el-form-item label="调整为" prop="newLevel">
                <div class="level-selector">
                  <div
                    v-for="level in CRISIS_LEVELS"
                    :key="level.value"
                    :class="['level-option', { 
                      selected: adjustForm.newLevel === level.value,
                      current: currentCase?.level === level.value,
                      disabled: currentCase?.level === level.value
                    }]"
                    :style="{ 
                      '--level-color': level.color,
                      '--level-bg': level.bgColor
                    }"
                    @click="selectLevel(level.value)"
                  >
                    <div class="level-indicator" :style="{ backgroundColor: level.color }"></div>
                    <div class="level-content">
                      <span class="level-name">{{ level.shortLabel }}</span>
                      <span class="level-response">{{ level.responseTime }}</span>
                    </div>
                    <el-icon v-if="adjustForm.newLevel === level.value" class="check-icon"><Check /></el-icon>
                    <span v-if="currentCase?.level === level.value" class="current-tag">当前</span>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="调整原因" prop="reason">
                <el-input
                  v-model="adjustForm.reason"
                  type="textarea"
                  :rows="4"
                  placeholder="请详细说明等级调整的原因和依据..."
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="附件资料">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :file-list="adjustForm.attachments"
                  @change="handleFileChange"
                  multiple
                  :limit="5"
                >
                  <el-button type="primary" plain :icon="Upload">上传附件</el-button>
                  <template #tip>
                    <div class="upload-tip">支持图片、文档等，单个文件不超过10MB</div>
                  </template>
                </el-upload>
              </el-form-item>

              <div class="form-actions">
                <el-button @click="$router.back()">取消</el-button>
                <el-button 
                  type="primary" 
                  @click="submitAdjust" 
                  :loading="submitting"
                  :disabled="!adjustForm.newLevel || adjustForm.newLevel === currentCase?.level"
                >
                  确认调整
                </el-button>
              </div>
            </el-form>
          </el-card>

          <el-card class="measures-card" v-if="adjustForm.newLevel && adjustForm.newLevel !== currentCase?.level">
            <template #header>
              <span class="title">调整后需采取的措施</span>
            </template>
            <div class="measures-content">
              <div class="new-level-info">
                <div 
                  class="level-badge large"
                  :style="{ backgroundColor: getLevelColor(adjustForm.newLevel), color: '#fff' }"
                >
                  {{ getLevelLabel(adjustForm.newLevel) }}
                </div>
                <span class="response-time">响应时效：{{ getLevelResponseTime(adjustForm.newLevel) }}</span>
              </div>
              <el-divider />
              <ul class="measures-list">
                <li v-for="(measure, idx) in getLevelMeasures(adjustForm.newLevel)" :key="idx">
                  <el-icon><CircleCheck /></el-icon>
                  <span>{{ measure }}</span>
                </li>
              </ul>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="history-card">
            <template #header>
              <div class="card-header">
                <span class="title">等级变更记录</span>
                <el-tag size="small" type="info">共 {{ levelHistory.length }} 条</el-tag>
              </div>
            </template>
            <div class="history-list" v-if="levelHistory.length">
              <el-timeline>
                <el-timeline-item
                  v-for="record in levelHistory"
                  :key="record.id"
                  :timestamp="record.operateTime"
                  placement="top"
                  :color="getLevelColor(record.toLevel)"
                >
                  <div class="history-item">
                    <div class="level-change">
                      <template v-if="record.fromLevel">
                        <span 
                          class="level-tag from"
                          :style="{ color: getLevelColor(record.fromLevel), borderColor: getLevelColor(record.fromLevel) }"
                        >
                          {{ getLevelShortLabel(record.fromLevel) }}
                        </span>
                        <el-icon><Right /></el-icon>
                      </template>
                      <span v-else class="initial-label">初始建档</span>
                      <span 
                        class="level-tag to"
                        :style="{ backgroundColor: getLevelColor(record.toLevel), color: '#fff' }"
                      >
                        {{ getLevelShortLabel(record.toLevel) }}
                      </span>
                    </div>
                    <div class="history-reason">{{ record.reason }}</div>
                    <div class="history-operator">
                      {{ record.operator }} · {{ record.operatorRole }}
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
            <el-empty v-else description="暂无变更记录" :image-size="80" />
          </el-card>

          <el-card class="level-guide-card">
            <template #header>
              <span class="title">等级说明</span>
            </template>
            <div class="level-guide">
              <div 
                v-for="level in CRISIS_LEVELS" 
                :key="level.value"
                class="guide-item"
                :class="{ active: currentCase?.level === level.value }"
              >
                <div class="guide-header">
                  <div class="guide-indicator" :style="{ backgroundColor: level.color }"></div>
                  <span class="guide-name">{{ level.label }}</span>
                </div>
                <p class="guide-desc">{{ level.description }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Check, Upload, CircleCheck, Right } from '@element-plus/icons-vue'
import {
  getCrisisDetail,
  updateCrisisLevel,
  getCrisisList,
  normalizeCrisisReportVo,
  isApiSuccess,
} from '../../api/crisisApi'
import { CRISIS_LEVELS, getLevelConfig } from '../../types/crisis'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const formRef = ref()
const currentCase = ref(null)
const levelHistory = ref([])

const adjustForm = ref({
  newLevel: '',
  reason: '',
  attachments: []
})

const rules = {
  newLevel: [{ required: true, message: '请选择要调整的等级', trigger: 'change' }],
  reason: [
    { required: true, message: '请填写调整原因', trigger: 'blur' },
    { min: 10, message: '调整原因至少10个字符', trigger: 'blur' }
  ]
}

const getLevelTagType = (level) => {
  const map = { red: 'danger', orange: 'warning', yellow: '', blue: '', green: 'success' }
  return map[level] || 'info'
}

const getLevelLabel = (level) => {
  return getLevelConfig(level)?.label || '未知'
}

const getLevelShortLabel = (level) => {
  return getLevelConfig(level)?.shortLabel || '未知'
}

const getLevelColor = (level) => {
  return getLevelConfig(level)?.color || '#94a3b8'
}

const getLevelDescription = (level) => {
  return getLevelConfig(level)?.description || ''
}

const getLevelResponseTime = (level) => {
  return getLevelConfig(level)?.responseTime || ''
}

const getLevelMeasures = (level) => {
  return getLevelConfig(level)?.interventionMeasures || []
}

const selectLevel = (level) => {
  if (level !== currentCase.value?.level) {
    adjustForm.value.newLevel = level
  }
}

const handleFileChange = (file, fileList) => {
  adjustForm.value.attachments = fileList
}

const loadCrisisDetail = async () => {
  loading.value = true
  const id = route.params.id || route.query.id
  currentCase.value = null
  levelHistory.value = []
  try {
    const res = await getCrisisDetail({ id })
    if (isApiSuccess(res) && res.data) {
      currentCase.value = normalizeCrisisReportVo(res.data)
    }
    if (!currentCase.value) {
      const lr = await getCrisisList({ page: 1, pageSize: 500 })
      if (isApiSuccess(lr)) {
        const rows = lr.data?.list || []
        const hit = rows.find((r) => r.reportId === id || r.id === id)
        if (hit) currentCase.value = hit
      }
    }
    levelHistory.value = currentCase.value?.levelHistory || []
    if (!currentCase.value) {
      ElMessage.warning('未找到危机记录（详情接口可能暂无数据，已尝试列表回退）')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('加载失败')
  }
  loading.value = false
}

const submitAdjust = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const levelConfig = getLevelConfig(adjustForm.value.newLevel)
  const currentConfig = getLevelConfig(currentCase.value?.level)
  
  const isUpgrade = levelConfig.priority < currentConfig.priority
  const confirmMsg = isUpgrade 
    ? `确认将危机等级从「${currentConfig.shortLabel}」提升为「${levelConfig.shortLabel}」？提升后将启动相应的干预措施。`
    : `确认将危机等级从「${currentConfig.shortLabel}」降为「${levelConfig.shortLabel}」？`

  try {
    await ElMessageBox.confirm(confirmMsg, '确认等级调整', {
      confirmButtonText: '确认调整',
      cancelButtonText: '取消',
      type: isUpgrade ? 'warning' : 'info'
    })
  } catch {
    return
  }

  submitting.value = true
  try {
    const res = await updateCrisisLevel({
      reportId: currentCase.value.reportId || currentCase.value.id,
      crisisLevel: adjustForm.value.newLevel,
    })
    if (isApiSuccess(res)) {
      ElMessage.success(res?.msg || '等级调整成功')
      router.back()
    } else {
      ElMessage.error(res?.msg || '调整失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error(e?.message || '调整失败')
  }
  submitting.value = false
}

onMounted(() => {
  loadCrisisDetail()
})
</script>

<style scoped>
.crisis-level-page {
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
.level-adjust-card,
.measures-card,
.history-card,
.level-guide-card {
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
  gap: 24px;
  align-items: flex-start;
}

.info-avatar {
  flex-shrink: 0;
}

.info-details {
  flex: 1;
}

.current-level-display {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-badge {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.level-badge.large {
  padding: 12px 24px;
  font-size: 16px;
}

.level-desc {
  color: #64748b;
  font-size: 14px;
}

.level-selector {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.level-option {
  position: relative;
  padding: 16px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.level-option:hover:not(.disabled) {
  border-color: var(--level-color);
  background: var(--level-bg);
}

.level-option.selected {
  border-color: var(--level-color);
  background: var(--level-bg);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--level-color) 20%, transparent);
}

.level-option.current {
  opacity: 0.6;
  cursor: not-allowed;
}

.level-option.disabled {
  pointer-events: none;
}

.level-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-bottom: 8px;
}

.level-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.level-response {
  font-size: 11px;
  color: #64748b;
}

.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--level-color);
  font-size: 16px;
}

.current-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
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

.measures-content {
  padding: 8px 0;
}

.new-level-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.response-time {
  color: #64748b;
  font-size: 14px;
}

.measures-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.measures-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 0;
  color: #334155;
  font-size: 14px;
  border-bottom: 1px dashed #e2e8f0;
}

.measures-list li:last-child {
  border-bottom: none;
}

.measures-list .el-icon {
  color: #16a34a;
  margin-top: 2px;
  flex-shrink: 0;
}

.history-list {
  max-height: 500px;
  overflow-y: auto;
}

.history-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.level-change {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.level-tag {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.level-tag.from {
  background: #fff;
  border: 1px solid;
}

.initial-label {
  font-size: 12px;
  color: #64748b;
}

.history-reason {
  font-size: 13px;
  color: #475569;
  margin-bottom: 8px;
  line-height: 1.5;
}

.history-operator {
  font-size: 12px;
  color: #94a3b8;
}

.level-guide {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guide-item {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.guide-item.active {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.guide-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.guide-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 13px;
}

.guide-desc {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .level-selector {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .el-row {
    flex-direction: column;
  }
  
  .el-col {
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
  
  .level-selector {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .level-selector {
    grid-template-columns: 1fr;
  }
  
  .student-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
