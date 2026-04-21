<template>
  <div class="schedule">
    <div class="page-head">
      <div>
        <h2>智能排班管理</h2>
        <p class="page-desc">可视化排班、批量生成、模板管理，支持按周/按日查看。</p>
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

      <el-button @click="prevWeek">⬅ 上一周</el-button>
      <el-button @click="toToday">📅 今天</el-button>
      <el-button @click="nextWeek">下一周 ➡</el-button>

      <el-button @click="viewMode='day'">按日查看</el-button>
      <el-button @click="viewMode='week'">按周查看</el-button>

      <el-button type="primary" @click="openBatch">批量生成排班</el-button>

      <el-button type="success" @click="saveTemplateDialogVisible = true">保存为模板</el-button>

      <el-button type="warning" @click="applyTemplateDialogVisible = true">应用模板</el-button>

      <el-button :icon="Refresh" @click="loadSchedule">刷新</el-button>
    </div>

    <div v-if="viewMode==='week'" class="week-title">
      当前周：{{ weekRange() }}
    </div>

    <!-- 可视化排班表 -->
    <table class="grid" v-loading="loading">
      <!-- ===== 表头 ===== -->
      <thead>
        <tr>
          <th>时间</th>

          <template v-if="viewMode==='week'">
            <th v-for="d in week" :key="d">
              {{ d.label }}
            </th>
          </template>

          <th v-else>
            {{ viewDate }}
          </th>
        </tr>

        <tr v-if="viewMode==='week'">
          <th>日期</th>

          <th v-for="item in getWeekDates()" :key="item.date">
            {{ item.date }}
          </th>
        </tr>
      </thead>

      <!-- ===== 表格主体 ===== -->
      <tbody>
        <tr v-for="t in periods" :key="t">
          <td>{{ t }}</td>

          <td
            v-for="col in (viewMode==='week' ? getWeekDates() : [{ date: viewDate }])"
            :key="col.date"
            @click="openCounselorDialog(col, t)"
            :class="getCell(col, t)"
          >
            {{ show(col, t) }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 选择咨询师对话框 -->
    <el-dialog v-model="counselorDialogVisible" title="选择咨询师" width="400px">
      <el-select v-model="selectedCounselorId" placeholder="请选择咨询师" style="width: 100%">
        <el-option label="清空" value="" />
        <el-option
          v-for="c in counselors"
          :key="c.id"
          :label="c.name"
          :value="c.id"
        />
      </el-select>
      <template #footer>
        <el-button @click="counselorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCounselor">确定</el-button>
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

    <!-- 批量生成排班对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量生成排班" width="500px">
      <el-form :model="batchForm">
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
        <el-form-item label="使用模板">
          <el-select v-model="batchForm.templateId" placeholder="选择模板（可选）" style="width: 100%">
            <el-option
              v-for="t in templateList"
              :key="t.id"
              :label="t.name"
              :value="t.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchLoading" @click="confirmBatch">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCounselorList,
  getScheduleList,
  updateSchedule,
  deleteSchedule,
  clearScheduleByDate,
  saveWeekTemplate,
  getTemplateList,
  applyTemplate,
  deleteTemplate,
  batchCreateSchedule
} from '../../../api/scheduleApi'

// ===== 状态定义 =====
const loading = ref(false)
const campus = ref('莲湖校区')
const viewDate = ref(new Date().toISOString().slice(0, 10))
const viewMode = ref('week') // week | day

const counselors = ref([])
const schedule = ref([])
const templateList = ref([])
const selectedCounselorId = ref('')
const currentCell = ref({ date: '', time: '' })

// 对话框
const counselorDialogVisible = ref(false)
const saveTemplateDialogVisible = ref(false)
const applyTemplateDialogVisible = ref(false)
const batchDialogVisible = ref(false)
const batchLoading = ref(false)

// 表单
const templateForm = ref({ name: '' })
const batchForm = ref({
  startDate: '',
  endDate: '',
  templateId: ''
})
const selectedTemplateId = ref('')

// 时间段（可根据后端配置动态获取）
const periods = ref([
  '08:00-09:00',
  '09:00-10:00',
  '10:00-11:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00'
])

// ===== 加载数据 =====
async function loadCounselors() {
  try {
    const res = await getCounselorList({ page: 1, pageSize: 100 })
    if (res?.code === 200 && res.data) {
      counselors.value = res.data.list || res.data.records || []
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
      schedule.value = res.data.list || res.data.records || []
      console.log('📊 加载排班数据：', schedule.value.length, '条')
    }
  } catch (e) {
    console.error('加载排班数据失败:', e)
    ElMessage.error('加载排班数据失败')
    schedule.value = []
  } finally {
    loading.value = false
  }
}

async function loadTemplates() {
  try {
    const res = await getTemplateList({ page: 1, pageSize: 50 })
    if (res?.code === 200 && res.data) {
      templateList.value = res.data.list || res.data.records || []
    }
  } catch (e) {
    console.error('加载模板列表失败:', e)
  }
}

// ===== 排班操作 =====
const show = (col, t) => {
  const dateKey = col.date
  const s = schedule.value.find(i => i.date === dateKey && i.time === t)
  return s ? s.counselorName : ''
}

const getCell = (col, t) => {
  const dateKey = col.date
  const s = schedule.value.find(i => i.date === dateKey && i.time === t)
  if (!s) return 'free'
  return 'busy'
}

const openCounselorDialog = (col, t) => {
  currentCell.value = { date: col.date, time: t }
  const s = schedule.value.find(i => i.date === col.date && i.time === t)
  selectedCounselorId.value = s ? s.counselorId : ''
  counselorDialogVisible.value = true
}

const confirmCounselor = async () => {
  const { date, time } = currentCell.value

  try {
    if (!selectedCounselorId.value) {
      // 清空排班
      const existingSchedule = schedule.value.find(i => i.date === date && i.time === time)
      if (existingSchedule) {
        await deleteSchedule(existingSchedule.id)
        ElMessage.success('已清空排班')
      }
    } else {
      // 更新排班
      const counselor = counselors.value.find(c => c.id === selectedCounselorId.value)
      if (!counselor) {
        ElMessage.error('未找到咨询师信息')
        return
      }

      const existingSchedule = schedule.value.find(i => i.date === date && i.time === time)
      if (existingSchedule) {
        // 更新现有排班
        await updateSchedule(existingSchedule.id, {
          counselorId: selectedCounselorId.value,
          counselorName: counselor.name,
          date,
          time
        })
      } else {
        // 创建新排班
        await updateSchedule(null, {
          counselorId: selectedCounselorId.value,
          counselorName: counselor.name,
          date,
          time
        })
      }
      ElMessage.success('排班更新成功')
    }

    counselorDialogVisible.value = false
    await loadSchedule()

    // 派发事件通知学生端刷新
    window.dispatchEvent(new Event('schedule-updated'))
  } catch (e) {
    console.error('更新排班失败:', e)
    ElMessage.error(e?.message || '更新排班失败')
  }
}

// ===== 模板管理 =====
const saveTemplate = async () => {
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

    await saveWeekTemplate({
      name: templateForm.value.name,
      schedules: weekData
    })

    ElMessage.success('模板保存成功')
    saveTemplateDialogVisible.value = false
    templateForm.value.name = ''
    await loadTemplates()
  } catch (e) {
    console.error('保存模板失败:', e)
    ElMessage.error(e?.message || '保存模板失败')
  }
}

const selectTemplate = (row) => {
  selectedTemplateId.value = row.id
}

const removeTemplate = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该模板？', '删除确认', {
      type: 'warning'
    })
    await deleteTemplate(id)
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

const applySelectedTemplate = async () => {
  if (!selectedTemplateId.value) {
    ElMessage.warning('请选择要应用的模板')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定应用该模板？将覆盖当前周的排班数据。',
      '应用模板确认',
      { type: 'warning' }
    )

    const weekDates = getWeekDates()
    await applyTemplate({
      templateId: selectedTemplateId.value,
      startDate: weekDates[0].date,
      endDate: weekDates[weekDates.length - 1].date
    })

    ElMessage.success('模板应用成功')
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
const openBatch = () => {
  batchForm.value = {
    startDate: '',
    endDate: '',
    templateId: ''
  }
  batchDialogVisible.value = true
}

const confirmBatch = async () => {
  if (!batchForm.value.startDate || !batchForm.value.endDate) {
    ElMessage.warning('请选择开始日期和结束日期')
    return
  }

  batchLoading.value = true
  try {
    if (batchForm.value.templateId) {
      // 使用模板批量生成
      await applyTemplate({
        templateId: batchForm.value.templateId,
        startDate: batchForm.value.startDate,
        endDate: batchForm.value.endDate
      })
      ElMessage.success('已按模板生成排班')
    } else {
      ElMessage.warning('请先保存并选择模板')
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

// ===== 日期工具函数 =====
const prevWeek = () => {
  const d = new Date(viewDate.value)
  d.setDate(d.getDate() - 7)
  viewDate.value = d.toISOString().slice(0, 10)
  loadSchedule()
}

const nextWeek = () => {
  const d = new Date(viewDate.value)
  d.setDate(d.getDate() + 7)
  viewDate.value = d.toISOString().slice(0, 10)
  loadSchedule()
}

const toToday = () => {
  viewDate.value = new Date().toISOString().slice(0, 10)
  loadSchedule()
}

const weekRange = () => {
  const arr = getWeekDates()
  if (!arr.length) return ''
  return `${arr[0].date} ~ ${arr[4].date}`
}

const getWeekDates = () => {
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
      label: ['周一', '周二', '周三', '周四', '周五'][i],
      date: d.toISOString().slice(0, 10),
    })
  }
  return arr
}

// ===== 生命周期 =====
onMounted(async () => {
  await Promise.all([loadCounselors(), loadSchedule(), loadTemplates()])
})
</script>

<style scoped>
.schedule {
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

.grid {
  width: 100%;
  border-collapse: collapse;
}

.grid td, .grid th {
  border: 1px solid #e2e8f0;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  min-height: 50px;
}

.grid th {
  background: #f8fafc;
  font-weight: 600;
  color: #1e293b;
}

.busy {
  background: #dcfce7;
  color: #166534;
  font-weight: 500;
}

.free {
  background: #fff;
}

.free:hover {
  background: #f1f5f9;
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
</style>
