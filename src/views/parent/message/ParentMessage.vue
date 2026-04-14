<template>
  <div class="parent-message">
    <h2>家长留言箱</h2>
    
    <!-- 留言表单 -->
    <div class="message-form">
      <h3>发送留言</h3>
      <form @submit.prevent="sendMessage">
        <div class="form-group">
          <label>收件人：</label>
          <select v-model="message.recipient" required>
            <option value="">请选择收件人</option>
            <option value="counselor">辅导员</option>
            <option value="mental-health">心理健康中心</option>
            <option value="school">学校相关部门</option>
          </select>
        </div>
        <div class="form-group">
          <label>主题：</label>
          <input v-model="message.subject" placeholder="请输入留言主题" required />
        </div>
        <div class="form-group">
          <label>内容：</label>
          <textarea v-model="message.content" placeholder="请输入留言内容" rows="5" required></textarea>
        </div>
        <div class="form-group">
          <label>紧急程度：</label>
          <select v-model="message.urgency" required>
            <option value="">请选择紧急程度</option>
            <option value="low">一般</option>
            <option value="medium">中等</option>
            <option value="high">紧急</option>
          </select>
        </div>
        <button type="submit" class="send-btn">发送留言</button>
      </form>
    </div>

    <!-- 留言记录 -->
    <div class="message-records">
      <h3>留言记录</h3>
      <div class="filter-section">
        <div class="filter-item">
          <label>状态：</label>
          <select v-model="statusFilter">
            <option value="all">全部</option>
            <option value="unread">未读</option>
            <option value="read">已读</option>
            <option value="replied">已回复</option>
          </select>
        </div>
        <div class="filter-item">
          <label>收件人：</label>
          <select v-model="recipientFilter">
            <option value="all">全部</option>
            <option value="counselor">辅导员</option>
            <option value="mental-health">心理健康中心</option>
            <option value="school">学校相关部门</option>
          </select>
        </div>
      </div>
      <div v-if="filteredMessages.length === 0" class="empty-state">
        <p>暂无留言记录</p>
      </div>
      <div v-else class="messages-list">
        <div v-for="msg in filteredMessages" :key="msg.id" class="message-item" :class="{ unread: msg.status === 'unread' }">
          <div class="message-header">
            <div class="message-info">
              <h4>{{ msg.subject }}</h4>
              <span class="recipient">{{ getRecipientText(msg.recipient) }}</span>
            </div>
            <div class="message-meta">
              <span :class="['urgency', msg.urgency]">{{ getUrgencyText(msg.urgency) }}</span>
              <span class="send-time">{{ msg.sendTime }}</span>
            </div>
          </div>
          <div class="message-body">
            <p class="content">{{ msg.content }}</p>
            <div class="message-status">
              <span class="status" :class="msg.status">{{ getStatusText(msg.status) }}</span>
              <button class="view-btn" @click="viewMessage(msg.id)">
                {{ msg.status === 'unread' ? '标记为已读' : '查看详情' }}
              </button>
            </div>
            <div v-if="msg.reply" class="reply">
              <h5>回复：</h5>
              <p>{{ msg.reply.content }}</p>
              <span class="reply-time">回复时间：{{ msg.reply.replyTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="detailOpen" title="留言详情" width="520px" destroy-on-close>
      <template v-if="detailMsg">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="主题">{{ detailMsg.subject }}</el-descriptions-item>
          <el-descriptions-item label="收件人">{{ getRecipientText(detailMsg.recipient) }}</el-descriptions-item>
          <el-descriptions-item label="紧急程度">{{ getUrgencyText(detailMsg.urgency) }}</el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ detailMsg.sendTime }}</el-descriptions-item>
          <el-descriptions-item label="内容">{{ detailMsg.content }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="detailMsg.reply" class="reply-block">
          <h4>回复</h4>
          <p>{{ detailMsg.reply.content }}</p>
          <span class="reply-time">回复时间：{{ detailMsg.reply.replyTime }}</span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getParentMessages, sendParentMessage } from '../../../api/parent.js'

const message = ref({
  recipient: '',
  subject: '',
  content: '',
  urgency: ''
})

const statusFilter = ref('all')
const recipientFilter = ref('all')
const loading = ref(false)
const messages = ref([])
const detailOpen = ref(false)
const detailMsg = ref(null)

onMounted(async () => {
  await loadMessages()
})

const loadMessages = async () => {
  try {
    loading.value = true
    const res = await getParentMessages({
      fromRole: 'parent'
    })
    messages.value = res.data || []
  } catch (error) {
    console.error('加载留言记录失败', error)
  } finally {
    loading.value = false
  }
}

const filteredMessages = computed(() => {
  return messages.value.filter(msg => {
    const statusMatch = statusFilter.value === 'all' || 
                      (statusFilter.value === 'unread' && msg.status === 'unread') ||
                      (statusFilter.value === 'read' && (msg.status === 'read' || msg.status === 'replied')) ||
                      (statusFilter.value === 'replied' && msg.status === 'replied')
    const recipientMatch = recipientFilter.value === 'all' || msg.recipient === recipientFilter.value
    return statusMatch && recipientMatch
  })
})

const getRecipientText = (recipient) => {
  const recipientMap = {
    counselor: '辅导员',
    'mental-health': '心理健康中心',
    school: '学校相关部门'
  }
  return recipientMap[recipient] || recipient
}

const getUrgencyText = (urgency) => {
  const urgencyMap = {
    low: '一般',
    medium: '中等',
    high: '紧急'
  }
  return urgencyMap[urgency] || urgency
}

const getStatusText = (status) => {
  const statusMap = {
    unread: '未读',
    read: '已读',
    replied: '已回复'
  }
  return statusMap[status] || status
}

const sendMessage = async () => {
  try {
    await sendParentMessage({
      counselorId: message.value.recipient,
      content: message.value.content,
      subject: message.value.subject,
      fromRole: 'parent'
    })
    
    await loadMessages()
    
    message.value = {
      recipient: '',
      subject: '',
      content: '',
      urgency: ''
    }
    
    ElMessage.success('留言发送成功')
  } catch (error) {
    console.error('发送留言失败', error)
    ElMessage.error('发送留言失败，请重试')
  }
}

const viewMessage = (id) => {
  const row = messages.value.find((msg) => msg.id === id)
  if (!row) return
  if (row.status === 'unread') {
    row.status = 'read'
    ElMessage.success('已标记为已读')
  }
  detailMsg.value = row
  detailOpen.value = true
}
</script>

<style scoped>
.parent-message {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.reply-block {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.reply-block h4 {
  margin: 0 0 8px;
  font-size: 14px;
}

.reply-time {
  font-size: 12px;
  color: #94a3b8;
}

.message-form {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.message-form h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.2rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.send-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a428e 100%);
  transform: translateY(-2px);
}

.message-records {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.message-records h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.2rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item label {
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.filter-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.message-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.message-item.unread {
  border-left: 4px solid #667eea;
  background: #f8f9ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.message-info h4 {
  margin: 0 0 5px;
  color: #333;
  font-size: 1.1rem;
}

.recipient {
  display: inline-block;
  padding: 2px 8px;
  background: #e9ecef;
  border-radius: 10px;
  font-size: 0.8rem;
  color: #666;
}

.message-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.urgency {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
}

.urgency.low {
  background: #28a745;
}

.urgency.medium {
  background: #ffc107;
  color: #333;
}

.urgency.high {
  background: #dc3545;
}

.send-time {
  font-size: 0.85rem;
  color: #666;
}

.message-body .content {
  margin: 0 0 15px;
  color: #555;
  line-height: 1.5;
  font-size: 0.95rem;
}

.message-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status.unread {
  background: #d1ecf1;
  color: #0c5460;
}

.status.read {
  background: #e2e3e5;
  color: #383d41;
}

.status.replied {
  background: #d4edda;
  color: #155724;
}

.view-btn {
  padding: 6px 12px;
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.view-btn:hover {
  background: #e9ecef;
}

.reply {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #667eea;
}

.reply h5 {
  margin: 0 0 10px;
  color: #333;
  font-size: 1rem;
}

.reply p {
  margin: 0 0 10px;
  color: #555;
  line-height: 1.5;
  font-size: 0.95rem;
}

.reply-time {
  font-size: 0.8rem;
  color: #666;
}

@media (max-width: 768px) {
  .parent-message {
    padding: 15px;
  }

  .message-form,
  .message-records {
    padding: 20px;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .message-meta {
    align-items: flex-start;
    width: 100%;
  }

  .message-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .view-btn {
    align-self: flex-end;
  }
}
</style>
