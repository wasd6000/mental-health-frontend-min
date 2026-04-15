<template>
  <div class="admin">
    <!-- 顶部 -->
    <header class="top">
      <div class="top-left" @click="goHome">
        <img class="logo" src="../../assets/images/logo.png" alt="校徽" />
        <div class="brand">
          <span class="system-title">心理健康管理后台</span>
          <span class="org" v-if="showOrg">党委学生工作部 学生工作处</span>
        </div>
      </div>
      <nav class="top-nav">
        <span
            class="nav-item message-link"
            @click.stop="goToMessageCenter"
            style="cursor: pointer;"
            title="消息中心"
        >
          <el-icon><Bell /></el-icon>
          <span>消息</span>
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
        </span>
        <span class="nav-item">基础信息</span>
        <span class="nav-item">教育管理</span>
        <span class="nav-item">日常管理</span>
        <span class="nav-item">心理健康管理</span>
        <span class="nav-item">资助管理</span>

        <!-- 用户信息和退出 -->
        <div class="user-section">
          <div class="user-info" @click="goHome">
            <el-icon class="user-avatar"><UserFilled /></el-icon>
            <span class="user-name">{{ userName }}</span>
            <span class="user-role-tag">{{ roleName }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout" title="退出登录">
            <el-icon><SwitchButton /></el-icon>
            <span>退出</span>
          </button>
        </div>
      </nav>
    </header>

    <div class="main">

      <!-- 左侧菜单 -->
      <aside class="menu">

        <!-- 辅导员专属菜单（支持 tutor 和 instructor 两种角色代码） -->
        <template v-if="role === 'tutor' || role === 'instructor'">
          <div class="item" :class="{ active: currentPath === 'tutor-workbench' }" @click="go('tutor-workbench')">工作台</div>
          <div class="item" :class="{ active: currentPath === 'tutor-students' }" @click="go('tutor-students')">学生管理</div>
          <div class="item" :class="{ active: currentPath === 'tutor-crisis-report' }" @click="go('tutor-crisis-report')">危机上报</div>
          <div class="item" :class="{ active: currentPath === 'tutor-assessment' }" @click="go('tutor-assessment')">测评查看</div>
          <div class="item" :class="{ active: currentPath === 'tutor-report' }" @click="go('tutor-report')">月报填写</div>
          <div class="item" :class="{ active: currentPath === 'tutor-appointment' }" @click="go('tutor-appointment')">预约管理</div>
          <div class="item" :class="{ active: currentPath === 'tutor-interview' }" @click="go('tutor-interview')">访谈管理</div>
          <div class="item" :class="{ active: currentPath === 'tutor-conversation' }" @click="go('tutor-conversation')">谈心谈话</div>
          <div class="item" :class="{ active: currentPath === 'tutor-parent-message' }" @click="go('tutor-parent-message')">家长留言</div>
          <div class="item" :class="{ active: currentPath === 'tutor-message-center' }" @click="go('tutor-message-center')">消息中心</div>
          <div class="item" :class="{ active: currentPath === 'tutor-activity-manage' }" @click="go('tutor-activity-manage')">活动管理</div>
          <div class="item" :class="{ active: currentPath === 'peer-forum' }" @click="go('peer-forum')">朋辈互助审核</div>
        </template>

        <!-- 院系领导专属菜单（支持 college 和 college_leader 两种角色代码） -->
        <template v-if="role === 'college' || role === 'college_leader'">
          <div class="item" :class="{ active: currentPath === 'college-workbench' }" @click="go('college-workbench')">工作台</div>
          <div class="item" :class="{ active: currentPath === 'college-statistics' }" @click="go('college-statistics')">数据统计</div>
          <div class="item" :class="{ active: currentPath === 'college-report' }" @click="go('college-report')">报表查看</div>
          <div class="item" :class="{ active: currentPath === 'college-crisis' }" @click="go('college-crisis')">危机管理</div>
          <div class="item" :class="{ active: currentPath === 'college-students' }" @click="go('college-students')">学生管理</div>
          <div class="item" :class="{ active: currentPath === 'college-manage' || currentPath === 'college-tutors' }" @click="go('college-manage')">院系管理</div>
          <div class="item" :class="{ active: currentPath === 'tutor-message-center' }" @click="go('tutor-message-center')">消息中心</div>
          <div class="item" :class="{ active: currentPath === 'peer-forum' }" @click="go('peer-forum')">朋辈互助审核</div>
        </template>

        <!-- 校领导专属菜单（支持 leader 和 school_leader 两种角色代码） -->
        <template v-else-if="role === 'leader' || role === 'school_leader'">
          <div class="item" :class="{ active: currentPath === 'leader-workbench' }" @click="go('leader-workbench')">工作台</div>
          <div class="item" :class="{ active: currentPath === 'leader-statistics' }" @click="go('leader-statistics')">数据统计</div>
          <div class="item" :class="{ active: currentPath === 'leader-report' }" @click="go('leader-report')">报表查看</div>
          <div class="item" :class="{ active: currentPath === 'leader-crisis' }" @click="go('leader-crisis')">危机管理</div>
          <div class="item" :class="{ active: currentPath === 'leader-colleges' }" @click="go('leader-colleges')">院系管理</div>
          <div class="item" :class="{ active: currentPath === 'tutor-message-center' }" @click="go('tutor-message-center')">消息中心</div>
          <div class="item" :class="{ active: currentPath === 'peer-forum' }" @click="go('peer-forum')">朋辈互助审核</div>
        </template>

        <!-- 系统管理员专属菜单 -->
        <template v-else-if="role === 'admin'">
          <div class="item" :class="{ active: currentPath === 'workbench' }" @click="go('workbench')">工作台</div>
          <div class="item" :class="{ active: currentPath === 'leave' }" @click="go('leave')">请假审批</div>
          <div class="item" :class="{ active: currentPath === 'system-manage' }" @click="go('system-manage')">系统管理</div>
          <div class="item" :class="{ active: currentPath === 'data-manage' }" @click="go('data-manage')">数据管理</div>
          <div class="item" :class="{ active: currentPath === 'user-manage' }" @click="go('user-manage')">用户管理</div>
          <div class="item" :class="{ active: currentPath === 'assessment-system' }" @click="go('assessment-system')">测评系统管理</div>
          <div class="item" :class="{ active: currentPath === 'system-monitor' }" @click="go('system-monitor')">系统监控</div>
          <div class="item" :class="{ active: currentPath === 'tutor-message-center' }" @click="go('tutor-message-center')">消息中心</div>
          <div class="item" :class="{ active: currentPath === 'peer-forum' }" @click="go('peer-forum')">朋辈互助审核</div>
        </template>

        <!-- 其他角色（心理中心、咨询师）菜单 -->
        <template v-else>
          <div class="item" :class="{ active: currentPath === 'workbench' }" @click="go('workbench')">工作台</div>
          <div class="item" :class="{ active: currentPath === 'time' }" @click="go('time')">预约规则配置</div>
          <div class="item" v-if="role === 'counselor'" :class="{ active: currentPath === 'case-list' }" @click="go('case-list')">个案管理</div>
          <div class="item" v-if="role === 'counselor'" :class="{ active: currentPath === 'crisis-list' }" @click="go('crisis-list')">危机管理</div>

          <!-- 请假管理（我的申请/撤销）：仅咨询师；管理员/心理中心在侧栏「请假审批」 -->
          <div class="item" v-if="role === 'counselor'" :class="{ active: currentPath === 'leave-list' }" @click="go('leave-list')">我的请假</div>

          <!-- 测评查看/测评管理：咨询师、心理中心可见 -->
          <div class="item" v-if="['counselor','center'].includes(role)" :class="{ active: currentPath === 'assessment-list' || currentPath.startsWith('assessment-detail/') }" @click="go('assessment-list')">测评管理</div>

          <!-- 学生管理：心理中心可见 -->
          <div class="item" v-if="role === 'center'" :class="{ active: currentPath === 'students' }" @click="go('students')">学生管理</div>

          <!-- 团体活动管理：咨询师、心理中心可见（嵌套在后台布局内） -->
          <div class="item" v-if="['counselor','center'].includes(role)" :class="{ active: currentPath === 'activity-manage' }" @click="go('activity-manage')">团体活动管理</div>

          <!-- 预约管理：心理中心、咨询师可见 -->
          <div class="item" v-if="['center','counselor'].includes(role)" :class="{ active: currentPath === 'appointments' }" @click="go('appointments')">预约管理</div>

          <!-- 请假审批：心理中心；危机审批：心理中心可见 -->
          <div class="item" v-if="role === 'center'" :class="{ active: currentPath === 'leave' }" @click="go('leave')">请假审批</div>
          <div class="item" v-if="role === 'center'" :class="{ active: currentPath === 'crisis' }" @click="go('crisis')">危机审批</div>

          <!-- 咨询师管理：心理中心 -->
          <div class="item" v-if="role === 'center'" :class="{ active: currentPath === 'counselor' }" @click="go('counselor')">咨询师管理</div>

          <!-- 智能排班：心理中心 -->
          <div class="item" v-if="role === 'center'" :class="{ active: currentPath === 'schedule' }" @click="go('schedule')">智能排班</div>

          <!-- 消息中心：心理中心、咨询师可见 -->
          <div class="item" v-if="['center','counselor'].includes(role)" :class="{ active: currentPath === 'tutor-message-center' }" @click="go('tutor-message-center')">消息中心</div>

          <!-- 朋辈互助审核：心理中心、咨询师可见 -->
          <div class="item" v-if="['center','counselor'].includes(role)" :class="{ active: currentPath === 'peer-forum' }" @click="go('peer-forum')">朋辈互助审核</div>

          <!-- 心理中心：数据统计、报表导出、系统状态监控、量表管理、访谈管理 -->
          <div class="item" v-if="role === 'center'" :class="{ active: currentPath === 'center-statistics' }" @click="go('center-statistics')">数据统计</div>
          <div class="item" v-if="role === 'center'" :class="{ active: currentPath === 'center-report-export' }" @click="go('center-report-export')">报表导出</div>
          <div class="item" v-if="role === 'center'" :class="{ active: currentPath === 'center-system-monitor' }" @click="go('center-system-monitor')">系统状态监控</div>
          <div class="item" v-if="role === 'center'" :class="{ active: currentPath === 'scale-manage' }" @click="go('scale-manage')">量表管理</div>
          <div class="item" v-if="role === 'center'" :class="{ active: currentPath === 'interview-manage' }" @click="go('interview-manage')">访谈管理</div>

          <!-- 咨询师 -->
          <div class="item" v-if="role === 'counselor'" :class="{ active: currentPath === 'counselor-work' }" @click="go('counselor-work')">我的咨询</div>
          <div class="item" v-if="role === 'counselor'" :class="{ active: currentPath === 'consult-record-change' }" @click="go('consult-record-change')">记录修改申请</div>
        </template>

      </aside>


      <!-- 右侧工作区 -->
      <section class="content">
        <div class="content-header">
          <h2>欢迎进入 {{ roleName }} 工作台</h2>
        </div>
        <div class="content-body">
          <!-- 使用插槽内的 route，与 Component 同源，避免与 useRoute() 异步边沿不一致导致 parentNode 为 null -->
          <router-view v-slot="{ Component, route: viewRoute }">
            <component :is="Component" :key="viewRoute.fullPath" />
          </router-view>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getNoticeList } from '../../api/notice'
import { clearAuthTokens } from '@/api/request'
import { ElMessage } from 'element-plus'
import {
  Bell,
  Odometer,
  Clock,
  User,
  Calendar,
  List,
  Notebook,
  EditPen,
  UserFilled,
  CircleCheck,
  Warning,
  SwitchButton,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const unreadCount = ref(0)
onMounted(async () => {
  try {
    const res = await getNoticeList({ page: 1, pageSize: 200 })
    const payload = res?.data
    let total = 0
    if (payload != null && typeof payload === 'object' && !Array.isArray(payload)) {
      const records = payload.records || payload.list || []
      total = Number(payload.total)
      if (!Number.isFinite(total) || (Array.isArray(records) && records.length > total)) {
        total = Array.isArray(records) ? records.length : 0
      }
    }
    unreadCount.value = Number.isFinite(total) ? total : 0
  } catch (_) {}
})

const userId = ref(localStorage.getItem('user_id'))

// 优先从 admin_role 获取，其次 user_role（兼容 instructor 和 tutor）
const roleValue = localStorage.getItem('admin_role') || localStorage.getItem('user_role') || ''
const role = ref(roleValue)
const admin_role = localStorage.getItem('admin_role')
const admin_token = localStorage.getItem('admin_token')

const roleMap = {
  admin: '管理员',
  counselor: '咨询师',
  center: '心理中心',
  college: '院系领导',
  college_leader: '院系领导',
  leader: '校领导',
  school_leader: '校领导',
  tutor: '辅导员',
  instructor: '辅导员',
}
const roleName = computed(() => roleMap[role.value] || '用户')

const userName = computed(() => {
  return localStorage.getItem('user_name') ||
      localStorage.getItem('User_name') ||
      localStorage.getItem('admin_name') ||
      '用户'
})

function handleLogout() {
  clearAuthTokens()

  try {
    localStorage.removeItem('user_name')
    localStorage.removeItem('User_name')
    localStorage.removeItem('admin_name')
    localStorage.removeItem('user_role')
    localStorage.removeItem('User_role')
    localStorage.removeItem('admin_role')
    localStorage.removeItem('userId')
    localStorage.removeItem('user_id')
  } catch (_) {}

  ElMessage.success('已退出登录')

  setTimeout(() => {
    router.push('/login/admin')
    window.location.reload()
  }, 500)
}

const showOrg = ref(true)

const currentPath = computed(() => {
  const p = route.path
  if (p.startsWith('/admin/')) return p.replace('/admin/', '') || 'workbench'
  return 'workbench'
})

const menuEntries = computed(() => [
  { path: 'workbench', label: '工作台', icon: Odometer, show: true },
  { path: 'time', label: '心理咨询时间规则', icon: Clock, show: true },
  { path: 'counselor', label: '咨询师管理', icon: User, show: role.value === 'center' },
  { path: 'schedule', label: '智能排班', icon: Calendar, show: role.value === 'center' },
  { path: 'counselor-work', label: '我的咨询', icon: List, show: role.value === 'counselor' },
  { path: 'consult-record-change', label: '记录修改申请', icon: EditPen, show: role.value === 'counselor' },
  { path: 'activity-manage', label: '团体活动管理', icon: Calendar, show: role.value === 'counselor' || role.value === 'center' },
  { path: 'appointments', label: '预约管理', icon: Calendar, show: role.value === 'counselor' || role.value === 'center' },
  { path: 'consult-records', label: '咨询记录', icon: Notebook, show: role.value === 'counselor' },
  { path: 'students', label: '学生管理', icon: UserFilled, show: role.value === 'admin' || role.value === 'center' },
  { path: 'leave', label: '请假审批', icon: CircleCheck, show: role.value === 'center' || role.value === 'admin' },
  { path: 'crisis', label: '危机审批', icon: Warning, show: true },
])

function go(page) {
  const path = `/admin/${String(page).replace(/^\//, '')}`
  router.push(path)
}

function goHome() {
  router.push('/')
}

function goToMessageCenter() {
  // 所有管理角色统一跳转到消息中心
  const targetPath = '/admin/tutor-message-center'

  // 如果已经在消息中心页面，刷新页面
  if (route.path === targetPath) {
    window.location.reload()
    return
  }

  router.push(targetPath).catch(err => {
    console.error('路由跳转失败:', err)
    ElMessage.error('跳转失败，请重试')
  })
}

function isExternalActive(path) {
  const p = route.path
  if (path === '/case') return p === '/case' || p.startsWith('/case/')
  if (path === '/crisis') return p.startsWith('/crisis')
  if (path === '/assessment/list') return p.startsWith('/assessment/list') || p.startsWith('/assessment/detail')
  return p === path || p.startsWith(path + '/')
}
</script>

<style scoped>
.admin {
  min-height: 100vh;
  background: #f1f5f9;
}

.top {
  height: 56px;
  background: linear-gradient(135deg, #1e3a5f 0%, #1e4f9c 50%, #2563eb 100%);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(30, 79, 156, 0.25);
}

.top-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo {
  height: 36px;
  width: auto;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.system-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.org {
  font-size: 11px;
  opacity: 0.88;
  margin-top: 1px;
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.15);
}

.user-avatar {
  font-size: 20px;
  color: #fff;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role-tag {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-weight: 500;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.logout-btn .el-icon {
  font-size: 16px;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
}


.message-link {
  color: inherit;
  text-decoration: none;
}

.unread-badge {
  background: #ef4444;
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 2px;
}

.main {
  display: flex;
  min-height: calc(100vh - 56px);
}

.menu {
  width: 220px;
  background: #fff;
  padding: 12px 8px;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
  border-right: 1px solid #e2e8f0;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 4px;
  border-radius: 10px;
  cursor: pointer;
  color: #475569;
  font-size: 14px;
  transition: background 0.2s, color 0.2s;
}

.item:hover {
  background: #f1f5f9;
  color: #1e4f9c;
}

.item.active {
  background: linear-gradient(90deg, rgba(30, 79, 156, 0.12) 0%, transparent 100%);
  color: #1e4f9c;
  font-weight: 600;
  border-left: 3px solid #1e4f9c;
  padding-left: 11px;
}

.item-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-header {
  padding: 20px 24px 12px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.content-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.content-body {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
</style>
