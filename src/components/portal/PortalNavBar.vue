<template>
  <div class="portal-nav-wrap">
    <header class="portal-nav" :class="`theme-${theme}`">
    <div class="logo-area">
        <img src="@/assets/logo.png" alt="校徽" class="logo-img" />
        <span class="title">心理健康服务平台</span>
      </div>

      <nav class="nav-menu">
        <router-link
          to="/"
          class="nav-item"
          :class="{ 'active-nav': activeKey === 'home' }"
        >
          首页
        </router-link>
        <router-link
          to="/wiki"
          class="nav-item"
          :class="{ 'active-nav': activeKey === 'wiki' }"
        >
          心理百科
        </router-link>
        <router-link
            to="/articles"
            class="nav-item"
            :class="{ 'active-nav': activeKey === 'articles' }"
        >
          心理美文
        </router-link>
        <span
            class="nav-item"
            :class="{ 'active-nav': activeKey === 'peer' }"
            @click="handlePeerSupportClick"          style="cursor: pointer;"
        >
          朋辈互助
        </span>
        <router-link
            to="/notices"
            class="nav-item"
            :class="{ 'active-nav': activeKey === 'notices' }"
        >
          通知公告
        </router-link>
      </nav>

      <div class="actions">
        <template v-if="!isLoggedIn">
          <button type="button" class="btn-login" @click="goLogin('admin')">管理登录</button>
          <button type="button" class="btn-login" @click="goLogin('user')">学生登录</button>
          <button type="button" class="btn-appoint" @click="goAppointment">在线预约</button>
        </template>

        <template v-else>
          <div class="user-info" @click="goToDashboard" style="cursor: pointer;">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role-badge" :class="roleClass">{{ roleText }}</span>
          </div>
          <button type="button" class="btn-logout" @click="handleLogout">退出登录</button>
        </template>
      </div>
    </header>
    <div class="portal-nav-spacer" aria-hidden="true" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { validateToken } from '../../api/auth'
import { clearAuthTokens } from '../../api/request'

defineProps({
  /** home | wiki | articles | peer | notices | appointment */
  activeKey: {
    type: String,
    default: '',
  },
  /** 主题色：red（红色）| blue（蓝色），默认 red */
  theme: {
    type: String,
    default: 'red',
    validator: (value) => ['red', 'blue'].includes(value),
  },
})

const router = useRouter()

const isLoggedIn = ref(false)
const userName = ref('')
const userRole = ref('')

const roleText = computed(() => {
  const roleMap = {
    admin: '管理员',
    center: '心理中心',
    counselor: '咨询师',
    instructor: '辅导员',
    tutor: '辅导员',
    college: '院系领导',
    college_leader: '院系领导',
    leader: '校领导',
    school_leader: '校领导',
    student: '学生',
    parent: '家长'
  }
  return roleMap[userRole.value] || userRole.value
})

const roleClass = computed(() => {
  // 统一将 tutor 映射为 instructor 的样式
  // 将 college_leader 映射为 college 的样式
  // 将 school_leader 映射为 leader 的样式
  let displayRole = userRole.value
  if (displayRole === 'tutor') {
    displayRole = 'instructor'
  } else if (displayRole === 'college_leader') {
    displayRole = 'college'
  } else if (displayRole === 'school_leader') {
    displayRole = 'leader'
  }
  return `role-${displayRole}`
})

onMounted(async () => {
  await checkLoginStatus()
})

async function checkLoginStatus() {
  const token = localStorage.getItem('auth_token') ||
                localStorage.getItem('access_token') ||
                localStorage.getItem('User_token') ||
                localStorage.getItem('admin_token')

  if (!token) {
    isLoggedIn.value = false
    return
  }

  try {
    const isValid = await validateToken()

    if (isValid) {
      isLoggedIn.value = true

      userName.value = localStorage.getItem('user_name') ||
                       localStorage.getItem('User_name') ||
                       '用户'

      // 从多个来源获取角色（这些字段现在都来自 JWT 的 role_code）
      userRole.value = localStorage.getItem('User_role') ||
                       localStorage.getItem('user_role') ||
                       localStorage.getItem('admin_role') ||
                       ''
    } else {
      clearAuthTokens()
      isLoggedIn.value = false
    }
  } catch (e) {
    console.error('[NavBar] Token 验证失败:', e)
    clearAuthTokens()
    isLoggedIn.value = false
  }
}


function goLogin(type) {
  if (type === 'admin') router.push('/login/admin')
  else router.push('/login/user')
}

function goAppointment() {
  const token = localStorage.getItem('auth_token') ||
                localStorage.getItem('User_token') ||
                localStorage.getItem('access_token')
  const role = localStorage.getItem('User_role')

  if (!token || !role) {
    router.push({ path: '/login/user', query: { redirect: '/appointment/select' } })
  } else {
    router.push('/appointment/select')
  }
}

function handleLogout() {
  clearAuthTokens()

  try {
    localStorage.removeItem('user_name')
    localStorage.removeItem('User_name')
    localStorage.removeItem('user_role')
    localStorage.removeItem('User_role')
    localStorage.removeItem('admin_role')
    localStorage.removeItem('userId')
    localStorage.removeItem('user_id')
  } catch (_) {}

  isLoggedIn.value = false
  userName.value = ''
  userRole.value = ''

  ElMessage.success('已退出登录')

  setTimeout(() => {
    window.location.reload()
  }, 500)
}

function goToDashboard() {
  const roleRoutes = {
    admin: '/admin/workbench',
    center: '/admin/center-statistics',
    counselor: '/admin/counselor-work',
    instructor: '/admin/tutor-workbench',
    tutor: '/admin/tutor-workbench',
    college: '/admin/college-workbench',
    college_leader: '/admin/college-workbench',
    leader: '/admin/leader-workbench',
    school_leader: '/admin/leader-workbench',
    student: '/student/dashboard',
    parent: '/parent/dashboard'
  }

  const route = roleRoutes[userRole.value]
  if (route) {
    router.push(route)
  } else {
    ElMessage.warning('未找到对应的后台页面')
  }
}

function handlePeerSupportClick() {
  const token = localStorage.getItem('auth_token') ||
      localStorage.getItem('User_token') ||
      localStorage.getItem('access_token')

  if (!token) {
    router.push('/student/peer-support')
    return
  }

  const role = localStorage.getItem('user_role') ||
      localStorage.getItem('User_role') ||
      localStorage.getItem('admin_role')

  if (['admin', 'center', 'counselor', 'tutor', 'instructor', 'college', 'leader'].includes(role)) {
    router.push('/admin/peer-forum')
  } else {
    router.push('/student/peer-support')
  }
}
</script>

<style scoped>
.portal-nav-wrap {
  position: relative;
}

.portal-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #a51c30;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 40px;
  min-height: 56px;
  box-sizing: border-box;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  transition: background 0.3s ease;
}

/* 蓝色主题 */
.portal-nav.theme-blue {
  background: linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%);
}

/* 红色主题（默认） */
.portal-nav.theme-red {
  background: #a51c30;
}

.portal-nav-spacer {
  height: 56px;
  flex-shrink: 0;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  height: 40px;
  width: auto;
  object-fit: contain;
  border-radius: 4px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
}

.nav-menu {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-item {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
}

.nav-item:hover,
.nav-item.active-nav {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  align-items: center;
}

.btn-login,
.btn-appoint,
.btn-logout {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-login {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.btn-login:hover {
  background: rgba(255, 255, 255, 0.25);
}

.btn-appoint {
  background: #c9a227;
  color: white;
  box-shadow: 0 4px 15px rgba(201, 162, 39, 0.4);
}

.theme-blue .btn-appoint {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.btn-appoint:hover {
  transform: translateY(-2px);
  background: #b8921f;
  box-shadow: 0 6px 20px rgba(201, 162, 39, 0.5);
}

.theme-blue .btn-appoint:hover {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.25);
  font-weight: 500;
}

.role-admin { background: rgba(99, 102, 241, 0.4); }
.role-center { background: rgba(59, 130, 246, 0.4); }
.role-counselor { background: rgba(245, 158, 11, 0.4); }
.role-instructor { background: rgba(16, 185, 129, 0.4); }
.role-tutor { background: rgba(16, 185, 129, 0.4); }
.role-college { background: rgba(139, 92, 246, 0.4); }
.role-leader { background: rgba(239, 68, 68, 0.4); }
.role-student { background: rgba(6, 182, 212, 0.4); }
.role-parent { background: rgba(236, 72, 153, 0.4); }

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 960px) {
  .portal-nav {
    flex-wrap: wrap;
    padding: 10px 16px;
    gap: 8px;
  }

  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: flex-start;
  }

  .title {
    font-size: 16px;
  }

  .user-info {
    padding: 6px 12px;
  }

  .user-name {
    max-width: 80px;
  }
}
</style>
