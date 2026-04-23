<template>
  <div class="student-dashboard" v-loading="initialLoading">
    <!-- 顶部欢迎区域 -->
    <header class="dashboard-header">
      <div class="header-left">
        <div class="user-avatar">
          <el-avatar :size="64" :src="userAvatar">
            <el-icon :size="32"><User /></el-icon>
          </el-avatar>
          <div class="mood-badge" :class="todayMood" @click="showMoodPicker = true" title="点击记录心情">
            <span>{{ moodEmojis[todayMood] || '😊' }}</span>
          </div>
        </div>
        <div class="user-info">
          <h1 class="greeting">{{ greeting }}，{{ userName || '同学' }}</h1>
          <p class="date-time">
            <el-icon><Calendar /></el-icon>
            {{ currentDate }}
            <span class="divider">|</span>
            <el-icon><Clock /></el-icon>
            {{ currentTime }}
          </p>
          <p class="motto">"{{ dailyMotto }}"</p>
        </div>
      </div>
      <div class="header-right">
        <el-button type="danger" round @click="go('/student/crisis')" class="emergency-btn">
          <el-icon><Warning /></el-icon>
          <span>紧急求助</span>
        </el-button>
        <el-badge
          :value="unreadCount || 0"
          :hidden="!unreadCount || unreadCount <= 0"
          :max="99"
          class="message-badge"
        >
          <el-button circle @click="go('/message')" class="message-btn">
            <el-icon><Bell /></el-icon>
          </el-button>
        </el-badge>
      </div>
    </header>

    <!-- 心情选择弹窗 -->
    <el-dialog
      v-model="showMoodPicker"
      title="今天心情如何？"
      width="380px"
      class="mood-dialog"
      append-to-body
    >
      <div class="mood-picker">
        <div
          v-for="(emoji, key) in moodEmojis"
          :key="key"
          class="mood-option"
          :class="{ active: selectedMood === key }"
          @click="selectedMood = key"
        >
          <span class="emoji">{{ emoji }}</span>
          <span class="label">{{ moodLabels[key] }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="showMoodPicker = false">取消</el-button>
        <el-button type="primary" @click="saveMood">记录心情</el-button>
      </template>
    </el-dialog>

    <!-- 家长绑定提示弹窗 -->
    <el-dialog
      v-model="showParentBindPrompt"
      title="家长申请绑定"
      width="420px"
      :close-on-click-modal="false"
      append-to-body
    >
      <div class="bind-prompt-content">
        <el-icon class="bind-icon" :size="48" color="#f59e0b"><Warning /></el-icon>
        <p class="bind-prompt-text">
          有家长发起与您的关联申请（待确认）。<br>
          请核实对方身份后选择确认或拒绝；<br>
          也可关闭后前往「关联家长」页面处理。
        </p>
      </div>
      <template #footer>
        <el-button @click="showParentBindPrompt = false">稍后处理</el-button>
        <el-button type="danger" plain :loading="parentBindActing" @click="handleRejectParentBind">
          拒绝
        </el-button>
        <el-button type="primary" :loading="parentBindActing" @click="handleConfirmParentBind">
          确认绑定
        </el-button>
      </template>
    </el-dialog>

    <!-- 数据统计概览 - 按使用频率排序 -->
    <section class="stats-section">
      <div class="stat-card priority" @click="go('/student/assessment')">
        <div class="stat-icon assessment">
          <el-icon><EditPen /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.pendingAssessments }}</span>
          <span class="stat-label">待完成测评</span>
          <span class="stat-hint" v-if="stats.pendingAssessments > 0">需尽快完成</span>
        </div>
        <el-icon class="stat-arrow"><ArrowRight /></el-icon>
      </div>
      <div class="stat-card" @click="go('/my-appointment')">
        <div class="stat-icon appointment">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.upcomingAppointments }}</span>
          <span class="stat-label">即将开始的预约</span>
        </div>
        <el-icon class="stat-arrow"><ArrowRight /></el-icon>
      </div>
      <div class="stat-card" @click="go('/student/activity')">
        <div class="stat-icon activity">
          <el-icon><Flag /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.registeredActivities }}</span>
          <span class="stat-label">已报名活动</span>
        </div>
        <el-icon class="stat-arrow"><ArrowRight /></el-icon>
      </div>
      <div class="stat-card" @click="go('/student/self-help')">
        <div class="stat-icon course">
          <el-icon><Reading /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.courseProgress }}%</span>
          <span class="stat-label">课程学习进度</span>
          <el-progress
            :percentage="stats.courseProgress"
            :show-text="false"
            :stroke-width="4"
            class="stat-progress"
          />
        </div>
        <el-icon class="stat-arrow"><ArrowRight /></el-icon>
      </div>
    </section>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧区域 -->
      <div class="content-left">
        <!-- 高频功能入口 - 核心服务 -->
        <section class="feature-section core-services">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Star /></el-icon>
              <span>核心服务</span>
              <el-tag size="small" type="info" effect="plain" class="section-tag">常用</el-tag>
            </h2>
          </div>
          <div class="feature-grid core">
            <div
              v-for="item in coreMenuItems"
              :key="item.path"
              class="feature-card core"
              :class="{ 'has-badge': item.badge > 0 }"
              @click="go(item.path)"
            >
              <div class="feature-icon" :style="{ background: item.color }">
                <component :is="item.icon" />
              </div>
              <div class="feature-info">
                <h3>
                  {{ item.title }}
                  <el-tag v-if="item.badge && item.badge > 0" type="danger" size="small" effect="dark" class="feature-badge">
                    {{ item.badge }}
                  </el-tag>
                </h3>
                <p>{{ item.desc }}</p>
              </div>
              <el-icon class="feature-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </section>

        <!-- 中频功能入口 - 成长支持 -->
        <section class="feature-section">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Grid /></el-icon>
              <span>成长支持</span>
            </h2>
          </div>
          <div class="feature-grid">
            <div
              v-for="item in secondaryMenuItems"
              :key="item.path"
              class="feature-card"
              @click="go(item.path)"
            >
              <div class="feature-icon" :style="{ background: item.color }">
                <component :is="item.icon" />
              </div>
              <div class="feature-info">
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
              <el-icon class="feature-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </section>

        <!-- 心情记录趋势 -->
        <section class="mood-history-section">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><TrendCharts /></el-icon>
              <span>近7天心情</span>
            </h2>
            <el-button link type="primary" @click="showMoodHistoryDetail">
              查看详情
            </el-button>
          </div>
          <div class="mood-history" v-if="hasMoodHistory">
            <div
              v-for="(record, index) in moodHistory"
              :key="index"
              class="mood-day"
              :class="{ today: record.isToday }"
              @click="record.isToday && (showMoodPicker = true)"
            >
              <span class="day-name">{{ record.day }}</span>
              <span class="day-emoji" :title="moodLabels[record.mood]">{{ moodEmojis[record.mood] || '—' }}</span>
              <span class="day-date">{{ record.date }}</span>
            </div>
          </div>
          <el-empty v-else description="暂无心情记录，点击右上角表情开始记录" :image-size="60" />
        </section>
      </div>

      <!-- 右侧区域 -->
      <div class="content-right">
        <!-- 待办事项 - 最重要 -->
        <section class="todo-section" v-if="todoList && todoList.length > 0">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Timer /></el-icon>
              <span>待办事项</span>
              <el-tag v-if="todoList.length > 0" type="danger" size="small" effect="dark" class="section-badge">{{ todoList.length }}</el-tag>
            </h2>
          </div>
          <div class="todo-list">
            <div
              v-for="todo in todoList.slice(0, 5)"
              :key="todo.id"
              class="todo-item"
              :class="{ urgent: todo.priority === 'high' }"
              @click="handleTodoClick(todo)"
            >
              <div class="todo-priority" :class="todo.priority">
                <el-icon v-if="todo.priority === 'high'"><Warning /></el-icon>
                <el-icon v-else-if="todo.priority === 'medium'"><Flag /></el-icon>
                <el-icon v-else><Minus /></el-icon>
              </div>
              <div class="todo-info">
                <h4>{{ todo.title }}</h4>
                <p>{{ todo.description }}</p>
              </div>
              <el-tag size="small" :type="todoTypeMap[todo.type]?.type || 'info'">
                {{ todoTypeMap[todo.type]?.label || todo.type }}
              </el-tag>
            </div>
          </div>
        </section>

        <!-- 即将开始的活动 -->
        <section class="upcoming-section">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Clock /></el-icon>
              <span>即将开始</span>
            </h2>
            <el-button link type="primary" @click="go('/student/activity')">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="upcoming-list" v-if="upcomingActivities.length">
            <div
              v-for="activity in upcomingActivities.slice(0, 3)"
              :key="activity.id"
              class="upcoming-item"
              @click="go(`/student/activity/${activity.id}`)"
            >
              <div class="activity-time">
                <span class="time-day">{{ formatDay(activity.startTime) }}</span>
                <span class="time-hour">{{ formatHour(activity.startTime) }}</span>
              </div>
              <div class="activity-info">
                <h4>{{ activity.title }}</h4>
                <p>
                  <el-icon><Location /></el-icon>
                  {{ activity.location || '地点待定' }}
                </p>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无即将开始的活动">
            <el-button type="primary" link @click="go('/student/activity')">
              去发现活动
            </el-button>
          </el-empty>
        </section>

        <!-- 待完成测评 -->
        <section class="assessment-section">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Document /></el-icon>
              <span>待完成测评</span>
            </h2>
            <el-button link type="primary" @click="go('/student/assessment')">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="assessment-list" v-if="pendingAssessments.length">
            <div
              v-for="assessment in pendingAssessments.slice(0, 3)"
              :key="assessment.id"
              class="assessment-item"
              @click="go(`/student/assessment/${assessment.id}`)"
            >
              <div class="assessment-icon">
                <el-icon><EditPen /></el-icon>
              </div>
              <div class="assessment-info">
                <h4>{{ assessment.title }}</h4>
                <p>
                  <el-icon><Timer /></el-icon>
                  截止：{{ assessment.deadline || '尽快完成' }}
                </p>
              </div>
              <el-tag size="small" type="warning" effect="dark">
                {{ assessment.duration || '20' }}分钟
              </el-tag>
            </div>
          </div>
          <el-empty v-else description="暂无待完成的测评">
            <el-button type="primary" link @click="go('/student/assessment')">
              查看历史测评
            </el-button>
          </el-empty>
        </section>

        <!-- 推荐内容 - 个性化 -->
        <section class="recommend-section">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><StarFilled /></el-icon>
              <span>为你推荐</span>
            </h2>
            <el-button link type="primary" @click="refreshRecommend">
              <el-icon><Refresh /></el-icon>
              换一换
            </el-button>
          </div>
          <div class="recommend-list">
            <div
              v-for="item in currentRecommend"
              :key="item.id"
              class="recommend-item"
              @click="go(item.path)"
            >
              <div class="recommend-cover" :style="{ backgroundColor: item.bgColor }">
                <el-icon :size="24"><component :is="item.icon" /></el-icon>
              </div>
              <div class="recommend-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- 底部快捷操作 - 按使用频率排序 -->
    <footer class="quick-actions">
      <div class="action-item" @click="go('/appointment/select')">
        <div class="action-icon primary">
          <el-icon :size="20"><Plus /></el-icon>
        </div>
        <span>预约咨询</span>
      </div>
      <div class="action-item" @click="go('/student/self-help/music-therapy')">
        <div class="action-icon">
          <el-icon :size="20"><Headset /></el-icon>
        </div>
        <span>音乐放松</span>
      </div>
      <div class="action-item" @click="go('/student/contact')">
        <div class="action-icon">
          <el-icon :size="20"><Phone /></el-icon>
        </div>
        <span>联系老师</span>
      </div>
      <div class="action-item" @click="go('/wiki')">
        <div class="action-icon">
          <el-icon :size="20"><Collection /></el-icon>
        </div>
        <span>心理百科</span>
      </div>
      <div class="action-item" @click="go('/student/profile')">
        <div class="action-icon">
          <el-icon :size="20"><User /></el-icon>
        </div>
        <span>我的档案</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  Clock,
  Plus,
  EditPen,
  Reading,
  Bell,
  Warning,
  ArrowRight,
  User,
  Flag,
  Grid,
  Location,
  Document,
  Star,
  Headset,
  Collection,
  TrendCharts,
  ChatDotRound,
  Phone,
  UserFilled,
  StarFilled,
  Timer,
  Minus,
  Refresh,
} from '@element-plus/icons-vue'
import { getMyAssessments } from '@/api/assessment'
import { getMyActivities } from '@/api/activity'
import { getMyAppointments } from '@/api/appointmentApi'
import { getUnreadCount } from '@/api/message'
import { getTodoList } from '@/api/todoApi'
import { getMicroCourseList } from '@/api/selfHelp'
import {
  getBindStatus,
  confirmStudentBind,
  rejectStudentBind,
} from '@/api/studentBind.js'
import { getStudentBindUserId } from '@/utils/studentBindSession.js'

const router = useRouter()

// 用户信息
const userName = computed(
  () => localStorage.getItem('user_name') || localStorage.getItem('User_name') || ''
)
const userAvatar = computed(() => localStorage.getItem('user_avatar') || '')

// 时间和日期
const currentTime = ref('')
const currentDate = ref('')
let timer = null

// 加载状态
const initialLoading = ref(false)

// 心情相关
const moodEmojis = {
  great: '😄',
  good: '😊',
  normal: '😐',
  bad: '😔',
  terrible: '😢',
}

const moodLabels = {
  great: '非常好',
  good: '很好',
  normal: '一般',
  bad: '不太好',
  terrible: '很差',
}

const todayMood = ref(localStorage.getItem('today_mood') || '')
const selectedMood = ref(todayMood.value || 'good')
const showMoodPicker = ref(false)
const moodHistory = ref([])

// 家长绑定
const showParentBindPrompt = ref(false)
const parentBindActing = ref(false)

// 消息未读数
const unreadCount = ref(0)

// 统计数据
const stats = ref({
  pendingAssessments: 0,
  registeredActivities: 0,
  upcomingAppointments: 0,
  courseProgress: 0,
})

// 列表数据
const upcomingActivities = ref([])
const pendingAssessments = ref([])
const todoList = ref([])

// 推荐内容
const allRecommendContent = [
  {
    id: 1,
    title: '情绪管理技巧',
    desc: '学习有效调节情绪的方法',
    path: '/student/self-help/course',
    bgColor: '#e0f2fe',
    icon: Reading,
    category: 'course',
  },
  {
    id: 2,
    title: '放松音乐',
    desc: '舒缓压力，放松身心',
    path: '/student/self-help/music-therapy',
    bgColor: '#fce7f3',
    icon: Headset,
    category: 'music',
  },
  {
    id: 3,
    title: '心理小知识',
    desc: '了解更多心理健康知识',
    path: '/wiki',
    bgColor: '#d1fae5',
    icon: Collection,
    category: 'wiki',
  },
  {
    id: 4,
    title: '正念冥想',
    desc: '每日练习，提升专注力',
    path: '/student/self-help/course',
    bgColor: '#fef3c7',
    icon: Reading,
    category: 'course',
  },
  {
    id: 5,
    title: '压力释放',
    desc: '白噪音与轻音乐组合',
    path: '/student/self-help/music-therapy',
    bgColor: '#ede9fe',
    icon: Headset,
    category: 'music',
  },
]
const currentRecommendIndex = ref(0)
const currentRecommend = computed(() => {
  const start = currentRecommendIndex.value % 3
  return allRecommendContent.slice(start, start + 3)
})

// 待办类型映射
const todoTypeMap = {
  assessment: { label: '测评', type: 'warning' },
  appointment: { label: '预约', type: 'primary' },
  activity: { label: '活动', type: 'success' },
  crisis: { label: '危机', type: 'danger' },
  report: { label: '报告', type: 'info' },
  leave: { label: '请假', type: 'info' },
  other: { label: '其他', type: 'info' },
}

// 每日格言
const dailyMottos = [
  '每一天都是新的开始，保持微笑向前走',
  '心若向阳，无谓悲伤',
  '生活不会辜负每一个认真生活的人',
  '你比自己想象的更强大',
  '保持好奇心，保持热爱',
  '困难是成长的阶梯',
  '今天的努力是明天的礼物',
]

const dailyMotto = computed(() => {
  const dayIndex = new Date().getDay()
  return dailyMottos[dayIndex]
})

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

// 是否有心情历史
const hasMoodHistory = computed(() => {
  return moodHistory.value.some(r => r.mood && r.mood !== '')
})

// 核心高频功能 - 按使用频率排序
const coreMenuItems = computed(() => [
  {
    title: '心理测评',
    desc: '完成心理测评任务，查看测评结果',
    path: '/student/assessment',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    icon: EditPen,
    badge: stats.value.pendingAssessments,
  },
  {
    title: '我的预约',
    desc: '查看、填写或取消心理咨询预约',
    path: '/my-appointment',
    color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    icon: Calendar,
    badge: stats.value.upcomingAppointments,
  },
  {
    title: '在线预约',
    desc: '选择时间与咨询师进行预约',
    path: '/appointment/select',
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: Plus,
    badge: 0,
  },
  {
    title: '联系咨询师',
    desc: '辅导员信息、咨询师列表与留言',
    path: '/student/contact',
    color: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    icon: Phone,
    badge: 0,
  },
])

// 次要功能 - 成长支持
const secondaryMenuItems = [
  {
    title: '团体活动',
    desc: '查看和报名心理健康团体活动',
    path: '/student/activity',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icon: Flag,
  },
  {
    title: '朋辈互助',
    desc: '匿名倾诉与同伴支持交流',
    path: '/student/peer-support',
    color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    icon: ChatDotRound,
  },
  {
    title: '心理自助',
    desc: '心理百科、美文、微课、音乐调节与课程',
    path: '/student/self-help',
    color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    icon: Reading,
  },
  {
    title: '关联家长',
    desc: '家长发起绑定后，在此确认或拒绝',
    path: '/student/parent-binding',
    color: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    icon: UserFilled,
  },
  {
    title: '个人档案',
    desc: '查看个人心理档案和历史记录',
    path: '/student/profile',
    color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    icon: User,
  },
]

// 方法定义
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

function formatDay(dateStr) {
  if (!dateStr) return '--/--'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function formatHour(dateStr) {
  if (!dateStr) return '--:--'
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 初始化心情历史（7天）
function initMoodHistory() {
  const savedHistory = localStorage.getItem('mood_history')
  if (savedHistory) {
    try {
      moodHistory.value = JSON.parse(savedHistory)
      return
    } catch (e) {
      console.warn('解析心情历史失败:', e)
    }
  }

  // 默认初始化7天
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const today = new Date()
  moodHistory.value = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayIndex = date.getDay()

    moodHistory.value.push({
      day: days[dayIndex],
      date: formatDate(date),
      mood: i === 0 ? todayMood.value : '',
      isToday: i === 0,
    })
  }
}

function saveMood() {
  todayMood.value = selectedMood.value
  localStorage.setItem('today_mood', selectedMood.value)

  // 更新今天的记录
  const todayRecord = moodHistory.value.find(r => r.isToday)
  if (todayRecord) {
    todayRecord.mood = selectedMood.value
  }

  // 保存历史
  localStorage.setItem('mood_history', JSON.stringify(moodHistory.value))

  showMoodPicker.value = false
  ElMessage.success('心情已记录，保持积极！')
}

function go(path) {
  router.push(path)
}

function refreshRecommend() {
  currentRecommendIndex.value = (currentRecommendIndex.value + 1) % 3
}

function showMoodHistoryDetail() {
  ElMessage.info('心情详情功能即将上线')
}

function handleTodoClick(todo) {
  if (todo.link) {
    go(todo.link)
  } else if (todo.type === 'assessment') {
    go('/student/assessment')
  } else if (todo.type === 'appointment') {
    go('/my-appointment')
  } else if (todo.type === 'activity') {
    go('/student/activity')
  }
}

// 家长绑定检查
async function checkPendingParentBind() {
  if (localStorage.getItem('User_role') !== 'student') return
  const sid = getStudentBindUserId()
  if (!sid) return
  try {
    const res = await getBindStatus(sid)
    if (res.code === 200 && Number(res.data) === 0) {
      showParentBindPrompt.value = true
    }
  } catch (e) {
    console.warn('[bind] pending check:', e?.message || e)
  }
}

async function handleConfirmParentBind() {
  const sid = getStudentBindUserId()
  if (!sid) return
  parentBindActing.value = true
  try {
    const res = await confirmStudentBind(sid)
    if (res.code === 200) {
      ElMessage.success(res.msg || '已确认绑定')
      showParentBindPrompt.value = false
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  } finally {
    parentBindActing.value = false
  }
}

async function handleRejectParentBind() {
  const sid = getStudentBindUserId()
  if (!sid) return
  parentBindActing.value = true
  try {
    const res = await rejectStudentBind(sid)
    if (res.code === 200) {
      ElMessage.success(res.msg || '已拒绝')
      showParentBindPrompt.value = false
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  } finally {
    parentBindActing.value = false
  }
}

// 加载数据
async function loadData() {
  try {
    // 并行加载多个数据源
    const [
      assessmentRes,
      activityRes,
      appointmentRes,
      unreadRes,
      todoRes,
      courseRes,
    ] = await Promise.allSettled([
      getMyAssessments(),
      getMyActivities(),
      getMyAppointments({ status: 'pending' }),
      getUnreadCount(),
      getTodoList({ status: 'PENDING', pageSize: 5 }),
      getMicroCourseList(),
    ])

    // 处理测评数据
    if (assessmentRes.status === 'fulfilled' && assessmentRes.value.code === 200) {
      const assessmentData = Array.isArray(assessmentRes.value.data)
        ? assessmentRes.value.data
        : (assessmentRes.value.data?.records || assessmentRes.value.data?.list || [])

      const pending = assessmentData.filter(a => a.status === 'pending' || a.status === '0' || a.status === 0)
      stats.value.pendingAssessments = pending.length || 0
      pendingAssessments.value = pending.slice(0, 3).map(a => ({
        id: a.id || a.assessmentId,
        title: a.title || a.name || a.scaleName || '心理测评',
        deadline: a.deadline || a.endTime?.slice(0, 10),
        duration: a.duration || 20,
      }))
    } else {
      stats.value.pendingAssessments = 0
    }

    // 处理活动数据
    if (activityRes.status === 'fulfilled' && activityRes.value.code === 200) {
      const activityData = Array.isArray(activityRes.value.data)
        ? activityRes.value.data
        : (activityRes.value.data?.records || activityRes.value.data?.list || [])

      stats.value.registeredActivities = activityData.length || 0
      upcomingActivities.value = activityData
        .filter(a => a.status === 'registered' || new Date(a.startTime) > new Date())
        .slice(0, 3)
    } else {
      stats.value.registeredActivities = 0
    }

    // 处理预约数据
    if (appointmentRes.status === 'fulfilled' && appointmentRes.value.code === 200) {
      const appointmentData = Array.isArray(appointmentRes.value.data)
        ? appointmentRes.value.data
        : (appointmentRes.value.data?.records || appointmentRes.value.data?.list || [])

      stats.value.upcomingAppointments = appointmentData.length || 0
    } else {
      stats.value.upcomingAppointments = 0
    }

    // 处理未读消息
    if (unreadRes.status === 'fulfilled' && unreadRes.value.code === 200) {
      unreadCount.value = Number(unreadRes.value.data) || 0
    } else {
      unreadCount.value = 0
    }

    // 处理待办事项
    if (todoRes.status === 'fulfilled' && todoRes.value.code === 200) {
      const todoData = Array.isArray(todoRes.value.data)
        ? todoRes.value.data
        : (todoRes.value.data?.records || todoRes.value.data?.list || [])

      todoList.value = todoData.map(t => ({
        id: t.id,
        title: t.title || '待办事项',
        description: t.description || t.content || '',
        type: t.type || 'other',
        priority: t.priority || 'medium',
        link: t.link,
      }))
    } else {
      todoList.value = []
    }

    // 处理课程进度
    if (courseRes.status === 'fulfilled' && courseRes.value.code === 200) {
      const courseData = Array.isArray(courseRes.value.data)
        ? courseRes.value.data
        : (courseRes.value.data?.records || courseRes.value.data?.list || [])

      if (courseData.length > 0) {
        const totalProgress = courseData.reduce((sum, c) => sum + (c.progress || 0), 0)
        stats.value.courseProgress = Math.round(totalProgress / courseData.length)
      }
    }

  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  initMoodHistory()

  initialLoading.value = true
  Promise.all([
    loadData(),
    checkPendingParentBind(),
  ]).finally(() => {
    initialLoading.value = false
  })
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.student-dashboard {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(160deg, #f0f4ff 0%, #e8f0fe 35%, #f5f7fa 70%, #fafbfc 100%);
  padding-bottom: 100px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(30, 79, 156, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.1);
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  position: relative;
}

.mood-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  font-size: 16px;
}

.mood-badge:hover {
  transform: scale(1.15);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.greeting {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e3a5f;
}

.date-time {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-time .divider {
  margin: 0 4px;
  color: #cbd5e1;
}

.motto {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
  font-style: italic;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.emergency-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  font-weight: 600;
}

.emergency-btn:hover {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.message-btn {
  width: 40px;
  height: 40px;
}

.message-badge :deep(.el-badge__content) {
  top: 4px;
  right: 4px;
}

.bind-prompt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.bind-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.bind-prompt-text {
  margin: 0;
  font-size: 14px;
  color: #334155;
  line-height: 1.8;
  text-align: center;
}

.mood-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}

.mood-picker {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.mood-option:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.mood-option.active {
  background: #e0f2fe;
  box-shadow: 0 0 0 2px #3b82f6;
}

.mood-option .emoji {
  font-size: 32px;
}

.mood-option .label {
  font-size: 12px;
  color: #64748b;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 79, 156, 0.1);
}

.stat-card.priority {
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 22px;
}

.stat-icon.assessment {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-icon.activity {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-icon.appointment {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.stat-icon.course {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-hint {
  font-size: 11px;
  color: #ef4444;
  font-weight: 500;
}

.stat-progress {
  margin-top: 4px;
  width: 80%;
}

.stat-arrow {
  color: #cbd5e1;
  transition: color 0.2s;
}

.stat-card:hover .stat-arrow {
  color: #3b82f6;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.section-tag {
  margin-left: 4px;
}

.section-badge {
  margin-left: 4px;
}

.feature-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

.feature-section.core-services {
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.feature-card:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.feature-card.core {
  padding: 18px 16px;
}

.feature-card.has-badge {
  border: 1px solid rgba(139, 92, 246, 0.15);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  flex-shrink: 0;
}

.feature-info {
  flex: 1;
  min-width: 0;
}

.feature-info h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.feature-badge {
  font-size: 11px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
}

.feature-info p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feature-arrow {
  color: #cbd5e1;
  flex-shrink: 0;
  transition: all 0.2s;
}

.feature-card:hover .feature-arrow {
  color: #3b82f6;
  transform: translateX(2px);
}

.mood-history-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.mood-history {
  display: flex;
  justify-content: space-between;
}

.mood-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.mood-day:hover {
  background: #f8fafc;
}

.mood-day.today {
  background: #eff6ff;
  box-shadow: 0 0 0 2px #3b82f6;
}

.day-name {
  font-size: 12px;
  color: #94a3b8;
}

.day-emoji {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 50%;
}

.day-date {
  font-size: 11px;
  color: #cbd5e1;
}

.content-right section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.todo-item:hover {
  background: #f1f5f9;
}

.todo-item.urgent {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.todo-item.urgent:hover {
  background: #fee2e2;
}

.todo-priority {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.todo-priority.high {
  background: #fee2e2;
  color: #ef4444;
}

.todo-priority.medium {
  background: #fef3c7;
  color: #f59e0b;
}

.todo-priority.low {
  background: #f1f5f9;
  color: #94a3b8;
}

.todo-info {
  flex: 1;
  min-width: 0;
}

.todo-info h4 {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.todo-info p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upcoming-item {
  display: flex;
  gap: 14px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.upcoming-item:hover {
  background: #f1f5f9;
}

.activity-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  color: #fff;
  min-width: 56px;
}

.time-day {
  font-size: 14px;
  font-weight: 600;
}

.time-hour {
  font-size: 11px;
  opacity: 0.9;
}

.activity-info h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.activity-info p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.assessment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.assessment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.assessment-item:hover {
  background: #f1f5f9;
}

.assessment-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.assessment-info {
  flex: 1;
  min-width: 0;
}

.assessment-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.assessment-info p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.recommend-item:hover {
  background: #f8fafc;
}

.recommend-cover {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

.recommend-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.recommend-info p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.quick-actions {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.action-item:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-item:hover .action-icon {
  background: #e0f2fe;
  transform: scale(1.1);
}

.action-icon.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
}

.action-item:hover .action-icon.primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.action-item span {
  font-size: 11px;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .content-right {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .content-right section {
    margin-bottom: 0;
  }
}

@media (max-width: 900px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-right {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .student-dashboard {
    padding: 16px;
    padding-bottom: 120px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .header-left {
    width: 100%;
  }

  .greeting {
    font-size: 20px;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    width: calc(100% - 32px);
    justify-content: space-around;
    padding: 8px 12px;
  }

  .action-item {
    padding: 6px 10px;
  }

  .action-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
