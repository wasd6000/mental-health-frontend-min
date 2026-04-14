<template>
  <div class="tutor-page">
    <div class="page-head">
      <h2>预约管理</h2>
      <p class="page-desc">代学生预约、批量导入与预约记录监控（数据来自 <code>/api/appointment/*</code>）。</p>
      <el-button :icon="Refresh" @click="loadList">刷新</el-button>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="预约监控" name="monitor">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="状态">
            <el-select v-model="listFilter.status" clearable placeholder="全部" style="width: 140px">
              <el-option label="待确认" value="PENDING" />
              <el-option label="已确认" value="CONFIRMED" />
              <el-option label="已取消" value="CANCELLED" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadList">查询</el-button>
          </el-form-item>
        </el-form>
        <el-table v-loading="loading" :data="appointmentRows" stripe border empty-text="暂无预约记录">
          <el-table-column prop="id" label="ID" width="90" show-overflow-tooltip />
          <el-table-column prop="studentName" label="学生" min-width="100" />
          <el-table-column prop="counselorName" label="咨询师" min-width="100" />
          <el-table-column prop="appointmentTime" label="预约时间" min-width="160" />
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="代预约" name="proxy">
        <el-card shadow="never" class="form-card">
          <el-form :model="proxyForm" label-width="100px" style="max-width: 520px">
            <el-form-item label="学生学号" required>
              <el-input v-model="proxyForm.studentNo" placeholder="必填" />
            </el-form-item>
            <el-form-item label="咨询师" required>
              <el-input v-model="proxyForm.counselorId" placeholder="咨询师 ID（与后端约定）" />
            </el-form-item>
            <el-form-item label="时段" required>
              <el-date-picker
                v-model="proxyForm.slotTime"
                type="datetime"
                placeholder="选择时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="proxyForm.remark" type="textarea" :rows="2" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="proxySubmitting" @click="submitProxy">提交代预约</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="批量预约" name="batch">
        <el-alert
          title="批量预约需后端提供导入模板与接口；此处可先导出学号列表线下协调。"
          type="info"
          show-icon
          :closable="false"
        />
        <div class="batch-actions">
          <el-button @click="ElMessage.info('请对接后端批量接口后在此上传 Excel')">上传 Excel（占位）</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="detailVisible" title="预约详情" width="520px" destroy-on-close>
      <pre v-if="detailJson" class="detail-pre">{{ detailJson }}</pre>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAppointmentList, createAppointment } from '../../api/appointmentApi.js'

const activeTab = ref('monitor')
const loading = ref(false)
const appointmentRows = ref([])
const listFilter = ref({ status: '' })

const proxyForm = ref({
  studentNo: '',
  counselorId: '',
  slotTime: '',
  remark: '',
})
const proxySubmitting = ref(false)

const detailVisible = ref(false)
const detailJson = ref('')

function normalizeListPayload(res) {
  const raw = res?.data !== undefined ? res.data : res
  if (Array.isArray(raw)) return raw
  return raw?.records || raw?.list || raw?.rows || []
}

async function loadList() {
  loading.value = true
  try {
    const res = await getAppointmentList({
      page: 1,
      pageSize: 50,
      status: listFilter.value.status || undefined,
    })
    appointmentRows.value = normalizeListPayload(res).map((r) => ({
      id: r.id ?? r.appointmentId,
      studentName: r.studentName ?? r.student_name ?? r.userName ?? '—',
      counselorName: r.counselorName ?? r.counselor_name ?? '—',
      appointmentTime: r.appointmentTime ?? r.startTime ?? r.timeSlot ?? '—',
      status: r.status ?? r.state ?? '—',
      _raw: r,
    }))
  } catch (e) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function viewDetail(row) {
  detailJson.value = JSON.stringify(row._raw || row, null, 2)
  detailVisible.value = true
}

async function submitProxy() {
  if (!proxyForm.value.studentNo || !proxyForm.value.counselorId || !proxyForm.value.slotTime) {
    ElMessage.warning('请填写学号、咨询师与时段')
    return
  }
  proxySubmitting.value = true
  try {
    await createAppointment({
      studentId: proxyForm.value.studentNo,
      counselorId: proxyForm.value.counselorId,
      appointmentTime: proxyForm.value.slotTime,
      remark: proxyForm.value.remark,
      source: 'TUTOR_PROXY',
    })
    ElMessage.success('已提交')
    proxyForm.value = { studentNo: '', counselorId: '', slotTime: '', remark: '' }
    activeTab.value = 'monitor'
    await loadList()
  } catch (e) {
    ElMessage.error(e?.message || '提交失败')
  } finally {
    proxySubmitting.value = false
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.tutor-page {
  padding: 0 4px 24px;
}
.page-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.page-head h2 {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
}
.page-desc {
  margin: 0;
  flex: 1;
  min-width: 200px;
  color: #64748b;
  font-size: 14px;
}
.filter-form {
  margin-bottom: 12px;
}
.form-card {
  margin-top: 8px;
}
.batch-actions {
  margin-top: 16px;
}
.detail-pre {
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 360px;
  overflow: auto;
}
</style>
