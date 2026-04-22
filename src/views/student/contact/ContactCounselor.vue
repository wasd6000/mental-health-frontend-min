<template>
  <div class="contact-counselor">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="$router.back()" :icon="ArrowLeft" text>返回</el-button>
        <h1 class="page-title">联系咨询师/辅导员</h1>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="MessageBox" @click="goToPrivateMessages">
          我的私信
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索咨询师姓名或专长..."
        clearable
        prefix-icon="Search"
        class="search-input"
      />
      <el-select v-model="specialtyFilter" placeholder="专长筛选" clearable class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="情绪管理" value="情绪管理" />
        <el-option label="人际关系" value="人际关系" />
        <el-option label="学业压力" value="学业压力" />
        <el-option label="焦虑抑郁" value="焦虑抑郁" />
        <el-option label="家庭关系" value="家庭关系" />
        <el-option label="恋爱问题" value="恋爱问题" />
      </el-select>
    </div>

    <!-- 我的辅导员卡片 -->
    <div class="section-card tutor-section" v-if="tutor">
      <div class="section-header">
        <div class="section-title-wrapper">
          <div class="section-icon tutor-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <h2 class="section-title">我的辅导员</h2>
        </div>
        <el-tag type="primary" effect="light" round>直接负责人</el-tag>
      </div>

      <div class="tutor-card">
        <div class="avatar-wrapper">
          <el-avatar :size="72" :src="tutor.avatarUrl">
            {{ tutor.name?.charAt(0) }}
          </el-avatar>
          <div class="status-dot online" v-if="tutor.online"></div>
        </div>
        <div class="info-wrapper">
          <div class="name-row">
            <h3 class="name">{{ tutor.name }}</h3>
            <el-tag size="small" type="info">{{ tutor.department }}</el-tag>
          </div>
          <p class="description">{{ tutor.bio || '负责学生日常管理和心理健康工作' }}</p>
          <div class="contact-details">
            <div class="contact-item" v-if="tutor.phone">
              <el-icon><Phone /></el-icon>
              <span>{{ tutor.phone }}</span>
              <el-button type="primary" link size="small" @click="copyText(tutor.phone)">复制</el-button>
            </div>
            <div class="contact-item" v-if="tutor.email">
              <el-icon><Message /></el-icon>
              <span>{{ tutor.email }}</span>
            </div>
            <div class="contact-item" v-if="tutor.office">
              <el-icon><Location /></el-icon>
              <span>{{ tutor.office }}</span>
            </div>
          </div>
        </div>
        <div class="action-wrapper">
          <el-button type="primary" size="large" @click="startPrivateChat(tutor)">
            <el-icon><ChatDotRound /></el-icon>
            发私信
          </el-button>
          <el-button size="large" @click="showMessageDialog(tutor, 'tutor')">
            <el-icon><EditPen /></el-icon>
            留言
          </el-button>
        </div>
      </div>
    </div>

    <!-- 心理咨询师列表 -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title-wrapper">
          <div class="section-icon counselor-icon">
            <el-icon><User /></el-icon>
          </div>
          <h2 class="section-title">心理咨询师</h2>
          <span class="counselor-count">共 {{ filteredCounselors.length }} 位</span>
        </div>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="grid">
            <el-icon><Grid /></el-icon>
          </el-radio-button>
          <el-radio-button value="list">
            <el-icon><List /></el-icon>
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="counselor-grid">
        <div
          v-for="c in filteredCounselors"
          :key="c.id"
          class="counselor-card"
          :class="{ 'has-schedule': c.available }"
        >
          <div class="card-header">
            <div class="avatar-wrapper">
              <el-avatar :size="64" :src="c.avatarUrl">
                {{ c.name?.charAt(0) }}
              </el-avatar>
              <div class="status-dot" :class="c.status || 'offline'"></div>
            </div>
            <div class="header-info">
              <h3 class="name">{{ c.name }}</h3>
              <p class="title">{{ c.title }}</p>
            </div>
          </div>

          <div class="specialty-tags">
            <el-tag
              v-for="tag in parseSpecialty(c.specialty)"
              :key="tag"
              size="small"
              effect="light"
              round
            >
              {{ tag }}
            </el-tag>
          </div>

          <div class="schedule-info" v-if="c.availableTime">
            <el-icon><Clock /></el-icon>
            <span>{{ c.availableTime }}</span>
          </div>

          <div class="card-actions">
            <el-button type="primary" @click="startPrivateChat(c)">
              <el-icon><ChatDotRound /></el-icon>
              私信
            </el-button>
            <el-button @click="goAppointment(c)">
              <el-icon><Calendar /></el-icon>
              预约
            </el-button>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="counselor-list">
        <div
          v-for="c in filteredCounselors"
          :key="c.id"
          class="counselor-list-item"
        >
          <div class="list-avatar">
            <el-avatar :size="56" :src="c.avatarUrl">
              {{ c.name?.charAt(0) }}
            </el-avatar>
            <div class="status-dot" :class="c.status || 'offline'"></div>
          </div>
          <div class="list-info">
            <div class="info-header">
              <h3 class="name">{{ c.name }}</h3>
              <span class="title">{{ c.title }}</span>
            </div>
            <div class="specialty-tags">
              <el-tag
                v-for="tag in parseSpecialty(c.specialty)"
                :key="tag"
                size="small"
                effect="light"
                round
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="contact-details">
              <span v-if="c.phone"><el-icon><Phone /></el-icon> {{ c.phone }}</span>
              <span v-if="c.office"><el-icon><Location /></el-icon> {{ c.office }}</span>
              <span v-if="c.availableTime"><el-icon><Clock /></el-icon> {{ c.availableTime }}</span>
            </div>
          </div>
          <div class="list-actions">
            <el-button type="primary" @click="startPrivateChat(c)">
              <el-icon><ChatDotRound /></el-icon>
              发私信
            </el-button>
            <el-button @click="goAppointment(c)">
              <el-icon><Calendar /></el-icon>
              预约咨询
            </el-button>
            <el-button text @click="showMessageDialog(c, 'counselor')">
              <el-icon><EditPen /></el-icon>
              留言
            </el-button>
          </div>
        </div>
      </div>

      <el-empty
        v-if="filteredCounselors.length === 0"
        description="暂无符合条件的咨询师"
        :image-size="120"
      />
    </div>

    <!-- 紧急热线 -->
    <div class="section-card hotline-section">
      <div class="section-header">
        <div class="section-title-wrapper">
          <div class="section-icon hotline-icon">
            <el-icon><PhoneFilled /></el-icon>
          </div>
          <h2 class="section-title">紧急心理援助热线</h2>
        </div>
        <el-tag type="danger" effect="dark" round>24小时服务</el-tag>
      </div>

      <div class="hotline-grid">
        <div class="hotline-card" v-for="h in hotlines" :key="h.name">
          <div class="hotline-header">
            <h4>{{ h.name }}</h4>
            <el-tag size="small" :type="h.type || 'info'">{{ h.time }}</el-tag>
          </div>
          <div class="hotline-number" @click="copyText(h.number)">
            <el-icon><Phone /></el-icon>
            <span class="number">{{ h.number }}</span>
            <el-button type="primary" link size="small">复制</el-button>
          </div>
          <p class="hotline-desc" v-if="h.description">{{ h.description }}</p>
        </div>
      </div>
    </div>

    <!-- 发送消息/留言弹窗 -->
    <el-dialog v-model="messageDialogVisible" title="发送消息" width="520px" destroy-on-close>
      <el-form :model="messageForm" label-width="80px" ref="messageFormRef" :rules="messageRules">
        <el-form-item label="收件人">
          <div class="recipient-info">
            <el-avatar :size="32" :src="messageTarget?.avatarUrl">
              {{ messageTarget?.name?.charAt(0) }}
            </el-avatar>
            <span>{{ messageTarget?.name }}</span>
            <el-tag size="small" type="info">{{ messageTarget?.type === 'tutor' ? '辅导员' : '咨询师' }}</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="主题" prop="subject">
          <el-input v-model="messageForm.subject" placeholder="请输入消息主题" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="messageForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入消息内容，咨询师会在看到消息后尽快回复您..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="紧急程度">
          <el-radio-group v-model="messageForm.priority">
            <el-radio :value="0">普通</el-radio>
            <el-radio :value="1">较紧急</el-radio>
            <el-radio :value="2">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="messageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSendMessage" :loading="sending">
          发送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, User, UserFilled, Phone, Message, Location,
  ChatDotRound, Calendar, Clock, Search, Grid, List,
  EditPen, PhoneFilled, MessageBox
} from '@element-plus/icons-vue'
import { sendMessage } from '@/api/openapi'
import { fetchConsulateCounselorList } from '@/api/consultApi'
import { sendPrivateMessage } from '@/api/message'

const router = useRouter()

// 搜索和筛选
const searchKeyword = ref('')
const specialtyFilter = ref('')
const viewMode = ref('grid')

// 数据
const loading = ref(false)
const tutor = ref(null)
const counselors = ref([])

// 计算属性：过滤后的咨询师
const filteredCounselors = computed(() => {
  let result = counselors.value

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(c =>
      c.name?.toLowerCase().includes(keyword) ||
      c.specialty?.toLowerCase().includes(keyword)
    )
  }

  // 专长筛选
  if (specialtyFilter.value) {
    result = result.filter(c =>
      c.specialty?.includes(specialtyFilter.value)
    )
  }

  return result
})

// 热线数据
const hotlines = ref([
  {
    name: '全国心理援助热线',
    number: '400-161-9995',
    time: '24小时',
    type: 'danger',
    description: '国家卫生健康委员会官方心理援助热线'
  },
  {
    name: '北京心理危机研究与干预中心',
    number: '010-82951332',
    time: '24小时',
    type: 'danger',
    description: '专业心理危机干预服务'
  },
  {
    name: '校心理咨询中心',
    number: '010-12345678',
    time: '工作日 8:30-17:30',
    type: 'primary',
    description: '校内专业心理咨询服务'
  },
  {
    name: '教育部全国统一心理援助热线',
    number: '400-161-9995',
    time: '24小时',
    type: 'danger',
    description: '教育部设立的学生心理援助专线'
  }
])

// 消息弹窗
const messageDialogVisible = ref(false)
const messageTarget = ref(null)
const messageFormRef = ref(null)
const sending = ref(false)
const messageForm = ref({
  subject: '',
  content: '',
  priority: 0
})

const messageRules = {
  subject: [{ required: true, message: '请输入主题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// 初始化加载数据
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      loadTutorInfo(),
      loadCounselors()
    ])
  } finally {
    loading.value = false
  }
})

// 加载辅导员信息
async function loadTutorInfo() {
  // 从 localStorage 获取辅导员信息，如果没有则使用 mock
  const tutorInfo = localStorage.getItem('tutor_info')
  if (tutorInfo) {
    tutor.value = JSON.parse(tutorInfo)
  } else {
    // Mock 数据，实际应该从 API 获取
    tutor.value = {
      id: 'tutor_001',
      name: '王老师',
      department: '计算机科学与技术学院',
      phone: '010-12345678',
      email: 'wang@example.edu.cn',
      office: '行政楼 305 室',
      avatarUrl: '',
      online: true,
      bio: '负责学生日常管理和心理健康工作，有5年辅导员工作经验'
    }
  }
}

// 加载咨询师列表
async function loadCounselors() {
  try {
    const res = await fetchConsulateCounselorList({
      page: 1,
      pageSize: 50
    })

    if (res.code === 200 && res.data) {
      const list = res.data.list || res.data.records || []
      counselors.value = list.map(c => ({
        id: c.counselorId || c.id,
        name: c.name || c.realName,
        title: c.title || '心理咨询师',
        specialty: c.specialty || c.specialties || '情绪管理、人际关系',
        phone: c.phone,
        email: c.email,
        office: c.officeLocation || c.office,
        avatarUrl: c.avatarUrl,
        availableTime: c.availableTime || c.workHours,
        status: c.status || 'offline',
        available: c.available !== false
      }))
    } else {
      // 使用 mock 数据作为后备
      useMockCounselors()
    }
  } catch (e) {
    console.error('加载咨询师列表失败:', e)
    useMockCounselors()
  }
}

// Mock 咨询师数据
function useMockCounselors() {
  counselors.value = [
    {
      id: '1',
      name: '李心理',
      title: '国家二级心理咨询师',
      specialty: '情绪管理、人际关系',
      phone: '010-87654321',
      office: '心理咨询中心 201 室',
      availableTime: '周一至周五 9:00-17:00',
      avatarUrl: '',
      status: 'online',
      available: true
    },
    {
      id: '2',
      name: '张咨询',
      title: '心理治疗师',
      specialty: '学业压力、焦虑抑郁',
      phone: '010-87654322',
      office: '心理咨询中心 202 室',
      availableTime: '周二、周四 14:00-17:00',
      avatarUrl: '',
      status: 'busy',
      available: true
    },
    {
      id: '3',
      name: '王医生',
      title: '精神科医师',
      specialty: '严重心理问题、危机干预',
      phone: '010-87654323',
      office: '心理咨询中心 203 室',
      availableTime: '周三、周五 9:00-16:00',
      avatarUrl: '',
      status: 'offline',
      available: false
    },
    {
      id: '4',
      name: '陈老师',
      title: '高级心理咨询师',
      specialty: '家庭关系、恋爱问题',
      phone: '010-87654324',
      office: '心理咨询中心 204 室',
      availableTime: '周一至周四 10:00-18:00',
      avatarUrl: '',
      status: 'online',
      available: true
    }
  ]
}

// 解析专长标签
function parseSpecialty(specialty) {
  if (!specialty) return ['心理咨询']
  return specialty.split(/[,、，]/).filter(Boolean).slice(0, 3)
}

// 打开消息弹窗
function showMessageDialog(target, type) {
  messageTarget.value = { ...target, type }
  messageForm.value = { subject: '', content: '', priority: 0 }
  messageDialogVisible.value = true
}

// 发送消息
async function handleSendMessage() {
  if (!messageFormRef.value) return

  await messageFormRef.value.validate(async (valid) => {
    if (!valid) return

    sending.value = true
    try {
      const res = await sendMessage({
        userId: messageTarget.value.id,
        title: messageForm.value.subject,
        content: messageForm.value.content,
        messageType: 'PRIVATE',
        priority: messageForm.value.priority
      })

      if (res?.code === 200) {
        ElMessage.success('消息发送成功')
        messageDialogVisible.value = false
        messageForm.value = { subject: '', content: '', priority: 0 }
      } else {
        ElMessage.error(res?.msg || '发送失败')
      }
    } catch (e) {
      console.error('发送消息失败:', e)
      ElMessage.error('发送失败，请稍后重试')
    } finally {
      sending.value = false
    }
  })
}

// 发起私信聊天
async function startPrivateChat(target) {
  try {
    // 使用私信系统发送第一条消息，打开对话
    await ElMessageBox.confirm(
      `确定要开始向 ${target.name} 的私信对话吗？`,
      '发起私信',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 跳转到消息中心私信页面
    router.push('/message?tab=private')
  } catch {
    // 用户取消
  }
}

// 跳转到预约页面
function goAppointment(counselor) {
  router.push({
    path: '/appointment/select',
    query: { counselorId: counselor.id }
  })
}

// 跳转到我的私信
function goToPrivateMessages() {
  router.push('/message?tab=private')
}

// 复制文本
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.contact-counselor {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.filter-select {
  width: 160px;
}

/* 区块卡片 */
.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.tutor-icon {
  background: #dbeafe;
  color: #2563eb;
}

.counselor-icon {
  background: #dcfce7;
  color: #16a34a;
}

.hotline-icon {
  background: #fee2e2;
  color: #dc2626;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.counselor-count {
  font-size: 14px;
  color: #64748b;
  font-weight: normal;
}

/* 辅导员卡片 */
.tutor-section {
  background: linear-gradient(135deg, #eff6ff 0%, #fff 50%);
  border-color: #bfdbfe;
}

.tutor-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #94a3b8;
}

.status-dot.online {
  background: #22c55e;
}

.status-dot.busy {
  background: #f59e0b;
}

.status-dot.offline {
  background: #94a3b8;
}

.info-wrapper {
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.name {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.description {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.contact-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #475569;
}

.contact-item .el-icon {
  color: #94a3b8;
}

.action-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

/* 咨询师网格 */
.counselor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.counselor-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.counselor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.counselor-card.has-schedule {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.header-info .name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.header-info .title {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.schedule-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #3b82f6;
  background: #dbeafe;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-actions .el-button {
  flex: 1;
}

/* 咨询师列表 */
.counselor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.counselor-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.counselor-list-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.list-avatar {
  position: relative;
  flex-shrink: 0;
}

.list-info {
  flex: 1;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.info-header .name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.info-header .title {
  font-size: 13px;
  color: #64748b;
}

.list-info .contact-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
}

.list-info .contact-details span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.list-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 热线部分 */
.hotline-section {
  background: linear-gradient(135deg, #fef2f2 0%, #fff 50%);
  border-color: #fecaca;
}

.hotline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.hotline-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #fecaca;
}

.hotline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.hotline-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #7f1d1d;
  margin: 0;
}

.hotline-number {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #dc2626;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.hotline-number:hover {
  background: #fee2e2;
}

.hotline-number .number {
  font-family: monospace;
}

.hotline-desc {
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0 0 0;
}

/* 弹窗样式 */
.recipient-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 响应式 */
@media (max-width: 768px) {
  .contact-counselor {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    max-width: 100%;
    width: 100%;
  }

  .tutor-card {
    flex-direction: column;
  }

  .action-wrapper {
    flex-direction: row;
    width: 100%;
  }

  .counselor-grid {
    grid-template-columns: 1fr;
  }

  .counselor-list-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .list-actions {
    width: 100%;
  }

  .hotline-grid {
    grid-template-columns: 1fr;
  }
}
</style>
