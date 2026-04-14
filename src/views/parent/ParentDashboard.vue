<template>
  <div class="parent-dashboard">
    <main class="dashboard-main">
      <!-- 欢迎区域 -->
      <section class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            <span class="greeting">{{ greetingText }}，</span>
            <span class="username">{{ userName }}</span>
          </h1>
          <p class="welcome-desc">关注孩子心理健康，陪伴孩子快乐成长</p>
        </div>
        <div class="date-display">
          <div class="date-main">{{ currentDate.day }}</div>
          <div class="date-sub">
            <span>{{ currentDate.month }}</span>
            <span>{{ currentDate.weekday }}</span>
          </div>
        </div>
      </section>

      <!-- 子女选择器 -->
      <section class="child-selector-section">
        <div class="selector-label">
          <span class="selector-icon">👨‍👩‍👧</span>
          <span>当前关注</span>
        </div>
        <div class="child-tabs">
          <button
            v-for="child in children"
            :key="child.id"
            :class="['child-tab', { active: selectedChild === child.id }]"
            @click="switchChild(child.id)"
          >
            <div class="child-avatar">{{ child.name.charAt(0) }}</div>
            <div class="child-info">
              <span class="child-name">{{ child.name }}</span>
              <span class="child-id">{{ child.studentId }}</span>
            </div>
          </button>
        </div>
        <button class="manage-btn" @click="goToChildManagement">
          <span>+</span> 管理子女
        </button>
      </section>

      <div class="content-grid">
        <!-- 左侧区域 -->
        <div class="left-column">
          <!-- 子女信息卡片 -->
          <div class="card child-profile-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="title-icon">📋</span>
                子女信息
              </h3>
            </div>
            <div class="profile-content">
              <div class="profile-avatar-area">
                <div class="large-avatar">{{ currentChild.name.charAt(0) }}</div>
                <div class="profile-name">{{ currentChild.name }}</div>
                <div class="profile-badge">在校学生</div>
              </div>
              <div class="profile-details">
                <div class="detail-item">
                  <span class="detail-label">学号</span>
                  <span class="detail-value">{{ currentChild.studentId }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">班级</span>
                  <span class="detail-value">{{ currentChild.class }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">学院</span>
                  <span class="detail-value">{{ currentChild.college }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">辅导员</span>
                  <span class="detail-value">{{ currentChild.counselor || '王老师' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 心理健康概览 -->
          <div class="card health-overview-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="title-icon">💚</span>
                心理健康概览
              </h3>
            </div>
            <div class="health-content">
              <div class="health-status">
                <div class="status-circle" :class="healthStatus.level">
                  <span class="status-emoji">{{ healthStatus.emoji }}</span>
                </div>
                <div class="status-info">
                  <div class="status-label">整体状态</div>
                  <div class="status-text" :class="healthStatus.level">{{ healthStatus.text }}</div>
                </div>
              </div>
              <div class="health-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ healthData.assessmentCount }}</div>
                  <div class="stat-label">已完成测评</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ healthData.activityCount }}</div>
                  <div class="stat-label">参与活动</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ healthData.consultCount }}</div>
                  <div class="stat-label">咨询次数</div>
                </div>
              </div>
              <button class="view-detail-btn" @click="goToProfile">
                查看详细档案
                <span class="arrow">→</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 中间区域 -->
        <div class="center-column">
          <!-- 快捷操作 -->
          <div class="card quick-actions-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="title-icon">⚡</span>
                快捷操作
              </h3>
            </div>
            <div class="actions-grid">
              <button class="action-item" @click="goToAssessment">
                <div class="action-icon assessment">
                  <span>📊</span>
                </div>
                <span class="action-text">测评情况</span>
              </button>
              <button class="action-item" @click="goToAppointment">
                <div class="action-icon appointment">
                  <span>📅</span>
                </div>
                <span class="action-text">预约咨询</span>
              </button>
              <button class="action-item" @click="goToActivity">
                <div class="action-icon activity">
                  <span>🎯</span>
                </div>
                <span class="action-text">活动记录</span>
              </button>
              <button class="action-item" @click="goToContact">
                <div class="action-icon contact">
                  <span>📞</span>
                </div>
                <span class="action-text">联系辅导员</span>
              </button>
              <button class="action-item" @click="goToMessage">
                <div class="action-icon message">
                  <span>💬</span>
                </div>
                <span class="action-text">留言箱</span>
              </button>
              <button class="action-item" @click="goToNotices">
                <div class="action-icon notice">
                  <span>📢</span>
                </div>
                <span class="action-text">通知公告</span>
              </button>
            </div>
          </div>

          <!-- 待办事项 -->
          <div class="card todo-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="title-icon">✅</span>
                待办提醒
              </h3>
              <span class="badge" v-if="todoItems.length">{{ todoItems.length }}</span>
            </div>
            <div class="todo-list">
              <div v-for="item in todoItems" :key="item.id" class="todo-item" :class="item.priority">
                <div class="todo-icon">{{ item.icon }}</div>
                <div class="todo-content">
                  <div class="todo-title">{{ item.title }}</div>
                  <div class="todo-time">{{ item.time }}</div>
                </div>
                <button class="todo-action" @click="handleTodo(item)">去处理</button>
              </div>
              <div v-if="!todoItems.length" class="empty-todo">
                <span class="empty-icon">🎉</span>
                <span>暂无待办事项</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧区域 -->
        <div class="right-column">
          <!-- 最近通知 -->
          <div class="card notifications-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="title-icon">🔔</span>
                最近通知
              </h3>
              <button class="more-btn" @click="goToNotices">查看全部</button>
            </div>
            <div class="notification-list">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                @click="viewNotification(notification)"
              >
                <div class="notification-type" :class="notification.type">
                  {{ notification.typeIcon }}
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-desc">{{ notification.content }}</div>
                  <div class="notification-time">{{ notification.date }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 常用资源 -->
          <div class="card resources-card">
            <div class="card-header">
              <h3 class="card-title">
                <span class="title-icon">📚</span>
                家长课堂
              </h3>
            </div>
            <div class="resource-list">
              <a href="#" class="resource-item" v-for="resource in resources" :key="resource.id">
                <span class="resource-icon">{{ resource.icon }}</span>
                <span class="resource-name">{{ resource.name }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航（移动端） -->
    <nav class="mobile-nav">
      <button class="nav-item active">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">首页</span>
      </button>
      <button class="nav-item" @click="goToAssessment">
        <span class="nav-icon">📊</span>
        <span class="nav-text">测评</span>
      </button>
      <button class="nav-item" @click="goToAppointment">
        <span class="nav-icon">📅</span>
        <span class="nav-text">预约</span>
      </button>
      <button class="nav-item" @click="goToMessage">
        <span class="nav-icon">💬</span>
        <span class="nav-text">消息</span>
      </button>
      <button class="nav-item" @click="goToProfile">
        <span class="nav-icon">👤</span>
        <span class="nav-text">我的</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('')
const selectedChild = ref('1')

const children = ref([
  {
    id: '1',
    name: '张三',
    studentId: '2024001',
    class: '计算机科学与技术1班',
    college: '计算机学院',
    counselor: '王老师'
  },
  {
    id: '2',
    name: '李四',
    studentId: '2024002',
    class: '软件工程2班',
    college: '计算机学院',
    counselor: '李老师'
  }
])

const notifications = ref([
  {
    id: '1',
    type: 'important',
    typeIcon: '📣',
    title: '心理健康讲座通知',
    content: '学校将于3月10日举办心理健康讲座，请家长和学生积极参加',
    date: '2026-02-25'
  },
  {
    id: '2',
    type: 'warning',
    typeIcon: '⚠️',
    title: '测评提醒',
    content: '您的孩子还有一项心理测评未完成，请提醒孩子及时完成',
    date: '2026-02-20'
  },
  {
    id: '3',
    type: 'info',
    typeIcon: '📌',
    title: '活动报名开始',
    content: '心理健康月系列活动报名已开始，欢迎参与',
    date: '2026-02-18'
  }
])

const todoItems = ref([
  {
    id: '1',
    icon: '📋',
    title: '提醒孩子完成心理测评',
    time: '截止: 2026-03-05',
    priority: 'high',
    action: 'assessment'
  },
  {
    id: '2',
    icon: '📅',
    title: '确认咨询预约',
    time: '2026-03-03 14:00',
    priority: 'medium',
    action: 'appointment'
  }
])

const resources = ref([
  { id: '1', icon: '📖', name: '如何与孩子有效沟通' },
  { id: '2', icon: '🧠', name: '青少年心理健康指南' },
  { id: '3', icon: '💡', name: '家庭教育小贴士' },
  { id: '4', icon: '🎯', name: '压力管理技巧' }
])

const healthData = ref({
  assessmentCount: 3,
  activityCount: 5,
  consultCount: 2
})

const healthStatus = computed(() => {
  return {
    level: 'good',
    text: '状态良好',
    emoji: '😊'
  }
})

const currentChild = computed(() => {
  return children.value.find(child => child.id === selectedChild.value) || children.value[0]
})

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) {
    return '夜深了'
  } else if (hour < 9) {
    return '早上好'
  } else if (hour < 12) {
    return '上午好'
  } else if (hour < 14) {
    return '中午好'
  } else if (hour < 18) {
    return '下午好'
  } else if (hour < 22) {
    return '晚上好'
  } else {
    return '夜深了'
  }
})

const currentDate = computed(() => {
  const now = new Date()
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return {
    day: now.getDate(),
    month: months[now.getMonth()],
    weekday: weekdays[now.getDay()]
  }
})

onMounted(() => {
  userName.value = localStorage.getItem('User_name') || '家长'
})

const switchChild = (childId) => {
  selectedChild.value = childId
}

const handleTodo = (item) => {
  if (item.action === 'assessment') {
    goToAssessment()
  } else if (item.action === 'appointment') {
    goToAppointment()
  }
}

const viewNotification = (notification) => {
  router.push(`/notices/${notification.id}`)
}

const goToChildManagement = () => router.push('/parent/children')
const goToAssessment = () => router.push('/parent/assessment')
const goToAppointment = () => router.push('/parent/appointment')
const goToActivity = () => router.push('/parent/activity')
const goToProfile = () => router.push('/parent/profile')
const goToContact = () => router.push('/parent/contact')
const goToMessage = () => router.push('/parent/message')
const goToNotices = () => router.push('/notices')
</script>

<style scoped>
.parent-dashboard {
  min-height: 100%;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 主内容区 */
.dashboard-main {
  flex: 1;
  padding: 20px 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* 欢迎区域 */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 16px;
  color: white;
}

.welcome-title {
  font-size: 1.8rem;
  margin: 0 0 8px;
}

.greeting {
  opacity: 0.9;
}

.username {
  font-weight: 700;
}

.welcome-desc {
  margin: 0;
  opacity: 0.85;
  font-size: 1rem;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
}

.date-main {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.date-sub {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* 子女选择器 */
.child-selector-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  white-space: nowrap;
}

.selector-icon {
  font-size: 1.2rem;
}

.child-tabs {
  display: flex;
  gap: 12px;
  flex: 1;
  overflow-x: auto;
}

.child-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #f5f7fa;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.child-tab:hover {
  background: #eef2ff;
}

.child-tab.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.child-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.child-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.child-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.child-id {
  font-size: 12px;
  color: #999;
}

.manage-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  background: transparent;
  border: 2px dashed #d0d5dd;
  border-radius: 10px;
  color: #667;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.manage-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: 300px 1fr 320px;
  gap: 20px;
}

.left-column,
.center-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片通用样式 */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.title-icon {
  font-size: 1.1rem;
}

.more-btn {
  padding: 4px 12px;
  background: #f5f7fa;
  border: none;
  border-radius: 6px;
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.more-btn:hover {
  background: #ecf5ff;
}

.badge {
  padding: 2px 8px;
  background: #ff4d4f;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

/* 子女信息卡片 */
.profile-content {
  padding: 20px;
}

.profile-avatar-area {
  text-align: center;
  margin-bottom: 20px;
}

.large-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  margin: 0 auto 12px;
}

.profile-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.profile-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  font-size: 12px;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.detail-label {
  color: #888;
  font-size: 13px;
}

.detail-value {
  color: #333;
  font-size: 13px;
  font-weight: 500;
}

/* 心理健康概览卡片 */
.health-content {
  padding: 20px;
}

.health-status {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
  border-radius: 12px;
}

.status-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.status-circle.good {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.status-circle.warning {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
}

.status-circle.alert {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
}

.status-emoji {
  filter: brightness(0) invert(1);
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.status-text {
  font-size: 1.2rem;
  font-weight: 600;
}

.status-text.good {
  color: #52c41a;
}

.status-text.warning {
  color: #faad14;
}

.status-text.alert {
  color: #ff4d4f;
}

.health-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px 8px;
  background: #f9fafb;
  border-radius: 10px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #409eff;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.view-detail-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.view-detail-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.arrow {
  transition: transform 0.2s;
}

.view-detail-btn:hover .arrow {
  transform: translateX(4px);
}

/* 快捷操作卡片 */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  background: #f9fafb;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  background: #ecf5ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(64, 158, 255, 0.15);
}

.action-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}

.action-icon.assessment {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.action-icon.appointment {
  background: linear-gradient(135deg, #36cfc9 0%, #13c2c2 100%);
}

.action-icon.activity {
  background: linear-gradient(135deg, #ff85c0 0%, #eb2f96 100%);
}

.action-icon.contact {
  background: linear-gradient(135deg, #ffc069 0%, #fa8c16 100%);
}

.action-icon.message {
  background: linear-gradient(135deg, #69c0ff 0%, #1890ff 100%);
}

.action-icon.notice {
  background: linear-gradient(135deg, #ff7875 0%, #f5222d 100%);
}

.action-text {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

/* 待办事项卡片 */
.todo-list {
  padding: 12px 20px 20px;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 10px;
  margin-bottom: 10px;
  border-left: 4px solid transparent;
}

.todo-item.high {
  border-left-color: #ff4d4f;
  background: #fff2f0;
}

.todo-item.medium {
  border-left-color: #faad14;
  background: #fffbe6;
}

.todo-item.low {
  border-left-color: #52c41a;
  background: #f6ffed;
}

.todo-icon {
  font-size: 1.4rem;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.todo-time {
  font-size: 12px;
  color: #999;
}

.todo-action {
  padding: 6px 12px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  color: #409eff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.todo-action:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.empty-todo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  color: #999;
}

.empty-icon {
  font-size: 2rem;
}

/* 通知卡片 */
.notification-list {
  padding: 12px 20px 20px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-item:hover {
  background: #ecf5ff;
}

.notification-type {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-type.important {
  background: #fff1f0;
}

.notification-type.warning {
  background: #fffbe6;
}

.notification-type.info {
  background: #e6f7ff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 12px;
  color: #bbb;
}

/* 资源卡片 */
.resource-list {
  padding: 12px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #f9fafb;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: all 0.2s;
}

.resource-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

.resource-icon {
  font-size: 1.2rem;
}

.resource-name {
  font-size: 13px;
}

/* 移动端底部导航 */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 8px 0;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.nav-item.active {
  color: #409eff;
}

.nav-icon {
  font-size: 1.3rem;
}

.nav-text {
  font-size: 11px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 280px 1fr;
  }

  .right-column {
    display: none;
  }
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .left-column {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 10px 16px;
  }

  .system-name {
    display: none;
  }

  .dashboard-main {
    padding: 16px;
    padding-bottom: 80px;
  }

  .welcome-section {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .welcome-title {
    font-size: 1.4rem;
  }

  .date-display {
    width: 100%;
    justify-content: center;
  }

  .child-selector-section {
    flex-wrap: wrap;
  }

  .child-tabs {
    width: 100%;
    order: 3;
  }

  .manage-btn {
    order: 2;
  }

  .left-column {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
  }

  .action-item {
    padding: 16px 10px;
  }

  .action-icon {
    width: 44px;
    height: 44px;
    font-size: 1.3rem;
  }

  .mobile-nav {
    display: flex;
  }
}

@media (max-width: 480px) {
  .child-tab {
    padding: 8px 12px;
  }

  .child-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 12px;
  }

  .action-item {
    padding: 12px 8px;
  }

  .action-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    font-size: 1.2rem;
  }

  .action-text {
    font-size: 11px;
  }
}
</style>
