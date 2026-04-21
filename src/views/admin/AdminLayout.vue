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
      <!-- 左侧菜单 - 完全动态生成 -->
      <aside class="menu" v-loading="menuLoading">
        <template v-if="sidebarMenus.length > 0">
          <div
            v-for="menuItem in sidebarMenus"
            :key="menuItem.path"
            class="item"
            :class="{ active: currentPath === menuItem.path }"
            @click="go(menuItem.path)"
          >
            {{ menuItem.label }}
          </div>
        </template>
        <div v-else-if="!menuLoading" class="empty-menu">
          <el-empty description="暂无可用菜单" :image-size="80" />
        </div>
      </aside>

      <!-- 右侧工作区 -->
      <section class="content">
        <div class="content-header">
          <h2>{{ currentPageTitle }}</h2>
        </div>
        <div class="content-body">
          <router-view v-slot="{ Component, route: viewRoute }">
            <component :is="Component" :key="viewRoute.fullPath" />
          </router-view>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getNoticeList } from '../../api/notice'
import { clearAuthTokens } from '@/api/request'
import { getMyPermissions } from '../../api/permissionApi.js'
import { transformBackendMenus, flattenMenuTree } from '../../utils/menuHelper.js'
import { ElMessage } from 'element-plus'
import { useMessageStore } from '@/stores/messageStore'
import {
  Bell,
  UserFilled,
  SwitchButton,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const messageStore = useMessageStore()
const unreadCount = computed(() => messageStore.totalUnread)
const menuLoading = ref(true)
const sidebarMenus = ref([])
const userPermissions = ref([])
const userRoles = ref([])

onMounted(async () => {
  // 加载未读消息数
  messageStore.fetchUnreadCount(true)
  messageStore.startPolling(30000)

  // 加载用户权限和动态菜单
  await loadUserPermissionsAndMenus()
})

onUnmounted(() => {
  messageStore.stopPolling()
})

// 加载未读消息数（保留原有逻辑，但改用store）
const loadUnreadCount = async () => {
  await messageStore.fetchUnreadCount(true)
}

// 加载用户权限和动态菜单
const loadUserPermissionsAndMenus = async () => {
  menuLoading.value = true
  try {
    console.log('🔐 开始加载用户权限...')
    const res = await getMyPermissions()
    console.log('📥 权限接口响应:', res)

    if (res.code === 200 && res.data) {
      // 保存用户权限和角色
      userPermissions.value = res.data.permissions || []
      userRoles.value = res.data.roles || []

      // 转换后端返回的菜单数据
      const backendMenus = res.data.menus || []
      console.log('📋 后端原始菜单数据:', JSON.stringify(backendMenus, null, 2))

      const transformedMenus = transformBackendMenus(backendMenus)
      console.log('✨ 转换后的菜单树:', JSON.stringify(transformedMenus, null, 2))

      // 扁平化菜单树为单层列表（用于侧边栏）
      sidebarMenus.value = flattenMenuTree(transformedMenus)
      console.log('📑 最终侧边栏菜单:', sidebarMenus.value.map(m => ({ label: m.label, path: m.path })))

      if (sidebarMenus.value.length === 0) {
        ElMessage.warning('当前用户暂无可用菜单，请联系管理员配置权限')
      }
    } else {
      console.error('❌ 获取用户权限失败:', res.message || res.msg)
      ElMessage.error(res.message || res.msg || '获取用户权限失败')
      sidebarMenus.value = []
    }
  } catch (e) {
    console.error('❌ 加载用户权限失败:', e)
    const errorMsg = e.response?.data?.message || e.message || '加载菜单失败'
    ElMessage.error(errorMsg)
    sidebarMenus.value = []
  } finally {
    menuLoading.value = false
    console.log('✅ 菜单加载完成，当前菜单数量:', sidebarMenus.value.length)
  }
}

// 用户信息
const userId = ref(localStorage.getItem('user_id'))
const roleValue = localStorage.getItem('admin_role') || localStorage.getItem('user_role') || ''
const role = ref(roleValue)

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

// 当前页面标题
const currentPageTitle = computed(() => {
  const currentMenu = sidebarMenus.value.find(m => m.path === currentPath.value)
  return currentMenu ? `${currentMenu.label} - ${roleName.value}` : `${roleName.value}工作台`
})

// 退出登录
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

// 当前路径
const currentPath = computed(() => {
  const p = route.path
  if (p.startsWith('/admin/')) return p.replace('/admin/', '') || 'workbench'
  return 'workbench'
})

// 路由跳转
function go(page) {
  const path = `/admin/${String(page).replace(/^\//, '')}`

  // 检查路由是否存在
  const resolvedRoute = router.resolve(path)
  if (resolvedRoute.name === null || resolvedRoute.matched.length === 0) {
    console.warn(`路由不存在: ${path}`)
    ElMessage.warning('该功能暂未开放或无权限访问')
    return
  }

  router.push(path).catch(err => {
    console.error('路由跳转失败:', err)
    // 只在真正的错误时才显示错误消息
    if (!err.message?.includes('Avoided redundant navigation')) {
      ElMessage.error('页面不存在或无权限访问')
    }
  })
}

function goHome() {
  router.push('/')
}

function goToMessageCenter() {
  // 根据用户角色动态跳转到对应的消息中心
  const role = localStorage.getItem('admin_role') || localStorage.getItem('user_role') || ''

  let targetPath = '/admin/tutor-message-center' // 默认辅导员消息中心

  // 根据角色选择对应的消息中心路径（支持大小写）
  const roleLower = role.toLowerCase()

  if (roleLower === 'college' || roleLower === 'college_leader') {
    targetPath = '/admin/college-message-center'
  } else if (roleLower === 'leader' || roleLower === 'school_leader') {
    targetPath = '/admin/leader-message-center'
  } else if (roleLower === 'counselor') {
    targetPath = '/admin/tutor-message-center'
  } else if (roleLower === 'center') {
    targetPath = '/admin/tutor-message-center'
  } else if (roleLower === 'admin') {
    targetPath = '/admin/tutor-message-center'
  } else if (roleLower === 'tutor' || roleLower === 'instructor') {
    targetPath = '/admin/tutor-message-center'
  }


  if (route.path === targetPath) {
    window.location.reload()
    return
  }

  router.push(targetPath).catch(err => {
    ElMessage.error('跳转失败，请重试')
  })
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
  border-right: 1px solid #e2e8f0;
  padding: 16px 0;
  overflow-y: auto;
}

.menu .item {
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.menu .item:hover {
  background: #f8fafc;
  color: #1e4f9c;
}

.menu .item.active {
  background: #eff6ff;
  color: #1e4f9c;
  border-left-color: #1e4f9c;
  font-weight: 600;
}

.empty-menu {
  padding: 40px 20px;
  text-align: center;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.content-header {
  padding: 20px 32px;
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
  padding: 24px 32px;
  overflow-y: auto;
}
</style>
