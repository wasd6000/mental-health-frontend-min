<template>
  <div class="parent-shell">
    <header class="shell-top">
      <div class="top-left" @click="goPortalHome">
        <img class="logo" src="@/assets/logo.png" alt="校徽" />
        <div class="brand">
          <span class="system-title">心理健康服务平台</span>
          <span class="tag">家长端</span>
        </div>
      </div>
      <nav class="top-links">
        <router-link to="/" class="link-pill">门户首页</router-link>
        <router-link to="/wiki" class="link-pill">心理百科</router-link>
        <router-link to="/notices" class="link-pill">通知公告</router-link>
      </nav>
      <div class="top-right">
        <router-link to="/parent/message" class="msg-link">
          <el-icon><Bell /></el-icon>
          <span>消息</span>
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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const displayName = computed(() => localStorage.getItem('User_name') || '家长')

const menuItems = [
  { label: '家长首页', path: '/parent/dashboard', match: (p) => p === '/parent/dashboard' },
  { label: '子女管理', path: '/parent/children', match: (p) => p === '/parent/children' },
  { label: '测评情况', path: '/parent/assessment', match: (p) => p === '/parent/assessment' },
  { label: '预约咨询', path: '/parent/appointment', match: (p) => p === '/parent/appointment' },
  { label: '活动记录', path: '/parent/activity', match: (p) => p === '/parent/activity' },
  { label: '联系辅导员', path: '/parent/contact', match: (p) => p === '/parent/contact' },
  { label: '留言箱', path: '/parent/message', match: (p) => p.startsWith('/parent/message') },
  { label: '个人资料', path: '/parent/profile', match: (p) => p === '/parent/profile' },
]

function isActive(item) {
  return item.match(route.path)
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
  } catch (_) {}
  router.push('/login/user')
}
</script>

<style scoped>
.parent-shell {
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
}

.msg-link:hover {
  background: rgba(255, 255, 255, 0.12);
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
