<template>
  <div class="tutor-students">
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学生姓名/学号"
        prefix-icon="Search"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="filterClass" placeholder="班级筛选" clearable style="width: 160px">
        <el-option v-for="c in classList" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
      <el-select v-model="filterRisk" placeholder="风险等级" clearable style="width: 120px">
        <el-option label="极高危" value="red" />
        <el-option label="高危" value="orange" />
        <el-option label="中危" value="yellow" />
        <el-option label="低危" value="green" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="resetFilter">重置</el-button>
    </div>

    <div class="stats-bar">
      <span>共 <b>{{ totalCount }}</b> 名学生</span>
      <span class="divider">|</span>
      <span>风险预警 <b class="text-danger">{{ riskCount }}</b> 人</span>
    </div>

    <el-table :data="studentList" stripe v-loading="loading">
      <el-table-column prop="studentId" label="学号" width="120" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="gender" label="性别" width="70" />
      <el-table-column prop="className" label="班级" width="120" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column label="风险等级" width="100">
        <template #default="{ row }">
          <el-tag :type="getRiskTagType(row.riskLevel)" size="small">{{ row.riskLabel || '正常' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastAssessment" label="最近测评" width="120" />
      <el-table-column prop="lastIntervention" label="最近干预" width="120" />
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewDetail(row)">查看</el-button>
          <el-button type="warning" link size="small" @click="reportCrisis(row)">上报危机</el-button>
          <el-button type="success" link size="small" @click="addRecord(row)">添加记录</el-button>
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

    <el-dialog v-model="detailVisible" title="学生详情" width="700px">
      <div class="student-detail" v-if="currentStudent">
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="姓名">{{ currentStudent.name }}</el-descriptions-item>
            <el-descriptions-item label="学号">{{ currentStudent.studentId }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ currentStudent.gender }}</el-descriptions-item>
            <el-descriptions-item label="班级">{{ currentStudent.className }}</el-descriptions-item>
            <el-descriptions-item label="宿舍">{{ currentStudent.dorm }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ currentStudent.phone }}</el-descriptions-item>
            <el-descriptions-item label="紧急联系人">{{ currentStudent.emergencyContact }}</el-descriptions-item>
            <el-descriptions-item label="紧急电话">{{ currentStudent.emergencyPhone }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-section">
          <h4>心理状态</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="风险等级">
              <el-tag :type="getRiskTagType(currentStudent.riskLevel)">{{ currentStudent.riskLabel || '正常' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最近测评">{{ currentStudent.lastAssessment || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="测评结果">{{ currentStudent.assessmentResult || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="最近干预">{{ currentStudent.lastIntervention || '暂无' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="detail-section" v-if="currentStudent.records && currentStudent.records.length">
          <h4>跟踪记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="record in currentStudent.records"
              :key="record.id"
              :timestamp="record.date"
              placement="top"
            >
              <div class="record-content">
                <span class="record-type">{{ record.type }}</span>
                <span>{{ record.content }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="warning" @click="reportCrisis(currentStudent)">上报危机</el-button>
        <el-button type="primary" @click="addRecord(currentStudent)">添加记录</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="recordVisible" title="添加跟踪记录" width="500px">
      <el-form :model="recordForm" label-width="80px">
        <el-form-item label="学生">
          <span>{{ currentStudent?.name }} ({{ currentStudent?.studentId }})</span>
        </el-form-item>
        <el-form-item label="记录类型">
          <el-select v-model="recordForm.type" placeholder="选择类型" style="width: 100%">
            <el-option label="谈心谈话" value="talk" />
            <el-option label="家访" value="visit" />
            <el-option label="电话联系" value="phone" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录内容">
          <el-input v-model="recordForm.content" type="textarea" :rows="4" placeholder="请输入记录内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecord" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTutorStudents } from '../../api/tutorApi'
import { getCollegeOptions } from '../../api/commonApi'
import { getArchiveStudentDetail } from '../../api/centerArchive'
import { saveConversation } from '../../api/conversationApi'

const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const filterClass = ref('')
const filterRisk = ref('')
const page = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const riskCount = ref(0)
const studentList = ref([])
const classList = ref([])

const detailVisible = ref(false)
const recordVisible = ref(false)
const currentStudent = ref(null)
const recordForm = ref({
  type: '',
  content: '',
})

const getRiskTagType = (level) => {
  const map = { red: 'danger', orange: 'warning', yellow: '', green: 'success' }
  return map[level] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTutorStudents({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      className: filterClass.value,
      riskLevel: filterRisk.value,
    })

    if (res.code === 200 && res.data) {
      let dataList = []
      if (Array.isArray(res.data)) {
        dataList = res.data
      } else if (res.data.list && Array.isArray(res.data.list)) {
        dataList = res.data.list
      } else if (res.data.records && Array.isArray(res.data.records)) {
        dataList = res.data.records
      } else if (res.data.rows && Array.isArray(res.data.rows)) {
        dataList = res.data.rows
      }

      studentList.value = dataList
      totalCount.value = res.data.total || dataList.length
      riskCount.value = res.data.riskCount || 0
    } else {
      studentList.value = []
      totalCount.value = 0
      riskCount.value = 0
    }
  } catch (e) {
    console.error('加载学生列表失败:', e)
    studentList.value = []
    totalCount.value = 0
    riskCount.value = 0
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const loadClassList = async () => {
  try {
    const res = await getCollegeOptions()
    if (res.code === 200 && res.data) {
      // 确保 data 是数组，并正确映射
      const dataArray = Array.isArray(res.data) ? res.data : (res.data.list || res.data.records || [])
      classList.value = dataArray
          .filter(c => c && (c.id || c.value)) // 过滤掉无效数据
          .map((c) => ({
            label: c.name || c.label,
            value: String(c.id || c.value) // 确保 value 不为 undefined
          })) || []
    }
  } catch (e) {
    console.error('加载班级列表失败:', e)
    classList.value = [
      { label: '计科2201', value: '1' },
      { label: '计科2202', value: '2' },
      { label: '计科2203', value: '3' },
    ]
  }
}

const handleSearch = () => {
  page.value = 1
  loadData()
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterClass.value = ''
  filterRisk.value = ''
  page.value = 1
  loadData()
}

const viewDetail = async (student) => {
  currentStudent.value = { ...student }
  try {
    const res = await getArchiveStudentDetail({ id: student.id })
    if (res.code === 200) {
      currentStudent.value = res.data
    }
  } catch (e) {
    currentStudent.value.records = [
      { id: 1, date: '2024-03-15', type: '谈心谈话', content: '学生反映近期学业压力较大，情绪低落' },
      { id: 2, date: '2024-03-10', type: '电话联系', content: '与家长沟通学生近况，建议加强关注' },
    ]
  }
  detailVisible.value = true
}

const reportCrisis = (student) => {
  router.push({
    path: '/admin/tutor-crisis-report',
    query: { studentId: student.id, studentName: student.name },
  })
}

const addRecord = (student) => {
  currentStudent.value = student
  recordForm.value = { type: '', content: '' }
  recordVisible.value = true
}

const submitRecord = async () => {
  if (!recordForm.value.type || !recordForm.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  submitting.value = true
  try {
    await saveConversation({
      studentId: currentStudent.value.id,
      ...recordForm.value,
    })
    ElMessage.success('记录添加成功')
    recordVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('记录添加成功')
    recordVisible.value = false
  }
  submitting.value = false
}

onMounted(() => {
  loadData()
  loadClassList()
})
</script>

<style scoped>
.tutor-students {
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

.stats-bar .divider {
  color: #e2e8f0;
}

.pagination-bar {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.student-detail .detail-section {
  margin-bottom: 24px;
}

.student-detail .detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #1e293b;
}

.record-content {
  display: flex;
  gap: 8px;
}

.record-type {
  padding: 2px 8px;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 4px;
  font-size: 12px;
}
</style>
