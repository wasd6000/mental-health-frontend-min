<template>
  <div class="college-students">
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学生姓名/学号"
        prefix-icon="Search"
        clearable
        style="width: 200px"
      />
      <el-select v-model="filterDept" placeholder="专业" clearable style="width: 160px">
        <el-option v-for="d in deptList" :key="d.value" :label="d.label" :value="d.value" />
      </el-select>
      <el-select v-model="filterGrade" placeholder="年级" clearable style="width: 120px">
        <el-option label="2024级" value="2024" />
        <el-option label="2023级" value="2023" />
        <el-option label="2022级" value="2022" />
        <el-option label="2021级" value="2021" />
      </el-select>
      <el-select v-model="filterRisk" placeholder="风险等级" clearable style="width: 120px">
        <el-option label="极高危" value="red" />
        <el-option label="高危" value="orange" />
        <el-option label="中危" value="yellow" />
        <el-option label="低危" value="green" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetFilter">重置</el-button>
      <el-button type="success" @click="exportData">导出</el-button>
    </div>

    <div class="stats-bar">
      <span>共 <b>{{ totalCount }}</b> 名学生</span>
      <span class="divider">|</span>
      <span>风险预警 <b class="text-danger">{{ riskCount }}</b> 人</span>
      <span class="divider">|</span>
      <span>测评完成率 <b class="text-primary">{{ assessmentRate }}%</b></span>
    </div>

    <el-table :data="studentList" stripe v-loading="loading">
      <el-table-column prop="studentId" label="学号" width="120" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="gender" label="性别" width="70" />
      <el-table-column prop="dept" label="专业" width="150" />
      <el-table-column prop="className" label="班级" width="120" />
      <el-table-column prop="tutorName" label="辅导员" width="100" />
      <el-table-column label="风险等级" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.riskLevel" :type="getRiskTagType(row.riskLevel)" size="small">{{ row.riskLabel }}</el-tag>
          <span v-else class="text-muted">正常</span>
        </template>
      </el-table-column>
      <el-table-column label="测评状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.assessed ? 'success' : 'info'" size="small">
            {{ row.assessed ? '已测评' : '未测评' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastIntervention" label="最近干预" width="120" />
      <el-table-column label="操作" fixed="right" width="150">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
          <el-button type="info" link size="small" @click="viewProfile(row)">档案</el-button>
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

    <el-dialog v-model="detailVisible" title="学生详情" width="800px">
      <div class="student-detail" v-if="currentStudent">
        <el-descriptions title="基本信息" :column="3" border>
          <el-descriptions-item label="姓名">{{ currentStudent.name }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentStudent.studentId }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentStudent.gender }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ currentStudent.dept }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentStudent.className }}</el-descriptions-item>
          <el-descriptions-item label="辅导员">{{ currentStudent.tutorName }}</el-descriptions-item>
          <el-descriptions-item label="宿舍">{{ currentStudent.dorm }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ currentStudent.phone }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人">{{ currentStudent.emergencyContact }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions title="心理状态" :column="3" border class="mt-16">
          <el-descriptions-item label="风险等级">
            <el-tag v-if="currentStudent.riskLevel" :type="getRiskTagType(currentStudent.riskLevel)">
              {{ currentStudent.riskLabel }}
            </el-tag>
            <span v-else>正常</span>
          </el-descriptions-item>
          <el-descriptions-item label="最近测评">{{ currentStudent.lastAssessment || '暂无' }}</el-descriptions-item>
          <el-descriptions-item label="测评结果">{{ currentStudent.assessmentResult || '暂无' }}</el-descriptions-item>
          <el-descriptions-item label="咨询次数">{{ currentStudent.consultCount || 0 }}次</el-descriptions-item>
          <el-descriptions-item label="最近咨询">{{ currentStudent.lastConsult || '暂无' }}</el-descriptions-item>
          <el-descriptions-item label="最近干预">{{ currentStudent.lastIntervention || '暂无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section" v-if="currentStudent.crisisHistory && currentStudent.crisisHistory.length">
          <h4>危机记录</h4>
          <el-table :data="currentStudent.crisisHistory" size="small">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="levelText" label="等级" width="80">
              <template #default="{ row }">
                <el-tag :type="getRiskTagType(row.level)" size="small">{{ row.levelText }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="statusText" label="状态" width="80" />
          </el-table>
        </div>

        <div class="detail-section" v-if="currentStudent.assessmentHistory && currentStudent.assessmentHistory.length">
          <h4>测评记录</h4>
          <el-table :data="currentStudent.assessmentHistory" size="small">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="name" label="量表名称" />
            <el-table-column prop="score" label="得分" width="80" />
            <el-table-column prop="result" label="结果" width="100">
              <template #default="{ row }">
                <el-tag :type="row.resultLevel === 'abnormal' ? 'danger' : 'success'" size="small">
                  {{ row.resultText }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="viewProfile(currentStudent)">查看完整档案</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, TrendCharts, Warning, Document, Calendar, Timer } from '@element-plus/icons-vue'
import { getArchiveStudents, getArchiveStudentDetail } from '../../api/centerArchive'
import { exportByApi } from '../../utils/exporter'

const router = useRouter()

const loading = ref(false)
const searchKeyword = ref('')
const filterDept = ref('')
const filterGrade = ref('')
const filterRisk = ref('')
const page = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const riskCount = ref(0)
const assessmentRate = ref(0)
const studentList = ref([])

const deptList = ref([
  { label: '计算机科学与技术', value: 'cs' },
  { label: '软件工程', value: 'se' },
  { label: '信息安全', value: 'is' },
  { label: '物联网工程', value: 'iot' },
  { label: '数据科学与大数据', value: 'ds' }
])

const overviewData = ref([
  {
    label: '学生总数',
    value: '3,256',
    icon: markRaw(User),
    color: '#3b82f6',
    bgColor: '#eff6ff',
    extra: { label: '已测评', value: '2,979', type: '' }
  },
  {
    label: '测评完成率',
    value: '91.5%',
    icon: markRaw(TrendCharts),
    color: '#10b981',
    bgColor: '#f0fdf4',
    trend: 5.2,
    trendPositive: true
  },
  {
    label: '危机个案数',
    value: 27,
    icon: markRaw(Warning),
    color: '#ef4444',
    bgColor: '#fef2f2',
    trend: -12,
    trendPositive: false,
    extra: { label: '处理中', value: '8', type: 'warning' }
  },
  {
    label: '咨询服务量',
    value: 156,
    icon: markRaw(Document),
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    trend: 8.5,
    trendPositive: true,
    extra: { label: '本月', value: '+23', type: 'success' }
  },
  {
    label: '活动参与人次',
    value: '1,280',
    icon: markRaw(Calendar),
    color: '#f59e0b',
    bgColor: '#fffbeb',
    trend: 15,
    trendPositive: true
  },
  {
    label: '平均响应时间',
    value: '2.5h',
    icon: markRaw(Timer),
    color: '#06b6d4',
    bgColor: '#ecfeff',
    trend: -18,
    trendPositive: false
  }
])

const detailVisible = ref(false)
const currentStudent = ref(null)

const getRiskTagType = (level) => {
  const map = { red: 'danger', orange: 'warning', yellow: '', green: 'success' }
  return map[level] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      dept: filterDept.value,
      grade: filterGrade.value,
      riskLevel: filterRisk.value,
    }
    const res = await getArchiveStudents(params)
    if (res.code === 200) {
      const data = res.data
      studentList.value = Array.isArray(data) ? data : (data?.list || data?.records || [])
      totalCount.value = data?.total || studentList.value.length
      riskCount.value = data?.riskCount || 0
      assessmentRate.value = data?.assessmentRate || 0
    }
  } catch (e) {
    studentList.value = [
      { id: 1, studentId: '2022001001', name: '张明华', gender: '男', dept: '计算机科学与技术', className: '计科2201', tutorName: '王老师', riskLevel: 'red', riskLabel: '极高危', assessed: true, lastIntervention: '3天前' },
      { id: 2, studentId: '2022001002', name: '李晓红', gender: '女', dept: '软件工程', className: '软工2201', tutorName: '张老师', riskLevel: 'orange', riskLabel: '高危', assessed: true, lastIntervention: '1周前' },
      { id: 3, studentId: '2022001003', name: '王建国', gender: '男', dept: '计算机科学与技术', className: '计科2202', tutorName: '李老师', riskLevel: 'yellow', riskLabel: '中危', assessed: true, lastIntervention: '2周前' },
      { id: 4, studentId: '2022001004', name: '赵小梅', gender: '女', dept: '信息安全', className: '信安2201', tutorName: '王老师', riskLevel: null, riskLabel: null, assessed: true, lastIntervention: '-' },
      { id: 5, studentId: '2022001005', name: '钱大明', gender: '男', dept: '物联网工程', className: '物联2201', tutorName: '刘老师', riskLevel: null, riskLabel: null, assessed: false, lastIntervention: '-' },
    ]
    totalCount.value = 3256
    riskCount.value = 27
    assessmentRate.value = 91.5
  }
  loading.value = false
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterDept.value = ''
  filterGrade.value = ''
  filterRisk.value = ''
  page.value = 1
  loadData()
}

const exportData = async () => {
  try {
    await exportByApi({
      url: '/api/college/students/export',
      params: {
        keyword: searchKeyword.value,
        dept: filterDept.value,
        grade: filterGrade.value,
        riskLevel: filterRisk.value,
      },
      filename: 'college-students.xlsx',
      fallbackData: studentList.value,
    })
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const viewDetail = async (row) => {
  currentStudent.value = { ...row }
  try {
    const res = await getArchiveStudentDetail({ id: row.id })
    if (res.code === 200) {
      currentStudent.value = res.data
    }
  } catch (e) {
    currentStudent.value = {
      ...row,
      dorm: '5栋301',
      phone: '138****1234',
      emergencyContact: '张父 139****5678',
      lastAssessment: '2024-03-15',
      assessmentResult: '轻度焦虑',
      consultCount: 3,
      lastConsult: '2024-03-10',
      crisisHistory: [
        { date: '2024-03-20', level: 'red', levelText: '红色', description: '存在自杀倾向', statusText: '处理中' },
      ],
      assessmentHistory: [
        { date: '2024-03-15', name: 'SCL-90', score: 85, resultLevel: 'abnormal', resultText: '异常' },
        { date: '2024-02-20', name: 'SDS抑郁量表', score: 62, resultLevel: 'abnormal', resultText: '轻度抑郁' },
      ],
    }
  }
  detailVisible.value = true
}

const viewProfile = (row) => {
  ElMessage.info(`查看 ${row.name} 的完整档案`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.college-students {
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
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #64748b;
}

.stats-bar b {
  color: #1e293b;
}

.stats-bar .text-danger {
  color: #dc2626;
}

.stats-bar .text-primary {
  color: #2563eb;
}

.stats-bar .divider {
  color: #e2e8f0;
}

.pagination-bar {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.text-muted {
  color: #94a3b8;
}

.student-detail .mt-16 {
  margin-top: 16px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #1e293b;
}
</style>
