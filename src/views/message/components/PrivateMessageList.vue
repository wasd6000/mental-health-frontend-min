<template>
  <div class="private-message-list">
    <div class="conversation-layout">
      <!-- 左侧会话列表 -->
      <div class="conversation-sidebar">
        <div class="sidebar-header">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索会话..."
            clearable
            size="small"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" size="small" :icon="Plus" circle @click="showNewMessage = true" />
        </div>

        <div class="conversation-list" v-loading="loading">
          <div
            v-for="conv in filteredConversations"
            :key="conv.id"
            class="conversation-item"
            :class="{ active: currentConversation?.id === conv.id, pinned: conv.isPinned }"
            @click="selectConversation(conv)"
          >
            <div class="conv-avatar">
              <el-avatar :size="48" :src="conv.targetUserAvatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <div v-if="conv.unreadCount > 0" class="unread-badge">
                {{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}
              </div>
            </div>
            <div class="conv-content">
              <div class="conv-header">
                <span class="conv-name">{{ conv.targetUserName || '未知用户' }}</span>
                <span class="conv-time">{{ formatTime(conv.lastMessageTime) }}</span>
              </div>
              <div class="conv-preview" :class="{ unread: conv.unreadCount > 0 }">
                {{ conv.lastMessageContent || '暂无消息' }}
              </div>
            </div>
            <div class="conv-actions" @click.stop>
              <el-dropdown trigger="click">
                <el-icon class="action-icon"><More /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="togglePin(conv)">
                      <el-icon><Top /></el-icon>
                      {{ conv.isPinned ? '取消置顶' : '置顶' }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="deleteConversation(conv)" divided>
                      <el-icon><Delete /></el-icon>
                      删除会话
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <el-empty v-if="filteredConversations.length === 0" description="暂无会话" />
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="conversation-main">
        <template v-if="currentConversation">
          <!-- 聊天头部 -->
          <div class="chat-header">
            <div class="chat-user">
              <el-avatar :size="40" :src="currentConversation.targetUserAvatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <div class="chat-user-info">
                <div class="chat-user-name">{{ currentConversation.targetUserName || '未知用户' }}</div>
                <div class="chat-user-role">{{ currentConversation.targetUserRole || '' }}</div>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div class="chat-messages" ref="messageContainer">
            <div v-if="loadingMessages" class="loading-more">
              <el-icon class="is-loading"><Loading /></el-icon>
              加载中...
            </div>
            <div
              v-for="msg in messageList"
              :key="msg.messageId"
              class="message-item"
              :class="{ self: msg.isSelf }"
            >
              <div class="message-avatar">
                <el-avatar :size="36" :src="msg.isSelf ? userAvatar : currentConversation.targetUserAvatar">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
              </div>
              <div class="message-content-wrapper">
                <div class="message-info">
                  <span class="message-sender">{{ msg.isSelf ? '我' : msg.senderName }}</span>
                  <span class="message-time">{{ formatTime(msg.createdAt, true) }}</span>
                </div>
                <div class="message-bubble">
                  <div class="message-content">{{ msg.content }}</div>
                </div>
              </div>
            </div>
            <el-empty v-if="!loadingMessages && messageList.length === 0" description="暂无消息，开始聊天吧" />
          </div>

          <!-- 输入区域 -->
          <div class="chat-input-area">
            <div class="input-toolbar">
              <el-tooltip content="发送图片" placement="top">
                <el-icon class="toolbar-icon"><Picture /></el-icon>
              </el-tooltip>
              <el-tooltip content="发送文件" placement="top">
                <el-icon class="toolbar-icon"><Document /></el-icon>
              </el-tooltip>
            </div>
            <div class="input-box">
              <el-input
                v-model="inputMessage"
                type="textarea"
                :rows="3"
                placeholder="输入消息..."
                resize="none"
                @keydown.enter.prevent="sendMessage"
              />
              <el-button type="primary" :disabled="!inputMessage.trim()" @click="sendMessage">
                发送
              </el-button>
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else class="empty-chat">
          <el-empty description="选择一个会话开始聊天">
            <el-button type="primary" @click="showNewMessage = true">发起新会话</el-button>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 发起新会话对话框 -->
    <el-dialog v-model="showNewMessage" title="发起新会话" width="500px">
      <el-form :model="newMessageForm" label-width="80px">
        <el-form-item label="接收人">
          <el-select
            v-model="newMessageForm.receiverId"
            filterable
            remote
            reserve-keyword
            placeholder="搜索用户..."
            :remote-method="searchUsers"
            :loading="userSearchLoading"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.userId"
              :label="user.realName || user.username"
              :value="user.userId"
            >
              <div class="user-option">
                <el-avatar :size="24" :src="user.avatarUrl">
                  <el-icon><UserFilled /></el-icon>
                </el-avatar>
                <span>{{ user.realName || user.username }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input
            v-model="newMessageForm.content"
            type="textarea"
            :rows="4"
            placeholder="输入消息内容..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewMessage = false">取消</el-button>
        <el-button type="primary" :disabled="!canSendNewMessage" @click="sendNewMessage">
          发送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Plus, UserFilled, More, Top, Delete,
  Picture, Document, Loading
} from '@element-plus/icons-vue'
import request from '@/request'

const emit = defineEmits(['update-unread'])

const loading = ref(false)
const loadingMessages = ref(false)
const conversations = ref([])
const currentConversation = ref(null)
const messageList = ref([])
const searchKeyword = ref('')
const inputMessage = ref('')
const messageContainer = ref(null)

const userAvatar = computed(() => {
  return localStorage.getItem('user_avatar') || ''
})

const filteredConversations = computed(() => {
  let list = conversations.value
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(conv =>
      (conv.targetUserName || '').toLowerCase().includes(keyword)
    )
  }
  // 置顶会话排在前面
  return list.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  })
})

const totalUnread = computed(() => {
  return conversations.value.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)
})

// 新会话相关
const showNewMessage = ref(false)
const newMessageForm = ref({
  receiverId: '',
  content: ''
})
const userOptions = ref([])
const userSearchLoading = ref(false)

const canSendNewMessage = computed(() => {
  return newMessageForm.value.receiverId && newMessageForm.value.content.trim()
})

// 加载会话列表
async function loadConversations() {
  loading.value = true
  try {
    const res = await request.get('/api/message/conversation/list')
    if (res.code === 200 && Array.isArray(res.data)) {
      conversations.value = res.data
      emit('update-unread', totalUnread.value)
    }
  } catch (e) {
    console.error('加载会话列表失败:', e)
    ElMessage.error('加载会话列表失败')
  } finally {
    loading.value = false
  }
}

// 选择会话
async function selectConversation(conv) {
  currentConversation.value = conv
  await loadMessages(conv.targetUserId)
  // 标记会话已读
  if (conv.unreadCount > 0) {
    await markConversationAsRead(conv.targetUserId)
    conv.unreadCount = 0
    emit('update-unread', totalUnread.value)
  }
}

// 加载消息列表
async function loadMessages(targetUserId, page = 1) {
  loadingMessages.value = true
  try {
    const res = await request.get('/api/message/private/conversation', {
      params: {
        targetUserId,
        page,
        pageSize: 20
      }
    })
    if (res.code === 200 && res.data) {
      const messages = res.data.records || []
      // 转换消息格式
      const currentUserId = localStorage.getItem('user_id') || localStorage.getItem('userId')
      messageList.value = messages.map(msg => ({
        ...msg,
        isSelf: msg.senderId === currentUserId
      })).reverse() // 按时间正序排列

      nextTick(() => {
        scrollToBottom()
      })
    }
  } catch (e) {
    console.error('加载消息失败:', e)
    ElMessage.error('加载消息失败')
  } finally {
    loadingMessages.value = false
  }
}

// 发送消息
async function sendMessage() {
  if (!inputMessage.value.trim() || !currentConversation.value) return

  const content = inputMessage.value.trim()
  try {
    const res = await request.post('/api/message/private/send', {
      receiverId: currentConversation.value.targetUserId,
      content: content,
      messageType: 1
    })

    if (res.code === 200) {
      inputMessage.value = ''
      // 添加到消息列表
      const currentUserId = localStorage.getItem('user_id') || localStorage.getItem('userId')
      messageList.value.push({
        messageId: Date.now().toString(),
        senderId: currentUserId,
        content: content,
        createdAt: new Date().toISOString(),
        isSelf: true
      })
      nextTick(() => {
        scrollToBottom()
      })
      // 更新会话列表
      loadConversations()
    }
  } catch (e) {
    console.error('发送消息失败:', e)
    ElMessage.error('发送消息失败')
  }
}

// 标记会话已读
async function markConversationAsRead(targetUserId) {
  try {
    await request.post('/api/message/private/conversation/read', {
      targetUserId
    })
  } catch (e) {
    console.error('标记已读失败:', e)
  }
}

// 置顶/取消置顶
async function togglePin(conv) {
  try {
    await request.post(`/api/message/conversation/pin/${conv.id}`, {
      isPinned: !conv.isPinned
    })
    conv.isPinned = !conv.isPinned
    ElMessage.success(conv.isPinned ? '已置顶' : '已取消置顶')
  } catch (e) {
    console.error('置顶操作失败:', e)
    ElMessage.error('操作失败')
  }
}

// 删除会话
async function deleteConversation(conv) {
  try {
    await ElMessageBox.confirm('确定删除该会话吗？删除后聊天记录将无法恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/api/message/conversation/${conv.id}`)
    conversations.value = conversations.value.filter(c => c.id !== conv.id)
    if (currentConversation.value?.id === conv.id) {
      currentConversation.value = null
      messageList.value = []
    }
    emit('update-unread', totalUnread.value)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除会话失败:', e)
      ElMessage.error('删除失败')
    }
  }
}

// 搜索用户
async function searchUsers(query) {
  if (!query) return
  userSearchLoading.value = true
  try {
    // 这里需要后端提供用户搜索接口
    // const res = await request.get('/api/user/search', { params: { keyword: query } })
    // userOptions.value = res.data || []

    // 临时：从现有会话中过滤
    userOptions.value = conversations.value
      .filter(conv => (conv.targetUserName || '').includes(query))
      .map(conv => ({
        userId: conv.targetUserId,
        realName: conv.targetUserName,
        avatarUrl: conv.targetUserAvatar
      }))
  } catch (e) {
    console.error('搜索用户失败:', e)
  } finally {
    userSearchLoading.value = false
  }
}

// 发送新消息
async function sendNewMessage() {
  if (!canSendNewMessage.value) return

  try {
    const res = await request.post('/api/message/private/send', {
      receiverId: newMessageForm.value.receiverId,
      content: newMessageForm.value.content.trim(),
      messageType: 1
    })

    if (res.code === 200) {
      ElMessage.success('发送成功')
      showNewMessage.value = false
      newMessageForm.value = { receiverId: '', content: '' }
      // 刷新会话列表
      await loadConversations()
      // 如果是发给已有会话的用户，自动选中
      const existingConv = conversations.value.find(
        c => c.targetUserId === newMessageForm.value.receiverId
      )
      if (existingConv) {
        selectConversation(existingConv)
      }
    }
  } catch (e) {
    console.error('发送消息失败:', e)
    ElMessage.error('发送失败')
  }
}

function scrollToBottom() {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

function formatTime(time, full = false) {
  if (!time) return ''
  const d = new Date(time)
  if (isNaN(d.getTime())) return String(time)
  if (full) {
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = (today - msgDate) / (1000 * 60 * 60 * 24)

  if (diffDays === 0) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[d.getDay()]
  } else {
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
}

onMounted(() => {
  loadConversations()
})

defineExpose({ loadConversations })
</script>

<style scoped>
.private-message-list {
  height: 600px;
}

.conversation-layout {
  display: flex;
  height: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

/* 左侧会话列表 */
.conversation-sidebar {
  width: 320px;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 8px;
}

.sidebar-header .el-input {
  flex: 1;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
  position: relative;
}

.conversation-item:hover {
  background: #f1f5f9;
}

.conversation-item.active {
  background: #eff6ff;
}

.conversation-item.pinned::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: #f59e0b;
  border-radius: 2px;
}

.conv-avatar {
  position: relative;
  flex-shrink: 0;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #f8fafc;
}

.conv-content {
  flex: 1;
  min-width: 0;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.conv-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 15px;
}

.conv-time {
  font-size: 12px;
  color: #94a3b8;
}

.conv-preview {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-preview.unread {
  color: #1e293b;
  font-weight: 500;
}

.conv-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.conversation-item:hover .conv-actions {
  opacity: 1;
}

.action-icon {
  padding: 4px;
  color: #94a3b8;
  cursor: pointer;
}

.action-icon:hover {
  color: #64748b;
}

/* 右侧聊天区域 */
.conversation-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.empty-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-user-info {
  display: flex;
  flex-direction: column;
}

.chat-user-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
}

.chat-user-role {
  font-size: 12px;
  color: #94a3b8;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8fafc;
}

.loading-more {
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  padding: 10px;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-item.self {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content-wrapper {
  max-width: 70%;
}

.message-info {
  margin-bottom: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.message-item.self .message-info {
  text-align: right;
}

.message-sender {
  margin-right: 8px;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-item.self .message-bubble {
  background: #3b82f6;
  color: white;
}

.message-content {
  line-height: 1.5;
  word-break: break-word;
}

.chat-input-area {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}

.input-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.toolbar-icon {
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.toolbar-icon:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.input-box {
  display: flex;
  gap: 12px;
}

.input-box .el-textarea {
  flex: 1;
}

.input-box .el-button {
  align-self: flex-end;
}

/* 新会话对话框 */
.user-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .conversation-sidebar {
    width: 100%;
  }

  .conversation-layout {
    flex-direction: column;
  }
}
</style>