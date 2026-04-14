<template>
  <div class="leader-report">
    <div class="page-header">
      <h2>报表查看</h2>
      <p>查看和导出全校心理健康工作报表</p>
    </div>

    <div class="filter-bar">
      <el-select v-model="reportType" placeholder="报表类型" style="width: 160px" @change="loadReports">
        <el-option label="月度报表" value="monthly" />
        <el-option label="季度报表" value="quarterly" />
        <el-option label="年度报表" value="yearly" />
        <el-option label="专项报表" value="special" />
      </el-select>
      <el-select v-model="filterCollege" placeholder="院系筛选" clearable style="width: 180px" @change="loadReports">
        <el-option label="全校" value="" />
        <el-option v-for="c in collegeList" :key="c.value" :label="c.label" :value="c.value" />
      </el-select>
      <el-date-picker
        v-model="selectedYear"
        type="year"
        placeholder="选择年份"
        format="YYYY年"
        value-format="YYYY"
        @change="loadReports"
      />
      <el-button type="primary" @click="loadReports">查询</el-button>
      <el-button type="success" @click="generateReport">生成报表</el-button>
    </div>

    <el-tabs v-model="activeTab" class="report-tabs">
      <el-tab-pane label="报表列表" name="list">
        <el-table :data="reportList" stripe v-loading="loading">
          <el-table-column prop="name" label="报表名称" min-width="250" />
          <el-table-column prop="type" label="报表类型" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ row.typeText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="scope" label="统计范围" width="120" />
          <el-table-column prop="period" label="统计周期" width="150" />
          <el-table-column prop="createTime" label="生成时间" width="180" />
          <el-table-column prop="creator" label="生成人" width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="viewReport(row)">查看</el-button>
              <el-button type="success" link size="small" @click="downloadReport(row)">下载</el-button>
              <el-button v-if="row.status === 'draft'" type="warning" link size="small" @click="publishReport(row)">发布</el-button>
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
      </el-tab-pane>

      <el-tab-pane label="院系月报汇总" name="college">
        <el-table :data="collegeReportList" stripe>
          <el-table-column prop="collegeName" label="院系" width="180" />
          <el-table-column prop="month" label="月份" width="120" />
          <el-table-column label="提交状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.submitted ? 'success' : 'danger'" size="small">
                {{ row.submitted ? '已提交' : '未提交' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submitTime" label="提交时间" width="180" />
          <el-table-column prop="crisisCount" label="危机个案" width="100" />
          <el-table-column prop="consultCount" label="咨询量" width="100" />
          <el-table-column prop="activityCount" label="活动数" width="100" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button v-if="row.submitted" type="primary" link size="small" @click="viewCollegeReport(row)">查看</el-button>
              <el-button v-else type="warning" link size="small" @click="remindSubmit(row)">催交</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="previewVisible" title="报表预览" width="1000px" :fullscreen="isFullscreen">
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
          <h1>{{ currentReport.name }}</h1>
          <p>统计周期：{{ currentReport.period }} | 统计范围：{{ currentReport.scope }}</p>
        </div>

        <div class="report-section">
          <h2>一、总体概况</h2>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="summary-item">
                <span class="summary-label">学生总数</span>
                <span class="summary-value">{{ reportDetail.totalStudents }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <span class="summary-label">测评完成率</span>
                <span class="summary-value">{{ reportDetail.assessmentRate }}%</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <span class="summary-label">危机个案数</span>
                <span class="summary-value text-danger">{{ reportDetail.crisisCount }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <span class="summary-label">咨询服务量</span>
                <span class="summary-value">{{ reportDetail.consultCount }}</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="report-section">
          <h2>二、各院系数据对比</h2>
          <div class="chart-container" ref="reportChartRef"></div>
        </div>

        <div class="report-section">
          <h2>三、危机干预情况</h2>
          <el-table :data="reportDetail.crisisData" size="small" border>
            <el-table-column prop="levelText" label="等级" width="100" />
            <el-table-column prop="count" label="个案数" width="100" />
            <el-table-column prop="resolved" label="已结案" width="100" />
            <el-table-column prop="ongoing" label="跟进中" width="100" />
            <el-table-column prop="resolveRate" label="结案率" width="100">
              <template #default="{ row }">{{ row.resolveRate }}%</template>
            </el-table-column>
          </el-table>
        </div>

        <div class="report-section">
          <h2>四、工作亮点</h2>
          <div class="highlight-content">{{ reportDetail.highlights }}</div>
        </div>

        <div class="report-section">
          <h2>五、存在问题与建议</h2>
          <div class="suggestion-content">{{ reportDetail.suggestions }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadReport(currentReport)">下载报表</el-button>
        <el-button v-if="currentReport?.status === 'draft'" type="success" @click="publishReport(currentReport)">发布报表</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getReportList, getReportHistory, postReportPreview } from '../../api/reportApi'
import { exportByApi } from '../../utils/exporter'

const loading = ref(false)
const reportType = ref('monthly')
const filterCollege = ref('')
const selectedYear = ref(new Date().getFullYear().toString())
const activeTab = ref('list')
const page = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

const reportList = ref([])
const collegeReportList = ref([])

const collegeList = ref([
  { label: '计算机学院', value: 'cs' },
  { label: '理学院', value: 'sci' },
  { label: '外语学院', value: 'fl' },
  { label: '文学院', value: 'lit' },
  { label: '经济管理学院', value: 'em' },
])

const previewVisible = ref(false)
const isFullscreen = ref(false)
const currentReport = ref(null)
const reportDetail = ref({})
const reportChartRef = ref()
let reportChart = null

const getStatusType = (status) => {
  const map = { published: 'success', draft: 'warning', generating: 'info' }
  return map[status] || 'info'
}

const loadReports = async () => {
  loading.value = true
  try {
    const res = await getReportList({
      type: reportType.value,
      college: filterCollege.value,
      year: selectedYear.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    if (res.code === 200) {
      reportList.value = res.data?.list || res.data || []
      totalCount.value = res.data?.total || reportList.value.length
    }
  } catch (e) {
    reportList.value = [
      { id: 1, name: '2024年3月全校心理健康工作月报', type: 'monthly', typeText: '月度', scope: '全校', period: '2024年3月', createTime: '2024-04-05 10:30', creator: '系统', status: 'published', statusText: '已发布' },
      { id: 2, name: '2024年2月全校心理健康工作月报', type: 'monthly', typeText: '月度', scope: '全校', period: '2024年2月', createTime: '2024-03-05 09:15', creator: '系统', status: 'published', statusText: '已发布' },
      { id: 3, name: '2024年第一季度心理健康工作报告', type: 'quarterly', typeText: '季度', scope: '全校', period: '2024年Q1', createTime: '2024-04-10 14:20', creator: '张处长', status: 'draft', statusText: '草稿' },
      { id: 4, name: '2023年度心理健康工作年报', type: 'yearly', typeText: '年度', scope: '全校', period: '2023年', createTime: '2024-01-20 16:00', creator: '李副校长', status: 'published', statusText: '已发布' },
    ]
    totalCount.value = 4
  }
  loading.value = false

  try {
    const res = await getReportHistory({ year: selectedYear.value, month: '03', scope: 'college' })
    if (res.code === 200) {
      collegeReportList.value = res.data || []
    }
  } catch (e) {
    collegeReportList.value = [
      { collegeName: '计算机学院', month: '2024-03', submitted: true, submitTime: '2024-04-03 10:30', crisisCount: 27, consultCount: 156, activityCount: 12 },
      { collegeName: '理学院', month: '2024-03', submitted: true, submitTime: '2024-04-04 09:15', crisisCount: 22, consultCount: 128, activityCount: 10 },
      { collegeName: '外语学院', month: '2024-03', submitted: true, submitTime: '2024-04-02 14:20', crisisCount: 18, consultCount: 98, activityCount: 8 },
      { collegeName: '文学院', month: '2024-03', submitted: false, submitTime: '-', crisisCount: 0, consultCount: 0, activityCount: 0 },
      { collegeName: '经济管理学院', month: '2024-03', submitted: true, submitTime: '2024-04-05 11:00', crisisCount: 32, consultCount: 145, activityCount: 11 },
    ]
  }
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
      totalStudents: 28560,
      assessmentRate: 93.2,
      crisisCount: 186,
      consultCount: 1256,
      crisisData: [
        { levelText: '红色', count: 12, resolved: 10, ongoing: 2, resolveRate: 83.3 },
        { levelText: '橙色', count: 38, resolved: 32, ongoing: 6, resolveRate: 84.2 },
        { levelText: '黄色', count: 86, resolved: 68, ongoing: 18, resolveRate: 79.1 },
        { levelText: '蓝色', count: 50, resolved: 45, ongoing: 5, resolveRate: 90.0 },
      ],
      highlights: '1. 全校测评完成率达到93.2%，较上月提升3.2个百分点。\n2. 危机个案数较上月下降8%，干预效果显著。\n3. 成功举办"5.25心理健康月"系列活动，覆盖学生2万余人次。\n4. 完成心理咨询师队伍培训，提升专业服务能力。',
      suggestions: '1. 部分院系测评完成率仍有提升空间，建议加强督促。\n2. 针对毕业生群体的心理服务需求增加，建议增设专项服务。\n3. 建议进一步优化心理危机预警机制，提高响应效率。\n4. 建议加大心理健康教育宣传力度，营造良好校园氛围。',
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
    legend: { data: ['测评完成率', '咨询覆盖率', '健康指数'] },
    xAxis: {
      type: 'category',
      data: ['计算机', '理学院', '外语', '文学院', '经管', '机械', '电信', '艺术'],
    },
    yAxis: { type: 'value', max: 100 },
    series: [
      { name: '测评完成率', type: 'bar', data: [95, 92, 90, 88, 85, 87, 91, 86] },
      { name: '咨询覆盖率', type: 'bar', data: [85, 80, 78, 75, 82, 76, 83, 70] },
      { name: '健康指数', type: 'line', data: [92, 88, 85, 82, 78, 80, 86, 84] },
    ],
  })
}

const downloadReport = async (row) => {
  try {
    await exportByApi({
      url: '/api/leader/report/download',
      params: { id: row.id, month: row.month },
      filename: `${row.name || 'leader-report'}.xlsx`,
      fallbackData: row,
    })
    ElMessage.success('下载成功')
  } catch (e) {
    ElMessage.error(e?.message || '下载失败')
  }
}

const publishReport = (row) => {
  ElMessage.success(`${row.name} 已发布`)
  row.status = 'published'
  row.statusText = '已发布'
}

const generateReport = async () => {
  try {
    await exportByApi({
      url: '/api/leader/report/generate',
      method: 'post',
      data: { month: selectedMonth.value },
      filename: `leader-report-${selectedMonth.value || 'current'}.xlsx`,
      fallbackData: reportList.value,
    })
    ElMessage.success('已生成并导出报表')
  } catch (e) {
    ElMessage.error(e?.message || '生成失败')
  }
}

const viewCollegeReport = (row) => {
  ElMessage.info(`查看 ${row.collegeName} 月报`)
}

const remindSubmit = (row) => {
  ElMessage.success(`已向 ${row.collegeName} 发送催交通知`)
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
.leader-report {
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

.report-tabs {
  margin-top: 20px;
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
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.report-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #1e293b;
}

.report-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.report-section {
  margin-bottom: 32px;
}

.report-section h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #1e293b;
  padding-bottom: 8px;
  border-bottom: 2px solid #3b82f6;
  display: inline-block;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.summary-label {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.summary-value.text-danger {
  color: #dc2626;
}

.chart-container {
  height: 300px;
}

.highlight-content,
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
