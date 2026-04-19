<template>
  <div class="message-center">
    <div class="page-header">
      <div class="header-left">
        <h1>消息中心</h1>
        <el-badge v-if="totalUnread > 0" :value="totalUnread" class="total-badge" />
      </div>
      <el-button :icon="Refresh" circle @click="refreshAll" />
    </div>

    <el-tabs v-model="activeTab" type="border-card" @tab-change="handleTabChange">
      <!-- 公告通知标签页 -->
      <el-tab-pane name="announcement">
        <template #label>
          <span class="tab-label">
            <el-icon><Bell /></el-icon>
            公告通知
            <el-badge v-if="unreadCount.announcement > 0" :value="unreadCount.announcement" class="tab-badge" />
          </span>
        </template>
        <AnnouncementList ref="announcementRef" @update-unread="updateAnnouncementUnread" />
      </el-tab-pane>

      <!-- 私信标签页 -->
      <el-tab-pane name="private">
        <template #label>
          <span class="tab-label">
            <el-icon><ChatDotRound /></el-icon>
            私信
            <el-badge v-if="unreadCount.privateMessage > 0" :value="unreadCount.privateMessage" class="tab-badge" />
          </span>
        </template>
        <PrivateMessageList ref="privateMessageRef" @update-unread="updatePrivateUnread" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Bell, ChatDotRound } from '@element-plus/icons-vue'
import AnnouncementList from './components/AnnouncementList.vue'
import PrivateMessageList from './components/PrivateMessageList.vue'
import request from '@/request'

const activeTab = ref('announcement')
const announcementRef = ref(null)
const privateMessageRef = ref(null)

const unreadCount = ref({
  announcement: 0,
  privateMessage: 0,
  total: 0
})

const totalUnread = computed(() => {
  return unreadCount.value.announcement + unreadCount.value.privateMessage
})

// 加载未读统计
async function loadUnreadCount() {
  try {
    const res = await request.get('/api/message/unread-count')
    if (res.code === 200 && res.data) {
      unreadCount.value = {
        announcement: res.data.announcementUnread || 0,
        privateMessage: res.data.privateMessageUnread || 0,
        total: res.data.totalUnread || 0
      }
    }
  } catch (e) {
    console.error('加载未读统计失败:', e)
  }
}

function handleTabChange(tab) {
  if (tab === 'announcement' && announcementRef.value) {
    announcementRef.value.loadList()
  } else if (tab === 'private' && privateMessageRef.value) {
    privateMessageRef.value.loadConversations()
  }
}

function refreshAll() {
  loadUnreadCount()
  if (activeTab.value === 'announcement' && announcementRef.value) {
    announcementRef.value.loadList()
  } else if (activeTab.value === 'private' && privateMessageRef.value) {
    privateMessageRef.value.loadConversations()
  }
}

function updateAnnouncementUnread(count) {
  unreadCount.value.announcement = count
}

function updatePrivateUnread(count) {
  unreadCount.value.privateMessage = count
}

onMounted(() => {
  loadUnreadCount()
})
</script>

<style scoped>
.message-center {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
  font-weight: 600;
}

.total-badge :deep(.el-badge__content) {
  background-color: #ef4444;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-label .el-icon {
  font-size: 16px;
}

.tab-badge :deep(.el-badge__content) {
  transform: translate(50%, -50%) scale(0.8);
  background-color: #ef4444;
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs__content) {
  padding: 20px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-top: none;
  border-radius: 0 0 4px 4px;
}
</style>