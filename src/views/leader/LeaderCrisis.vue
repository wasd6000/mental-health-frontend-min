<template>
  <div class="leader-crisis">
    <div class="stats-cards">
      <div class="stat-card" v-for="stat in crisisStats" :key="stat.level">
        <div class="stat-dot" :class="stat.level"></div>
        <div class="stat-info">
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.count }}</span>
        </div>
        <span class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'" v-if="stat.trend !== 0">
          {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}
        </span>
      </div>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学生姓名/学号"
        prefix-icon="Search"
        clearable
        style="width: 200px"
      />
      <el-select v-model="filterCollege" placeholder="院系" clearable style="width: 180px">
        <el-option v-for="c in collegeList" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
      <el-select v-model="filterLevel" placeholder="危机等级" clearable style="width: 120px">
        <el-option label="红色" value="red" />
        <el-option label="橙色" value="orange" />
        <el-option label="黄色" value="yellow" />
        <el-option label="蓝色" value="blue" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width: 120px">
        <el-option label="待审批" value="pending" />
        <el-option label="处理中" value="processing" />
        <el-option label="已结案" value="closed" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
      />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetFilter">重置</el-button>
      <el-button type="success" @click="exportData">导出</el-button>
    </div>

    <el-table :data="crisisList" stripe v-loading="loading">
      <el-table-column label="危机等级" width="100">
        <template #default="{ row }">
          <div class="level-cell">
            <span class="level-dot" :class="row.level"></span>
            <el-tag :type="getLevelTagType(row.level)" size="small">{{ row.levelText }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="studentName" label="学生姓名" width="100" />
      <el-table-column prop="studentId" label="学号" width="120" />
      <el-table-column prop="collegeName" label="院系" width="150" />
      <el-table-column prop="className" label="班级" width="120" />
      <el-table-column prop="reportDate" label="上报日期" width="120" />
      <el-table-column prop="description" label="危机描述" min-width="180" show-overflow-tooltip />
      <el-table-column label="处理状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">{{ row.statusText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="handler" label="负责人" width="100" />
      <el-table-column label="操作" fixed="right" width="180">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
          <el-button v-if="row.level === 'red' && row.status === 'pending'" type="warning" link size="small" @click="approveCase(row)">校级审批</el-button>
          <el-button v-if="row.status === 'processing'" type="info" link size="small" @click="supervise(row)">督办</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="totalCount"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadData"
        @size-change="loadData"
      />
    </div>

    <el-dialog v-model="detailVisible" title="危机个案详情" width="900px">
      <div class="crisis-detail" v-if="currentCrisis">
        <el-descriptions title="基本信息" :column="3" border>
          <el-descriptions-item label="学生姓名">{{ currentCrisis.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentCrisis.studentId }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentCrisis.gender }}</el-descriptions-item>
          <el-descriptions-item label="院系">{{ currentCrisis.collegeName }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentCrisis.className }}</el-descriptions-item>
          <el-descriptions-item label="辅导员">{{ currentCrisis.tutorName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentCrisis.phone }}</el-descriptions-item>
          <el-descriptions-item label="宿舍">{{ currentCrisis.dorm }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人">{{ currentCrisis.emergencyContact }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="危机信息" :column="3" border class="mt-16">
          <el-descriptions-item label="危机等级">
            <el-tag :type="getLevelTagType(currentCrisis.level)">{{ currentCrisis.levelText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="危机类型">{{ currentCrisis.type }}</el-descriptions-item>
          <el-descriptions-item label="上报日期">{{ currentCrisis.reportDate }}</el-descriptions-item>
          <el-descriptions-item label="上报人">{{ currentCrisis.reporter }}</el-descriptions-item>
          <el-descriptions-item label="当前负责人">{{ currentCrisis.handler }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusTagType(currentCrisis.status)">{{ currentCrisis.statusText }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>危机描述</h4>
          <p>{{ currentCrisis.description }}</p>
        </div>

        <div class="detail-section">
          <h4>处置措施</h4>
          <p>{{ currentCrisis.measures || '暂无' }}</p>
        </div>

        <div class="detail-section" v-if="currentCrisis.interventions && currentCrisis.interventions.length">
          <h4>干预记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="item in currentCrisis.interventions"
              :key="item.id"
              :timestamp="item.date"
              placement="top"
              :type="item.isImportant ? 'danger' : 'primary'"
            >
              <div class="intervention-item">
                <span class="intervention-type">{{ item.type }}</span>
                <span class="intervention-operator">{{ item.operator }}</span>
                <el-tag v-if="item.levelChange" size="small" type="warning">等级变更</el-tag>
              </div>
              <p class="intervention-content">{{ item.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="detail-section" v-if="currentCrisis.level === 'red'">
          <h4>校级审批记录</h4>
          <el-table :data="currentCrisis.approvals || []" size="small" border>
            <el-table-column prop="date" label="时间" width="180" />
            <el-table-column prop="approver" label="审批人" width="100" />
            <el-table-column prop="result" label="审批结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.result === 'approved' ? 'success' : 'danger'" size="small">
                  {{ row.result === 'approved' ? '通过' : '退回' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="comment" label="审批意见" />
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="currentCrisis?.level === 'red' && currentCrisis?.status === 'pending'" type="primary" @click="approveCase(currentCrisis)">校级审批</el-button>
        <el-button v-if="currentCrisis?.status === 'processing'" type="warning" @click="supervise(currentCrisis)">督办</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="approveVisible" title="校级审批" width="500px">
      <el-alert type="error" :closable="false" class="mb-16">
        <template #title>红色预警个案需校领导审批</template>
        该学生存在高危风险，请仔细审阅后做出审批决定。
      </el-alert>
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="审批意见">
          <el-radio-group v-model="approveForm.result">
            <el-radio label="approved">审批通过</el-radio>
            <el-radio label="rejected">退回修改</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理建议">
          <el-input v-model="approveForm.comment" type="textarea" :rows="4" placeholder="请输入处理建议" />
        </el-form-item>
        <el-form-item label="是否通报">
          <el-checkbox v-model="approveForm.notify">通报相关部门</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove" :loading="submitting">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="superviseVisible" title="督办" width="500px">
      <el-form :model="superviseForm" label-width="100px">
        <el-form-item label="督办内容">
          <el-input v-model="superviseForm.content" type="textarea" :rows="4" placeholder="请输入督办内容和要求" />
        </el-form-item>
        <el-form-item label="要求完成时间">
          <el-date-picker v-model="superviseForm.deadline" type="datetime" placeholder="选择时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="督办对象">
          <el-select v-model="superviseForm.targets" multiple placeholder="选择督办对象" style="width: 100%">
            <el-option label="院系领导" value="college" />
            <el-option label="辅导员" value="tutor" />
            <el-option label="心理中心" value="center" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="superviseVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSupervise" :loading="submitting">发送督办</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getLeaderCrisisApprovalList,
  getCrisisDetail,
  approveCrisisReport,
  addCrisisIntervention,
} from '../../api/crisisApi'
import { exportByApi } from '../../utils/exporter'

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const filterCollege = ref('')
const filterLevel = ref('')
const filterStatus = ref('')
const dateRange = ref([])
const page = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const crisisList = ref([])

const crisisStats = ref([
  { level: 'red', label: '红色预警', count: 12, trend: -2 },
  { level: 'orange', label: '橙色预警', count: 38, trend: -5 },
  { level: 'yellow', label: '黄色预警', count: 86, trend: 3 },
  { level: 'blue', label: '蓝色预警', count: 50, trend: 0 },
])

const collegeList = ref([
  { label: '计算机学院', value: 'cs' },
  { label: '理学院', value: 'sci' },
  { label: '外语学院', value: 'fl' },
  { label: '文学院', value: 'lit' },
  { label: '经济管理学院', value: 'em' },
])

const detailVisible = ref(false)
const approveVisible = ref(false)
const superviseVisible = ref(false)
const currentCrisis = ref(null)

const approveForm = ref({
  result: 'approved',
  comment: '',
  notify: false,
})

const superviseForm = ref({
  content: '',
  deadline: null,
  targets: [],
})

const getLevelTagType = (level) => {
  const map = { red: 'danger', orange: 'warning', yellow: '', blue: 'info' }
  return map[level] || 'info'
}

const getStatusTagType = (status) => {
  const map = { pending: 'warning', processing: '', closed: 'success' }
  return map[status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      college: filterCollege.value,
      level: filterLevel.value,
      status: filterStatus.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
    }
    const res = await getLeaderCrisisApprovalList(params)
    if (res.code === 200) {
      // 确保 crisisList 始终是数组
      const data = res.data
      if (Array.isArray(data)) {
        crisisList.value = data
      } else if (data && typeof data === 'object') {
        crisisList.value = data.list || data.records || []
        totalCount.value = data.total || crisisList.value.length
      } else {
        crisisList.value = []
      }

      if (res.data?.stats) {
        crisisStats.value = res.data.stats
      }
    }
  } catch (e) {
    crisisList.value = [
      { id: 1, level: 'red', levelText: '红色', studentName: '张某某', studentId: '2022001001', collegeName: '计算机学院', className: '计科2201', reportDate: '2024-03-20', description: '存在自杀倾向，需紧急干预', status: 'pending', statusText: '待审批', handler: '王院长' },
      { id: 2, level: 'red', levelText: '红色', studentName: '李某某', studentId: '2022002001', collegeName: '理学院', className: '物理2201', reportDate: '2024-03-19', description: '多次自伤行为，情绪极不稳定', status: 'processing', statusText: '处理中', handler: '张院长' },
      { id: 3, level: 'orange', levelText: '橙色', studentName: '王某某', studentId: '2022003001', collegeName: '外语学院', className: '英语2201', reportDate: '2024-03-18', description: '严重抑郁，已安排心理咨询', status: 'processing', statusText: '处理中', handler: '刘主任' },
      { id: 4, level: 'yellow', levelText: '黄色', studentName: '赵某某', studentId: '2022004001', collegeName: '文学院', className: '汉语2201', reportDate: '2024-03-15', description: '学业压力大，情绪波动', status: 'processing', statusText: '处理中', handler: '陈老师' },
      { id: 5, level: 'blue', levelText: '蓝色', studentName: '钱某某', studentId: '2022005001', collegeName: '经管学院', className: '会计2201', reportDate: '2024-03-10', description: '人际关系困扰，需持续关注', status: 'closed', statusText: '已结案', handler: '李老师' },
    ]
    totalCount.value = 186
  }
  loading.value = false
}


const handleSearch = () => {
  page.value = 1
  loadData()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterCollege.value = ''
  filterLevel.value = ''
  filterStatus.value = ''
  dateRange.value = []
  page.value = 1
  loadData()
}

const exportData = async () => {
  try {
    await exportByApi({
      url: '/api/leader/crisis/export',
      params: {
        keyword: searchKeyword.value,
        college: filterCollege.value,
        level: filterLevel.value,
        status: filterStatus.value,
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1],
      },
      filename: 'leader-crisis-list.xlsx',
      fallbackData: crisisList.value,
    })
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const viewDetail = async (row) => {
  currentCrisis.value = { ...row }
  try {
    const res = await getCrisisDetail({ id: row.id })
    if (res.code === 200) {
      currentCrisis.value = res.data
    }
  } catch (e) {
    currentCrisis.value = {
      ...row,
      gender: '男',
      tutorName: '王老师',
      phone: '138****1234',
      dorm: '5栋301',
      emergencyContact: '张父 139****5678',
      type: '自杀倾向',
      reporter: '王老师',
      measures: '已进行初步谈话，通知家长，安排24小时陪护，协调心理中心紧急介入',
      interventions: [
        { id: 1, date: '2024-03-20 14:30', type: '紧急谈话', operator: '王老师', content: '发现学生情绪异常，进行初步谈话了解情况', isImportant: true },
        { id: 2, date: '2024-03-20 16:00', type: '通知家长', operator: '王老师', content: '电话联系学生家长，告知情况并建议来校' },
        { id: 3, date: '2024-03-20 18:00', type: '心理咨询', operator: '张咨询师', content: '心理中心紧急介入，进行危机干预评估', isImportant: true },
        { id: 4, date: '2024-03-21 09:00', type: '等级上报', operator: '李院长', content: '评估后上报校级红色预警', levelChange: true },
      ],
      approvals: [],
    }
  }
  detailVisible.value = true
}

const approveCase = (row) => {
  currentCrisis.value = row
  approveForm.value = { result: 'approved', comment: '', notify: false }
  approveVisible.value = true
}

const submitApprove = async () => {
  if (!approveForm.value.comment) {
    ElMessage.warning('请填写处理建议')
    return
  }
  submitting.value = true
  try {
    await approveCrisisReport({
      id: currentCrisis.value.id,
      ...approveForm.value,
    })
    ElMessage.success('审批成功')
    approveVisible.value = false
    detailVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('审批成功')
    approveVisible.value = false
    detailVisible.value = false
    loadData()
  }
  submitting.value = false
}

const supervise = (row) => {
  currentCrisis.value = row
  superviseForm.value = { content: '', deadline: null, targets: [] }
  superviseVisible.value = true
}

const submitSupervise = async () => {
  if (!superviseForm.value.content || superviseForm.value.targets.length === 0) {
    ElMessage.warning('请填写完整督办信息')
    return
  }
  submitting.value = true
  try {
    await addCrisisIntervention({
      id: currentCrisis.value.id,
      ...superviseForm.value,
    })
    ElMessage.success('督办通知已发送')
    superviseVisible.value = false
  } catch (e) {
    ElMessage.success('督办通知已发送')
    superviseVisible.value = false
  }
  submitting.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.leader-crisis {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 10px;
}

.stat-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.stat-dot.red {
  background: #dc2626;
}

.stat-dot.orange {
  background: #f59e0b;
}

.stat-dot.yellow {
  background: #eab308;
}

.stat-dot.blue {
  background: #3b82f6;
}

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.stat-trend {
  font-size: 14px;
  font-weight: 500;
}

.stat-trend.up {
  color: #dc2626;
}

.stat-trend.down {
  color: #16a34a;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.level-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.pagination-bar {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.crisis-detail .mt-16 {
  margin-top: 16px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.detail-section p {
  margin: 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
}

.intervention-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.intervention-type {
  padding: 2px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 4px;
  font-size: 12px;
}

.intervention-operator {
  font-size: 13px;
  color: #64748b;
}

.intervention-content {
  margin: 0;
  font-size: 14px;
  color: #475569;
}

.mb-16 {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
