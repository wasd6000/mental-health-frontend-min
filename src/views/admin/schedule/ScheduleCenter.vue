<template>
  <div class="schedule">
    <div class="page-head">
      <div>
        <h2>心理中心 - 智能排班</h2>
        <p class="page-desc">可视化排班管理，支持按周/按日查看和批量生成</p>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-select v-model="campus" placeholder="选择校区" style="width: 150px">
        <el-option label="莲湖校区" value="莲湖校区" />
        <el-option label="南坝校区" value="南坝校区" />
      </el-select>

      <el-date-picker
        v-model="viewDate"
        type="date"
        placeholder="选择日期"
        value-format="YYYY-MM-DD"
        style="width: 160px"
      />

      <el-button @click="prevWeek">
        <el-icon><ArrowLeft /></el-icon>上一周
      </el-button>
      <el-button @click="toToday">📅 今天</el-button>
      <el-button @click="nextWeek">
        下一周<el-icon><ArrowRight /></el-icon>
      </el-button>

      <el-button @click="viewMode = 'day'">按日查看</el-button>
      <el-button @click="viewMode = 'week'">按周查看</el-button>

      <el-button type="primary" @click="openBatchDialog">批量生成排班</el-button>

      <el-button type="success" @click="saveTemplateDialogVisible = true">保存为模板</el-button>

      <el-button type="warning" @click="applyTemplateDialogVisible = true">应用模板</el-button>

      <el-button :icon="Refresh" @click="loadSchedule">刷新</el-button>
    </div>

    <div v-if="viewMode === 'week'" class="week-title">
      当前周：{{ weekRange() }}
    </div>

    <!-- 可视化排班表 -->
    <div class="schedule-grid-wrapper" v-loading="loading">
      <table class="schedule-grid">
        <thead>
          <tr>
            <th class="time-header">时间段</th>
            <th v-for="day in displayDays" :key="day.date">
              {{ day.label }}<br />{{ day.date }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="time in periods" :key="time">
            <td class="time-cell">{{ time }}</td>
            <td
              v-for="day in displayDays"
              :key="day.date + '-' + time"
              :class="getCellClass(day.date, time)"
              @click="openCounselorDialog(day.date, time)"
            >
              <div v-if="getSchedules(day.date, time).length > 0" class="counselor-list">
                <div
                  v-for="s in getSchedules(day.date, time)"
                  :key="s.id"
                  class="counselor-tag"
                  :class="{ 'on-leave': isOnLeave(day.date, time, s.counselorId) }"
                >
                  <span class="name">{{ s.counselorName }}</span>
                  <span v-if="isOnLeave(day.date, time, s.counselorId)" class="leave-mark">假</span>
                </div>
              </div>
              <div v-else class="empty-cell">点击设置</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 选择咨询师对话框 -->
    <el-dialog v-model="counselorDialogVisible" title="管理排班" width="450px">
      <div class="current-schedules" v-if="currentCellSchedules.length > 0">
        <div class="section-title">当前排班</div>
        <div class="schedule-list">
          <div
            v-for="s in currentCellSchedules"
            :key="s.id"
            class="schedule-item"
            :class="{ 'on-leave': isOnLeave(currentCell.date, currentCell.time, s.counselorId) }"
          >
            <span class="counselor-name">{{ s.counselorName }}</span>
            <span v-if="isOnLeave(currentCell.date, currentCell.time, s.counselorId)" class="leave-badge">请假中</span>
            <el-button type="danger" link size="small" @click="removeSchedule(s.id)">删除</el-button>
          </div>
        </div>
      </div>

      <div class="add-schedule-section">
        <div class="section-title">添加排班</div>
        <el-select v-model="selectedCounselorId" placeholder="选择咨询师" style="width: 100%">
          <el-option
            v-for="c in availableCounselorsForCell"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          />
        </el-select>
      </div>

      <template #footer>
        <el-button @click="counselorDialogVisible = false">关闭</el-button>
        <el-button type="primary" :disabled="!selectedCounselorId" @click="confirmCounselor">添加</el-button>
      </template>
    </el-dialog>

    <!-- 批量生成排班对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量生成排班" width="600px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="开始日期" required>
          <el-date-picker
            v-model="batchForm.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期" required>
          <el-date-picker
            v-model="batchForm.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="选择咨询师" required>
          <el-select-v2
            v-model="batchForm.counselorIds"
            :options="counselorOptions"
            placeholder="选择咨询师（可多选，留空则选择全部）"
            multiple
            clearable
            :props="{ multiple: true }"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="使用模板">
          <el-select v-model="batchForm.templateId" placeholder="选择模板（可选）" style="width: 100%" clearable>
            <el-option
              v-for="t in templateList"
              :key="t.id"
              :label="t.name"
              :value="t.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="重复设置">
          <el-checkbox v-model="batchForm.skipExisting">跳过已存在的排班</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchLoading" @click="confirmBatch">生成</el-button>
      </template>
    </el-dialog>

    <!-- 保存模板对话框 -->
    <el-dialog v-model="saveTemplateDialogVisible" title="保存为模板" width="400px">
      <el-form :model="templateForm">
        <el-form-item label="模板名称" required>
          <el-input v-model="templateForm.name" placeholder="例如：第8周排班模板" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="saveTemplateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>

    <!-- 应用模板对话框 -->
    <el-dialog v-model="applyTemplateDialogVisible" title="应用模板" width="500px">
      <el-table :data="templateList" @row-click="selectTemplate" highlight-current-row>
        <el-table-column prop="name" label="模板名称" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click.stop="removeTemplate(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="applyTemplateDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedTemplateId" @click="applySelectedTemplate">应用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Refresh, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCounselorList,
  getScheduleList,
  createSchedule,
  deleteSchedule,
  clearScheduleByDate,
  saveWeekTemplate,
  getTemplateList,
  applyTemplate,
  deleteTemplate,
  batchCreateSchedule
} from '../../../api/scheduleApi'
import { getApprovedLeaveList } from '../../../api/leaveApi.js'

// ===== 状态定义 =====
const loading = ref(false)
const campus = ref('莲湖校区')
const viewDate = ref(new Date().toISOString().slice(0, 10))
const viewMode = ref('week') // week | day

const counselors = ref([])
const schedule = ref([])
const approvedLeaves = ref([])
const templateList = ref([])
const selectedCounselorId = ref('')
const currentCell = ref({ date: '', time: '' })

// 对话框
const counselorDialogVisible = ref(false)
const batchDialogVisible = ref(false)
const saveTemplateDialogVisible = ref(false)
const applyTemplateDialogVisible = ref(false)
const batchLoading = ref(false)

// 表单
const batchForm = ref({
  startDate: '',
  endDate: '',
  templateId: '',
  counselorIds: [],
  skipExisting: true
})
const templateForm = ref({ name: '' })
const selectedTemplateId = ref('')

// 时间段
const periods = ref([
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00'
])

// ===== 计算属性 =====
const weekDays = ['周一', '周二', '周三', '周四', '周五']

const displayDays = computed(() => {
  if (viewMode.value === 'week') {
    return getWeekDates()
  } else {
    return [{ label: '选中日期', date: viewDate.value }]
  }
})

// 咨询师选项（用于多选下拉框）
const counselorOptions = computed(() => {
  return counselors.value.map(c => ({
    label: c.name,
    value: c.id
  }))
})

// ===== 工具函数 =====
function toDay(d) {
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt.getTime())) return ''
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getWeekDates() {
  const base = viewDate.value ? new Date(viewDate.value) : new Date()
  const day = base.getDay()
  const monday = new Date(base)
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(base.getDate() + diff)

  const arr = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    arr.push({
      label: weekDays[i],
      date: toDay(d),
    })
  }
  return arr
}

function weekRange() {
  const arr = getWeekDates()
  if (!arr.length) return ''
  return `${arr[0].date} ~ ${arr[4].date}`
}

// ===== 数据加载 =====
async function loadCounselors() {
  try {
    const res = await getCounselorList({ page: 1, pageSize: 100 })
    console.log('咨询师列表响应:', res)
    if (res?.code === 200 && res.data) {
      const list = res.data.list || res.data.records || []
      // 统一字段名映射
      counselors.value = list.map(item => ({
        id: item.id || item.counselorId || item.counselor_id,
        name: item.name || item.counselorName || item.counselor_name || item.realName || item.real_name || item.username
      })).filter(c => c.id && c.name)
      console.log('加载咨询师列表:', counselors.value.length, '人', counselors.value)
    }
  } catch (e) {
    console.error('加载咨询师列表失败:', e)
    ElMessage.error('加载咨询师列表失败')
  }
}

async function loadSchedule() {
  loading.value = true
  try {
    const weekDates = getWeekDates()
    const startDate = weekDates[0]?.date || viewDate.value
    const endDate = weekDates[weekDates.length - 1]?.date || viewDate.value

    const res = await getScheduleList({
      startDate,
      endDate,
      page: 1,
      pageSize: 500
    })

    if (res?.code === 200 && res.data) {
      // 转换后端数据格式
      const records = res.data.list || res.data.records || []
      schedule.value = records
        .filter(item => item != null) // 过滤 null 项
        .map(item => ({
          id: item.scheduleId || item.schedule_id,
          date: item.scheduleDate || item.schedule_date,
          time: `${item.startTime || item.start_time}-${item.endTime || item.end_time}`,
          counselorId: item.counselorId || item.counselor_id,
          counselorName: item.counselorName || item.counselor_name || getCounselorName(item.counselorId || item.counselor_id),
          status: item.status
        }))
      console.log('📊 加载排班数据：', schedule.value.length, '条')
    }

    // 加载请假数据
    try {
      const leaveRes = await getApprovedLeaveList({ startDate, endDate })
      if (leaveRes?.code === 200 && Array.isArray(leaveRes.data)) {
        approvedLeaves.value = leaveRes.data
        console.log('📋 已批准请假数据：', approvedLeaves.value.length, '条')
      }
    } catch (e) {
      console.warn('获取请假数据失败:', e)
      approvedLeaves.value = []
    }
  } catch (e) {
    console.error('加载排班数据失败:', e)
    ElMessage.error('加载排班数据失败')
    schedule.value = []
  } finally {
    loading.value = false
  }
}

function getCounselorName(id) {
  const c = counselors.value.find(c => c.id === id)
  return c ? c.name : id
}

async function loadTemplates() {
  try {
    // 从本地存储获取模板
    const templates = JSON.parse(localStorage.getItem(LOCAL_TEMPLATE_KEY) || '[]')
    templateList.value = templates
  } catch (e) {
    console.error('加载模板失败:', e)
    templateList.value = []
  }
}

// ===== 排班操作 =====
// 获取指定日期和时间段的所有排班（支持多咨询师）
function getSchedules(date, time) {
  return schedule.value.filter(i => i.date === date && i.time === time)
}

// 兼容旧代码，返回第一个排班
function getSchedule(date, time) {
  return getSchedules(date, time)[0]
}

// 当前单元格已设置的排班（计算属性需要在函数定义后）
const currentCellSchedules = computed(() => {
  if (!currentCell.value.date || !currentCell.value.time) return []
  return getSchedules(currentCell.value.date, currentCell.value.time)
})

// 当前单元格可添加的咨询师（排除已设置的）
const availableCounselorsForCell = computed(() => {
  const existingCounselorIds = new Set(currentCellSchedules.value.map(s => s.counselorId))
  return counselors.value.filter(c => c && c.id && !existingCounselorIds.has(c.id))
})

function isOnLeave(date, time, counselorId) {
  if (!counselorId) {
    // 如果没有指定咨询师，检查该时段是否有任何咨询师请假
    const schedules = getSchedules(date, time)
    return schedules.some(s => isOnLeave(date, time, s.counselorId))
  }

  const timeParts = time.split('-')
  if (timeParts.length !== 2) return false

  const slotStartTime = new Date(`${date}T${timeParts[0]}`)
  const slotEndTime = new Date(`${date}T${timeParts[1]}`)

  if (isNaN(slotStartTime.getTime()) || isNaN(slotEndTime.getTime())) return false

  return approvedLeaves.value.some(leave => {
    if (!leave || !leave.counselorId || !leave.startTime || !leave.endTime) return false
    if (leave.counselorId !== counselorId) return false
    const leaveStart = new Date(leave.startTime)
    const leaveEnd = new Date(leave.endTime)
    if (isNaN(leaveStart.getTime()) || isNaN(leaveEnd.getTime())) return false
    return slotStartTime < leaveEnd && slotEndTime > leaveStart
  })
}

function getCellClass(date, time) {
  const schedules = getSchedules(date, time)
  if (schedules.length === 0) return 'empty'
  const hasActiveSchedule = schedules.some(s => !isOnLeave(date, time, s.counselorId))
  if (!hasActiveSchedule) return 'on-leave'
  return 'has-schedule'
}

function openCounselorDialog(date, time) {
  currentCell.value = { date, time }
  selectedCounselorId.value = ''
  counselorDialogVisible.value = true
}

async function removeSchedule(scheduleId) {
  try {
    await deleteSchedule(scheduleId)
    ElMessage.success('已删除排班')
    await loadSchedule()
    window.dispatchEvent(new Event('schedule-updated'))
  } catch (e) {
    console.error('删除排班失败:', e)
    ElMessage.error('删除排班失败')
  }
}

async function confirmCounselor() {
  const { date, time } = currentCell.value
  const [startTime, endTime] = time.split('-')

  if (!selectedCounselorId.value) {
    ElMessage.warning('请选择咨询师')
    return
  }

  try {
    // 创建新排班
    const counselor = counselors.value.find(c => c.id === selectedCounselorId.value)
    if (!counselor) {
      ElMessage.error('未找到咨询师信息')
      return
    }

    await createSchedule({
      counselorId: selectedCounselorId.value,
      scheduleDate: date,
      startTime,
      endTime,
      availableSlots: 1,
      scheduleType: 'REGULAR',
      status: 1,
      reservationLocation: campus.value
    })
    ElMessage.success('排班添加成功')

    selectedCounselorId.value = ''
    await loadSchedule()

    // 派发事件通知学生端刷新
    window.dispatchEvent(new Event('schedule-updated'))
  } catch (e) {
    console.error('添加排班失败:', e)
    ElMessage.error(e?.message || '添加排班失败')
  }
}

// ===== 模板管理 =====
// ===== 模板管理 =====
// 本地存储模板的 key
const LOCAL_TEMPLATE_KEY = 'schedule_templates'

async function saveTemplate() {
  if (!templateForm.value.name) {
    ElMessage.warning('请输入模板名称')
    return
  }

  try {
    const weekDates = getWeekDates().map(i => i.date)
    const weekData = schedule.value.filter(i => weekDates.includes(i.date))

    if (weekData.length === 0) {
      ElMessage.warning('当前周没有排班数据，无法保存模板')
      return
    }

    // 从本地存储获取现有模板
    const existingTemplates = JSON.parse(localStorage.getItem(LOCAL_TEMPLATE_KEY) || '[]')

    // 创建新模板
    const newTemplate = {
      id: Date.now().toString(),
      name: templateForm.value.name,
      createTime: new Date().toISOString(),
      schedules: weekData
    }

    // 保存到本地存储
    existingTemplates.push(newTemplate)
    localStorage.setItem(LOCAL_TEMPLATE_KEY, JSON.stringify(existingTemplates))

    ElMessage.success('模板保存成功')
    saveTemplateDialogVisible.value = false
    templateForm.value.name = ''
    await loadTemplates()
  } catch (e) {
    console.error('保存模板失败:', e)
    ElMessage.error(e?.message || '保存模板失败')
  }
}

function selectTemplate(row) {
  selectedTemplateId.value = row.id
}

async function removeTemplate(id) {
  try {
    await ElMessageBox.confirm('确定删除该模板？', '删除确认', {
      type: 'warning'
    })

    // 从本地存储删除模板
    const existingTemplates = JSON.parse(localStorage.getItem(LOCAL_TEMPLATE_KEY) || '[]')
    const filtered = existingTemplates.filter(t => t.id !== id)
    localStorage.setItem(LOCAL_TEMPLATE_KEY, JSON.stringify(filtered))

    ElMessage.success('删除成功')
    await loadTemplates()
    if (selectedTemplateId.value === id) {
      selectedTemplateId.value = ''
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除模板失败:', e)
      ElMessage.error(e?.message || '删除失败')
    }
  }
}

async function applySelectedTemplate() {
  if (!selectedTemplateId.value) {
    ElMessage.warning('请选择要应用的模板')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定应用该模板？将按模板生成当前周的排班数据。',
      '应用模板确认',
      { type: 'warning' }
    )

    const template = templateList.value.find(t => t.id === selectedTemplateId.value)
    if (!template || !template.schedules) {
      throw new Error('模板数据不存在')
    }

    const weekDates = getWeekDates()
    let createdCount = 0

    // 遍历本周每一天
    for (const weekDay of weekDates) {
      const date = weekDay.date
      const dayOfWeek = new Date(date).getDay()

      // 获取模板中对应星期几的排班
      const templateDaySchedules = template.schedules.filter(s => {
        const templateDate = new Date(s.date)
        return templateDate.getDay() === dayOfWeek
      })

      // 创建排班
      for (const templateItem of templateDaySchedules) {
        const [startTime, endTime] = (templateItem.time || '09:00-10:00').split('-')
        try {
          await createSchedule({
            counselorId: templateItem.counselorId,
            scheduleDate: date,
            startTime: startTime || '09:00',
            endTime: endTime || '10:00',
            availableSlots: templateItem.availableSlots || 1,
            scheduleType: templateItem.scheduleType || 'REGULAR',
            status: 1,
            reservationLocation: templateItem.reservationLocation || campus.value
          })
          createdCount++
        } catch (err) {
          console.warn(`创建排班失败: ${date} ${templateItem.time}`, err)
        }
      }
    }

    ElMessage.success(`模板应用成功，共创建 ${createdCount} 条排班`)
    applyTemplateDialogVisible.value = false
    selectedTemplateId.value = ''
    await loadSchedule()
    window.dispatchEvent(new Event('schedule-updated'))
  } catch (e) {
    if (e !== 'cancel') {
      console.error('应用模板失败:', e)
      ElMessage.error(e?.message || '应用模板失败')
    }
  }
}

// ===== 批量生成 =====
function openBatchDialog() {
  batchForm.value = {
    startDate: '',
    endDate: '',
    templateId: '',
    counselorIds: [],
    skipExisting: true
  }
  batchDialogVisible.value = true
}

// 检查排班是否已存在
function isScheduleExists(counselorId, date, startTime, endTime) {
  return schedule.value.some(s =>
    s.counselorId === counselorId &&
    s.date === date &&
    s.time === `${startTime}-${endTime}`
  )
}

async function confirmBatch() {
  if (!batchForm.value.startDate || !batchForm.value.endDate) {
    ElMessage.warning('请选择开始日期和结束日期')
    return
  }

  // 确定要生成排班的咨询师列表
  let targetCounselors = []
  if (batchForm.value.counselorIds && batchForm.value.counselorIds.length > 0) {
    targetCounselors = counselors.value.filter(c => batchForm.value.counselorIds.includes(c.id))
  } else {
    targetCounselors = counselors.value.filter(c => c && c.id)
  }

  if (targetCounselors.length === 0) {
    ElMessage.warning('请至少选择一位咨询师')
    return
  }

  batchLoading.value = true
  let createdCount = 0
  let skippedCount = 0
  let failedCount = 0

  try {
    const start = new Date(batchForm.value.startDate)
    const end = new Date(batchForm.value.endDate)

    if (batchForm.value.templateId) {
      // ===== 使用模板批量生成 =====
      const template = templateList.value.find(t => t.id === batchForm.value.templateId)
      if (!template || !template.schedules) {
        throw new Error('模板数据不存在')
      }

      // 按星期几分组模板排班
      const weekdayConfigs = new Map() // dayOfWeek -> [{startTime, endTime, ...}]
      template.schedules.forEach(s => {
        const templateDate = new Date(s.date)
        const dayOfWeek = templateDate.getDay() === 0 ? 7 : templateDate.getDay() // 0=周日->7
        if (!weekdayConfigs.has(dayOfWeek)) {
          weekdayConfigs.set(dayOfWeek, [])
        }
        const [startTime, endTime] = (s.time || '09:00-10:00').split('-')
        weekdayConfigs.get(dayOfWeek).push({
          startTime: startTime || '09:00',
          endTime: endTime || '10:00',
          availableSlots: s.availableSlots || 1,
          slotDuration: '50',
          reservationLocation: s.reservationLocation || campus.value
        })
      })

      // 为每个咨询师调用批量创建接口
      for (const counselor of targetCounselors) {
        try {
          // 检查排班是否已存在
          if (batchForm.value.skipExisting) {
            const existingSchedules = schedule.value.filter(s => s.counselorId === counselor.id)
            if (existingSchedules.length > 0) {
              skippedCount++
              continue
            }
          }

          await batchCreateSchedule({
            counselorId: counselor.id,
            startDate: batchForm.value.startDate,
            endDate: batchForm.value.endDate,
            schedules: Array.from(weekdayConfigs.entries()).flatMap(([dayOfWeek, configs]) =>
              configs.map(cfg => ({ ...cfg, dayOfWeek }))
            )
          })
          createdCount++
        } catch (err) {
          failedCount++
          console.warn(`为咨询师 ${counselor.name} 批量创建排班失败:`, err)
        }
      }

      ElMessage.success(`批量生成完成！成功: ${createdCount} 位咨询师, 跳过: ${skippedCount}, 失败: ${failedCount}`)
    } else {
      // ===== 直接批量创建默认排班 =====
      // 按星期几分组时间段
      const weekdayTimeConfigs = new Map()
      let current = new Date(start)
      while (current <= end) {
        const jsDay = current.getDay() // 0=周日, 1=周一...
        const dayOfWeek = jsDay === 0 ? 7 : jsDay // 转换为 1-7（周一=1, 周日=7）

        if (jsDay !== 0 && jsDay !== 6) { // 跳过周末
          if (!weekdayTimeConfigs.has(dayOfWeek)) {
            weekdayTimeConfigs.set(dayOfWeek, [])
          }
          for (const time of periods.value) {
            const [startTime, endTime] = time.split('-')
            weekdayTimeConfigs.get(dayOfWeek).push({
              startTime,
              endTime,
              availableSlots: 1,
              slotDuration: '50',
              reservationLocation: campus.value
            })
          }
        }
        current.setDate(current.getDate() + 1)
      }

      // 为每个咨询师调用批量创建接口
      for (const counselor of targetCounselors) {
        try {
          await batchCreateSchedule({
            counselorId: counselor.id,
            startDate: batchForm.value.startDate,
            endDate: batchForm.value.endDate,
            schedules: Array.from(weekdayTimeConfigs.entries()).flatMap(([dayOfWeek, configs]) =>
              configs.map(cfg => ({ ...cfg, dayOfWeek }))
            )
          })
          createdCount++
        } catch (err) {
          failedCount++
          console.warn(`为咨询师 ${counselor.name} 批量创建排班失败:`, err)
        }
      }

      ElMessage.success(`批量生成完成！成功: ${createdCount} 位咨询师, 失败: ${failedCount}`)
    }

    batchDialogVisible.value = false
    viewDate.value = batchForm.value.startDate
    await loadSchedule()
    window.dispatchEvent(new Event('schedule-updated'))
  } catch (e) {
    console.error('批量生成失败:', e)
    ElMessage.error(e?.message || '批量生成失败')
  } finally {
    batchLoading.value = false
  }
}

// ===== 日期导航 =====
function prevWeek() {
  const d = new Date(viewDate.value)
  d.setDate(d.getDate() - 7)
  viewDate.value = toDay(d)
  loadSchedule()
}

function nextWeek() {
  const d = new Date(viewDate.value)
  d.setDate(d.getDate() + 7)
  viewDate.value = toDay(d)
  loadSchedule()
}

function toToday() {
  viewDate.value = toDay(new Date())
  loadSchedule()
}

// ===== 生命周期 =====
onMounted(async () => {
  await Promise.all([loadCounselors(), loadSchedule(), loadTemplates()])
})
</script>

<style scoped>
.schedule {
  padding: 20px;
  max-width: 1400px;
}

.page-head {
  margin-bottom: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.page-head h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.week-title {
  margin-bottom: 16px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.schedule-grid-wrapper {
  margin-top: 16px;
  overflow-x: auto;
}

.schedule-grid {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e2e8f0;
}

.schedule-grid th,
.schedule-grid td {
  border: 1px solid #e2e8f0;
  padding: 8px;
  text-align: center;
}

.schedule-grid th {
  background: #f8fafc;
  font-weight: 600;
  color: #1e293b;
}

.schedule-grid .time-header,
.schedule-grid .time-cell {
  background: #f8fafc;
  font-weight: 500;
  width: 100px;
}

.schedule-grid td {
  min-width: 120px;
  min-height: 60px;
  cursor: pointer;
  transition: all 0.2s;
}

.schedule-grid td:hover {
  background: #f1f5f9;
}

.schedule-grid td.empty {
  color: #94a3b8;
}

.schedule-grid td.has-schedule {
  background: #dcfce7;
  color: #166534;
}

.schedule-grid td.on-leave {
  background: #fee2e2;
  color: #991b1b;
  text-decoration: line-through;
}

.schedule-grid td .counselor-info {
  text-align: center;
}

.schedule-grid td .counselor-info .name {
  font-weight: 500;
  font-size: 14px;
}

.schedule-grid td .leave-badge {
  font-size: 11px;
  color: #dc2626;
  margin-top: 2px;
}

.schedule-grid td .empty-cell {
  font-size: 12px;
  color: #94a3b8;
}

/* 多咨询师排班列表 */
.counselor-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.counselor-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 8px;
  background: #dcfce7;
  border-radius: 4px;
  font-size: 13px;
  color: #166534;
}

.counselor-tag.on-leave {
  background: #fee2e2;
  color: #991b1b;
  text-decoration: line-through;
}

.counselor-tag .leave-mark {
  font-size: 10px;
  background: #dc2626;
  color: white;
  padding: 0 4px;
  border-radius: 2px;
}

/* 对话框样式 */
.current-schedules {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 12px;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.schedule-item.on-leave {
  background: #fee2e2;
  border-color: #fecaca;
}

.schedule-item .counselor-name {
  font-weight: 500;
  color: #1e293b;
}

.schedule-item .leave-badge {
  font-size: 11px;
  color: #dc2626;
  margin-left: 8px;
}

.add-schedule-section {
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.cell-content {
  min-height: 60px;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.cell-content:hover {
  background: #f1f5f9;
}

.cell-content.empty {
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell-content.has-schedule {
  background: #dcfce7;
  color: #166534;
}

.cell-content.on-leave {
  background: #fee2e2;
  color: #991b1b;
  text-decoration: line-through;
}

.counselor-info {
  text-align: center;
}

.counselor-info .name {
  font-weight: 500;
  font-size: 14px;
}

.counselor-info .status {
  font-size: 12px;
  margin-top: 4px;
}

.empty-cell {
  font-size: 12px;
  color: #94a3b8;
}

.schedule-table {
  margin-top: 16px;
}
</style>
