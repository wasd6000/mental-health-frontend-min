<template>
  <div class="tutor-page">
    <div class="page-head">
      <h2>家长留言管理</h2>
      <p class="page-desc">查看并回复家长留言（<code>/api/teacher/message/inbox</code>、<code>/api/teacher/message/reply</code>）。</p>
      <el-button :icon="Refresh" :loading="loading" @click="loadInbox">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="messages" stripe border empty-text="暂无留言">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="parentName" label="家长" width="100" />
      <el-table-column prop="studentName" label="学生" width="100" />
      <el-table-column prop="content" label="留言内容" min-width="220" show-overflow-tooltip />
      <el-table-column prop="createTime" label="时间" width="170" />
      <el-table-column prop="status" label="状态" width="90" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openReply(row)">回复</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="replyVisible" title="回复家长" width="520px" destroy-on-close>
      <el-input v-model="replyText" type="textarea" rows="6" placeholder="请输入回复内容" />
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" :loading="replying" @click="sendReply">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getTeacherMessageInbox, replyTeacherMessage } from '../../api/teacherMessage.js'

const loading = ref(false)
const messages = ref([])
const replyVisible = ref(false)
const replyText = ref('')
const replying = ref(false)
const currentRow = ref(null)

function normalizeInbox(res) {
  const raw = res?.data !== undefined ? res.data : res
  const list = Array.isArray(raw) ? raw : raw?.records || raw?.list || []
  return list.map((m, i) => ({
    id: m.id ?? m.messageId ?? i,
    parentName: m.parentName ?? m.senderName ?? '—',
    studentName: m.studentName ?? m.childName ?? '—',
    content: m.content ?? m.body ?? m.text ?? '—',
    createTime: m.createTime ?? m.createdAt ?? '—',
    status: m.status ?? (m.read ? '已读' : '未读'),
    _raw: m,
  }))
}

async function loadInbox() {
  loading.value = true
  try {
    const res = await getTeacherMessageInbox()
    messages.value = normalizeInbox(res)
  } catch (e) {
    ElMessage.error(e?.message || '加载失败')
    messages.value = []
  } finally {
    loading.value = false
  }
}

function openReply(row) {
  currentRow.value = row
  replyText.value = ''
  replyVisible.value = true
}

async function sendReply() {
  if (!replyText.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  replying.value = true
  try {
    await replyTeacherMessage({
      messageId: currentRow.value?.id,
      content: replyText.value,
      replyTo: currentRow.value?._raw,
    })
    ElMessage.success('已发送')
    replyVisible.value = false
    await loadInbox()
  } catch (e) {
    ElMessage.error(e?.message || '发送失败')
  } finally {
    replying.value = false
  }
}

onMounted(() => {
  loadInbox()
})
</script>

<style scoped>
.tutor-page {
  padding: 0 4px 24px;
}
.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.page-head h2 {
  margin: 0;
  font-size: 20px;
}
.page-desc {
  margin: 0;
  flex: 1;
  color: #64748b;
  font-size: 14px;
}
</style>
