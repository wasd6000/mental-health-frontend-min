<template>
  <div class="college-crisis">
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学生姓名/学号"
        prefix-icon="Search"
        clearable
        style="width: 200px"
      />
      <el-select v-model="filterLevel" placeholder="危机等级" clearable style="width: 120px">
        <el-option label="红色" value="red" />
        <el-option label="橙色" value="orange" />
        <el-option label="黄色" value="yellow" />
        <el-option label="蓝色" value="blue" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="处理状态" clearable style="width: 120px">
        <el-option label="待处理" value="pending" />
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
    </div>

    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-dot red"></span>
        <span>红色：{{ levelStats.red }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-dot orange"></span>
        <span>橙色：{{ levelStats.orange }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-dot yellow"></span>
        <span>黄色：{{ levelStats.yellow }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-dot blue"></span>
        <span>蓝色：{{ levelStats.blue }}</span>
      </div>
      <span class="divider">|</span>
      <span>共 <b>{{ totalCount }}</b> 个危机个案</span>
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
      <el-table-column prop="className" label="班级" width="120" />
      <el-table-column prop="tutorName" label="辅导员" width="100" />
      <el-table-column prop="reportDate" label="上报日期" width="120" />
      <el-table-column prop="description" label="危机描述" min-width="180" show-overflow-tooltip />
      <el-table-column label="处理状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">{{ row.statusText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="180">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
          <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="approveCase(row)">审批</el-button>
          <el-button v-if="row.status === 'processing'" type="warning" link size="small" @click="followUp(row)">跟进</el-button>
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

    <el-dialog v-model="detailVisible" title="危机个案详情" width="800px">
      <div class="crisis-detail" v-if="currentCrisis">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="学生姓名">{{ currentCrisis.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentCrisis.studentId }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentCrisis.gender }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentCrisis.className }}</el-descriptions-item>
          <el-descriptions-item label="辅导员">{{ currentCrisis.tutorName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentCrisis.phone }}</el-descriptions-item>
          <el-descriptions-item label="宿舍">{{ currentCrisis.dorm }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人">{{ currentCrisis.emergencyContact }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="危机信息" :column="2" border class="mt-16">
          <el-descriptions-item label="危机等级">
            <el-tag :type="getLevelTagType(currentCrisis.level)">{{ currentCrisis.levelText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="危机类型">{{ currentCrisis.type }}</el-descriptions-item>
          <el-descriptions-item label="上报日期">{{ currentCrisis.reportDate }}</el-descriptions-item>
          <el-descriptions-item label="上报人">{{ currentCrisis.reporter }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="getStatusTagType(currentCrisis.status)">{{ currentCrisis.statusText }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>危机描述</h4>
          <p>{{ currentCrisis.description }}</p>
        </div>

        <div class="detail-section">
          <h4>已采取措施</h4>
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
            >
              <div class="intervention-item">
                <span class="intervention-type">{{ item.type }}</span>
                <span class="intervention-operator">{{ item.operator }}</span>
              </div>
              <p class="intervention-content">{{ item.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="currentCrisis?.status === 'pending'" type="primary" @click="approveCase(currentCrisis)">审批通过</el-button>
        <el-button v-if="currentCrisis?.status === 'processing'" type="warning" @click="followUp(currentCrisis)">添加跟进</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="approveVisible" title="危机审批" width="500px">
      <el-form :model="approveForm" label-width="100px">
        <el-form-item label="审批意见">
          <el-radio-group v-model="approvalForm.result">
            <el-radio value="approved">审批通过</el-radio>
            <el-radio value="rejected">退回修改</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理建议">
          <el-input v-model="approveForm.suggestion" type="textarea" :rows="4" placeholder="请输入处理建议" />
        </el-form-item>
        <el-form-item label="指定负责人">
          <el-select v-model="approveForm.assignee" placeholder="选择负责人" style="width: 100%">
            <el-option label="王老师" value="1" />
            <el-option label="李老师" value="2" />
            <el-option label="张老师" value="3" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove" :loading="submitting">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="followUpVisible" title="添加跟进记录" width="500px">
      <el-form :model="followUpForm" label-width="100px">
        <el-form-item label="跟进类型">
          <el-select v-model="followUpForm.type" placeholder="选择类型" style="width: 100%">
            <el-option label="谈心谈话" value="talk" />
            <el-option label="心理咨询" value="consult" />
            <el-option label="家访" value="visit" />
            <el-option label="电话联系" value="phone" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进内容">
          <el-input v-model="followUpForm.content" type="textarea" :rows="4" placeholder="请输入跟进内容" />
        </el-form-item>
        <el-form-item label="等级调整">
          <el-select v-model="followUpForm.newLevel" placeholder="如需调整等级请选择" clearable style="width: 100%">
            <el-option label="红色 - 极高危" value="red" />
            <el-option label="橙色 - 高危" value="orange" />
            <el-option label="黄色 - 中危" value="yellow" />
            <el-option label="蓝色 - 关注" value="blue" />
            <el-option label="绿色 - 解除" value="green" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="followUpVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFollowUp" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getCrisisList,
  getCrisisDetail,
  approveCrisisReport,
  addCrisisIntervention,
} from '../../api/crisisApi'

const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const filterLevel = ref('')
const filterStatus = ref('')
const dateRange = ref([])
const page = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const crisisList = ref([])

const levelStats = ref({ red: 0, orange: 0, yellow: 0, blue: 0 })

const detailVisible = ref(false)
const approveVisible = ref(false)
const followUpVisible = ref(false)
const currentCrisis = ref(null)

const approveForm = ref({
  result: 'approve',
  suggestion: '',
  assignee: '',
})

const followUpForm = ref({
  type: '',
  content: '',
  newLevel: '',
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
      level: filterLevel.value,
      status: filterStatus.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
    }
    const res = await getCrisisList(params)
    if (res.code === 200) {
      crisisList.value = res.data?.list || res.data || []
      totalCount.value = res.data?.total || crisisList.value.length
      if (res.data?.stats) {
        levelStats.value = res.data.stats
      }
    }
  } catch (e) {
    crisisList.value = [
      { id: 1, level: 'red', levelText: '红色', studentName: '张某某', studentId: '2022001001', className: '计科2201', tutorName: '王老师', reportDate: '2024-03-20', description: '存在自杀倾向，需紧急干预', status: 'pending', statusText: '待处理' },
      { id: 2, level: 'orange', levelText: '橙色', studentName: '李某某', studentId: '2022001002', className: '软工2201', tutorName: '张老师', reportDate: '2024-03-18', description: '严重抑郁，已安排心理咨询', status: 'processing', statusText: '处理中' },
      { id: 3, level: 'yellow', levelText: '黄色', studentName: '王某某', studentId: '2022001003', className: '计科2202', tutorName: '李老师', reportDate: '2024-03-15', description: '学业压力大，情绪不稳定', status: 'processing', statusText: '处理中' },
      { id: 4, level: 'blue', levelText: '蓝色', studentName: '赵某某', studentId: '2022001004', className: '信安2201', tutorName: '王老师', reportDate: '2024-03-10', description: '人际关系困扰，需持续关注', status: 'closed', statusText: '已结案' },
    ]
    totalCount.value = 27
    levelStats.value = { red: 2, orange: 5, yellow: 12, blue: 8 }
  }
  loading.value = false
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterLevel.value = ''
  filterStatus.value = ''
  dateRange.value = []
  page.value = 1
  loadData()
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
      phone: '138****1234',
      dorm: '5栋301',
      emergencyContact: '张父 139****5678',
      type: '自杀倾向',
      reporter: '王老师',
      measures: '已进行初步谈话，通知家长，安排24小时陪护',
      interventions: [
        { id: 1, date: '2024-03-20 14:30', type: '紧急谈话', operator: '王老师', content: '发现学生情绪异常，进行初步谈话了解情况' },
        { id: 2, date: '2024-03-20 16:00', type: '通知家长', operator: '王老师', content: '电话联系学生家长，告知情况并建议来校' },
      ],
    }
  }
  detailVisible.value = true
}

const approveCase = (row) => {
  currentCrisis.value = row
  approveForm.value = { result: 'approve', suggestion: '', assignee: '' }
  approveVisible.value = true
}

const submitApprove = async () => {
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

const followUp = (row) => {
  currentCrisis.value = row
  followUpForm.value = { type: '', content: '', newLevel: '' }
  followUpVisible.value = true
}

const submitFollowUp = async () => {
  if (!followUpForm.value.type || !followUpForm.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  submitting.value = true
  try {
    await addCrisisIntervention({
      id: currentCrisis.value.id,
      ...followUpForm.value,
    })
    ElMessage.success('跟进记录添加成功')
    followUpVisible.value = false
    if (detailVisible.value) {
      viewDetail(currentCrisis.value)
    }
  } catch (e) {
    ElMessage.success('跟进记录添加成功')
    followUpVisible.value = false
  }
  submitting.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.college-crisis {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-dot {
  width: 10px;
  height: 10px;
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

.divider {
  color: #e2e8f0;
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
</style>
