<template>
  <div class="leader-colleges">
    <div class="page-header">
      <h2>院系管理</h2>
      <p>查看和管理各院系心理健康工作情况</p>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索院系名称"
        prefix-icon="Search"
        clearable
        style="width: 200px"
      />
      <el-select v-model="sortField" placeholder="排序方式" style="width: 150px">
        <el-option label="学生数量" value="studentCount" />
        <el-option label="测评完成率" value="assessmentRate" />
        <el-option label="危机个案数" value="crisisCount" />
        <el-option label="健康指数" value="healthIndex" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button type="success" @click="exportData">导出</el-button>
    </div>

    <div class="college-cards">
      <div class="college-card" v-for="college in collegeList" :key="college.id" @click="viewCollegeDetail(college)">
        <div class="card-header">
          <h3>{{ college.name }}</h3>
          <el-tag :type="getHealthTagType(college.healthIndex)" size="small">{{ college.healthIndex }}分</el-tag>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">学生总数</span>
            <span class="stat-value">{{ college.studentCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">测评完成率</span>
            <span class="stat-value">{{ college.assessmentRate }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">危机个案</span>
            <span class="stat-value" :class="college.crisisCount > 20 ? 'text-danger' : ''">{{ college.crisisCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">咨询量</span>
            <span class="stat-value">{{ college.consultCount }}</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="leader-info">
            <span class="leader-label">分管领导：</span>
            <span class="leader-name">{{ college.leader }}</span>
          </div>
          <el-button type="primary" link size="small">查看详情</el-button>
        </div>
      </div>
    </div>

    <el-dialog v-model="detailVisible" :title="currentCollege?.name" width="900px">
      <div class="college-detail" v-if="currentCollege">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="院系名称">{{ currentCollege.name }}</el-descriptions-item>
          <el-descriptions-item label="院系代码">{{ currentCollege.code }}</el-descriptions-item>
          <el-descriptions-item label="学生总数">{{ currentCollege.studentCount }}</el-descriptions-item>
          <el-descriptions-item label="辅导员数量">{{ currentCollege.tutorCount }}</el-descriptions-item>
          <el-descriptions-item label="分管领导">{{ currentCollege.leader }}</el-descriptions-item>
          <el-descriptions-item label="心理负责人">{{ currentCollege.psychLeader }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>心理健康指标</h4>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="metric-card">
                <span class="metric-label">测评完成率</span>
                <el-progress type="circle" :percentage="currentCollege.assessmentRate" :color="getProgressColor(currentCollege.assessmentRate)" :width="80" />
              </div>
            </el-col>
            <el-col :span="6">
              <div class="metric-card">
                <span class="metric-label">健康指数</span>
                <div class="metric-value" :class="getHealthClass(currentCollege.healthIndex)">{{ currentCollege.healthIndex }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="metric-card">
                <span class="metric-label">危机个案</span>
                <div class="metric-value" :class="currentCollege.crisisCount > 20 ? 'text-danger' : ''">{{ currentCollege.crisisCount }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="metric-card">
                <span class="metric-label">咨询覆盖率</span>
                <div class="metric-value">{{ currentCollege.consultRate }}%</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="detail-section">
          <h4>危机等级分布</h4>
          <el-table :data="currentCollege.crisisDistribution" size="small" border>
            <el-table-column prop="levelText" label="等级" width="100">
              <template #default="{ row }">
                <div class="level-cell">
                  <span class="level-dot" :class="row.level"></span>
                  <span>{{ row.levelText }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="个案数" width="100" />
            <el-table-column prop="resolved" label="已结案" width="100" />
            <el-table-column prop="ongoing" label="跟进中" width="100" />
            <el-table-column prop="resolveRate" label="结案率" width="100">
              <template #default="{ row }">{{ row.resolveRate }}%</template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-section">
          <h4>辅导员工作情况</h4>
          <el-table :data="currentCollege.tutorList" size="small">
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="studentCount" label="负责学生" width="100" />
            <el-table-column prop="talkCount" label="谈心谈话" width="100" />
            <el-table-column prop="crisisReport" label="危机上报" width="100" />
            <el-table-column label="月报状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.reportSubmitted ? 'success' : 'danger'" size="small">
                  {{ row.reportSubmitted ? '已提交' : '未提交' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-section">
          <h4>趋势对比</h4>
          <div class="chart-container" ref="detailChartRef"></div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="viewCollegeReport">查看报表</el-button>
        <el-button type="warning" @click="sendNotice">发送通知</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getCollegeOptions } from '../../api/commonApi'
import { getStatsOverview } from '../../api/statsApi'
import { exportByApi } from '../../utils/exporter'

const searchKeyword = ref('')
const sortField = ref('healthIndex')

const collegeList = ref([])
const detailVisible = ref(false)
const currentCollege = ref(null)
const detailChartRef = ref()
let detailChart = null

const getHealthTagType = (index) => {
  if (index >= 85) {
    return 'success'
  }
  if (index >= 70) {
    return ''
  }
  return 'danger'
}

const getHealthClass = (index) => {
  if (index >= 85) {
    return 'text-success'
  }
  if (index >= 70) {
    return ''
  }
  return 'text-danger'
}

const getProgressColor = (rate) => {
  if (rate >= 90) {
    return '#10b981'
  }
  if (rate >= 70) {
    return '#f59e0b'
  }
  return '#ef4444'
}

const loadData = async () => {
  try {
    const res = await getCollegeOptions({
      keyword: searchKeyword.value,
      sortBy: sortField.value,
    })
    if (res.code === 200) {
      collegeList.value = res.data || []
    }
  } catch (e) {
    collegeList.value = [
      { id: 1, name: '计算机科学与技术学院', code: 'CS', studentCount: 3256, assessmentRate: 95, crisisCount: 27, consultCount: 156, healthIndex: 92, leader: '张院长', tutorCount: 12 },
      { id: 2, name: '理学院', code: 'SCI', studentCount: 2890, assessmentRate: 92, crisisCount: 22, consultCount: 128, healthIndex: 88, leader: '李院长', tutorCount: 10 },
      { id: 3, name: '外国语学院', code: 'FL', studentCount: 2450, assessmentRate: 90, crisisCount: 18, consultCount: 98, healthIndex: 85, leader: '王院长', tutorCount: 8 },
      { id: 4, name: '文学院', code: 'LIT', studentCount: 2120, assessmentRate: 88, crisisCount: 15, consultCount: 86, healthIndex: 82, leader: '刘院长', tutorCount: 7 },
      { id: 5, name: '经济管理学院', code: 'EM', studentCount: 3560, assessmentRate: 85, crisisCount: 32, consultCount: 145, healthIndex: 78, leader: '陈院长', tutorCount: 14 },
      { id: 6, name: '机械工程学院', code: 'ME', studentCount: 2680, assessmentRate: 87, crisisCount: 24, consultCount: 112, healthIndex: 80, leader: '赵院长', tutorCount: 10 },
      { id: 7, name: '电子信息学院', code: 'EI', studentCount: 3120, assessmentRate: 91, crisisCount: 26, consultCount: 135, healthIndex: 86, leader: '孙院长', tutorCount: 11 },
      { id: 8, name: '艺术学院', code: 'ART', studentCount: 1850, assessmentRate: 86, crisisCount: 12, consultCount: 76, healthIndex: 84, leader: '周院长', tutorCount: 6 },
    ]
  }
}

const viewCollegeDetail = async (college) => {
  currentCollege.value = { ...college }
  try {
    const res = await getStatsOverview({ collegeId: college.id })
    if (res.code === 200) {
      currentCollege.value = res.data
    }
  } catch (e) {
    currentCollege.value = {
      ...college,
      psychLeader: '王主任',
      consultRate: 85,
      crisisDistribution: [
        { level: 'red', levelText: '红色', count: 2, resolved: 1, ongoing: 1, resolveRate: 50 },
        { level: 'orange', levelText: '橙色', count: 5, resolved: 4, ongoing: 1, resolveRate: 80 },
        { level: 'yellow', levelText: '黄色', count: 12, resolved: 9, ongoing: 3, resolveRate: 75 },
        { level: 'blue', levelText: '蓝色', count: 8, resolved: 7, ongoing: 1, resolveRate: 87.5 },
      ],
      tutorList: [
        { name: '王老师', studentCount: 420, talkCount: 35, crisisReport: 3, reportSubmitted: true },
        { name: '李老师', studentCount: 380, talkCount: 28, crisisReport: 2, reportSubmitted: true },
        { name: '张老师', studentCount: 350, talkCount: 22, crisisReport: 1, reportSubmitted: false },
      ],
    }
  }
  detailVisible.value = true
  setTimeout(initDetailChart, 100)
}

const initDetailChart = () => {
  if (!detailChartRef.value) {
    return
  }
  detailChart?.dispose()
  detailChart = echarts.init(detailChartRef.value)
  detailChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['测评完成率', '健康指数', '全校平均'] },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: { type: 'value', max: 100 },
    series: [
      {
        name: '测评完成率',
        type: 'line',
        data: [88, 90, 92, 93, 94, 95],
        itemStyle: { color: '#3b82f6' },
      },
      {
        name: '健康指数',
        type: 'line',
        data: [85, 86, 88, 89, 91, 92],
        itemStyle: { color: '#10b981' },
      },
      {
        name: '全校平均',
        type: 'line',
        data: [86, 87, 88, 89, 90, 91],
        itemStyle: { color: '#94a3b8' },
        lineStyle: { type: 'dashed' },
      },
    ],
  })
}

const exportData = async () => {
  try {
    await exportByApi({
      url: '/api/leader/college/export',
      params: {
        keyword: searchKeyword.value,
        type: filterType.value,
      },
      filename: 'leader-college-overview.xlsx',
      fallbackData: collegeList.value,
    })
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(e?.message || '导出失败')
  }
}

const viewCollegeReport = () => {
  ElMessage.info(`查看 ${currentCollege.value.name} 报表`)
}

const sendNotice = () => {
  ElMessage.info(`向 ${currentCollege.value.name} 发送通知`)
}

watch(detailVisible, (val) => {
  if (!val && detailChart) {
    detailChart.dispose()
    detailChart = null
  }
})

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  detailChart?.dispose()
})
</script>

<style scoped>
.leader-colleges {
  max-width: 1400px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1e293b;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.college-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.college-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.college-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.card-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.stat-value.text-danger {
  color: #dc2626;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.leader-info {
  font-size: 13px;
  color: #64748b;
}

.leader-name {
  color: #1e293b;
}

.college-detail .detail-section {
  margin-top: 24px;
}

.college-detail .detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.metric-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
}

.metric-value.text-success {
  color: #16a34a;
}

.metric-value.text-danger {
  color: #dc2626;
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

.level-dot.red {
  background: #dc2626;
}

.level-dot.orange {
  background: #f59e0b;
}

.level-dot.yellow {
  background: #eab308;
}

.level-dot.blue {
  background: #3b82f6;
}

.chart-container {
  height: 250px;
}

@media (max-width: 1024px) {
  .college-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .college-cards {
    grid-template-columns: 1fr;
  }
}
</style>
