<template>
  <div class="message-center">
    <div class="page-header">
      <div class="header-left">
        <h1>消息中心</h1>
        <el-badge v-if="totalUnread > 0" :value="totalUnread" class="total-badge" />
      </div>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="loadList">刷新</el-button>
        <el-button type="primary" @click="markAllAsRead" v-if="hasUnreadMessages">
          全部标记已读
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 系统消息标签页（所有角色可见） -->
      <el-tab-pane label="系统消息" name="system">
        <el-card class="list-card" shadow="never" v-loading="loading">
          <div class="table-toolbar">
            <el-radio-group v-model="systemReadFilter" @change="loadSystemMessages" size="small">
              <el-radio-button value="">全部</el-radio-button>
              <el-radio-button value="unread">未读</el-radio-button>
              <el-radio-button value="read">已读</el-radio-button>
            </el-radio-group>
          </div>
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

      <!-- 危机预警消息标签页（心理中心、院系领导、校领导、辅导员可见） -->
      <el-tab-pane
          v-if="['center', 'college', 'leader', 'tutor', 'instructor'].includes(currentRole)"
          label="危机预警"
          name="crisis"
      >
        <el-card class="list-card crisis-card" shadow="never" v-loading="loading">
          <!-- 危机统计卡片 -->
          <div class="crisis-stats">
            <el-statistic title="待处理" :value="crisisStats.pending" value-style="color: #f59e0b" />
            <el-statistic title="审核中" :value="crisisStats.reviewing" value-style="color: #3b82f6" />
            <el-statistic title="高风险" :value="crisisStats.highRisk" value-style="color: #ef4444" />
            <el-statistic title="总计" :value="crisisStats.total" />
          </div>

          <!-- 筛选工具栏 -->
          <div class="table-toolbar">
            <el-select v-model="crisisLevelFilter" placeholder="危机等级" clearable @change="loadCrisisMessages" size="small" style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="低风险" value="LOW" />
              <el-option label="中等风险" value="MODERATE" />
              <el-option label="高风险" value="HIGH" />
              <el-option label="严重风险" value="SEVERE" />
            </el-select>
            <el-select v-model="crisisStatusFilter" placeholder="处理状态" clearable @change="loadCrisisMessages" size="small" style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="待处理" value="PENDING" />
              <el-option label="审核中" value="REVIEWING" />
              <el-option label="已处理" value="PROCESSED" />
              <el-option label="已关闭" value="CLOSED" />
            </el-select>
            <el-input
              v-model="crisisKeyword"
              placeholder="搜索学生姓名或标题"
              clearable
              @input="debounceCrisisSearch"
              size="small"
              style="width: 200px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <el-table :data="crisisMessages" stripe style="width: 100%" :row-class-name="getCrisisRowClass">
            <el-table-column prop="title" label="预警标题" min-width="240" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="crisis-title-cell">
                  <el-icon v-if="isHighRisk(row.crisisLevel)" class="crisis-warning-icon"><WarningFilled /></el-icon>
                  <span>{{ row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="crisisLevel" label="危机等级" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="getCrisisLevelTag(row.crisisLevel)" size="small" effect="dark">
                  {{ getCrisisLevelText(row.crisisLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="studentName" label="学生姓名" width="120">
              <template #default="{ row }">
                <span class="student-name">{{ row.studentName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="collegeName" label="所属院系" width="140" show-overflow-tooltip />
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
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openCrisisDetail(row)">查看详情</el-button>
                <el-button
                  v-if="canProcessCrisis(row)"
                  type="success"
                  link
                  @click="processCrisis(row)"
                >
                  处理
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && crisisMessages.length === 0" description="暂无危机预警" />

          <!-- 分页 -->
          <div v-if="crisisTotal > 0" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="crisisPage"
              v-model:page-size="crisisPageSize"
              :total="crisisTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              @size-change="loadCrisisMessages"
              @current-change="loadCrisisMessages"
            />
          </div>
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

      <!-- 私信标签页（所有角色可见） -->
      <el-tab-pane label="私信" name="private">
        <PrivateMessageList ref="privateMessageRef" @update-unread="handlePrivateUnreadUpdate" />
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

    <!-- 危机详情对话框 -->
    <el-dialog
      v-model="crisisDetailVisible"
      :title="crisisDetail.title || '危机详情'"
      width="900px"
      destroy-on-close
    >
      <div class="crisis-detail-container">
        <!-- 基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">
            <span class="student-name-highlight">{{ crisisDetail.studentName }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="所属院系">{{ crisisDetail.collegeName }}</el-descriptions-item>
          <el-descriptions-item label="危机等级">
            <el-tag :type="getCrisisLevelTag(crisisDetail.crisisLevel)" effect="dark">
              {{ getCrisisLevelText(crisisDetail.crisisLevel) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getCrisisStatusTag(crisisDetail.status)">
              {{ getCrisisStatusText(crisisDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="上报时间">{{ formatTime(crisisDetail.reportTime, true) }}</el-descriptions-item>
          <el-descriptions-item label="上报人">{{ crisisDetail.reporterName || '未知' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 危机描述 -->
        <div class="detail-section">
          <h4>危机描述</h4>
          <div class="detail-content">{{ crisisDetail.description || crisisDetail.content || '暂无描述' }}</div>
        </div>

        <!-- 处理建议 -->
        <div v-if="crisisDetail.suggestions" class="detail-section">
          <h4>处理建议</h4>
          <div class="suggestion-content">{{ crisisDetail.suggestions }}</div>
        </div>

        <!-- 处理记录 -->
        <div v-if="crisisDetail.processRecords && crisisDetail.processRecords.length > 0" class="detail-section">
          <h4>处理记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in crisisDetail.processRecords"
              :key="index"
              :timestamp="formatTime(record.time, true)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="timeline-operator">{{ record.operator }}</div>
                <div class="timeline-action">{{ record.action }}</div>
                <div v-if="record.remark" class="timeline-remark">{{ record.remark }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <template #footer>
        <el-button @click="crisisDetailVisible = false">关闭</el-button>
        <el-button
          v-if="canProcessCrisis(crisisDetail) && crisisDetail.status !== 'PROCESSED'"
          type="primary"
          @click="processCrisisFromDialog"
        >
          立即处理
        </el-button>
      </template>
    </el-dialog>

    <!-- 危机处理对话框 -->
    <el-dialog v-model="processDialogVisible" title="处理危机预警" width="600px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理结果">
          <el-radio-group v-model="processForm.result">
            <el-radio value="PROCESSED">已处理</el-radio>
            <el-radio value="TRANSFERRED">已转介</el-radio>
            <el-radio value="CLOSED">已关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input
            v-model="processForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入处理说明..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProcess">提交</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search, WarningFilled } from '@element-plus/icons-vue'
import request from '@/request'
import { useMessageStore } from '@/stores/messageStore'
import PrivateMessageList from './components/PrivateMessageList.vue'

const router = useRouter()
const messageStore = useMessageStore()

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
const totalUnread = computed(() => messageStore.totalUnread)
const hasUnreadMessages = computed(() => messageStore.totalUnread > 0)

// 系统消息相关
const systemMessages = ref([])
const systemReadFilter = ref('')

// 教师留言相关
const teacherMessages = ref([])

// 危机预警相关
const crisisMessages = ref([])
const crisisTotal = ref(0)
const crisisPage = ref(1)
const crisisPageSize = ref(20)
const crisisLevelFilter = ref('')
const crisisStatusFilter = ref('')
const crisisKeyword = ref('')
const crisisStats = ref({
  pending: 0,
  reviewing: 0,
  highRisk: 0,
  total: 0
})
let crisisSearchTimer = null

// 预约通知相关
const appointmentMessages = ref([])

// 详情对话框相关
const systemDetailVisible = ref(false)
const systemDetail = ref({})

const teacherDetailVisible = ref(false)
const teacherDetail = ref({})

const crisisDetailVisible = ref(false)
const crisisDetail = ref({})

const processDialogVisible = ref(false)
const processForm = ref({
  crisisId: '',
  result: 'PROCESSED',
  remark: ''
})

const replyDialogVisible = ref(false)
const replyForm = ref({
  messageId: '',
  content: ''
})

const privateMessageRef = ref(null)

async function loadList() {
  loading.value = true
  try {
    // 首先获取全局未读数
    await messageStore.fetchUnreadCount(true)

    if (activeTab.value === 'system') {
      await loadSystemMessages()
    } else if (activeTab.value === 'teacher') {
      await loadTeacherMessages()
    } else if (activeTab.value === 'crisis') {
      await loadCrisisMessages()
    } else if (activeTab.value === 'appointment') {
      await loadAppointmentMessages()
    } else if (activeTab.value === 'private') {
      // 私信列表由组件自己加载
      if (privateMessageRef.value) {
        privateMessageRef.value.loadConversations()
      }
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
    const params = {
      userId: currentUserId.value,
      page: 1,
      pageSize: 100
    }

    if (systemReadFilter.value === 'read') {
      params.isRead = true
    } else if (systemReadFilter.value === 'unread') {
      params.isRead = false
    }

    const res = await request.get('/api/message/system-message/list', { params })

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
  } catch (e) {
    console.error('加载系统消息失败:', e)
    ElMessage.error('加载系统消息失败')
    systemMessages.value = []
  }
}

// 快速切换系统消息的已读状态（用于批量操作）
function toggleSystemMessageRead(messageId, isRead) {
  const index = systemMessages.value.findIndex(
    msg => (msg.messageId || msg.id) === messageId
  )

  if (index > -1) {
    // 创建新对象触发响应式更新
    const updatedMessage = { ...systemMessages.value[index], isRead }
    systemMessages.value.splice(index, 1, updatedMessage)

    // 如果当前在筛选模式下，可能需要从列表中移除
    if (systemReadFilter.value === 'unread' && isRead) {
      setTimeout(() => {
        const currentIndex = systemMessages.value.findIndex(
          msg => (msg.messageId || msg.id) === messageId
        )
        if (currentIndex > -1) {
          systemMessages.value.splice(currentIndex, 1)
        }
      }, 300)
    } else if (systemReadFilter.value === 'read' && !isRead) {
      setTimeout(() => {
        const currentIndex = systemMessages.value.findIndex(
          msg => (msg.messageId || msg.id) === messageId
        )
        if (currentIndex > -1) {
          systemMessages.value.splice(currentIndex, 1)
        }
      }, 300)
    }
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
      page: crisisPage.value,
      pageSize: crisisPageSize.value
    }

    // 如果是院系领导或辅导员，添加院系ID筛选
    if ((currentRole.value === 'college' || currentRole.value === 'tutor' || currentRole.value === 'instructor') && currentCollegeId.value) {
      params.collegeId = currentCollegeId.value
    }

    // 添加筛选条件
    if (crisisLevelFilter.value) {
      params.crisisLevel = crisisLevelFilter.value
    }
    if (crisisStatusFilter.value) {
      params.status = crisisStatusFilter.value
    }
    if (crisisKeyword.value) {
      params.keyword = crisisKeyword.value
    }

    const res = await request.get('/api/crisis-report/list', { params })

    const data = res.data || {}
    crisisMessages.value = data.records || data.list || []
    crisisTotal.value = data.total || 0

    // 计算统计数据
    calculateCrisisStats()
  } catch (e) {
    console.error('加载危机预警失败:', e)
    ElMessage.error('加载危机预警失败')
    crisisMessages.value = []
  }
}

function calculateCrisisStats() {
  const allCrisis = crisisMessages.value
  crisisStats.value = {
    pending: allCrisis.filter(c => c.status === 'PENDING').length,
    reviewing: allCrisis.filter(c => c.status === 'REVIEWING').length,
    highRisk: allCrisis.filter(c => c.crisisLevel === 'HIGH' || c.crisisLevel === 'SEVERE').length,
    total: allCrisis.length
  }
}

function debounceCrisisSearch() {
  clearTimeout(crisisSearchTimer)
  crisisSearchTimer = setTimeout(() => {
    crisisPage.value = 1
    loadCrisisMessages()
  }, 300)
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
    const messageId = message.messageId || message.id
    await request.post('/api/message/system-message/mark-read', {
      messageIds: [messageId]
    })

    // 使用 Vue 的响应式更新方式
    const index = systemMessages.value.findIndex(
      msg => (msg.messageId || msg.id) === messageId
    )

    if (index > -1) {
      // 创建新对象触发响应式更新
      const updatedMessage = { ...systemMessages.value[index], isRead: true }
      systemMessages.value.splice(index, 1, updatedMessage)

      // 更新未读数
      messageStore.decreaseSystemMessageUnread(1)

      // 如果当前在"未读"筛选模式下，从列表中移除该消息
      if (systemReadFilter.value === 'unread') {
        setTimeout(() => {
          const currentIndex = systemMessages.value.findIndex(
            msg => (msg.messageId || msg.id) === messageId
          )
          if (currentIndex > -1) {
            systemMessages.value.splice(currentIndex, 1)
          }
        }, 300)
      }
    }

    ElMessage.success('已标记为已读')
  } catch (e) {
    console.error('标记已读失败:', e)
    ElMessage.error('标记已读失败')
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
    await messageStore.fetchUnreadCount(true)
    ElMessage.success('已全部标记为已读')
    loadList()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('批量标记已读失败:', e)
      ElMessage.error('操作失败')
    }
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

    // 立即更新本地留言列表中的状态
    const message = teacherMessages.value.find(
      msg => (msg.messageId || msg.id) === replyForm.value.messageId
    )
    if (message) {
      message.replied = true
      message.replyContent = replyForm.value.content
    }
  } catch (e) {
    console.error('回复失败:', e)
    ElMessage.error('回复失败')
  }
}


// 处理私信未读数更新
function handlePrivateUnreadUpdate(count) {
  messageStore.setPrivateMessageUnread(count)
}

function getMessageTypeTag(type) {
  const map = {
    SYSTEM: 'primary',
    APPOINTMENT: 'primary',
    REMINDER: 'warning',
    NOTIFICATION: 'success',
    ALERT: 'danger',
    CRISIS: 'danger',
    ASSESSMENT: 'info',
    ACTIVITY: 'success'
  }
  return map[type] || 'info'
}

function getMessageTypeText(type) {
  const map = {
    SYSTEM: '系统',
    APPOINTMENT: '预约',
    REMINDER: '提醒',
    NOTIFICATION: '通知',
    ALERT: '警报',
    CRISIS: '危机',
    ASSESSMENT: '测评',
    ACTIVITY: '活动'
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
    // 数字格式
    1: 'info',
    2: 'warning',
    3: 'danger',
    4: 'danger',
    // 字符串格式
    'LOW': 'info',
    'MODERATE': 'warning',
    'HIGH': 'danger',
    'SEVERE': 'danger'
  }
  return map[level] || 'info'
}

function getCrisisLevelText(level) {
  const map = {
    // 数字格式
    1: '一般',
    2: '较重',
    3: '严重',
    4: '特别严重',
    // 字符串格式
    'LOW': '低风险',
    'MODERATE': '中等风险',
    'HIGH': '高风险',
    'SEVERE': '严重风险'
  }
  return map[level] || level
}

function getCrisisStatusTag(status) {
  const map = {
    PENDING: 'warning',
    REVIEWING: 'primary',
    PROCESSED: 'success',
    CLOSED: 'info'
  }
  return map[status] || 'info'
}

function getCrisisStatusText(status) {
  const map = {
    PENDING: '待处理',
    REVIEWING: '审核中',
    PROCESSED: '已处理',
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
    COMPLETED: 'primary',
    NO_SHOW: 'danger'
  }
  return map[status] || 'info'
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

function isHighRisk(level) {
  return level === 'HIGH' || level === 'SEVERE' || level === 3 || level === 4
}

function getCrisisRowClass({ row }) {
  if (isHighRisk(row.crisisLevel) && row.status !== 'PROCESSED' && row.status !== 'CLOSED') {
    return 'high-risk-row'
  }
  return ''
}

function canProcessCrisis(crisis) {
  // 辅导员可以处理本院系的待处理和审核中的危机
  if (['tutor', 'instructor'].includes(currentRole.value)) {
    return crisis.status === 'PENDING' || crisis.status === 'REVIEWING'
  }
  // 心理中心可以处理所有危机
  if (currentRole.value === 'center') {
    return crisis.status === 'PENDING' || crisis.status === 'REVIEWING'
  }
  // 院系领导可以处理本院系的危机
  if (currentRole.value === 'college') {
    return crisis.status === 'PENDING' || crisis.status === 'REVIEWING'
  }
  return false
}

function processCrisis(crisis) {
  processForm.value = {
    crisisId: crisis.id,
    result: 'PROCESSED',
    remark: ''
  }
  processDialogVisible.value = true
}

function processCrisisFromDialog() {
  crisisDetailVisible.value = false
  processCrisis(crisisDetail.value)
}

async function submitProcess() {
  if (!processForm.value.remark.trim()) {
    ElMessage.warning('请输入处理说明')
    return
  }

  try {
    await request.post('/api/crisis-report/process', {
      crisisId: processForm.value.crisisId,
      result: processForm.value.result,
      remark: processForm.value.remark,
      processorId: currentUserId.value
    })

    ElMessage.success('处理成功')
    processDialogVisible.value = false

    // 立即更新本地危机列表中的状态
    const crisis = crisisMessages.value.find(c => c.id === processForm.value.crisisId)
    if (crisis) {
      crisis.status = processForm.value.result
      // 如果处理结果是已关闭，可能需要从列表中移除或刷新
      if (crisisStatusFilter.value && crisisStatusFilter.value !== processForm.value.result) {
        // 如果当前有状态筛选且与新的状态不匹配，从列表中移除
        const index = crisisMessages.value.findIndex(c => c.id === processForm.value.crisisId)
        if (index > -1) {
          crisisMessages.value.splice(index, 1)
          crisisTotal.value = Math.max(0, crisisTotal.value - 1)
        }
      }
    }

    // 重新计算统计数据
    calculateCrisisStats()
  } catch (e) {
    console.error('处理失败:', e)
    ElMessage.error('处理失败')
  }
}


function openCrisisDetail(crisis) {
  crisisDetail.value = { ...crisis }
  crisisDetailVisible.value = true
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

.header-actions {
  display: flex;
  gap: 12px;
}

.list-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.crisis-card {
  background: linear-gradient(to bottom, #fef2f2 0%, #ffffff 100px);
}

.table-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

/* 危机统计卡片 */
.crisis-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #fee2e2;
}

/* 危机标题单元格 */
.crisis-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crisis-warning-icon {
  color: #ef4444;
  font-size: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 高风险行样式 */
:deep(.high-risk-row) {
  background-color: #fef2f2 !important;
}

:deep(.high-risk-row:hover) {
  background-color: #fee2e2 !important;
}

.student-name {
  font-weight: 500;
  color: #1e293b;
}

.student-name-highlight {
  font-weight: 600;
  color: #dc2626;
  font-size: 15px;
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

.suggestion-content {
  line-height: 1.8;
  color: #059669;
  white-space: pre-wrap;
  background: #ecfdf5;
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #10b981;
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

/* 危机详情样式 */
.crisis-detail-container {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.timeline-content {
  padding: 4px 0;
}

.timeline-operator {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.timeline-action {
  color: #475569;
  margin-bottom: 4px;
}

.timeline-remark {
  color: #64748b;
  font-size: 13px;
  background: #f8fafc;
  padding: 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .crisis-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-toolbar {
    flex-direction: column;
  }

  .table-toolbar > * {
    width: 100% !important;
  }
}
</style>
