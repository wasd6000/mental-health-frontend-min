<template>
  <div class="select-slot-page">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon class="header-icon"><Calendar /></el-icon>
            <span class="header-title">选择预约时间</span>
          </div>
          <el-button type="primary" @click="goToAppointments">
            <el-icon><List /></el-icon>
            <span>我的预约</span>
          </el-button>
        </div>
      </template>

      <div class="content-wrapper">
        <div class="calendar-section">
          <div class="section-title">
            <el-icon><Calendar /></el-icon>
            <span>选择日期</span>
          </div>

          <div class="calendar-container">
            <div class="calendar-header">
              <el-button
                link
                :disabled="!canGoPrev"
                @click="changeWeek(-1)"
              >
                <el-icon><ArrowLeft /></el-icon>
                上一周
              </el-button>
              <span class="current-month">{{ currentMonthText }}</span>
              <el-button
                link
                :disabled="!canGoNext"
                @click="changeWeek(1)"
              >
                下一周
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>

            <div class="calendar-grid">
              <div
                v-for="day in weekDays"
                :key="day.date"
                class="calendar-day"
                :class="{
                  'is-selected': selectedDate === day.date,
                  'is-today': day.isToday,
                  'is-disabled': !day.hasSlots || day.isPast,
                  'has-slots': day.hasSlots && !day.isPast
                }"
                @click="selectDay(day)"
              >
                <div class="day-week">{{ day.weekDay }}</div>
                <div class="day-date">{{ day.dayNum }}</div>
                <div class="day-indicator">
                  <template v-if="day.hasSlots && !day.isPast">
                    <span class="slot-count">{{ day.slotCount }}个时段</span>
                  </template>
                  <template v-else-if="day.isPast">
                    <span class="no-slot">已过期</span>
                  </template>
                  <template v-else>
                    <span class="no-slot">无排班</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="filter-section">
          <div class="section-title">
            <el-icon><Filter /></el-icon>
            <span>筛选条件</span>
          </div>
          <div class="filter-row">
            <el-select
              v-model="filterCounselor"
              placeholder="选择咨询师"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="c in availableCounselors"
                :key="c.id"
                :label="c.name"
                :value="c.id"
              />
            </el-select>
          </div>
        </div>

        <div class="slots-section">
          <div class="section-title">
            <el-icon><Clock /></el-icon>
            <span>可预约时段</span>
            <el-tag v-if="selectedDate" type="info" size="small">
              {{ formatDateCN(selectedDate) }}
            </el-tag>
          </div>

          <div v-if="loading" class="loading-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <div v-else-if="!selectedDate" class="empty-state">
            <el-icon><Calendar /></el-icon>
            <p>请先选择一个日期</p>
          </div>

          <div v-else-if="filteredSlots.length === 0" class="empty-state">
            <el-icon><Warning /></el-icon>
            <p>当前日期暂无可预约时段</p>
            <el-button type="primary" link @click="selectedDate = ''">
              重新选择日期
            </el-button>
          </div>

          <div v-else class="slots-grid">
            <div
              v-for="slot in filteredSlots"
              :key="slot.scheduleId || `${slot.date}-${slot.time}-${slot.counselorId}`"
              class="slot-card"
              :class="{
                'is-avoided': isAvoidedByCollege(slot),
                'is-college-only': isOnlyCollegeBlocked(slot)
              }"
              @click="openConfirmDialog(slot)"
            >
              <div class="slot-time">
                <el-icon><Clock /></el-icon>
                <span>{{ slot.time }}</span>
              </div>

              <div class="slot-counselor">
                <el-avatar :size="40" class="counselor-avatar">
                  {{ slot.counselorName?.charAt(0) || '师' }}
                </el-avatar>
                <div class="counselor-info">
                  <div class="counselor-name">{{ slot.counselorName }}</div>
                  <div class="counselor-title">心理咨询师</div>
                </div>
              </div>

              <div class="slot-tags">
                <el-tag
                  v-if="isAvoidedByCollege(slot)"
                  type="danger"
                  size="small"
                >
                  回避学院
                </el-tag>
                <el-tag
                  v-else-if="isOnlyCollegeBlocked(slot)"
                  type="warning"
                  size="small"
                >
                  仅限本院
                </el-tag>
                <el-tag
                  v-else
                  type="success"
                  size="small"
                >
                  可预约
                </el-tag>
              </div>

              <div class="slot-action">
                <el-button
                  type="primary"
                  :disabled="isAvoidedByCollege(slot) || isOnlyCollegeBlocked(slot)"
                  size="small"
                >
                  立即预约
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="confirmDialogVisible"
      title="确认预约"
      width="420px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedSlot" class="confirm-content">
        <div class="confirm-item">
          <span class="confirm-label">预约日期</span>
          <span class="confirm-value">{{ formatDateCN(selectedSlot.date) }}</span>
        </div>
        <div class="confirm-item">
          <span class="confirm-label">预约时段</span>
          <span class="confirm-value">{{ selectedSlot.time }}</span>
        </div>
        <div class="confirm-item">
          <span class="confirm-label">咨询师</span>
          <span class="confirm-value">{{ selectedSlot.counselorName }}</span>
        </div>

        <el-alert
          v-if="selectedSlot.unitType === 'single_unit'"
          title="温馨提示"
          type="info"
          :closable="false"
          show-icon
          style="margin-top: 16px"
        >
          本次预约为一次性单元咨询
        </el-alert>
      </div>

      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="confirmAppointment"
        >
          确认预约
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  List,
  Filter,
  Loading,
  Warning
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  fetchScheduleList,
  fetchConsultantList,
  fetchAppointmentList,
  unwrapPageResult,
  buildCounselorNameMap,
  expandScheduleRowToSlots,
  defaultSubmitBodyFromSlot,
  submitAppointment,
  parseAppointmentSubmitData,
} from '../../api/psychPlatformAppointment.js'
import { useAppointmentMock, resolveBackendUserIdForAppointmentApi } from '../../api/appointmentEnv'
import { getApprovedLeaveList } from '../../api/leaveApi.js'
import request from '../../api/request.js'

const router = useRouter()

/** 与 appointment.ts 一致：默认走后端，仅 VITE_USE_MOCK_APPOINTMENT=true 时用 mock */
const useBackendAppointment = !useAppointmentMock()

const loading = ref(false)
const submitting = ref(false)
const dates = ref<string[]>([])
const selectedDate = ref('')
const slots = ref<any[]>([])
const studentId = ref('')
const filterCounselor = ref('')
const confirmDialogVisible = ref(false)
const selectedSlot = ref<any>(null)
const currentWeekStart = ref(new Date())
const semesterInfo = ref({ start: '', end: '' })

let scheduleUpdateHandler: any

const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function toDay(d: string | Date) {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt.getTime())) return ''
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateCN(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDay = WEEK_DAYS[date.getDay()]
  return `${month}月${day}日 ${weekDay}`
}

function getWeekStart(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const currentMonthText = computed(() => {
  const start = currentWeekStart.value
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const startMonth = start.getMonth() + 1
  const endMonth = end.getMonth() + 1
  const year = start.getFullYear()

  if (startMonth === endMonth) {
    return `${year}年${startMonth}月`
  } else {
    return `${year}年${startMonth}月 - ${endMonth}月`
  }
})

const weekDays = computed(() => {
  const result: any[] = []
  const today = toDay(new Date())
  const start = new Date(currentWeekStart.value)

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const dateStr = toDay(d)
    const daySlots = allAvailableSlots.value.filter(s => toDay(s.date) === dateStr)

    result.push({
      date: dateStr,
      dayNum: d.getDate(),
      weekDay: WEEK_DAYS[d.getDay()],
      isToday: dateStr === today,
      isPast: dateStr < today,
      hasSlots: daySlots.length > 0,
      slotCount: daySlots.length
    })
  }

  return result
})

const allAvailableSlots = ref<any[]>([])

const canGoPrev = computed(() => {
  const today = getWeekStart(new Date())
  return currentWeekStart.value > today
})

const canGoNext = computed(() => {
  if (!semesterInfo.value.end) return true
  const semesterEnd = new Date(semesterInfo.value.end)
  const nextWeekStart = new Date(currentWeekStart.value)
  nextWeekStart.setDate(nextWeekStart.getDate() + 7)
  return nextWeekStart <= semesterEnd
})

const availableCounselors = computed(() => {
  const counselorMap = new Map()
  allAvailableSlots.value.forEach(slot => {
    if (!counselorMap.has(slot.counselorId)) {
      counselorMap.set(slot.counselorId, {
        id: slot.counselorId,
        name: slot.counselorName
      })
    }
  })
  return Array.from(counselorMap.values())
})

const filteredSlots = computed(() => {
  let result = slots.value

  if (filterCounselor.value) {
    result = result.filter(s => s.counselorId === filterCounselor.value)
  }

  return result
})

function changeWeek(delta: number) {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() + delta * 7)
  currentWeekStart.value = newStart
}

function selectDay(day: any) {
  if (day.isPast || !day.hasSlots) return
  selectedDate.value = day.date
}

async function refreshSchedule() {
  loading.value = true

  try {
    const semesterStartStr = toDay(semesterInfo.value.start)
    const semesterEndStr = toDay(semesterInfo.value.end)

    if (useBackendAppointment) {
      const [schRes, conRes] = await Promise.all([
        fetchScheduleList({
          page: 1,
          pageSize: 500,
          startTime: semesterStartStr,
          endTime: semesterEndStr
        }),
        fetchConsultantList({ page: 1, pageSize: 200 }),
      ])
      const scheduleRows = unwrapPageResult(schRes).records
      const consultantRows = unwrapPageResult(conRes).records
      const nameMap = buildCounselorNameMap(consultantRows)

      // 获取已批准的请假列表，用于过滤请假时间段的排班
      let approvedLeaves: any[] = []
      try {
        const leaveRes = await getApprovedLeaveList({
          startDate: semesterStartStr,
          endDate: semesterEndStr,
        })
        if (leaveRes?.code === 200 && Array.isArray(leaveRes.data)) {
          approvedLeaves = leaveRes.data
          console.log('📋 已批准请假列表:', approvedLeaves.length, '条')
        }
      } catch (e) {
        console.warn('获取请假列表失败:', e)
      }

      const bookedScheduleIds = new Set<string>()
      const uid =
          studentId.value || resolveBackendUserIdForAppointmentApi()
      if (uid) {
        try {
          const appRes = await fetchAppointmentList({
            page: 1,
            pageSize: 200,
            userId: uid,
          })
          unwrapPageResult(appRes).records.forEach((a: any) => {
            const sid = a.scheduleId ?? a.schedule_id
            if (sid) bookedScheduleIds.add(String(sid))
          })
        } catch (_) {
          /* 未登录或无列表权限时忽略 */
        }
      }

      const availableSlots: any[] = []
      scheduleRows.forEach((row: any) => {
        const av = row.availableSlots ?? row.available_slots ?? 0
        if (Number(av) <= 0) return
        const expanded = expandScheduleRowToSlots(
            row,
            nameMap,
            semesterStartStr,
            semesterEndStr,
        )
        expanded.forEach((slot) => {
          if (!slot.scheduleId || !slot.date) return
          if (bookedScheduleIds.has(String(slot.scheduleId))) return
          // 检查该时段是否在请假时间段内
          const counselorId = slot.counselorId || slot.counselor_id
          const slotStartTime = new Date(`${slot.date}T${slot.time?.split('-')[0] || '00:00:00'}`)
          const slotEndTime = new Date(`${slot.date}T${slot.time?.split('-')[1] || '23:59:59'}`)
          const isInLeavePeriod = approvedLeaves.some((leave: any) => {
            if (leave.counselorId !== counselorId) return false
            const leaveStart = new Date(leave.startTime)
            const leaveEnd = new Date(leave.endTime)
            // 检查时段是否与请假时间段重叠
            return slotStartTime < leaveEnd && slotEndTime > leaveStart
          })
          if (isInLeavePeriod) {
            console.log('🚫 过滤请假时段:', slot.date, slot.time, '咨询师:', counselorId)
            return
          }
          if (slot.date >= semesterStartStr && slot.date <= semesterEndStr) {
            availableSlots.push({
              ...slot,
              // 保留后端返回的回避学院信息
              avoid_colleges: row.avoidColleges || row.avoid_colleges || [],
              consultant_college_id: row.consultantCollegeId || row.consultant_college_id || '',
            })
          }
        })
      })

      const dateSet = new Set<string>()
      availableSlots.forEach(s => dateSet.add(s.date))
      dates.value = Array.from(dateSet).sort()
      allAvailableSlots.value = availableSlots
    } else {
      // Mock模式已禁用，提示用户
      ElMessage.warning('Mock模式已禁用，请确保后端服务正常运行')
      dates.value = []
      slots.value = []
      allAvailableSlots.value = []
      return
    }

    if (!selectedDate.value && dates.value.length > 0) {
      const today = toDay(new Date())
      const futureDate = dates.value.find(d => d >= today)
      selectedDate.value = futureDate || dates.value[0]
    }

    updateSlots()
  } catch (e) {
    console.error('加载排班数据失败:', e)
    dates.value = []
    slots.value = []
    allAvailableSlots.value = []
    ElMessage.error('加载排班数据失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

function updateSlots() {
  if (!selectedDate.value) {
    slots.value = []
    return
  }

  const dayStr = toDay(selectedDate.value)
  slots.value = allAvailableSlots.value.filter(s => toDay(s.date) === dayStr)
}

function openConfirmDialog(slot: any) {
  if (isAvoidedByCollege(slot)) {
    ElMessage.warning('当前学生所属学院被设置为回避，无法预约该时段')
    return
  }

  if (isOnlyCollegeBlocked(slot)) {
    ElMessage.warning('当前时段仅对本学院开放')
    return
  }

  selectedSlot.value = slot
  confirmDialogVisible.value = true
}

async function confirmAppointment() {
  if (!selectedSlot.value) return

  submitting.value = true

  try {
    if (useBackendAppointment) {
      const body = defaultSubmitBodyFromSlot(selectedSlot.value)
      const res: any = await submitAppointment(body)
      const parsed = parseAppointmentSubmitData(res?.data)
      if (res?.code === 200 && parsed.ok) {
        ElMessage.success(parsed.message || '预约成功')
        confirmDialogVisible.value = false
        // 后端 submit 未返回 appointmentId，跳转列表页
        router.push('/my-appointment')
      } else {
        ElMessage.error(parsed.message || res?.msg || '预约失败')
      }
    } else {
      ElMessage.warning('Mock模式已禁用，请使用后端接口')
    }
  } catch (e: any) {
    console.error('预约创建失败:', e)
    ElMessage.error(e.message || '预约创建失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

function goToAppointments() {
  router.push('/my-appointment')
}

function isOnlyCollegeBlocked(row: any) {
  if (!row || !row.onlyCollege) return false
  const studentCollege = localStorage.getItem('student_college') || ''
  return !studentCollege || studentCollege !== (row.counselorCollege || '')
}

function isAvoidedByCollege(row: any) {
  const studentCollegeId = localStorage.getItem('student_college_id') || ''
  if (!studentCollegeId) return false

  if (Array.isArray(row.avoid_colleges)) {
    return row.avoid_colleges.includes(studentCollegeId)
  }

  return false
}

onMounted(async () => {
  studentId.value = resolveBackendUserIdForAppointmentApi()
  currentWeekStart.value = getWeekStart(new Date())

  // 获取学期信息
  try {
    const semRes = await request.get('/api/semester/current')
    semesterInfo.value = {
      start: semRes.data?.start || semRes.data?.startDate,
      end: semRes.data?.end || semRes.data?.endDate
    }
  } catch (e) {
    console.warn('获取学期信息失败，使用默认值')
    semesterInfo.value = {
      start: '2026-03-01',
      end: '2026-07-10'
    }
  }

  await refreshSchedule()

  scheduleUpdateHandler = async () => {
    await refreshSchedule()
  }

  window.addEventListener('schedule-updated', scheduleUpdateHandler)
})

onUnmounted(() => {
  if (scheduleUpdateHandler) {
    window.removeEventListener('schedule-updated', scheduleUpdateHandler)
  }
})

watch(selectedDate, () => {
  updateSlots()
})
</script>

<style scoped>
.select-slot-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
}

.main-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 24px;
  color: #409eff;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.content-wrapper {
  padding: 8px 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.section-title .el-icon {
  color: #409eff;
}

.calendar-section {
  margin-bottom: 8px;
}

.calendar-container {
  background: #fafbfc;
  border-radius: 12px;
  padding: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.current-month {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  border: 2px solid transparent;
}

.calendar-day:hover:not(.is-disabled) {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.calendar-day.is-selected {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-color: #409eff;
}

.calendar-day.is-selected .day-week,
.calendar-day.is-selected .day-date,
.calendar-day.is-selected .slot-count {
  color: #fff;
}

.calendar-day.is-today:not(.is-selected) {
  border-color: #67c23a;
}

.calendar-day.is-today:not(.is-selected) .day-date {
  color: #67c23a;
  font-weight: 600;
}

.calendar-day.is-disabled {
  background: #f5f7fa;
  cursor: not-allowed;
  opacity: 0.6;
}

.calendar-day.has-slots:not(.is-selected) {
  background: #f0f9eb;
}

.day-week {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.day-date {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.day-indicator {
  font-size: 11px;
}

.slot-count {
  color: #67c23a;
}

.no-slot {
  color: #c0c4cc;
}

.filter-section {
  margin-bottom: 8px;
}

.filter-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.slots-section {
  min-height: 200px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.loading-state .el-icon,
.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.loading-state .is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-state p {
  margin: 0 0 12px;
  font-size: 14px;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.slot-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.slot-card:hover:not(.is-avoided):not(.is-college-only) {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.slot-card.is-avoided,
.slot-card.is-college-only {
  background: #fef0f0;
  border-color: #fde2e2;
  cursor: not-allowed;
}

.slot-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.slot-time .el-icon {
  color: #409eff;
}

.slot-counselor {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.counselor-avatar {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  font-weight: 500;
}

.counselor-info {
  flex: 1;
}

.counselor-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.counselor-title {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.slot-tags {
  margin-bottom: 12px;
}

.slot-action {
  text-align: right;
}

.confirm-content {
  padding: 8px 0;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.confirm-item:last-of-type {
  border-bottom: none;
}

.confirm-label {
  color: #909399;
}

.confirm-value {
  color: #303133;
  font-weight: 500;
}

:deep(.el-card__header) {
  padding: 16px 24px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-card__body) {
  padding: 24px;
}

:deep(.el-divider) {
  margin: 20px 0;
}

@media (max-width: 768px) {
  .select-slot-page {
    padding: 12px;
  }

  .calendar-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .calendar-day {
    padding: 8px 4px;
  }

  .day-date {
    font-size: 16px;
  }

  .day-indicator {
    font-size: 10px;
  }

  .slots-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
