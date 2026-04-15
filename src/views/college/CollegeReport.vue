<template>
  <div class="college-report">
    <div class="page-header">
      <h2>报表查看</h2>
      <p>查看和导出院系心理健康工作报表</p>
    </div>

    <div class="filter-bar">
      <el-select v-model="reportType" placeholder="报表类型" style="width: 160px">
        <el-option label="月度报表" value="monthly" />
        <el-option label="季度报表" value="quarterly" />
        <el-option label="年度报表" value="yearly" />
        <el-option label="专项报表" value="special" />
      </el-select>
      <el-date-picker
        v-model="selectedPeriod"
        :type="periodType"
        :placeholder="periodPlaceholder"
        :format="periodFormat"
        :value-format="periodValueFormat"
        @change="loadReports"
      />
      <el-button type="primary" @click="loadReports">查询</el-button>
    </div>

    <el-table :data="reportList" stripe v-loading="loading">
      <el-table-column prop="name" label="报表名称" min-width="200" />
      <el-table-column prop="period" label="统计周期" width="150" />
      <el-table-column prop="createTime" label="生成时间" width="180" />
      <el-table-column prop="creator" label="生成人" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'published' ? 'success' : 'info'" size="small">
            {{ row.status === 'published' ? '已发布' : '待审核' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="viewReport(row)">查看</el-button>
          <el-button type="success" link size="small" @click="downloadReport(row)">下载</el-button>
          <el-button type="warning" link size="small" @click="shareReport(row)">分享</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="totalCount"
        layout="total, prev, pager, next"
        @current-change="loadReports"
      />
    </div>

    <el-dialog v-model="previewVisible" title="报表预览" width="900px" :fullscreen="isFullscreen">
      <template #header>
        <div class="dialog-header">
          <span>{{ currentReport?.name }}</span>
          <el-button type="primary" link @click="isFullscreen = !isFullscreen">
            {{ isFullscreen ? '退出全屏' : '全屏查看' }}
          </el-button>
        </div>
      </template>
      <div class="report-preview" v-if="currentReport">
        <div class="report-header">
          <h2>{{ currentReport.name }}</h2>
          <p>统计周期：{{ currentReport.period }}</p>
        </div>

        <div class="report-section">
          <h3>一、总体概况</h3>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="学生总数">{{ reportDetail.totalStudents }}</el-descriptions-item>
            <el-descriptions-item label="测评完成率">{{ reportDetail.assessmentRate }}%</el-descriptions-item>
            <el-descriptions-item label="危机个案数">{{ reportDetail.crisisCount }}</el-descriptions-item>
            <el-descriptions-item label="咨询服务量">{{ reportDetail.consultCount }}次</el-descriptions-item>
            <el-descriptions-item label="活动开展数">{{ reportDetail.activityCount }}场</el-descriptions-item>
            <el-descriptions-item label="参与人次">{{ reportDetail.participantCount }}人次</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="report-section">
          <h3>二、测评分析</h3>
          <div class="chart-container" ref="reportChartRef"></div>
        </div>

        <div class="report-section">
          <h3>三、危机情况</h3>
          <el-table :data="reportDetail.crisisData" size="small">
            <el-table-column prop="level" label="等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getCrisisTagType(row.level)" size="small">{{ row.levelText }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="count" label="个案数" width="100" />
            <el-table-column prop="resolved" label="已结案" width="100" />
            <el-table-column prop="ongoing" label="跟进中" width="100" />
          </el-table>
        </div>

        <div class="report-section">
          <h3>四、辅导员月报汇总</h3>
          <el-table :data="reportDetail.tutorReports" size="small">
            <el-table-column prop="tutorName" label="辅导员" width="100" />
            <el-table-column prop="studentCount" label="负责学生" width="100" />
            <el-table-column prop="talkCount" label="谈心谈话" width="100" />
            <el-table-column prop="crisisReport" label="危机上报" width="100" />
            <el-table-column prop="status" label="月报状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'submitted' ? 'success' : 'warning'" size="small">
                  {{ row.status === 'submitted' ? '已提交' : '未提交' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="report-section">
          <h3>五、工作建议</h3>
          <div class="suggestion-content">{{ reportDetail.suggestions }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadReport(currentReport)">下载报表</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getReportList, postReportPreview } from '../../api/reportApi'

const loading = ref(false)
const reportType = ref('monthly')
const selectedPeriod = ref('')
const page = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const reportList = ref([])

const previewVisible = ref(false)
const isFullscreen = ref(false)
const currentReport = ref(null)
const reportDetail = ref({})
const reportChartRef = ref()
let reportChart = null

const periodType = computed(() => {
  const map = { monthly: 'month', quarterly: 'month', yearly: 'year', special: 'daterange' }
  return map[reportType.value] || 'month'
})

const periodPlaceholder = computed(() => {
  const map = { monthly: '选择月份', quarterly: '选择季度起始月', yearly: '选择年份', special: '选择日期范围' }
  return map[reportType.value]
})

const periodFormat = computed(() => {
  const map = { monthly: 'YYYY年MM月', quarterly: 'YYYY年MM月', yearly: 'YYYY年', special: 'YYYY-MM-DD' }
  return map[reportType.value]
})

const periodValueFormat = computed(() => {
  const map = { monthly: 'YYYY-MM', quarterly: 'YYYY-MM', yearly: 'YYYY', special: 'YYYY-MM-DD' }
  return map[reportType.value]
})

const getCrisisTagType = (level) => {
  const map = { red: 'danger', orange: 'warning', yellow: '', blue: 'info' }
  return map[level] || 'info'
}

const loadReports = async () => {
  loading.value = true
  try {
    const res = await getReportList({
      type: reportType.value,
      period: selectedPeriod.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (res.code === 200) {
      const data = res.data
      reportList.value = Array.isArray(data) ? data : (data?.list || data?.records || [])
      totalCount.value = data?.total || reportList.value.length
    }
  } catch (e) {
    reportList.value = [
      { id: 1, name: '2024年3月心理健康工作月报', period: '2024年3月', createTime: '2024-04-05 10:30', creator: '张主任', status: 'published' },
      { id: 2, name: '2024年2月心理健康工作月报', period: '2024年2月', createTime: '2024-03-05 09:15', creator: '张主任', status: 'published' },
      { id: 3, name: '2024年1月心理健康工作月报', period: '2024年1月', createTime: '2024-02-03 14:20', creator: '张主任', status: 'published' },
      { id: 4, name: '2023年度心理健康工作年报', period: '2023年', createTime: '2024-01-15 16:00', creator: '李副院长', status: 'published' },
    ]
    totalCount.value = 4
  }
  loading.value = false
}

const viewReport = async (row) => {
  currentReport.value = row
  try {
    const res = await postReportPreview({ reportId: row.id })
    if (res.code === 200) {
      reportDetail.value = res.data
    }
  } catch (e) {
    reportDetail.value = {
      totalStudents: 3256,
      assessmentRate: 91.5,
      crisisCount: 27,
      consultCount: 156,
      activityCount: 12,
      participantCount: 1850,
      crisisData: [
        { level: 'red', levelText: '红色', count: 2, resolved: 1, ongoing: 1 },
        { level: 'orange', levelText: '橙色', count: 5, resolved: 3, ongoing: 2 },
        { level: 'yellow', levelText: '黄色', count: 12, resolved: 8, ongoing: 4 },
        { level: 'blue', levelText: '蓝色', count: 8, resolved: 6, ongoing: 2 },
      ],
      tutorReports: [
        { tutorName: '王老师', studentCount: 420, talkCount: 35, crisisReport: 3, status: 'submitted' },
        { tutorName: '李老师', studentCount: 380, talkCount: 28, crisisReport: 2, status: 'submitted' },
        { tutorName: '张老师', studentCount: 350, talkCount: 22, crisisReport: 1, status: 'pending' },
      ],
      suggestions: '1. 加强对重点学生的关注和跟踪，特别是大一新生和毕业班学生。\n2. 增加心理健康教育活动的频次和覆盖面。\n3. 优化辅导员与心理中心的协作机制，提高危机干预效率。\n4. 定期组织辅导员心理工作培训，提升专业能力。',
    }
  }
  previewVisible.value = true
  setTimeout(initReportChart, 100)
}

const initReportChart = () => {
  if (!reportChartRef.value) {
    return
  }
  reportChart?.dispose()
  reportChart = echarts.init(reportChartRef.value)
  reportChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['应测人数', '已测人数'] },
    xAxis: {
      type: 'category',
      data: ['计科', '软工', '信安', '物联网', '数据科学'],
    },
    yAxis: { type: 'value' },
    series: [
      { name: '应测人数', type: 'bar', data: [820, 750, 520, 680, 486] },
      { name: '已测人数', type: 'bar', data: [779, 660, 478, 578, 437] },
    ],
  })
}

const downloadReport = (row) => {
  ElMessage.info(`下载 ${row.name}`)
}

const shareReport = (row) => {
  ElMessage.info(`分享 ${row.name}`)
}

watch(previewVisible, (val) => {
  if (!val && reportChart) {
    reportChart.dispose()
    reportChart = null
  }
})

onMounted(() => {
  loadReports()
})

onUnmounted(() => {
  reportChart?.dispose()
})
</script>

<style scoped>
.college-report {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
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

.pagination-bar {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.report-preview {
  max-height: 70vh;
  overflow-y: auto;
}

.report-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.report-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1e293b;
}

.report-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.report-section {
  margin-bottom: 24px;
}

.report-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #1e293b;
  padding-bottom: 8px;
  border-bottom: 2px solid #3b82f6;
  display: inline-block;
}

.chart-container {
  height: 250px;
}

.suggestion-content {
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
  line-height: 1.8;
  white-space: pre-line;
}
</style>
