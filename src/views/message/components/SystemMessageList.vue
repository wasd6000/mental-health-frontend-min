<template>
  <div class="system-message-list">
    <!-- 搜索和筛选工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="query.keyword"
          placeholder="搜索消息标题..."
          clearable
          class="search-input"
          @input="debounceSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="messageTypeFilter" placeholder="消息类型" clearable @change="handleTypeFilterChange">
          <el-option label="全部" value="" />
          <el-option label="系统消息" value="SYSTEM" />
          <el-option label="预约通知" value="APPOINTMENT" />
          <el-option label="危机预警" value="CRISIS" />
          <el-option label="提醒" value="REMINDER" />
          <el-option label="通知" value="NOTIFICATION" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-radio-group v-model="readFilter" @change="handleReadFilterChange">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="unread">未读</el-radio-button>
          <el-radio-button value="read">已读</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="markAllAsRead" v-if="unreadCount > 0">
          全部已读
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="statistics-bar">
      <el-tag type="info" effect="plain">
        总计 {{ totalCount }} 条
      </el-tag>
      <el-tag type="success" effect="plain">
        已读 {{ readCount }} 条
      </el-tag>
      <el-tag type="danger" effect="plain">
        未读 {{ unreadCount }} 条
      </el-tag>
      <el-tag v-if="appointmentCount > 0" type="warning" effect="plain">
        预约通知 {{ appointmentCount }} 条
      </el-tag>
      <el-tag v-if="crisisCount > 0" type="danger" effect="plain">
        危机预警 {{ crisisCount }} 条
      </el-tag>
    </div>

    <!-- 消息列表 -->
    <el-card v-loading="loading" class="list-card" shadow="never">
      <div v-if="messageList.length > 0" class="message-items">
        <div
          v-for="item in messageList"
          :key="item.messageId || item.id"
          class="message-item"
          :class="{ unread: !item.isRead && !item.read }"
          @click="openDetail(item)"
        >
          <div class="item-left">
            <div class="item-icon" :class="`type-${getMessageTypeClass(item.messageType || item.type)}`">
              <el-icon>
                <Bell v-if="getMessageTypeClass(item.messageType || item.type) === 'SYSTEM'" />
                <Warning v-else-if="getMessageTypeClass(item.messageType || item.type) === 'CRISIS'" />
                <Timer v-else-if="getMessageTypeClass(item.messageType || item.type) === 'REMINDER'" />
                <Calendar v-else-if="getMessageTypeClass(item.messageType || item.type) === 'APPOINTMENT'" />
                <Document v-else />
              </el-icon>
            </div>
            <div class="item-content">
              <div class="item-header">
                <span class="item-title">{{ item.title }}</span>
                <el-tag
                  v-if="item.priority === 1 || item.priority === 'HIGH'"
                  type="danger"
                  size="small"
                  effect="dark"
                >重要</el-tag>
                <el-tag
                  v-if="getMessageTypeText(item.messageType || item.type) === '危机预警'"
                  type="danger"
                  size="small"
                >危机</el-tag>
                <el-tag
                  v-if="getMessageTypeText(item.messageType || item.type) === '预约通知'"
                  type="warning"
                  size="small"
                >预约</el-tag>
                <el-tag
                  v-if="!item.isRead && !item.read"
                  type="success"
                  size="small"
                >未读</el-tag>
              </div>
              <div class="item-summary">{{ item.content?.substring(0, 100) }}</div>
              <div class="item-meta">
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatTime(item.createdAt || item.createTime) }}
                </span>
                <span class="meta-item" v-if="item.sourceName">
                  <el-icon><User /></el-icon>
                  {{ item.sourceName }}
                </span>
              </div>
            </div>
          </div>
          <div class="item-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无系统消息" />

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadList"
          @current-change="loadList"
        />
      </div>
    </el-card>

    <!-- 消息详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentMessage.title || '消息详情'"
      width="800px"
      destroy-on-close
    >
      <div class="detail-content">
        <div class="detail-meta">
          <span class="meta-item">
            <el-icon><Clock /></el-icon>
            发送时间：{{ formatTime(currentMessage.createdAt || currentMessage.createTime, true) }}
          </span>
          <el-tag :type="getMessageTypeTag(currentMessage.messageType || currentMessage.type)" size="small">
            {{ getMessageTypeText(currentMessage.messageType || currentMessage.type) }}
          </el-tag>
          <el-tag v-if="currentMessage.priority === 1 || currentMessage.priority === 'HIGH'" type="danger" size="small">
            重要
          </el-tag>
        </div>
        <div class="detail-body">{{ currentMessage.content }}</div>
        <div v-if="currentMessage.relatedData" class="detail-related">
          <el-divider />
          <div class="related-title">相关信息</div>
          <pre class="related-data">{{ JSON.stringify(currentMessage.relatedData, null, 2) }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="!currentMessage.isRead && !currentMessage.read"
          type="primary"
          @click="markAsRead(currentMessage)"
        >
          标记已读
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Bell, Warning, Timer, Calendar, Document, ArrowRight, Clock, User } from '@element-plus/icons-vue'
import request from '@/request'
import { useMessageStore } from '@/stores/messageStore'

const messageStore = useMessageStore()
const emit = defineEmits(['update-unread'])

const loading = ref(false)
const messageList = ref([])
const total = ref(0)
const unreadCount = ref(0)
const readCount = ref(0)
const totalCount = ref(0)
const appointmentCount = ref(0)
const crisisCount = ref(0)
const readFilter = ref('')
const messageTypeFilter = ref('')

const query = ref({
  page: 1,
  pageSize: 20,
  keyword: ''
})

const detailVisible = ref(false)
const currentMessage = ref({})

let searchTimer = null
function debounceSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    query.value.page = 1
    loadList()
  }, 300)
}

function handleReadFilterChange() {
  query.value.page = 1
  loadList()
}

function handleTypeFilterChange() {
  query.value.page = 1
  loadList()
}

async function loadList() {
  loading.value = true
  try {
    const params = {
      page: query.value.page,
      pageSize: query.value.pageSize,
      keyword: query.value.keyword
    }

    // 根据筛选条件添加已读参数
    if (readFilter.value === 'read') {
      params.read = true
    } else if (readFilter.value === 'unread') {
      params.read = false
    }

    // 根据消息类型筛选
    if (messageTypeFilter.value) {
      params.messageType = messageTypeFilter.value
    }

    const res = await request.get('/api/message/list', { params })
    if (res.code === 200 && res.data) {
      messageList.value = res.data.records || res.data.list || []
      total.value = res.data.total || 0

      // 统计各类消息数量
      const allMessages = messageList.value
      unreadCount.value = allMessages.filter(item => !(item.isRead || item.read)).length
      readCount.value = allMessages.filter(item => (item.isRead || item.read)).length
      totalCount.value = allMessages.length
      appointmentCount.value = allMessages.filter(item =>
        (item.messageType || item.type) === 'APPOINTMENT'
      ).length
      crisisCount.value = allMessages.filter(item =>
        (item.messageType || item.type) === 'CRISIS'
      ).length

      emit('update-unread', unreadCount.value)
    }
  } catch (e) {
    console.error('加载系统消息列表失败:', e)
    ElMessage.error('加载系统消息列表失败')
  } finally {
    loading.value = false
  }
}

async function openDetail(item) {
  currentMessage.value = { ...item }
  detailVisible.value = true
  // 自动标记已读
  if (!item.isRead && !item.read) {
    await markAsRead(item, false)
  }
}

async function markAsRead(item, showMessage = true) {
  try {
    await request.post('/api/message/mark-read', {
      messageIds: [item.messageId || item.id]
    })
    item.isRead = true
    item.read = true
    if (showMessage) {
      ElMessage.success('已标记为已读')
    }
    // 同时更新全局store和父组件
    messageStore.decreaseSystemMessageUnread(1)
    emit('update-unread', Math.max(0, unreadCount.value - 1))
    // 重新加载以更新统计
    await loadList()
  } catch (e) {
    console.error('标记已读失败:', e)
    if (showMessage) {
      ElMessage.error('标记已读失败')
    }
  }
}

async function markAllAsRead() {
  try {
    await ElMessageBox.confirm('确定将所有消息标记为已读吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.post('/api/message/mark-all-read')
    // 计算之前的未读数用于更新store
    const unreadCountBefore = messageList.value.filter(item => !(item.isRead || item.read)).length
    messageList.value.forEach(item => {
      item.isRead = true
      item.read = true
    })
    // 更新本地未读数
    unreadCount.value = 0
    readCount.value = totalCount.value
    // 同时更新全局store和父组件
    messageStore.decreaseSystemMessageUnread(unreadCountBefore)
    emit('update-unread', 0)
    ElMessage.success('已全部标记为已读')
  } catch (e) {
    if (e !== 'cancel') {
      console.error('批量标记已读失败:', e)
      ElMessage.error('操作失败')
    }
  }
}

function getMessageTypeClass(type) {
  const normalizedType = String(type).toUpperCase()
  if (normalizedType === 'CRISIS') return 'CRISIS'
  if (normalizedType === 'APPOINTMENT') return 'APPOINTMENT'
  if (normalizedType === 'REMINDER') return 'REMINDER'
  if (normalizedType === 'ALERT') return 'ALERT'
  if (normalizedType === 'NOTIFICATION') return 'NOTIFICATION'
  return 'SYSTEM'
}

function getMessageTypeTag(type) {
  const map = {
    'SYSTEM': 'info',
    'APPOINTMENT': 'warning',
    'REMINDER': 'primary',
    'NOTIFICATION': 'success',
    'ALERT': 'danger',
    'CRISIS': 'danger'
  }
  return map[type] || 'info'
}

function getMessageTypeText(type) {
  const normalizedType = String(type).toUpperCase()
  const map = {
    'SYSTEM': '系统消息',
    'APPOINTMENT': '预约通知',
    'REMINDER': '提醒',
    'NOTIFICATION': '通知',
    'ALERT': '警报',
    'CRISIS': '危机预警'
  }
  return map[normalizedType] || normalizedType
}

function formatTime(time, full = false) {
  if (!time) return ''
  const d = new Date(time)
  if (isNaN(d.getTime())) return String(time)
  if (full) {
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return d.toLocaleDateString('zh-CN')
  }
}

onMounted(() => {
  loadList()
})

defineExpose({ loadList })
</script>

<style scoped>
.system-message-list {
  min-height: 400px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  flex: 1;
}

.search-input {
  max-width: 300px;
}

.toolbar-left .el-select {
  width: 160px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.statistics-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.list-card {
  border-radius: 8px;
}

.message-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
}

.message-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.message-item.unread {
  background: #fff;
  border-left-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.item-left {
  display: flex;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.item-icon.type-SYSTEM {
  background: #dbeafe;
  color: #2563eb;
}

.item-icon.type-APPOINTMENT {
  background: #fef3c7;
  color: #f59e0b;
}

.item-icon.type-REMINDER {
  background: #e0e7ff;
  color: #6366f1;
}

.item-icon.type-ALERT,
.item-icon.type-CRISIS {
  background: #fee2e2;
  color: #dc2626;
}

.item-icon.type-NOTIFICATION {
  background: #d1fae5;
  color: #10b981;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.unread .item-title {
  color: #2563eb;
}

.item-summary {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #94a3b8;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-arrow {
  color: #cbd5e1;
  font-size: 20px;
  padding-left: 16px;
}

.message-item:hover .item-arrow {
  color: #64748b;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* 详情对话框样式 */
.detail-content {
  max-height: 500px;
  overflow-y: auto;
}

.detail-meta {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #64748b;
  flex-wrap: wrap;
}

.detail-meta .meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-body {
  line-height: 1.8;
  color: #334155;
  font-size: 15px;
  padding: 0 8px;
  white-space: pre-wrap;
}

.detail-related {
  margin-top: 20px;
}

.related-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.related-data {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #64748b;
  overflow-x: auto;
  max-height: 200px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }

  .search-input,
  .toolbar-left .el-select {
    width: 100% !important;
    max-width: none;
  }

  .toolbar-right {
    justify-content: space-between;
  }

  .detail-meta {
    flex-direction: column;
    gap: 8px;
  }

  .statistics-bar {
    justify-content: flex-start;
  }
}
</style>
