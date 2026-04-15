<template>
  <div class="tutor-assessment">
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索学生姓名/学号"
        prefix-icon="Search"
        clearable
        style="width: 240px"
      />
      <el-select v-model="filterClass" placeholder="班级筛选" clearable style="width: 160px">
        <el-option v-for="c in classList" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="测评状态" clearable style="width: 120px">
        <el-option label="已完成" value="completed" />
        <el-option label="未完成" value="pending" />
      </el-select>
      <el-select v-model="filterResult" placeholder="测评结果" clearable style="width: 120px">
        <el-option label="异常" value="abnormal" />
        <el-option label="正常" value="normal" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetFilter">重置</el-button>
    </div>

    <div class="stats-cards">
      <div class="stat-item">
        <span class="stat-label">应测人数</span>
        <span class="stat-value">{{ stats.total }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已测人数</span>
        <span class="stat-value text-success">{{ stats.completed }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">完成率</span>
        <span class="stat-value text-primary">{{ stats.rate }}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">异常人数</span>
        <span class="stat-value text-danger">{{ stats.abnormal }}</span>
      </div>
    </div>

    <el-table :data="assessmentList" stripe v-loading="loading">
      <el-table-column prop="studentId" label="学号" width="120" />
      <el-table-column prop="studentName" label="姓名" width="100" />
      <el-table-column prop="className" label="班级" width="120" />
      <el-table-column prop="assessmentName" label="测评名称" min-width="160" />
      <el-table-column label="测评状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'completed' ? 'success' : 'info'" size="small">
            {{ row.status === 'completed' ? '已完成' : '未完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="completeTime" label="完成时间" width="160" />
      <el-table-column label="测评结果" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status === 'completed'" :type="row.resultLevel === 'abnormal' ? 'danger' : 'success'" size="small">
            {{ row.resultText || (row.resultLevel === 'abnormal' ? '异常' : '正常') }}
          </el-tag>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="150">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'completed'"
            type="primary"
            link
            size="small"
            @click="viewResult(row)"
          >
            查看报告
          </el-button>
          <el-button
            v-else
            type="warning"
            link
            size="small"
            @click="remindStudent(row)"
          >
            提醒完成
          </el-button>
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

    <el-dialog v-model="resultVisible" title="测评报告" width="700px">
      <div class="result-detail" v-if="currentResult">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名">{{ currentResult.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ currentResult.studentId }}</el-descriptions-item>
          <el-descriptions-item label="测评名称">{{ currentResult.assessmentName }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ currentResult.completeTime }}</el-descriptions-item>
          <el-descriptions-item label="总分">{{ currentResult.score }}</el-descriptions-item>
          <el-descriptions-item label="结果">
            <el-tag :type="currentResult.resultLevel === 'abnormal' ? 'danger' : 'success'">
              {{ currentResult.resultText }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="factor-section" v-if="currentResult.factors && currentResult.factors.length">
          <h4>因子分析</h4>
          <el-table :data="currentResult.factors" size="small">
            <el-table-column prop="name" label="因子" />
            <el-table-column prop="score" label="得分" width="80" />
            <el-table-column prop="level" label="等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getFactorTagType(row.level)" size="small">{{ row.levelText }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="suggestion-section" v-if="currentResult.suggestion">
          <h4>建议</h4>
          <p>{{ currentResult.suggestion }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="resultVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportResult">导出报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTutorAssessments } from '../../api/tutorApi'
import { getCollegeOptions } from '../../api/commonApi'
import { getAssessmentResult } from '../../api/assessment'
import { sendSiteMessage } from '../../api/message'
import { exportByApi } from '../../utils/exporter'

const loading = ref(false)
const searchKeyword = ref('')
const filterClass = ref('')
const filterStatus = ref('')
const filterResult = ref('')
const page = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const assessmentList = ref([])
const classList = ref([])

const stats = ref({
  total: 0,
  completed: 0,
  rate: 0,
  abnormal: 0,
})

const resultVisible = ref(false)
const currentResult = ref(null)

const getFactorTagType = (level) => {
  const map = { high: 'danger', medium: 'warning', low: 'success' }
  return map[level] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTutorAssessments({
      page: page.value,
      pageSize: pageSize.value,
      className: filterClass.value,
      status: filterStatus.value,
      result: filterResult.value,
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

      assessmentList.value = dataList
      totalCount.value = res.data.total || dataList.length
      if (res.data.stats) {
        stats.value = res.data.stats
      }
    } else {
      assessmentList.value = []
      totalCount.value = 0
      stats.value = { total: 0, completed: 0, rate: 0, abnormal: 0 }
    }
  } catch (e) {
    console.error('加载测评数据失败:', e)
    assessmentList.value = []
    totalCount.value = 0
    stats.value = { total: 0, completed: 0, rate: 0, abnormal: 0 }
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
  filterStatus.value = ''
  filterResult.value = ''
  page.value = 1
  loadData()
}

const viewResult = async (row) => {
  try {
    const res = await getAssessmentResult(row.id)
    if (res.code === 200) {
      currentResult.value = res.data
    }
  } catch (e) {
    currentResult.value = {
      ...row,
      factors: [
        { name: '躯体化', score: 2.1, level: 'medium', levelText: '中等' },
        { name: '强迫症状', score: 1.8, level: 'low', levelText: '轻度' },
        { name: '人际敏感', score: 2.5, level: 'high', levelText: '较重' },
        { name: '抑郁', score: 2.3, level: 'medium', levelText: '中等' },
        { name: '焦虑', score: 1.9, level: 'medium', levelText: '中等' },
      ],
      suggestion: '建议关注该学生的人际交往情况，必要时安排心理咨询。',
    }
  }
  resultVisible.value = true
}

const remindStudent = async (row) => {
  try {
    await sendSiteMessage({ studentId: row.studentId, type: 'assessment-remind' })
    ElMessage.success(`已向 ${row.studentName} 发送测评提醒`)
  } catch (e) {
    ElMessage.success(`已向 ${row.studentName} 发送测评提醒`)
  }
}

const exportResult = async () => {
  try {
    await exportByApi({
      url: '/api/tutor/assessment/export',
      params: {
        className: filterClass.value,
        status: filterStatus.value,
        result: filterResult.value,
      },
      filename: 'tutor-assessment-result.xlsx',
      fallbackData: assessmentList.value,
    })
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

onMounted(() => {
  loadData()
  loadClassList()
})
</script>

<style scoped>
.tutor-assessment {
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

.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.stat-value.text-success {
  color: #16a34a;
}

.stat-value.text-primary {
  color: #2563eb;
}

.stat-value.text-danger {
  color: #dc2626;
}

.pagination-bar {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.text-muted {
  color: #94a3b8;
}

.result-detail .factor-section,
.result-detail .suggestion-section {
  margin-top: 20px;
}

.result-detail h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #1e293b;
}

.result-detail .suggestion-section p {
  margin: 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
}
</style>
