<template>
  <div class="profile-page">
    <!-- 顶部导航 -->
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回</el-button>
      <span class="nav-title">个人心理档案</span>
      <el-button type="primary" @click="exportProfile">
        <el-icon><Download /></el-icon>
        导出档案
      </el-button>
    </div>

    <!-- 个人信息卡片 -->
    <div class="profile-card">
      <div class="card-header">
        <div class="avatar-section">
          <el-avatar :size="88" :src="avatarUrl">
            <el-icon :size="40"><User /></el-icon>
          </el-avatar>
          <div class="status-dot" :class="profile.academicStatus === '正常' ? 'active' : ''"></div>
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ profile.name }}</h2>
          <p class="user-id">学号：{{ profile.studentId }}</p>
          <div class="user-meta">
            <span><el-icon><School /></el-icon>{{ profile.college }}</span>
            <span><el-icon><Collection /></el-icon>{{ profile.major }}</span>
          </div>
          <div class="user-tags">
            <el-tag v-for="tag in profile.tags" :key="tag" size="small" effect="plain">
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="quick-stats">
          <div class="stat-item">
            <span class="stat-value">{{ profile.assessmentRecords?.length || 0 }}</span>
            <span class="stat-label">测评记录</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ profile.consultationRecords?.length || 0 }}</span>
            <span class="stat-label">咨询记录</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ profile.activityRecords?.length || 0 }}</span>
            <span class="stat-label">活动参与</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 信息内容区域 -->
    <div class="content-grid">
      <!-- 左侧基本信息 -->
      <div class="info-column">
        <!-- 基本信息 -->
        <div class="info-card">
          <div class="card-title">
            <el-icon><User /></el-icon>
            <span>基本信息</span>
          </div>
          <div class="info-list">
            <div class="info-row">
              <span class="label">姓名</span>
              <span class="value">{{ profile.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">学号</span>
              <span class="value">{{ profile.studentId }}</span>
            </div>
            <div class="info-row">
              <span class="label">性别</span>
              <span class="value">{{ profile.gender === 1 ? '男' : '女' }}</span>
            </div>
            <div class="info-row">
              <span class="label">年龄</span>
              <span class="value">{{ profile.age }}岁</span>
            </div>
            <div class="info-row">
              <span class="label">出生日期</span>
              <span class="value">{{ profile.birthday }}</span>
            </div>
            <div class="info-row">
              <span class="label">民族</span>
              <span class="value">{{ profile.nation }}</span>
            </div>
          </div>
        </div>

        <!-- 学业信息 -->
        <div class="info-card">
          <div class="card-title">
            <el-icon><School /></el-icon>
            <span>学业信息</span>
          </div>
          <div class="info-list">
            <div class="info-row">
              <span class="label">学院</span>
              <span class="value">{{ profile.college }}</span>
            </div>
            <div class="info-row">
              <span class="label">专业</span>
              <span class="value">{{ profile.major }}</span>
            </div>
            <div class="info-row">
              <span class="label">班级</span>
              <span class="value">{{ profile.class }}</span>
            </div>
            <div class="info-row">
              <span class="label">入学时间</span>
              <span class="value">{{ profile.enrollmentDate }}</span>
            </div>
            <div class="info-row">
              <span class="label">学业状态</span>
              <span class="value">
                <el-tag :type="profile.academicStatus === '正常' ? 'success' : 'warning'" size="small">
                  {{ profile.academicStatus }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- 健康信息 -->
        <div class="info-card">
          <div class="card-title">
            <el-icon><FirstAidKit /></el-icon>
            <span>健康信息</span>
          </div>
          <div class="info-list">
            <div class="info-row">
              <span class="label">身体状况</span>
              <span class="value">{{ profile.healthStatus }}</span>
            </div>
            <div class="info-row">
              <span class="label">既往病史</span>
              <span class="value">{{ profile.medicalHistory || '无' }}</span>
            </div>
            <div class="info-row">
              <span class="label">过敏史</span>
              <span class="value">{{ profile.allergyHistory || '无' }}</span>
            </div>
          </div>
        </div>

        <!-- 联系方式 -->
        <div class="info-card">
          <div class="card-title">
            <el-icon><Phone /></el-icon>
            <span>联系方式</span>
          </div>
          <div class="info-list">
            <div class="info-row">
              <span class="label">手机</span>
              <span class="value">{{ profile.contact?.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">邮箱</span>
              <span class="value">{{ profile.contact?.email }}</span>
            </div>
            <div class="info-row">
              <span class="label">紧急联系人</span>
              <span class="value">{{ profile.contact?.emergencyContact }}（{{ profile.contact?.emergencyRelation }}）</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧档案记录 -->
      <div class="records-column">
        <!-- 心理测评档案 -->
        <div class="records-card">
          <div class="card-title">
            <el-icon><Document /></el-icon>
            <span>心理测评档案</span>
            <el-badge :value="profile.assessmentRecords?.length" :hidden="!profile.assessmentRecords?.length" />
          </div>
          <div class="records-list" v-if="profile.assessmentRecords?.length">
            <div
              v-for="record in profile.assessmentRecords"
              :key="record.id"
              class="record-item"
              @click="viewAssessment(record.id)"
            >
              <div class="record-icon assessment">
                <el-icon><EditPen /></el-icon>
              </div>
              <div class="record-info">
                <span class="record-title">{{ record.title }}</span>
                <span class="record-date">{{ record.date }}</span>
              </div>
              <div class="record-extra">
                <span class="record-score">{{ record.score }}分</span>
                <el-tag :type="getLevelType(record.level)" size="small">{{ getLevelText(record.level) }}</el-tag>
              </div>
              <el-icon class="record-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <el-empty v-else description="暂无测评记录" :image-size="60" />
        </div>

        <!-- 咨询档案 -->
        <div class="records-card">
          <div class="card-title">
            <el-icon><ChatDotRound /></el-icon>
            <span>咨询档案</span>
            <el-badge :value="profile.consultationRecords?.length" :hidden="!profile.consultationRecords?.length" />
          </div>
          <div class="records-list" v-if="profile.consultationRecords?.length">
            <div
              v-for="record in profile.consultationRecords"
              :key="record.id"
              class="record-item"
              @click="viewConsultation(record.id)"
            >
              <div class="record-icon consultation">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="record-info">
                <span class="record-title">心理咨询</span>
                <span class="record-date">{{ record.date }}</span>
              </div>
              <div class="record-extra">
                <span class="record-meta">{{ record.counselor }} · {{ record.duration }}分钟</span>
              </div>
              <el-icon class="record-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <el-empty v-else description="暂无咨询记录" :image-size="60" />
        </div>

        <!-- 访谈档案 -->
        <div class="records-card">
          <div class="card-title">
            <el-icon><Microphone /></el-icon>
            <span>访谈档案</span>
            <el-badge :value="profile.interviewRecords?.length" :hidden="!profile.interviewRecords?.length" />
          </div>
          <div class="records-list" v-if="profile.interviewRecords?.length">
            <div
              v-for="record in profile.interviewRecords"
              :key="record.id"
              class="record-item"
              @click="viewInterview(record.id)"
            >
              <div class="record-icon interview">
                <el-icon><Microphone /></el-icon>
              </div>
              <div class="record-info">
                <span class="record-title">{{ record.title }}</span>
                <span class="record-date">{{ record.date }}</span>
              </div>
              <div class="record-extra">
                <span class="record-meta">{{ record.interviewer }} · {{ record.duration }}分钟</span>
              </div>
              <el-icon class="record-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <el-empty v-else description="暂无访谈记录" :image-size="60" />
        </div>

        <!-- 危机干预档案 -->
        <div class="records-card" v-if="profile.crisisRecords?.length">
          <div class="card-title">
            <el-icon><Warning /></el-icon>
            <span>危机干预档案</span>
            <el-badge :value="profile.crisisRecords?.length" type="danger" />
          </div>
          <div class="records-list">
            <div
              v-for="record in profile.crisisRecords"
              :key="record.id"
              class="record-item"
              @click="viewCrisis(record.id)"
            >
              <div class="record-icon crisis">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="record-info">
                <span class="record-title">{{ record.title }}</span>
                <span class="record-date">{{ record.date }}</span>
              </div>
              <div class="record-extra">
                <el-tag :type="getCrisisLevelType(record.level)" size="small">
                  {{ getCrisisLevelText(record.level) }}
                </el-tag>
                <el-tag type="success" size="small">{{ record.status }}</el-tag>
              </div>
              <el-icon class="record-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <!-- 活动档案 -->
        <div class="records-card">
          <div class="card-title">
            <el-icon><Flag /></el-icon>
            <span>活动档案</span>
            <el-badge :value="profile.activityRecords?.length" :hidden="!profile.activityRecords?.length" />
          </div>
          <div class="records-list" v-if="profile.activityRecords?.length">
            <div
              v-for="record in profile.activityRecords"
              :key="record.id"
              class="record-item"
              @click="viewActivity(record.id)"
            >
              <div class="record-icon activity">
                <el-icon><Flag /></el-icon>
              </div>
              <div class="record-info">
                <span class="record-title">{{ record.title }}</span>
                <span class="record-date">{{ record.date }}</span>
              </div>
              <div class="record-extra">
                <el-tag type="success" size="small">{{ record.status }}</el-tag>
              </div>
              <el-icon class="record-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <el-empty v-else description="暂无活动记录" :image-size="60" />
        </div>
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      :title="detailTitle"
      width="560px"
      destroy-on-close
      class="record-detail-dialog"
      @closed="onDetailClosed"
    >
      <template v-if="detailRecord">
        <template v-if="detailKind === 'interview'">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="主题">{{ detailRecord.title }}</el-descriptions-item>
            <el-descriptions-item label="日期">{{ detailRecord.date }}</el-descriptions-item>
            <el-descriptions-item label="访谈人">{{ detailRecord.interviewer }}</el-descriptions-item>
            <el-descriptions-item label="时长">{{ detailRecord.duration }} 分钟</el-descriptions-item>
            <el-descriptions-item v-if="detailRecord.summary" label="摘要">
              <p class="detail-text">{{ detailRecord.summary }}</p>
            </el-descriptions-item>
            <el-descriptions-item v-else label="说明">
              <p class="detail-text muted">暂无更多摘要，完整纪要以后端档案接口为准。</p>
            </el-descriptions-item>
          </el-descriptions>
        </template>
        <template v-else-if="detailKind === 'consultation'">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="咨询日期">{{ detailRecord.date }}</el-descriptions-item>
            <el-descriptions-item label="咨询师">{{ detailRecord.counselor }}</el-descriptions-item>
            <el-descriptions-item label="时长">{{ detailRecord.duration }} 分钟</el-descriptions-item>
            <el-descriptions-item v-if="detailRecord.method" label="方式">{{ detailRecord.method }}</el-descriptions-item>
            <el-descriptions-item v-if="detailRecord.summary" label="摘要">
              <p class="detail-text">{{ detailRecord.summary }}</p>
            </el-descriptions-item>
            <el-descriptions-item v-else label="说明">
              <p class="detail-text muted">咨询过程详情由心理中心记录，接口就绪后可展示完整内容。</p>
            </el-descriptions-item>
          </el-descriptions>
        </template>
        <template v-else-if="detailKind === 'crisis'">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="事件标题">{{ detailRecord.title }}</el-descriptions-item>
            <el-descriptions-item label="日期">{{ detailRecord.date }}</el-descriptions-item>
            <el-descriptions-item label="等级">
              <el-tag :type="getCrisisLevelType(detailRecord.level)" size="small">
                {{ getCrisisLevelText(detailRecord.level) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">{{ detailRecord.status }}</el-descriptions-item>
            <el-descriptions-item v-if="detailRecord.description" label="说明">
              <p class="detail-text">{{ detailRecord.description }}</p>
            </el-descriptions-item>
          </el-descriptions>
        </template>
        <template v-else-if="detailKind === 'activity'">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="活动名称">{{ detailRecord.title }}</el-descriptions-item>
            <el-descriptions-item label="日期">{{ detailRecord.date }}</el-descriptions-item>
            <el-descriptions-item label="参与状态">
              <el-tag type="success" size="small">{{ detailRecord.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="detailRecord.location" label="地点">{{ detailRecord.location }}</el-descriptions-item>
            <el-descriptions-item v-if="detailRecord.summary" label="备注">
              <p class="detail-text">{{ detailRecord.summary }}</p>
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </template>
      <template #footer>
        <el-button v-if="detailKind === 'activity'" @click="openActivityPage">打开活动详情页</el-button>
        <el-button type="primary" @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  Download,
  User,
  School,
  Collection,
  FirstAidKit,
  Phone,
  Document,
  EditPen,
  ChatDotRound,
  Microphone,
  Warning,
  Flag,
} from '@element-plus/icons-vue'
import { getProfileDetail } from '../../../api/profileApi'
import { isSuccess } from '../../../utils/responseHelper'

const router = useRouter()
const avatarUrl = ref('')

const detailVisible = ref(false)
const detailKind = ref('interview')
const detailRecord = ref(null)

const detailTitle = computed(() => {
  const map = {
    interview: '访谈记录详情',
    consultation: '咨询记录详情',
    crisis: '危机干预记录详情',
    activity: '活动参与详情'
  }
  return map[detailKind.value] || '记录详情'
})

function onDetailClosed() {
  detailRecord.value = null
}

const profile = ref({
  name: '',
  studentId: '',
  gender: 1,
  age: 0,
  birthday: '',
  nation: '',
  college: '',
  major: '',
  class: '',
  enrollmentDate: '',
  academicStatus: '',
  healthStatus: '',
  medicalHistory: '',
  allergyHistory: '',
  contact: {
    phone: '',
    email: '',
    emergencyContact: '',
    emergencyRelation: ''
  },
  tags: [],
  assessmentRecords: [],
  interviewRecords: [],
  consultationRecords: [],
  crisisRecords: [],
  activityRecords: [],
  referralRecords: [],
  behaviorRecords: []
})

onMounted(async () => {
  await loadProfile()
})


function normalizeProfile(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      name: '',
      studentId: '',
      gender: 1,
      age: 0,
      birthday: '',
      nation: '',
      college: '',
      major: '',
      class: '',
      enrollmentDate: '',
      academicStatus: '',
      healthStatus: '',
      medicalHistory: '',
      allergyHistory: '',
      contact: {
        phone: '',
        email: '',
        emergencyContact: '',
        emergencyRelation: ''
      },
      tags: [],
      assessmentRecords: [],
      interviewRecords: [],
      consultationRecords: [],
      crisisRecords: [],
      activityRecords: [],
      referralRecords: [],
      behaviorRecords: []
    }
  }
  const baseContact = {
    phone: '',
    email: '',
    emergencyContact: '',
    emergencyRelation: ''
  }
  const c = raw.contact
  const contact =
      c && typeof c === 'object'
          ? { ...baseContact, ...c }
          : {
            ...baseContact,
            phone: typeof c === 'string' ? c : baseContact.phone
          }
  return {
    ...raw,
    contact,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    assessmentRecords:
        raw.assessmentRecords || raw.assessments || [],
    interviewRecords: raw.interviewRecords || [],
    consultationRecords:
        raw.consultationRecords || raw.consultations || [],
    crisisRecords: raw.crisisRecords || [],
    activityRecords: raw.activityRecords || raw.activities || [],
    referralRecords: raw.referralRecords || [],
    behaviorRecords: raw.behaviorRecords || []
  }
}

const loadProfile = async () => {
  try {
    // 优先使用 userId（JWT subject，可能是 UUID 或数字）
    const userId = localStorage.getItem('userId') || localStorage.getItem('user_id') || ''
    const studentId = localStorage.getItem('studentId') || ''

    let params = {}

    if (userId) {
      // 直接使用 userId，不转换类型（UUID 保持字符串，数字保持数字）
      params = { id: userId }
      console.log('[profile] 使用 userId:', userId, 'type:', typeof userId)
    } else if (studentId) {
      // 降级使用 studentId
      params = { studentId }
      console.log('[profile] 使用 studentId:', studentId)
    }

    if (Object.keys(params).length > 0) {
      const res = await getProfileDetail(params)
      if (isSuccess(res) && res.data) {
        profile.value = normalizeProfile(res.data)
        return
      }
    }
  } catch (e) {
    console.error('[profile] GET /api/profile/detail 失败', e)
    ElMessage.error('加载个人档案失败，请稍后重试')
  }
  profile.value = normalizeProfile({})
}


const getLevelText = (level) => {
  const levelMap = {
    excellent: '优秀',
    normal: '良好',
    warning: '需关注',
    danger: '需干预'
  }
  return levelMap[level] || level
}

const getLevelType = (level) => {
  const typeMap = {
    excellent: 'success',
    normal: 'info',
    warning: 'warning',
    danger: 'danger'
  }
  return typeMap[level] || 'info'
}

const getCrisisLevelText = (level) => {
  const levelMap = {
    red: '极高危',
    orange: '高危',
    yellow: '中危',
    blue: '轻度',
    green: '正常'
  }
  return levelMap[level] || level
}

const getCrisisLevelType = (level) => {
  const typeMap = {
    red: 'danger',
    orange: 'warning',
    yellow: 'warning',
    blue: 'info',
    green: 'success'
  }
  return typeMap[level] || 'info'
}

const viewAssessment = (id) => {
  router.push(`/student/assessment/${id}/result`)
}

const viewInterview = (id) => {
  const row = profile.value.interviewRecords?.find((r) => String(r.id) === String(id))
  if (!row) {
    ElMessage.warning('未找到该访谈记录')
    return
  }
  detailKind.value = 'interview'
  detailRecord.value = row
  detailVisible.value = true
}

const viewConsultation = (id) => {
  const row = profile.value.consultationRecords?.find((r) => String(r.id) === String(id))
  if (!row) {
    ElMessage.warning('未找到该咨询记录')
    return
  }
  detailKind.value = 'consultation'
  detailRecord.value = row
  detailVisible.value = true
}

const viewCrisis = (id) => {
  const row = profile.value.crisisRecords?.find((r) => String(r.id) === String(id))
  if (!row) {
    ElMessage.warning('未找到该危机记录')
    return
  }
  detailKind.value = 'crisis'
  detailRecord.value = row
  detailVisible.value = true
}

const viewActivity = (id) => {
  const row = profile.value.activityRecords?.find((r) => String(r.id) === String(id))
  if (!row) {
    ElMessage.warning('未找到该活动记录')
    return
  }
  detailKind.value = 'activity'
  detailRecord.value = row
  detailVisible.value = true
}

function openActivityPage() {
  const id = detailRecord.value?.id
  detailVisible.value = false
  if (id) {
    router.push(`/student/activity/${id}`)
  }
}

const exportProfile = async () => {
  try {
    await exportByApi({
      url: '/api/student/profile/export',
      params: { studentId: profile.value.studentId || profile.value.id },
      filename: `student-profile-${profile.value.studentId || 'self'}.pdf`,
      fallbackData: profile.value,
    })
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}
</script>

<style scoped>
.detail-text {
  margin: 0;
  line-height: 1.6;
  color: #334155;
  font-size: 14px;
}

.detail-text.muted {
  color: #94a3b8;
}

.profile-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.page-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.profile-card {
  background: #fff;
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px;
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: #fff;
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.avatar-section :deep(.el-avatar) {
  border: 3px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.2);
}

.status-dot {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #94a3b8;
  border: 3px solid #fff;
}

.status-dot.active {
  background: #22c55e;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
}

.user-id {
  margin: 0 0 12px 0;
  font-size: 14px;
  opacity: 0.9;
}

.user-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  font-size: 14px;
}

.user-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
}

.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.user-tags :deep(.el-tag) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.quick-stats {
  display: flex;
  gap: 24px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.content-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.records-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card,
.records-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.card-title :deep(.el-badge) {
  margin-left: auto;
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-size: 14px;
  color: #64748b;
}

.info-row .value {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.record-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.record-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.record-icon.assessment {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
}

.record-icon.consultation {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.record-icon.interview {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.record-icon.crisis {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.record-icon.activity {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.record-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-date {
  font-size: 12px;
  color: #94a3b8;
}

.record-extra {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.record-score {
  font-size: 14px;
  font-weight: 600;
  color: #0ea5e9;
}

.record-meta {
  font-size: 12px;
  color: #64748b;
}

.record-arrow {
  color: #cbd5e1;
  flex-shrink: 0;
  transition: all 0.2s;
}

.record-item:hover .record-arrow {
  color: #0ea5e9;
  transform: translateX(2px);
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-wrap: wrap;
  }

  .quick-stats {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .profile-page {
    padding: 12px;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 24px 20px;
  }

  .user-meta {
    justify-content: center;
  }

  .user-tags {
    justify-content: center;
  }

  .quick-stats {
    padding: 12px 16px;
    gap: 16px;
  }

  .stat-value {
    font-size: 22px;
  }

  .record-extra {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
}
</style>
