<template>
  <div class="contact-counselor">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">联系咨询师/辅导员</span>
    </div>

    <div class="contact-cards">
      <div class="contact-section">
        <h3 class="section-title">
          <el-icon><User /></el-icon>
          我的辅导员
        </h3>
        <div class="contact-card" v-if="tutor">
          <el-avatar :size="56">{{ tutor.name?.slice(-2) }}</el-avatar>
          <div class="contact-info">
            <h4>{{ tutor.name }}</h4>
            <p>{{ tutor.department }}</p>
            <p class="contact-detail">
              <el-icon><Phone /></el-icon> {{ tutor.phone }}
            </p>
            <p class="contact-detail">
              <el-icon><Message /></el-icon> {{ tutor.email }}
            </p>
            <p class="contact-detail">
              <el-icon><Location /></el-icon> {{ tutor.office }}
            </p>
          </div>
          <div class="contact-actions">
            <el-button type="primary" @click="openMessageDialog(tutor, 'tutor')">
              <el-icon><ChatDotRound /></el-icon> 发送消息
            </el-button>
          </div>
        </div>
        <el-empty v-else description="暂无辅导员信息" :image-size="60" />
      </div>

      <div class="contact-section">
        <h3 class="section-title">
          <el-icon><UserFilled /></el-icon>
          心理咨询师
        </h3>
        <div class="contact-card" v-for="c in counselors" :key="c.id">
          <el-avatar :size="56">{{ c.name?.slice(-2) }}</el-avatar>
          <div class="contact-info">
            <h4>{{ c.name }}</h4>
            <p>{{ c.title }} · {{ c.specialty }}</p>
            <p class="contact-detail">
              <el-icon><Phone /></el-icon> {{ c.phone }}
            </p>
            <p class="contact-detail">
              <el-icon><Location /></el-icon> {{ c.office }}
            </p>
            <div class="available-time" v-if="c.availableTime">
              <el-icon><Clock /></el-icon>
              <span>值班时间：{{ c.availableTime }}</span>
            </div>
          </div>
          <div class="contact-actions">
            <el-button type="primary" @click="openMessageDialog(c, 'counselor')">
              <el-icon><ChatDotRound /></el-icon> 发送消息
            </el-button>
            <el-button @click="goAppointment(c)">
              <el-icon><Calendar /></el-icon> 预约咨询
            </el-button>
          </div>
        </div>
        <el-empty v-if="counselors.length === 0" description="暂无咨询师信息" :image-size="60" />
      </div>
    </div>

    <div class="hotline-section">
      <h3 class="section-title">
        <el-icon><Phone /></el-icon>
        心理援助热线
      </h3>
      <div class="hotline-cards">
        <div class="hotline-card" v-for="h in hotlines" :key="h.name">
          <div class="hotline-info">
            <h4>{{ h.name }}</h4>
            <p class="hotline-number">{{ h.number }}</p>
            <p class="hotline-time">{{ h.time }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 发送消息弹窗 -->
    <el-dialog v-model="messageDialogVisible" title="发送消息" width="500px">
      <el-form :model="messageForm" label-width="80px">
        <el-form-item label="收件人">
          <el-input :value="messageTarget?.name" disabled />
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="messageForm.subject" placeholder="请输入消息主题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="messageForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入消息内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="messageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="sendMessage" :disabled="!messageForm.content">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, User, UserFilled, Phone, Message, Location,
  ChatDotRound, Calendar, Clock
} from '@element-plus/icons-vue'

const router = useRouter()

// 静态 mock 数据 —— 后端就绪后替换为 API 调用
const tutor = ref({
  id: 1,
  name: '王老师',
  department: '计算机科学与技术学院',
  phone: '010-12345678',
  email: 'wang@example.edu.cn',
  office: '行政楼 305 室'
})

const counselors = ref([
  {
    id: 1, name: '李心理', title: '国家二级心理咨询师',
    specialty: '情绪管理、人际关系', phone: '010-87654321',
    office: '心理咨询中心 201 室', availableTime: '周一至周五 9:00-17:00'
  },
  {
    id: 2, name: '张咨询', title: '心理治疗师',
    specialty: '学业压力、焦虑抑郁', phone: '010-87654322',
    office: '心理咨询中心 202 室', availableTime: '周二、周四 14:00-17:00'
  }
])

const hotlines = ref([
  { name: '全国心理援助热线', number: '400-161-9995', time: '24小时' },
  { name: '北京心理危机研究与干预中心', number: '010-82951332', time: '24小时' },
  { name: '校心理咨询中心', number: '010-12345678', time: '工作日 8:30-17:30' }
])

const messageDialogVisible = ref(false)
const messageTarget = ref(null)
const messageForm = ref({ subject: '', content: '' })

function openMessageDialog(target, type) {
  messageTarget.value = target
  messageForm.value = { subject: '', content: '' }
  messageDialogVisible.value = true
}

function sendMessage() {
  if (!messageForm.value.content) return
  // TODO: 接入后端 API
  ElMessage.success('消息已发送')
  messageDialogVisible.value = false
}

function goAppointment(counselor) {
  router.push('/appointment/select')
}
</script>

<style scoped>
.contact-counselor {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}
.page-nav {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 20px; padding: 12px 16px;
  background: #fff; border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.nav-title { font-size: 18px; font-weight: 600; color: #1e293b; }
.section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 16px; font-weight: 600; color: #1e293b;
  margin: 0 0 16px 0;
}
.contact-section {
  background: #fff; border-radius: 12px; padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 20px;
}
.contact-card {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 16px; background: #f8fafc; border-radius: 10px;
  margin-bottom: 12px;
}
.contact-info { flex: 1; }
.contact-info h4 { margin: 0 0 4px; font-size: 16px; color: #1e293b; }
.contact-info p { margin: 0 0 4px; font-size: 13px; color: #64748b; }
.contact-detail {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; color: #475569;
}
.available-time {
  display: flex; align-items: center; gap: 4px;
  margin-top: 6px; font-size: 12px; color: #3b82f6;
  background: #eff6ff; padding: 4px 8px; border-radius: 4px;
  width: fit-content;
}
.contact-actions {
  display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;
}
.hotline-section {
  background: #fff; border-radius: 12px; padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.hotline-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.hotline-card {
  padding: 16px; background: #fef2f2; border-radius: 10px;
  border: 1px solid #fecaca;
}
.hotline-info h4 { margin: 0 0 8px; font-size: 14px; color: #991b1b; }
.hotline-number { margin: 0 0 4px; font-size: 18px; font-weight: 700; color: #dc2626; }
.hotline-time { margin: 0; font-size: 12px; color: #9ca3af; }

@media (max-width: 768px) {
  .contact-card { flex-direction: column; }
  .contact-actions { flex-direction: row; }
  .hotline-cards { grid-template-columns: 1fr; }
}
</style>
