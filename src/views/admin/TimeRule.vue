<template>
  <div class="time-rule-page">
    <div class="page-head">
      <div>
        <h2>预约规则配置</h2>
        <p class="page-desc">配置咨询师排班规则，支持筛选、分页、新增、编辑与删除。</p>
      </div>
      <el-button v-if="canEdit" type="primary" @click="openCreateDialog">新增排班规则</el-button>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters">
        <el-form-item label="咨询师">
          <el-select v-model="filters.counselorId" placeholder="全部咨询师" clearable style="width: 180px">
            <el-option
              v-for="(item, idx) in consultantOptions"
              :key="item.id + '-' + idx"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="filters.date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="pagedList" v-loading="loading" style="width: 100%">
        <el-table-column prop="counselorName" label="咨询师" min-width="140" />
        <el-table-column prop="date" label="日期" width="140" />
        <el-table-column prop="time" label="时间段" width="180" />
        <el-table-column prop="maxAppointments" label="可预约人数" width="120">
          <template #default="{ row }">{{ row?.maxAppointments ?? 1 }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row?.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row?.status === 'enabled' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" v-if="canEdit">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="filteredList.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑排班规则' : '新增排班规则'" width="560px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="咨询师" prop="counselorId" v-if="!isEdit">
          <el-select v-model="form.counselorId" placeholder="请选择咨询师" style="width: 100%">
            <el-option
              v-for="(item, idx) in consultantOptions"
              :key="item.id + '-' + idx"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="咨询师" v-else>
          <el-input :model-value="form.counselorName" disabled />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
            style="width: 100%"
            @change="onDateChange"
          />
        </el-form-item>
        <el-form-item label="时间段" prop="time">
          <el-select v-model="form.time" placeholder="请选择时间段" style="width: 100%" filterable>
            <el-option v-for="slot in slotOptions" :key="slot" :label="slot" :value="slot" />
          </el-select>
        </el-form-item>
        <el-form-item label="可预约人数" prop="maxAppointments" v-if="!isEdit">
          <el-input-number v-model="form.maxAppointments" :min="1" :max="20" />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="isEdit">
          <el-switch
            v-model="form.status"
            active-value="enabled"
            inactive-value="disabled"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { usePermission } from '../../hooks/usePermission'
import {
  getConsultantListAsync,
  getScheduleListAsync,
  createScheduleAsync,
  updateScheduleAsync,
  deleteScheduleAsync,
  getAppointmentSlotsAsync,
} from '../../api/appointment.ts'

type Consultant = { id: string; name: string }
type ScheduleItem = {
  id: string
  counselorId: string
  counselorName: string
  date: string
  time: string
  status: 'enabled' | 'disabled' | string
  maxAppointments?: number
}

const { can: canEdit, guard } = usePermission(['admin', 'center'])

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const page = ref(1)
const pageSize = ref(10)

const consultantOptions = ref<Consultant[]>([])
const allSchedules = ref<ScheduleItem[]>([])
const slotOptions = ref<string[]>([])

const filters = reactive({
  counselorId: '',
  date: '',
})

const form = reactive({
  id: '',
  counselorId: '',
  counselorName: '',
  date: '',
  time: '',
  status: 'enabled',
  maxAppointments: 1,
})

const formRules: FormRules = {
  counselorId: [{ required: true, message: '请选择咨询师', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  time: [{ required: true, message: '请选择时间段', trigger: 'change' }],
}

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

/** 对齐 /api/consultant/list：可能是 CounselorVO 或带 userVO 的嵌套结构 */
function normalizeConsultants(raw: unknown): Consultant[] {
  if (!Array.isArray(raw)) return []
  const out: Consultant[] = []
  for (const item of raw) {
    if (item == null || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const u = (o.userVO ?? o.userVo) as Record<string, unknown> | undefined
    const id = pickStr(o.id, o.counselorId, o.userId, u?.userId)
    const name = pickStr(o.name, o.realName, u?.realName, o.username, u?.username, id)
    if (!id) continue
    out.push({ id, name: name || id })
  }
  return out
}

function padTimePart(t: unknown): string {
  if (t == null) return ''
  const s = typeof t === 'string' ? t : String(t)
  return s.length >= 5 ? s.slice(0, 5) : s
}

/** 对齐 /api/schedule/list：counselor_schedule 扁平字段 */
function normalizeSchedules(raw: unknown): ScheduleItem[] {
  if (!Array.isArray(raw)) return []
  const out: ScheduleItem[] = []
  raw.forEach((item, idx) => {
    if (item == null || typeof item !== 'object') return
    const r = item as Record<string, unknown>
    const id = pickStr(r.schedule_id, r.scheduleId, r.id, `row-${idx}`)
    const counselorId = pickStr(r.counselor_id, r.counselorId, r.userId)
    let date = pickStr(r.schedule_date, r.scheduleDate, r.date)
    if (date && date.includes('T')) date = date.slice(0, 10)
    const st = padTimePart(r.start_time ?? r.startTime)
    const et = padTimePart(r.end_time ?? r.endTime)
    const time = st && et ? `${st}-${et}` : pickStr(r.time, r.timeSlot)
    const maxRaw = r.available_slots ?? r.availableSlots ?? r.maxAppointments
    const maxAppointments = Math.max(1, Number(maxRaw) || 1)
    const stt = r.status
    let status: string = 'enabled'
    if (stt === 0 || stt === '0' || stt === 'disabled') status = 'disabled'
    if (stt === 2 || stt === '2') status = 'disabled'
    out.push({
      id,
      counselorId,
      counselorName: pickStr(r.counselorName, r.counselor_name),
      date,
      time,
      status,
      maxAppointments,
    })
  })
  return out
}

function enrichScheduleCounselorNames() {
  const m = new Map(consultantOptions.value.map((c) => [c.id, c.name]))
  allSchedules.value = allSchedules.value.map((s) => ({
    ...s,
    counselorName: s.counselorName || m.get(s.counselorId) || s.counselorId || '—',
  }))
}

const filteredList = computed(() => {
  let list = allSchedules.value.filter((item) => item != null)
  if (filters.counselorId) {
    list = list.filter((item) => item.counselorId === filters.counselorId)
  }
  if (filters.date) {
    list = list.filter((item) => item.date === filters.date)
  }
  return list
})

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

watch([() => filters.counselorId, () => filters.date], () => {
  page.value = 1
})

async function loadConsultants() {
  try {
    const res = await getConsultantListAsync()
    consultantOptions.value = normalizeConsultants(res?.data)
  } catch (error) {
    consultantOptions.value = []
    ElMessage.error('获取咨询师列表失败')
  }
}

async function loadSchedules() {
  loading.value = true
  try {
    const week = filters.date || new Date().toISOString().slice(0, 10)
    const res = await getScheduleListAsync({ week })
    allSchedules.value = normalizeSchedules(res?.data)
  } catch (error) {
    allSchedules.value = []
    ElMessage.error('获取排班列表失败')
  } finally {
    loading.value = false
  }
}

async function loadSlots(date: string) {
  if (!date) {
    slotOptions.value = []
    return
  }
  try {
    const res = await getAppointmentSlotsAsync(date)
    slotOptions.value = Array.isArray(res?.data) ? res.data : []
  } catch (error) {
    slotOptions.value = []
    ElMessage.error('获取可预约时间段失败')
  }
}

function onSearch() {
  loadSchedules()
}

function onReset() {
  filters.counselorId = ''
  filters.date = ''
  page.value = 1
  loadSchedules()
}

function resetForm() {
  form.id = ''
  form.counselorId = ''
  form.counselorName = ''
  form.date = ''
  form.time = ''
  form.status = 'enabled'
  form.maxAppointments = 1
  slotOptions.value = []
}

function openCreateDialog() {
  if (!guard()) return
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

async function openEditDialog(row: ScheduleItem) {
  if (!guard() || row == null) return
  isEdit.value = true
  form.id = row.id
  form.counselorId = row.counselorId
  form.counselorName = row.counselorName
  form.date = row.date
  form.time = row.time
  form.status = row.status || 'enabled'
  form.maxAppointments = row.maxAppointments || 1
  dialogVisible.value = true
  await loadSlots(form.date)
}

async function onDateChange(date: string) {
  form.time = ''
  await loadSlots(date)
}

function parseRange(time: string): [number, number] | null {
  const parts = (time || '').split('-')
  if (parts.length !== 2) return null
  const start = toMinute(parts[0])
  const end = toMinute(parts[1])
  if (start >= end) return null
  return [start, end]
}

function toMinute(hhmm: string): number {
  const [hour, minute] = hhmm.split(':').map(Number)
  return hour * 60 + minute
}

function hasTimeConflict(): boolean {
  const targetRange = parseRange(form.time)
  if (!targetRange) return true

  const sameDayItems = allSchedules.value.filter((item) => {
    if (isEdit.value && item.id === form.id) return false
    return item.counselorId === form.counselorId && item.date === form.date
  })

  return sameDayItems.some((item) => {
    const currentRange = parseRange(item.time)
    if (!currentRange) return false
    return targetRange[0] < currentRange[1] && currentRange[0] < targetRange[1]
  })
}

function submitForm() {
  if (!guard()) return
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    if (hasTimeConflict()) {
      ElMessage.warning('当前时间段与已有排班冲突，请重新选择')
      return
    }

    submitting.value = true
    try {
      if (isEdit.value) {
        await updateScheduleAsync({
          id: form.id,
          date: form.date,
          time: form.time,
          status: form.status,
        })
        ElMessage.success('排班规则更新成功')
      } else {
        await createScheduleAsync({
          counselorId: form.counselorId,
          date: form.date,
          time: form.time,
        })
        ElMessage.success('排班规则新增成功')
      }
      dialogVisible.value = false
      await loadSchedules()
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '新增失败')
    } finally {
      submitting.value = false
    }
  })
}

function handleDelete(row: ScheduleItem) {
  if (!guard()) return
  ElMessageBox.confirm('确定删除该排班吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteScheduleAsync(row.id)
      ElMessage.success('删除成功')
      await loadSchedules()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

onMounted(async () => {
  try {
    await Promise.all([loadConsultants(), loadSchedules()])
    enrichScheduleCounselorNames()
  } catch {
    /* 单项加载内部已提示 */
  }
})
</script>

<style scoped>
.time-rule-page { max-width: 1100px; }

.page-head {
  margin-bottom: 16px;
  padding: 20px 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.page-head h2 {
  margin: 0 0 8px;
  color: #1e293b;
  font-size: 20px;
}

.page-desc {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 16px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.table-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
