<template>
  <div class="admin-workbench">
    <div class="page-head">
      <div class="head-main">
        <h2>{{ workbenchTitle }}</h2>
        <p class="page-desc">{{ workbenchDesc }}</p>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="stats-row">
      <div class="stat-card" v-for="stat in statsData" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.color }">
          <el-icon><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
        <router-link v-if="stat.to" :to="stat.to" class="stat-link">处理</router-link>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="section-header">
      <h3>快捷入口</h3>
    </div>
    <div class="cards">
      <router-link
        v-for="item in entries"
        :key="item.to"
        :to="item.to"
        class="card"
      >
        <div class="card-icon" :style="{ background: item.color }">
          <el-icon><component :is="item.icon" /></el-icon>
        </div>
        <div class="card-body">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
        <span class="card-arrow"><el-icon><ArrowRight /></el-icon></span>
      </router-link>
    </div>

    <!-- 待办事项 -->
    <div v-if="displayTodoList.length" class="todo-section">
      <div class="section-header">
        <h3>待办事项</h3>
        <router-link to="/admin/tutor-message-center" class="link-more">查看全部</router-link>
      </div>
      <div class="todo-list">
        <div
          v-for="todo in displayTodoList"
          :key="todo.id"
          class="todo-item"
          @click="handleTodo(todo)"
        >
          <span class="todo-type" :class="todo.type">{{ todo.typeText }}</span>
          <span class="todo-content">{{ todo.content }}</span>
          <span class="todo-time">{{ todo.time }}</span>
          <el-icon class="todo-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Calendar,
  CircleCheck,
  Warning,
  Bell,
  ArrowRight,
  Setting,
  FolderOpened,
  User,
  DataBoard,
  List,
  Document,
  TrendCharts,
  OfficeBuilding,
} from '@element-plus/icons-vue'
import { getCrisisList } from '../../api/crisisApi'
import { getLeaveApprovalList } from '../../api/leaveApi'
import { getUnreadCount } from '../../api/message.js'
import { getAppointmentList } from '../../api/appointmentApi'

const router = useRouter()
const role = ref(localStorage.getItem('admin_role') || localStorage.getItem('user_role') || 'admin')
const stats = ref({
  crisisPending: 0,
  leavePending: 0,
  unreadCount: 0,
  appointmentToday: 0,
  studentCount: 0,
  reportCount: 0,
})
const todoList = ref([])

// 工作台配置（根据角色动态显示）
const workbenchConfig = {
  admin: {
    title: '系统管理员工作台',
    desc: '系统全局管理、用户权限配置、数据监控与运维。',
  },
  center: {
    title: '心理中心工作台',
    desc: '心理咨询管理、危机干预、数据统计与报表。',
  },
  counselor: {
    title: '咨询师工作台',
    desc: '咨询预约管理、个案跟进、咨询记录与排班。',
  },
  tutor: {
    title: '辅导员工作台',
    desc: '学生管理、危机上报、测评查看与家校沟通。',
  },
  instructor: {
    title: '辅导员工作台',
    desc: '学生管理、危机上报、测评查看与家校沟通。',
  },
  college: {
    title: '院系领导工作台',
    desc: '本院系学生心理健康监测、危机预警与统计分析。',
  },
  leader: {
    title: '校领导工作台',
    desc: '全校心理健康工作概览、数据分析与决策支持。',
  },
}

const workbenchTitle = computed(() => workbenchConfig[role.value]?.title || '工作台')
const workbenchDesc = computed(() => workbenchConfig[role.value]?.desc || '工作概览')

const statsData = computed(() => {
  const base = []

  // 所有角色都显示：未读消息
  base.push({
    label: '未读消息',
    value: stats.value.unreadCount,
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    icon: Bell,
    to: '/admin/tutor-message-center',
  })

  // admin, center, counselor, college, leader 显示：待审批危机
  if (['admin', 'center', 'counselor', 'college', 'leader'].includes(role.value)) {
    base.unshift({
      label: '待处理危机',
      value: stats.value.crisisPending,
      color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      icon: Warning,
      to: '/admin/crisis-list',
    })
  }

  // admin, center 显示：待审批请假
  if (['admin', 'center'].includes(role.value)) {
    base.push({
      label: '待审批请假',
      value: stats.value.leavePending,
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: CircleCheck,
      to: '/admin/leave-list',
    })
  }

  // center, counselor 显示：今日预约
  if (['center', 'counselor'].includes(role.value)) {
    base.push({
      label: '今日预约',
      value: stats.value.appointmentToday,
      color: 'linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%)',
      icon: Calendar,
      to: '/admin/appointments',
    })
  }

  // tutor, instructor 显示：负责学生数
  if (['tutor', 'instructor'].includes(role.value)) {
    base.unshift({
      label: '负责学生',
      value: stats.value.studentCount,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: User,
      to: '/admin/tutor-students',
    })
  }

  // college, leader 显示：本院系/全校学生数
  if (['college', 'leader'].includes(role.value)) {
    base.unshift({
      label: role.value === 'college' ? '本院学生' : '全校学生',
      value: stats.value.studentCount,
      color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      icon: role.value === 'college' ? OfficeBuilding : DataBoard,
      to: role.value === 'college' ? '/admin/college-students' : '/admin/leader-colleges',
    })
  }

  return base
})

const entriesConfig = {
  admin: [
    { title: '用户管理', desc: '管理各角色用户账号', to: '/admin/user-manage', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: User },
    { title: '危机审批', desc: '危机个案上报与协同审批', to: '/admin/crisis-list', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: Warning },
    { title: '请假审批', desc: '咨询师请假申请审核', to: '/admin/leave-list', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: CircleCheck },
    { title: '预约管理', desc: '查看与处理咨询预约', to: '/admin/appointments', color: 'linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%)', icon: Calendar },
    { title: '数据管理', desc: '数据备份、恢复、归档与字典', to: '/admin/data-manage', color: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', icon: FolderOpened },
    { title: '系统管理', desc: '系统参数与角色权限配置', to: '/admin/system-manage', color: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', icon: Setting },
  ],
  center: [
    { title: '预约管理', desc: '查看与处理咨询预约', to: '/admin/appointments', color: 'linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%)', icon: Calendar },
    { title: '危机管理', desc: '危机个案上报与协同审批', to: '/admin/crisis-list', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: Warning },
    { title: '请假审批', desc: '咨询师请假申请审批', to: '/admin/leave-list', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: CircleCheck },
    { title: '咨询师管理', desc: '管理咨询师信息与排班', to: '/admin/counselor', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: User },
    { title: '个案管理', desc: '咨询记录与个案跟进', to: '/admin/case-list', color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', icon: List },
    { title: '数据统计', desc: '全院数据统计与报表', to: '/admin/center-statistics', color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', icon: DataBoard },
  ],
  counselor: [
    { title: '我的咨询', desc: '今日咨询与个案管理', to: '/admin/counselor-work', color: 'linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%)', icon: List },
    { title: '预约管理', desc: '查看与处理咨询预约', to: '/admin/appointments', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: Calendar },
    { title: '个案管理', desc: '咨询记录与个案跟进', to: '/admin/case-list', color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', icon: Document },
    { title: '危机管理', desc: '危机个案上报与处理', to: '/admin/crisis-list', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: Warning },
    { title: '请假申请', desc: '提交请假申请', to: '/leave/apply', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: CircleCheck },
  ],
  tutor: [
    { title: '学生管理', desc: '查看与管理负责学生', to: '/admin/tutor-students', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: User },
    { title: '危机上报', desc: '提交学生危机预警', to: '/admin/tutor-crisis-report', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: Warning },
    { title: '测评查看', desc: '查看学生心理测评结果', to: '/admin/tutor-assessment', color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', icon: DataBoard },
    { title: '访谈记录', desc: '学生谈话记录管理', to: '/admin/tutor-interview', color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', icon: Document },
    { title: '月报填写', desc: '填写月度工作报告', to: '/admin/tutor-report', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: TrendCharts },
    { title: '活动管理', desc: '心理健康活动组织', to: '/admin/activity-manage', color: 'linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%)', icon: Calendar },
  ],
  instructor: [
    { title: '学生管理', desc: '查看与管理负责学生', to: '/admin/tutor-students', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: User },
    { title: '危机上报', desc: '提交学生危机预警', to: '/admin/tutor-crisis-report', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: Warning },
    { title: '测评查看', desc: '查看学生心理测评结果', to: '/admin/tutor-assessment', color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', icon: DataBoard },
    { title: '访谈记录', desc: '学生谈话记录管理', to: '/admin/tutor-interview', color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', icon: Document },
    { title: '月报填写', desc: '填写月度工作报告', to: '/admin/tutor-report', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: TrendCharts },
    { title: '活动管理', desc: '心理健康活动组织', to: '/admin/activity-manage', color: 'linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%)', icon: Calendar },
  ],
  college: [
    { title: '本院学生', desc: '查看本院系学生信息', to: '/admin/college-students', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: User },
    { title: '危机预警', desc: '本院系危机事件监控', to: '/admin/college-crisis', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: Warning },
    { title: '数据统计', desc: '本院系心理健康统计', to: '/admin/college-statistics', color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', icon: DataBoard },
    { title: '工作报告', desc: '查看院系工作报告', to: '/admin/college-report', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: Document },
    { title: '辅导员管理', desc: '管理本院系辅导员', to: '/admin/college-tutors', color: 'linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%)', icon: OfficeBuilding },
  ],
  leader: [
    { title: '全校概览', desc: '全校心理健康工作概览', to: '/admin/leader-statistics', color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', icon: DataBoard },
    { title: '危机监控', desc: '全校危机事件监控', to: '/admin/leader-crisis', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', icon: Warning },
    { title: '院系管理', desc: '查看各院系工作情况', to: '/admin/leader-colleges', color: 'linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%)', icon: OfficeBuilding },
    { title: '工作报告', desc: '全校心理健康报告', to: '/admin/leader-report', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: Document },
  ],
}

const entries = computed(() => entriesConfig[role.value] || entriesConfig.admin)

const displayTodoList = computed(() => todoList.value)

async function loadStats() {
  try {
    // 1. 获取待处理危机数量
    if (['admin', 'center', 'counselor', 'college', 'leader'].includes(role.value)) {
      const crisisRes = await getCrisisList({ status: 'PENDING', page: 1, pageSize: 1 })
      if (crisisRes?.code === 200) {
        stats.value.crisisPending = crisisRes.data?.total || 0
      } else {
        stats.value.crisisPending = 0
      }
    }

    // 2. 获取待审批请假数量（仅 admin 和 center）
    if (['admin', 'center'].includes(role.value)) {
      const leaveRes = await getLeaveApprovalList({ status: 'PENDING', page: 1, pageSize: 1 })
      if (leaveRes?.code === 200) {
        stats.value.leavePending = leaveRes.data?.total || 0
      } else {
        stats.value.leavePending = 0
      }
    }

    // 3. 获取未读消息数量
    const msgRes = await getUnreadCount()
    if (msgRes?.data !== undefined) {
      if (typeof msgRes.data === 'object' && msgRes.data !== null) {
        stats.value.unreadCount = msgRes.data.totalCount || 0
      } else {
        stats.value.unreadCount = msgRes.data
      }
    } else {
      stats.value.unreadCount = 0
    }

    // 4. 获取今日预约数量（center, counselor）
    if (['center', 'counselor'].includes(role.value)) {
      try {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        const appointmentRes = await getAppointmentList({
          date: todayStr,
          status: 'CONFIRMED',
          page: 1,
          pageSize: 1
        })

        if (appointmentRes?.code === 200) {
          stats.value.appointmentToday = appointmentRes.data?.total || 0
        } else {
          stats.value.appointmentToday = 0
        }
      } catch (e) {
        console.error('获取今日预约失败:', e)
        stats.value.appointmentToday = 0
      }
    }

    // 5. 获取学生数量（tutor/instructor/college/leader）
    if (['tutor', 'instructor', 'college', 'leader'].includes(role.value)) {
      // TODO: 调用真实接口获取学生数量
      // 暂时使用模拟数据，等待后端提供接口
      stats.value.studentCount = role.value === 'leader' ? 5000 : (role.value === 'college' ? 800 : 120)
    }
  } catch (e) {
    console.error('加载统计数据失败:', e)
    stats.value = {
      crisisPending: 0,
      leavePending: 0,
      unreadCount: 0,
      appointmentToday: 0,
      studentCount: 0,
      reportCount: 0,
    }
  }
}

async function loadTodo() {
  try {
    const todos = []

    // 1. 获取待处理危机
    if (['admin', 'center', 'counselor', 'college', 'leader'].includes(role.value)) {
      try {
        const crisisRes = await getCrisisList({ status: 'PENDING', page: 1, pageSize: 2 })
        if (crisisRes?.code === 200) {
          const crisisList =
            crisisRes.data?.list ??
            crisisRes.data?.records ??
            (Array.isArray(crisisRes.data) ? crisisRes.data : [])

          crisisList.slice(0, 2).forEach((item, index) => {
            todos.push({
              id: `crisis-${item.id || index}`,
              type: 'crisis',
              typeText: '危机',
              content: item.studentName ? `${item.studentName}危机待处理` : '危机个案待处理',
              time: formatTime(item.createTime || item.reportTime),
              to: `/crisis/${item.id}`
            })
          })
        }
      } catch (e) {
        console.error('获取危机待办失败:', e)
      }
    }

    // 2. 获取待审批请假（仅 admin 和 center）
    if (['admin', 'center'].includes(role.value)) {
      try {
        const leaveRes = await getLeaveApprovalList({ status: 'PENDING', page: 1, pageSize: 1 })
        if (leaveRes?.code === 200) {
          const leaveList =
            leaveRes.data?.list ??
            leaveRes.data?.records ??
            (Array.isArray(leaveRes.data) ? leaveRes.data : [])

          leaveList.slice(0, 1).forEach((item, index) => {
            todos.push({
              id: `leave-${item.id || index}`,
              type: 'leave',
              typeText: '请假',
              content: item.counselorName ? `${item.counselorName}请假待审批` : '请假申请待审批',
              time: formatTime(item.createTime || item.applyTime),
              to: '/admin/leave-list'
            })
          })
        }
      } catch (e) {
        console.error('获取请假待办失败:', e)
      }
    }

    // 3. 添加未读消息提醒
    try {
      const msgRes = await getUnreadCount()
      if (msgRes?.data) {
        const unreadCount = typeof msgRes.data === 'object' ? msgRes.data.totalCount : msgRes.data
        if (unreadCount > 0) {
          todos.push({
            id: 'message-unread',
            type: 'message',
            typeText: '消息',
            content: `您有 ${unreadCount} 条未读消息`,
            time: '最近',
            to: '/admin/tutor-message-center'
          })
        }
      }
    } catch (e) {
      console.error('获取消息待办失败:', e)
    }

    // 按时间排序，最多显示5条
    todoList.value = todos.slice(0, 5)
  } catch (e) {
    console.error('加载待办事项失败:', e)
    todoList.value = []
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '未知时间'

  const now = new Date()
  const time = new Date(timeStr)
  const diff = now - time

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`

  return time.toLocaleDateString('zh-CN')
}

function handleTodo(todo) {
  if (todo.to) router.push(todo.to)
}

onMounted(() => {
  loadStats()
  loadTodo()
})
</script>

<style scoped>
.admin-workbench {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.page-head {
  margin-bottom: 24px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border-radius: 16px;
  border: 1px solid #e0f2fe;
  box-shadow: 0 2px 8px rgba(30, 79, 156, 0.06);
}

.head-main h2 {
  margin: 0 0 6px 0;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(30, 79, 156, 0.12);
  border-color: #bae6fd;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  display: block;
  font-size: 26px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.stat-link {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 12px;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.stat-link:hover {
  text-decoration: underline;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.link-more {
  font-size: 13px;
  color: #2563eb;
  text-decoration: none;
  float: right;
  font-weight: 500;
}

.link-more:hover {
  text-decoration: underline;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-decoration: none;
  color: inherit;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(30, 79, 156, 0.12);
  border-color: rgba(30, 79, 156, 0.2);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-icon .el-icon {
  font-size: 24px;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.card p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.card-arrow {
  color: #94a3b8;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.card:hover .card-arrow {
  color: #1e4f9c;
  transform: translateX(3px);
}

.card-arrow .el-icon {
  font-size: 18px;
}

.todo-section {
  margin-top: 28px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item:hover {
  background: #f8fafc;
  padding-left: 8px;
  border-radius: 8px;
}

.todo-type {
  flex-shrink: 0;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.todo-type.crisis {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.todo-type.leave {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.todo-type.message {
  background: #f5f3ff;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
}

.todo-content {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
}

.todo-time {
  flex-shrink: 0;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.todo-arrow {
  color: #cbd5e1;
  font-size: 16px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.todo-item:hover .todo-arrow {
  color: #1e4f9c;
  transform: translateX(2px);
}

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .admin-workbench {
    padding: 0 12px;
  }

  .page-head {
    padding: 20px;
  }

  .head-main h2 {
    font-size: 20px;
  }

  .stats-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .todo-section {
    padding: 20px;
  }
}
</style>
