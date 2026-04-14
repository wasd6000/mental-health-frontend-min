<template>
  <div class="admin-students">
    <div class="page-head">
      <h2>学生管理</h2>
      <p class="page-desc">按学号/姓名/院系筛选学生档案，设置档案查看范围。</p>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filter" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="filter.keyword" placeholder="学号/姓名" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="院系">
          <el-select v-model="filter.college" placeholder="全部" clearable style="width: 140px">
            <el-option v-for="c in collegeList" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="filter.riskLevel" placeholder="全部" clearable style="width: 120px">
            <el-option label="极高危" value="red" />
            <el-option label="高危" value="orange" />
            <el-option label="中危" value="yellow" />
            <el-option label="低危" value="green" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="stats-bar">
      <span>共 <b>{{ totalCount }}</b> 名学生</span>
      <span class="divider">|</span>
      <span>风险预警 <b class="text-danger">{{ riskCount }}</b> 人</span>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="paginatedList" stripe v-loading="loading">
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="70" />
        <el-table-column prop="college" label="院系" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="tutorName" label="辅导员" width="100" />
        <el-table-column label="风险等级" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.riskLevel" :type="getRiskTagType(row.riskLevel)" size="small">{{ row.riskLabel }}</el-tag>
            <span v-else class="text-muted">正常</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastAssessment" label="最近测评" width="120" />
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
            <el-button type="info" link size="small" @click="viewProfile(row)">档案</el-button>
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

    <el-dialog v-model="detailVisible" title="学生详情" width="720px">
      <div v-if="currentStudent" class="student-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentStudent.name }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentStudent.studentId }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentStudent.gender }}</el-descriptions-item>
          <el-descriptions-item label="院系">{{ currentStudent.college }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ currentStudent.className }}</el-descriptions-item>
          <el-descriptions-item label="辅导员">{{ currentStudent.tutorName }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ currentStudent.phone }}</el-descriptions-item>
          <el-descriptions-item label="紧急联系人">{{ currentStudent.emergencyContact }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-section">
          <h4>心理状态</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="风险等级">
              <el-tag v-if="currentStudent.riskLevel" :type="getRiskTagType(currentStudent.riskLevel)">
                {{ currentStudent.riskLabel || '正常' }}
              </el-tag>
              <span v-else>正常</span>
            </el-descriptions-item>
            <el-descriptions-item label="最近测评">{{ currentStudent.lastAssessment || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="最近干预">{{ currentStudent.lastIntervention || '暂无' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArchiveStudents } from '../../api/centerArchive'

const router = useRouter()
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const riskCount = ref(0)
const studentList = ref([])
const collegeList = ref([
  { label: '计算机学院', value: '计算机学院' },
  { label: '经济学院', value: '经济学院' },
  { label: '文学院', value: '文学院' },
])
const detailVisible = ref(false)
const currentStudent = ref(null)

const filter = reactive({
  keyword: '',
  college: '',
  riskLevel: '',
})

const MOCK_LIST = [
  { id: 1, studentId: '2022001001', name: '张明华', gender: '男', college: '计算机学院', className: '计科2201', tutorName: '李辅导员', riskLevel: 'red', riskLabel: '极高危', lastAssessment: '2024-03-15', lastIntervention: '3天前', phone: '138****1234', emergencyContact: '张父' },
  { id: 2, studentId: '2022001002', name: '李晓红', gender: '女', college: '计算机学院', className: '计科2202', tutorName: '李辅导员', riskLevel: 'orange', riskLabel: '高危', lastAssessment: '2024-03-10', lastIntervention: '1周前', phone: '137****2345', emergencyContact: '李母' },
  { id: 3, studentId: '2022001003', name: '王建国', gender: '男', college: '经济学院', className: '经管2201', tutorName: '王辅导员', riskLevel: 'yellow', riskLabel: '中危', lastAssessment: '2024-03-08', lastIntervention: '2周前', phone: '135****3456', emergencyContact: '王父' },
  { id: 4, studentId: '2022001004', name: '赵小梅', gender: '女', college: '经济学院', className: '经管2202', tutorName: '王辅导员', riskLevel: 'green', riskLabel: '低危', lastAssessment: '2024-03-01', lastIntervention: '-', phone: '136****4567', emergencyContact: '赵母' },
  { id: 5, studentId: '2022001005', name: '钱大明', gender: '男', college: '文学院', className: '中文2201', tutorName: '张辅导员', riskLevel: null, riskLabel: null, lastAssessment: '2024-02-20', lastIntervention: '-', phone: '139****5678', emergencyContact: '钱父' },
]

const getRiskTagType = (level) => {
  const map = { red: 'danger', orange: 'warning', yellow: '', green: 'success' }
  return map[level] || 'info'
}

const filteredList = computed(() => {
  let list = studentList.value
  if (filter.keyword) {
    const k = filter.keyword.toLowerCase()
    list = list.filter(
      (s) =>
        (s.studentId && s.studentId.toLowerCase().includes(k)) ||
        (s.name && s.name.toLowerCase().includes(k))
    )
  }
  if (filter.college) list = list.filter((s) => s.college === filter.college)
  if (filter.riskLevel) list = list.filter((s) => s.riskLevel === filter.riskLevel)
  return list
})

const paginatedList = computed(() => {
  const list = filteredList.value
  const start = (page.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

async function loadData() {
  loading.value = true
  try {
    const res = await getArchiveStudents({ page: page.value, pageSize: pageSize.value, ...filter })
    if (res?.code === 200 && res.data) {
      studentList.value = res.data.list || res.data || []
      totalCount.value = res.data.total ?? studentList.value.length
      riskCount.value = res.data.riskCount ?? studentList.value.filter((s) => s.riskLevel).length
    } else {
      throw new Error('no data')
    }
  } catch {
    studentList.value = [...MOCK_LIST]
    totalCount.value = 128
    riskCount.value = 5
  }
  loading.value = false
}

function resetFilter() {
  filter.keyword = ''
  filter.college = ''
  filter.riskLevel = ''
  page.value = 1
  loadData()
}

function viewDetail(row) {
  currentStudent.value = { ...row }
  detailVisible.value = true
}

function viewProfile(row) {
  router.push(`/student/profile/${row.id}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-students { max-width: 1100px; }

.page-head {
  margin-bottom: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.page-head h2 { margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #1e293b; }
.page-desc { margin: 0; font-size: 14px; color: #64748b; }

.filter-card, .table-card { margin-bottom: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
.filter-form { margin-bottom: 0; }

.stats-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #64748b;
}

.stats-bar b { color: #1e293b; }
.stats-bar .text-danger { color: #dc2626; }
.stats-bar .divider { color: #e2e8f0; }

.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }

.student-detail .detail-section { margin-top: 16px; }
.student-detail .detail-section h4 { margin: 0 0 12px 0; font-size: 15px; color: #1e293b; }
.text-muted { color: #94a3b8; }
</style>
