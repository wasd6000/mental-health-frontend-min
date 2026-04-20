<template>
  <div class="student-shell">
    <header class="shell-top">
      <div class="top-left" @click="goPortalHome">
        <img class="logo" src="@/assets/logo.png" alt="校徽" />
        <div class="brand">
          <span class="system-title">心理健康服务平台</span>
          <span class="tag">学生端</span>
        </div>
      </div>
      <nav class="top-links">
        <router-link to="/" class="link-pill" target="_blank">门户首页</router-link>
        <router-link to="/student/wiki" class="link-pill">心理百科</router-link>
        <router-link to="/student/notices" class="link-pill">通知公告</router-link>
      </nav>
      <div class="top-right">
        <router-link to="/message" class="msg-link">
          <el-icon><Bell /></el-icon>
          <span>消息</span>
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </router-link>
        <span class="user-name">{{ displayName }}</span>
        <button type="button" class="logout-btn" @click="logout">退出</button>
      </div>
    </header>

    <div class="shell-main">
      <aside class="side-menu">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="menu-item"
          :class="{ active: isActive(item) }"
          @click="go(item.path)"
        >
          {{ item.label }}
        </div>
      </aside>
      <section class="shell-content">
        <router-view />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores/messageStore'

const router = useRouter()
const route = useRoute()
const messageStore = useMessageStore()

const unreadCount = computed(() => messageStore.totalUnread)

const displayName = computed(
  () => localStorage.getItem('user_name') || localStorage.getItem('User_name') || '同学'
)

// 加载未读消息数
onMounted(() => {
  messageStore.fetchUnreadCount(true)
  messageStore.startPolling(30000)
})

onUnmounted(() => {
  messageStore.stopPolling()
})

const menuItems = [
  { label: '工作台', path: '/student/dashboard', match: (p) => p === '/student/dashboard' },
  { label: '心理测评', path: '/student/assessment', match: (p) => p.startsWith('/student/assessment') },
  { label: '团体活动', path: '/student/activity', match: (p) => p.startsWith('/student/activity') },
  { label: '我的预约', path: '/my-appointment', match: (p) => p.startsWith('/my-appointment') },
  { label: '在线预约', path: '/appointment/select', match: (p) => p.startsWith('/appointment') },
  { label: '朋辈互助', path: '/student/peer-support', match: (p) => p.startsWith('/student/peer-support') },
  { label: '心理自助', path: '/student/self-help', match: (p) => p.startsWith('/student/self-help') },
  { label: '联系咨询师', path: '/student/contact', match: (p) => p === '/student/contact' },
  { label: '关联家长', path: '/student/parent-binding', match: (p) => p === '/student/parent-binding' },
  { label: '个人档案', path: '/student/profile', match: (p) => p.startsWith('/student/profile') || p.startsWith('/student/psych-profile') },
  { label: '危机上报', path: '/student/crisis', match: (p) => p === '/student/crisis' },
]

function isActive(item) {
  const p = route.path
  return item.match(p)
}

function go(path) {
  router.push(path)
}

function goPortalHome() {
  router.push('/')
}

function logout() {
  try {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('anon_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('User_token')
    localStorage.removeItem('User_role')
    localStorage.removeItem('User_name')
    localStorage.removeItem('user_name')
  } catch (_) {}
  router.push('/login/user')
}
</script>

<style scoped>
.student-shell {
  min-height: 100vh;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
}

.shell-top {
  height: 56px;
  background: linear-gradient(135deg, #1e3a5f 0%, #1e4f9c 50%, #2563eb 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 12px rgba(30, 79, 156, 0.25);
  flex-shrink: 0;
  gap: 12px;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo {
  height: 34px;
  width: auto;
  border-radius: 6px;
}

.brand {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.system-title {
  font-size: 16px;
  font-weight: 600;
}

.tag {
  font-size: 11px;
  opacity: 0.9;
}

.top-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  flex: 1;
  min-width: 0;
}

.link-pill {
  color: rgba(255, 255, 255, 0.92);
  text-decoration: none;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 0.2s;
  cursor: pointer;
}

.link-pill:hover {
  background: rgba(255, 255, 255, 0.15);
}

.link-pill.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.top-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.msg-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: inherit;
  text-decoration: none;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 8px;
  position: relative;
}

.msg-link:hover {
  background: rgba(255, 255, 255, 0.12);
}

.unread-badge {
  background: #ef4444;
  color: #fff;
  padding: 1px 5px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 2px;
}

.user-name {
  font-size: 13px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.22);
}

.shell-main {
  display: flex;
  flex: 1;
  min-height: 0;
}

.side-menu {
  width: 220px;
  background: #fff;
  padding: 12px 8px;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
  border-right: 1px solid #e2e8f0;
  flex-shrink: 0;
  overflow-y: auto;
}

.menu-item {
  padding: 12px 14px;
  margin-bottom: 4px;
  border-radius: 10px;
  cursor: pointer;
  color: #475569;
  font-size: 14px;
  transition: background 0.2s, color 0.2s;
}

.menu-item:hover {
  background: #f1f5f9;
  color: #1e4f9c;
}

.menu-item.active {
  background: linear-gradient(90deg, rgba(30, 79, 156, 0.12) 0%, transparent 100%);
  color: #1e4f9c;
  font-weight: 600;
  border-left: 3px solid #1e4f9c;
  padding-left: 11px;
}

.shell-content {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

@media (max-width: 768px) {
  .side-menu {
    width: 180px;
  }

  .top-links {
    display: none;
  }
}
</style>
