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

      <!-- 系统消息标签页 -->
      <el-tab-pane name="system">
        <template #label>
          <span class="tab-label">
            <el-icon><Message /></el-icon>
            系统消息
            <el-badge v-if="unreadCount.systemMessage > 0" :value="unreadCount.systemMessage" class="tab-badge" />
          </span>
        </template>
        <SystemMessageList ref="systemMessageRef" @update-unread="updateSystemUnread" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Bell, ChatDotRound, Message } from '@element-plus/icons-vue'
import { useMessageStore } from '@/stores/messageStore'
import AnnouncementList from './components/AnnouncementList.vue'
import PrivateMessageList from './components/PrivateMessageList.vue'
import SystemMessageList from './components/SystemMessageList.vue'

const messageStore = useMessageStore()

const activeTab = ref('system')
const announcementRef = ref(null)
const privateMessageRef = ref(null)
const systemMessageRef = ref(null)

// 从store获取未读数
const unreadCount = computed(() => ({
  announcement: messageStore.announcementUnread,
  privateMessage: messageStore.privateMessageUnread,
  systemMessage: messageStore.systemMessageUnread,
  total: messageStore.totalUnread
}))

const totalUnread = computed(() => messageStore.totalUnread)

// 加载未读统计
async function loadUnreadCount() {
  await messageStore.fetchUnreadCount(true)
}

function handleTabChange(tab) {
  if (tab === 'announcement' && announcementRef.value) {
    announcementRef.value.loadList()
  } else if (tab === 'private' && privateMessageRef.value) {
    privateMessageRef.value.loadConversations()
  } else if (tab === 'system' && systemMessageRef.value) {
    systemMessageRef.value.loadList()
  }
}

function refreshAll() {
  loadUnreadCount()
  if (activeTab.value === 'announcement' && announcementRef.value) {
    announcementRef.value.loadList()
  } else if (activeTab.value === 'private' && privateMessageRef.value) {
    privateMessageRef.value.loadConversations()
  } else if (activeTab.value === 'system' && systemMessageRef.value) {
    systemMessageRef.value.loadList()
  }
}

// 子组件更新未读数时同步到store
function updateAnnouncementUnread(count) {
  messageStore.setAnnouncementUnread(count)
}

function updatePrivateUnread(count) {
  messageStore.setPrivateMessageUnread(count)
}

function updateSystemUnread(count) {
  messageStore.setSystemMessageUnread(count)
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
