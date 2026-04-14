<template>
  <div class="message-center">
    <div class="page-header">
      <div class="header-left">
        <h1>消息中心</h1>
        <el-badge v-if="unreadCount > 0" :value="unreadCount" class="total-badge" />
      </div>
      <el-button :icon="Refresh" @click="loadList">刷新</el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 系统消息标签页（所有角色可见） -->
      <el-tab-pane label="系统消息" name="system">
        <el-card class="list-card" shadow="never" v-loading="loading">
          <el-table :data="systemMessages" stripe style="width: 100%">
            <el-table-column prop="title" label="消息标题" min-width="260" show-overflow-tooltip />
            <el-table-column prop="messageType" label="消息类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getMessageTypeTag(row.messageType)" size="small">
                  {{ getMessageTypeText(row.messageType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="发送时间" width="180">
              <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
            </el-table-column>
            <el-table-column prop="isRead" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isRead ? 'info' : 'success'" size="small">
                  {{ row.isRead ? '已读' : '未读' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openDetail(row, 'system')">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && systemMessages.length === 0" description="暂无系统消息" />
        </el-card>
      </el-tab-pane>

      <!-- 家长/学生留言标签页（仅辅导员可见） -->
      <el-tab-pane
          v-if="['tutor', 'instructor'].includes(currentRole)"
          label="家长/学生留言"
          name="teacher"
      >
        <el-card class="list-card" shadow="never" v-loading="loading">
          <el-table :data="teacherMessages" stripe style="width: 100%">
            <el-table-column prop="subject" label="主题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="fromRole" label="发送方" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ getFromRoleText(row.fromRole) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="senderName" label="发送人" width="120" />
            <el-table-column prop="studentName" label="关联学生" width="120" />
            <el-table-column prop="createTime" label="发送时间" width="180">
              <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
            </el-table-column>
            <el-table-column prop="isRead" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isRead ? 'info' : 'warning'" size="small">
                  {{ row.isRead ? '已读' : '未读' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openDetail(row, 'teacher')">查看</el-button>
                <el-button
                    v-if="!row.replied"
                    type="success"
                    link
                    @click="handleReply(row)"
                >
                  回复
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && teacherMessages.length === 0" description="暂无留言" />
        </el-card>
      </el-tab-pane>

      <!-- 危机预警消息标签页（心理中心、院系领导、校领导可见） -->
      <el-tab-pane
          v-if="['center', 'college', 'leader'].includes(currentRole)"
          label="危机预警"
          name="crisis"
      >
        <el-card class="list-card" shadow="never" v-loading="loading">
          <el-table :data="crisisMessages" stripe style="width: 100%">
            <el-table-column prop="title" label="预警标题" min-width="240" show-overflow-tooltip />
            <el-table-column prop="crisisLevel" label="危机等级" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getCrisisLevelTag(row.crisisLevel)" size="small">
                  {{ getCrisisLevelText(row.crisisLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="studentName" label="学生姓名" width="120" />
            <el-table-column prop="collegeName" label="所属院系" width="140" />
            <el-table-column prop="reportTime" label="上报时间" width="180">
              <template #default="{ row }">{{ formatTime(row.reportTime) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="处理状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getCrisisStatusTag(row.status)" size="small">
                  {{ getCrisisStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openCrisisDetail(row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && crisisMessages.length === 0" description="暂无危机预警" />
        </el-card>
      </el-tab-pane>

      <!-- 预约通知标签页（咨询师、心理中心可见） -->
      <el-tab-pane
          v-if="['counselor', 'center'].includes(currentRole)"
          label="预约通知"
          name="appointment"
      >
        <el-card class="list-card" shadow="never" v-loading="loading">
          <el-table :data="appointmentMessages" stripe style="width: 100%">
            <el-table-column prop="studentName" label="学生姓名" width="120" />
            <el-table-column prop="appointmentTime" label="预约时间" width="180">
              <template #default="{ row }">{{ formatTime(row.appointmentTime) }}</template>
            </el-table-column>
            <el-table-column prop="type" label="预约类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ getAppointmentTypeText(row.type) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getAppointmentStatusTag(row.status)" size="small">
                  {{ getAppointmentStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="通知时间" width="180">
              <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openAppointmentDetail(row)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && appointmentMessages.length === 0" description="暂无预约通知" />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 系统消息详情对话框 -->
    <el-dialog
      v-model="systemDetailVisible"
      :title="systemDetail.title || '消息详情'"
      width="720px"
    >
      <div class="detail-meta">
        <span>发送时间：{{ formatTime(systemDetail.createTime, true) || '—' }}</span>
        <el-tag :type="getMessageTypeTag(systemDetail.messageType)" size="small" style="margin-left: 12px">
          {{ getMessageTypeText(systemDetail.messageType) }}
        </el-tag>
      </div>
      <div class="detail-content">{{ systemDetail.content || '暂无内容' }}</div>
      <template #footer>
        <el-button @click="systemDetailVisible = false">关闭</el-button>
        <el-button v-if="!systemDetail.isRead" type="primary" @click="markAsRead(systemDetail)">标记为已读</el-button>
      </template>
    </el-dialog>

    <!-- 留言详情对话框 -->
    <el-dialog
      v-model="teacherDetailVisible"
      :title="teacherDetail.subject || '留言详情'"
      width="720px"
    >
      <div class="detail-meta">
        <span>发送人：{{ teacherDetail.senderName || '未知' }}</span>
        <span style="margin-left: 16px">发送时间：{{ formatTime(teacherDetail.createTime, true) || '—' }}</span>
      </div>
      <div class="detail-content">{{ teacherDetail.content || '暂无内容' }}</div>

      <div v-if="teacherDetail.replyContent" class="reply-section">
        <div class="reply-header">我的回复：</div>
        <div class="reply-content">{{ teacherDetail.replyContent }}</div>
      </div>

      <template #footer>
        <el-button @click="teacherDetailVisible = false">关闭</el-button>
        <el-button v-if="!teacherDetail.replied" type="primary" @click="handleReply(teacherDetail)">回复</el-button>
      </template>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog v-model="replyDialogVisible" title="回复留言" width="600px">
      <el-form :model="replyForm" label-width="80px">
        <el-form-item label="回复内容">
          <el-input
            v-model="replyForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">发送回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import request from '@/request'

const router = useRouter()

// 获取当前用户角色
const currentRole = computed(() => {
  return localStorage.getItem('admin_role') || localStorage.getItem('user_role') || ''
})

// 获取当前用户ID
const currentUserId = computed(() => {
  return localStorage.getItem('user_id') || localStorage.getItem('userId') || ''
})

// 获取当前用户的院系ID（用于院系领导筛选）
const currentCollegeId = computed(() => {
  return localStorage.getItem('college_id') || ''
})

const loading = ref(false)
const activeTab = ref('system')
const unreadCount = ref(0)

const systemMessages = ref([])
const teacherMessages = ref([])
const crisisMessages = ref([])
const appointmentMessages = ref([])

const systemDetailVisible = ref(false)
const systemDetail = ref({})

const teacherDetailVisible = ref(false)
const teacherDetail = ref({})

const replyDialogVisible = ref(false)
const replyForm = ref({
  messageId: '',
  content: ''
})

async function loadList() {
  loading.value = true
  try {
    if (activeTab.value === 'system') {
      await loadSystemMessages()
    } else if (activeTab.value === 'teacher') {
      await loadTeacherMessages()
    } else if (activeTab.value === 'crisis') {
      await loadCrisisMessages()
    } else if (activeTab.value === 'appointment') {
      await loadAppointmentMessages()
    }
  } catch (e) {
    console.error('加载消息列表失败:', e)
    ElMessage.error('加载消息列表失败')
  } finally {
    loading.value = false
  }
}

async function loadSystemMessages() {
  try {
    const res = await request.get('/api/message/system-message/list', {
      params: {
        userId: currentUserId.value,
        page: 1,
        pageSize: 100
      }
    })

    // 后端返回格式: { code: 200, data: { list: [], total: 0, pageNum: 1, pageSize: 10 } }
    const data = res.data || {}
    const messages = data.list || data.records || []

    // 转换数据格式以匹配前端期望的结构
    systemMessages.value = messages.map(msg => ({
      id: msg.id || msg.messageId,
      messageId: msg.id || msg.messageId,
      title: msg.title,
      content: msg.content,
      messageType: msg.type,
      isRead: msg.read !== undefined ? msg.read : (msg.isRead !== undefined ? msg.isRead : false),
      createTime: msg.createTime,
      link: msg.link
    }))

    updateUnreadCount()
  } catch (e) {
    console.error('加载系统消息失败:', e)
    ElMessage.error('加载系统消息失败')
    systemMessages.value = []
  }
}

async function loadTeacherMessages() {
  try {
    const res = await request.get('/api/message/teacher/list', {
      params: {
        receiverId: currentUserId.value,
        page: 1,
        pageSize: 100
      }
    })

    const data = res.data || {}
    teacherMessages.value = data.records || data.list || []
    updateUnreadCount()
  } catch (e) {
    console.error('加载教师留言失败:', e)
    ElMessage.error('加载教师留言失败')
    teacherMessages.value = []
  }
}

async function loadCrisisMessages() {
  try {
    const params = {
      role: currentRole.value,
      page: 1,
      pageSize: 100
    }

    // 如果是院系领导，添加院系ID筛选
    if (currentRole.value === 'college' && currentCollegeId.value) {
      params.collegeId = currentCollegeId.value
    }

    const res = await request.get('/api/crisis-report/list', {
      params
    })

    const data = res.data || {}
    crisisMessages.value = data.records || data.list || []
    updateUnreadCount()
  } catch (e) {
    console.error('加载危机预警失败:', e)
    ElMessage.error('加载危机预警失败')
    crisisMessages.value = []
  }
}

async function loadAppointmentMessages() {
  try {
    const res = await request.get('/api/appointment/notifications', {
      params: {
        counselorId: currentUserId.value,
        page: 1,
        pageSize: 100
      }
    })

    const data = res.data || {}
    appointmentMessages.value = data.records || data.list || []
    updateUnreadCount()
  } catch (e) {
    console.error('加载预约通知失败:', e)
    ElMessage.error('加载预约通知失败')
    appointmentMessages.value = []
  }
}

function handleTabChange(tab) {
  loadList()
}

function openDetail(row, type) {
  if (type === 'system') {
    systemDetail.value = { ...row }
    systemDetailVisible.value = true
  } else {
    teacherDetail.value = { ...row }
    teacherDetailVisible.value = true
  }
}

async function markAsRead(message) {
  try {
    await request.post('/api/message/system-message/mark-read', {
      messageIds: [message.messageId || message.id]
    })

    message.isRead = true
    ElMessage.success('已标记为已读')
    updateUnreadCount()
  } catch (e) {
    console.error('标记已读失败:', e)
    ElMessage.error('标记已读失败')
  }
}

function handleReply(message) {
  replyForm.value = {
    messageId: message.messageId || message.id,
    content: ''
  }
  teacherDetailVisible.value = false
  replyDialogVisible.value = true
}

async function submitReply() {
  if (!replyForm.value.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  try {
    await request.post('/api/message/teacher/reply', {
      messageId: replyForm.value.messageId,
      content: replyForm.value.content,
      replierId: currentUserId.value
    })

    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    loadTeacherMessages()
  } catch (e) {
    console.error('回复失败:', e)
    ElMessage.error('回复失败')
  }
}

function updateUnreadCount() {
  const systemUnread = systemMessages.value.filter(m => !m.isRead).length
  const teacherUnread = teacherMessages.value.filter(m => !m.isRead).length
  const crisisUnread = crisisMessages.value.filter(m => m.status === 'PENDING').length
  const appointmentUnread = appointmentMessages.value.filter(m => m.status === 'PENDING').length
  unreadCount.value = systemUnread + teacherUnread + crisisUnread + appointmentUnread
}

function getMessageTypeTag(type) {
  const map = {
    APPOINTMENT: 'primary',
    REMINDER: 'warning',
    NOTIFICATION: 'success',
    ALERT: 'danger'
  }
  return map[type] || ''
}

function getMessageTypeText(type) {
  const map = {
    APPOINTMENT: '预约',
    REMINDER: '提醒',
    NOTIFICATION: '通知',
    ALERT: '警报'
  }
  return map[type] || type
}

function getFromRoleText(role) {
  const map = {
    parent: '家长',
    student: '学生',
    leader: '领导'
  }
  return map[role] || role
}

function getCrisisLevelTag(level) {
  const map = {
    1: 'info',
    2: 'warning',
    3: 'danger',
    4: 'danger'
  }
  return map[level] || ''
}

function getCrisisLevelText(level) {
  const map = {
    1: '一般',
    2: '较重',
    3: '严重',
    4: '特别严重'
  }
  return map[level] || level
}

function getCrisisStatusTag(status) {
  const map = {
    PENDING: 'warning',
    PROCESSING: 'primary',
    RESOLVED: 'success',
    CLOSED: 'info'
  }
  return map[status] || ''
}

function getCrisisStatusText(status) {
  const map = {
    PENDING: '待处理',
    PROCESSING: '处理中',
    RESOLVED: '已解决',
    CLOSED: '已关闭'
  }
  return map[status] || status
}

function getAppointmentTypeText(type) {
  const map = {
    INDIVIDUAL: '个体咨询',
    GROUP: '团体咨询',
    CRISIS: '危机干预'
  }
  return map[type] || type
}

function getAppointmentStatusTag(status) {
  const map = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'info',
    COMPLETED: 'primary'
  }
  return map[status] || ''
}

function getAppointmentStatusText(status) {
  const map = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    CANCELLED: '已取消',
    COMPLETED: '已完成'
  }
  return map[status] || status
}

function openCrisisDetail(crisis) {
  // 跳转到危机详情页面
  router.push(`/crisis/${crisis.id}`)
}

function openAppointmentDetail(appointment) {
  // 跳转到预约详情页面
  router.push(`/appointment/${appointment.id}/detail`)
}

function formatTime(time, full = false) {
  if (!time) return ''
  const d = new Date(time)
  if (isNaN(d.getTime())) return String(time)
  if (full) return d.toLocaleString('zh-CN')
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.message-center {
  padding: 20px;
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
  font-size: 22px;
  color: #1f2937;
}

.list-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.detail-meta {
  margin-bottom: 16px;
  color: #64748b;
  font-size: 14px;
}

.detail-content {
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
  min-height: 100px;
}

.reply-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.reply-header {
  font-weight: 600;
  color: #1e4f9c;
  margin-bottom: 8px;
}

.reply-content {
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
}
</style>
