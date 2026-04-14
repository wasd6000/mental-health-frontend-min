<template>
  <div class="center-report-export">
    <div class="page-head">
      <h2>报表导出</h2>
      <p class="page-desc">导出心理中心各类业务报表，支持 Excel、PDF、Word 等格式。</p>
    </div>

    <el-card class="export-card" shadow="never">
      <el-form :model="form" label-width="100px" class="export-form">
        <el-form-item label="报表类型">
          <el-select v-model="form.reportType" placeholder="选择报表类型" style="width: 100%">
            <el-option label="咨询统计报表" value="consult" />
            <el-option label="测评完成报表" value="assessment" />
            <el-option label="危机处置报表" value="crisis" />
            <el-option label="预约统计报表" value="appointment" />
            <el-option label="综合月报" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="统计周期">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="form.format">
            <el-radio value="excel">Excel</el-radio>
            <el-radio value="pdf">PDF</el-radio>
            <el-radio value="word">Word</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Download" @click="handleExport" :loading="exporting">
            导出报表
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="history-card" shadow="never">
      <template #header>
        <span class="card-title">导出记录</span>
      </template>
      <el-table :data="exportHistory" stripe>
        <el-table-column prop="name" label="报表名称" min-width="180" />
        <el-table-column prop="period" label="周期" width="140" />
        <el-table-column prop="format" label="格式" width="80" />
        <el-table-column prop="time" label="导出时间" width="170" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="downloadAgain(row)">再次下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  reportType: 'consult',
  dateRange: [],
  format: 'excel',
})

const exporting = ref(false)
const exportHistory = ref([
  { id: 1, name: '咨询统计报表', period: '2025-02', format: 'Excel', time: '2025-03-04 09:32:15' },
  { id: 2, name: '综合月报', period: '2025-02', format: 'PDF', time: '2025-03-03 14:20:08' },
])

function handleExport() {
  if (!form.dateRange || form.dateRange.length !== 2) {
    ElMessage.warning('请选择统计周期')
    return
  }
  exporting.value = true
  setTimeout(() => {
    exporting.value = false
    const name = { consult: '咨询统计报表', assessment: '测评完成报表', crisis: '危机处置报表', appointment: '预约统计报表', monthly: '综合月报' }[form.reportType]
    exportHistory.value.unshift({
      id: Date.now(),
      name,
      period: form.dateRange.join(' ~ '),
      format: form.format.toUpperCase(),
      time: new Date().toLocaleString('zh-CN'),
    })
    ElMessage.success('报表导出成功')
  }, 800)
}

function downloadAgain(row) {
  ElMessage.info('再次下载：' + row.name)
}
</script>

<style scoped>
.center-report-export { max-width: 700px; }

.page-head {
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.page-head h2 { margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #1e293b; }
.page-desc { margin: 0; font-size: 14px; color: #64748b; }

.export-card, .history-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.export-form { max-width: 400px; }
</style>
