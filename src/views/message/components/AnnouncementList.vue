<template>
  <div class="announcement-list">
    <!-- 搜索和筛选工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="query.keyword"
          placeholder="搜索公告标题..."
          clearable
          class="search-input"
          @input="debounceSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="query.type" placeholder="公告类型" clearable @change="loadList">
          <el-option label="系统公告" :value="1" />
          <el-option label="活动通知" :value="2" />
          <el-option label="紧急通知" :value="3" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-radio-group v-model="readFilter" @change="handleReadFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="unread">未读</el-radio-button>
          <el-radio-button label="read">已读</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="markAllAsRead" v-if="unreadCount > 0">
          全部已读
        </el-button>
      </div>
    </div>

    <!-- 公告列表 -->
    <el-card v-loading="loading" class="list-card" shadow="never">
      <div v-if="announcementList.length > 0" class="announcement-items">
        <div
          v-for="item in announcementList"
          :key="item.id"
          class="announcement-item"
          :class="{ unread: !item.hasRead }"
          @click="openDetail(item)"
        >
          <div class="item-left">
            <div class="item-icon" :class="`type-${item.type}`">
              <el-icon>
                <Bell v-if="item.type === 1" />
                <Calendar v-else-if="item.type === 2" />
                <Warning v-else />
              </el-icon>
            </div>
            <div class="item-content">
              <div class="item-header">
                <span class="item-title">{{ item.title }}</span>
                <el-tag
                  v-if="item.priority === 2"
                  type="danger"
                  size="small"
                  effect="dark"
                >紧急</el-tag>
                <el-tag
                  v-else-if="item.priority === 1"
                  type="warning"
                  size="small"
                >重要</el-tag>
                <el-tag
                  v-if="!item.hasRead"
                  type="success"
                  size="small"
                >未读</el-tag>
              </div>
              <div class="item-summary">{{ item.summary || item.content?.substring(0, 100) }}</div>
              <div class="item-meta">
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ item.publisherName || '系统管理员' }}
                </span>
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatTime(item.publishTime) }}
                </span>
                <span class="meta-item" v-if="item.readCount">
                  <el-icon><View /></el-icon>
                  {{ item.readCount }}人阅读
                </span>
              </div>
            </div>
          </div>
          <div class="item-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无公告通知" />

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

    <!-- 公告详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="currentAnnouncement.title || '公告详情'"
      width="800px"
      destroy-on-close
    >
      <div class="detail-content">
        <div class="detail-meta">
          <span class="meta-item">
            <el-icon><User /></el-icon>
            发布人：{{ currentAnnouncement.publisherName || '系统管理员' }}
          </span>
          <span class="meta-item">
            <el-icon><Clock /></el-icon>
            发布时间：{{ formatTime(currentAnnouncement.publishTime, true) }}
          </span>
          <span class="meta-item" v-if="currentAnnouncement.readCount">
            <el-icon><View /></el-icon>
            阅读量：{{ currentAnnouncement.readCount }}
          </span>
        </div>
        <div class="detail-body" v-html="formattedContent"></div>
        <div v-if="currentAnnouncement.attachmentUrl" class="detail-attachment">
          <el-divider />
          <div class="attachment-title">
            <el-icon><Paperclip /></el-icon>
            附件
          </div>
          <el-link :href="currentAnnouncement.attachmentUrl" target="_blank" type="primary">
            下载附件
          </el-link>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="!currentAnnouncement.hasRead"
          type="primary"
          @click="markAsRead(currentAnnouncement)"
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
import { Search, Bell, Calendar, Warning, ArrowRight, User, Clock, View, Paperclip } from '@element-plus/icons-vue'
import request from '@/request'

const emit = defineEmits(['update-unread'])

const loading = ref(false)
const announcementList = ref([])
const total = ref(0)
const unreadCount = ref(0)
const readFilter = ref('')

const query = ref({
  page: 1,
  pageSize: 10,
  keyword: '',
  type: null
})

const detailVisible = ref(false)
const currentAnnouncement = ref({})

const formattedContent = computed(() => {
  if (!currentAnnouncement.value.content) return ''
  // 简单处理换行
  return currentAnnouncement.value.content.replace(/\n/g, '<br>')
})

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

async function loadList() {
  loading.value = true
  try {
    const params = {
      page: query.value.page,
      pageSize: query.value.pageSize,
      keyword: query.value.keyword,
      type: query.value.type
    }
    // 根据筛选条件添加已读参数
    if (readFilter.value === 'read') {
      params.isRead = true
    } else if (readFilter.value === 'unread') {
      params.isRead = false
    }

    const res = await request.get('/api/message/announcement/list', { params })
    if (res.code === 200 && res.data) {
      announcementList.value = res.data.records || []
      total.value = res.data.total || 0
      // 更新未读数
      const unread = announcementList.value.filter(item => !item.hasRead).length
      emit('update-unread', unread)
    }
  } catch (e) {
    console.error('加载公告列表失败:', e)
    ElMessage.error('加载公告列表失败')
  } finally {
    loading.value = false
  }
}

async function openDetail(item) {
  currentAnnouncement.value = { ...item }
  detailVisible.value = true
  // 自动标记已读
  if (!item.hasRead) {
    await markAsRead(item, false)
  }
}

async function markAsRead(item, showMessage = true) {
  try {
    await request.post(`/api/message/announcement/read/${item.id}`)
    item.hasRead = true
    if (showMessage) {
      ElMessage.success('已标记为已读')
    }
    emit('update-unread', Math.max(0, unreadCount.value - 1))
  } catch (e) {
    console.error('标记已读失败:', e)
    if (showMessage) {
      ElMessage.error('标记已读失败')
    }
  }
}

async function markAllAsRead() {
  try {
    await ElMessageBox.confirm('确定将所有公告标记为已读吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // 获取所有未读公告ID
    const unreadIds = announcementList.value.filter(item => !item.hasRead).map(item => item.id)
    // 逐个标记已读（后端没有批量接口）
    for (const id of unreadIds) {
      await request.post(`/api/message/announcement/read/${id}`)
    }
    announcementList.value.forEach(item => item.hasRead = true)
    emit('update-unread', 0)
    ElMessage.success('已全部标记为已读')
  } catch (e) {
    if (e !== 'cancel') {
      console.error('批量标记已读失败:', e)
      ElMessage.error('操作失败')
    }
  }
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
.announcement-list {
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

.toolbar-left .el-select {
  width: 140px;
}

.search-input {
  max-width: 300px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.list-card {
  border-radius: 8px;
}

.announcement-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 4px solid transparent;
}

.announcement-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.announcement-item.unread {
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

.item-icon.type-1 {
  background: #dbeafe;
  color: #2563eb;
}

.item-icon.type-2 {
  background: #fef3c7;
  color: #f59e0b;
}

.item-icon.type-3 {
  background: #fee2e2;
  color: #dc2626;
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

.announcement-item:hover .item-arrow {
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
  gap: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #64748b;
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
}

.detail-attachment {
  margin-top: 20px;
}

.attachment-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }

  .toolbar-left .el-select,
  .search-input {
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
}
</style>