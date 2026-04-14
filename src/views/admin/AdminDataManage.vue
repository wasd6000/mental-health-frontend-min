<template>
  <div class="data-manage">
    <div class="page-head">
      <h2>数据管理</h2>
      <p class="page-desc">数据备份、恢复、归档及数据字典管理。</p>
    </div>

    <el-tabs v-model="activeTab" class="data-tabs">
      <!-- 数据备份 -->
      <el-tab-pane label="数据备份" name="backup">
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header-row">
              <span class="card-title">备份管理</span>
              <el-button type="primary" :icon="Download" :loading="backupLoading" @click="handleBackup">
                立即备份
              </el-button>
            </div>
          </template>
          <el-table :data="backupList" stripe style="width: 100%">
            <el-table-column prop="time" label="备份时间" width="180" />
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === '成功' ? 'success' : row.status === '失败' ? 'danger' : 'info'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" :disabled="row.status !== '成功'" @click="handleRestore(row)">
                  恢复
                </el-button>
                <el-button type="primary" link size="small" :disabled="row.status !== '成功'" @click="handleDownloadBackup(row)">
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 数据恢复 -->
      <el-tab-pane label="数据恢复" name="restore">
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">恢复备份</span>
          </template>
          <el-alert
            type="warning"
            title="数据恢复将覆盖当前数据，操作前请确认已做好必要备份。"
            :closable="false"
            show-icon
            class="restore-alert"
          />
          <el-table :data="restoreList" stripe style="width: 100%; margin-top: 16px">
            <el-table-column prop="time" label="备份时间" width="180" />
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="danger" link size="small" @click="handleRestoreConfirm(row)">
                  恢复到此备份
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 数据归档 -->
      <el-tab-pane label="数据归档" name="archive">
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header-row">
              <span class="card-title">归档配置</span>
              <el-button type="primary" :icon="Setting" @click="archiveConfigVisible = true">
                配置归档规则
              </el-button>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="预约归档">超过 2 年的已结案预约自动归档</el-descriptions-item>
            <el-descriptions-item label="测评归档">超过 3 年的测评记录自动归档</el-descriptions-item>
            <el-descriptions-item label="咨询记录归档">超过 2 年的咨询记录自动归档</el-descriptions-item>
            <el-descriptions-item label="下次执行">每日 02:00 自动执行</el-descriptions-item>
          </el-descriptions>
          <div class="archive-list-header">
            <span class="card-title">归档历史</span>
          </div>
          <el-table :data="archiveList" stripe style="width: 100%">
            <el-table-column prop="time" label="归档时间" width="180" />
            <el-table-column prop="type" label="归档类型" width="140" />
            <el-table-column prop="count" label="归档条数" width="100" />
            <el-table-column prop="operator" label="操作人" width="100" />
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 数据字典 -->
      <el-tab-pane label="数据字典" name="dict">
        <el-row :gutter="20">
          <el-col :span="10">
            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header-row">
                  <span class="card-title">字典类型</span>
                  <el-button type="primary" size="small" @click="handleAddDictType">新增</el-button>
                </div>
              </template>
              <el-table
                :data="dictTypes"
                stripe
                highlight-current-row
                @current-change="handleDictTypeSelect"
              >
                <el-table-column prop="code" label="编码" min-width="100" />
                <el-table-column prop="name" label="名称" min-width="100" />
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="handleEditDictType(row)">编辑</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="14">
            <el-card class="section-card" shadow="never">
              <template #header>
                <div class="card-header-row">
                  <span class="card-title">字典项 - {{ currentDictType?.name || '请选择类型' }}</span>
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="!currentDictType"
                    @click="handleAddDictItem"
                  >
                    新增
                  </el-button>
                </div>
              </template>
              <el-table :data="dictItems" stripe style="width: 100%">
                <el-table-column prop="label" label="标签" min-width="100" />
                <el-table-column prop="value" label="值" min-width="100" />
                <el-table-column prop="sort" label="排序" width="80" />
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '启用' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="handleEditDictItem(row)">编辑</el-button>
                    <el-button type="danger" link size="small" @click="handleDeleteDictItem(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <!-- 归档配置弹窗 -->
    <el-dialog v-model="archiveConfigVisible" title="归档规则配置" width="500px">
      <el-form :model="archiveForm" label-width="120px">
        <el-form-item label="预约归档">
          <el-input-number v-model="archiveForm.appointmentYears" :min="1" :max="10" />
          <span class="form-suffix">年</span>
        </el-form-item>
        <el-form-item label="测评归档">
          <el-input-number v-model="archiveForm.assessmentYears" :min="1" :max="10" />
          <span class="form-suffix">年</span>
        </el-form-item>
        <el-form-item label="咨询记录">
          <el-input-number v-model="archiveForm.recordYears" :min="1" :max="10" />
          <span class="form-suffix">年</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="archiveConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="saveArchiveConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 恢复确认弹窗 -->
    <el-dialog v-model="restoreConfirmVisible" title="确认恢复" width="420px">
      <el-alert type="error" :closable="false" show-icon>
        <template #title>恢复将覆盖当前所有数据，且不可逆。确定要恢复吗？</template>
      </el-alert>
      <template #footer>
        <el-button @click="restoreConfirmVisible = false">取消</el-button>
        <el-button type="danger" :loading="restoreLoading" @click="executeRestore">确认恢复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Setting } from '@element-plus/icons-vue'
import { getBackupList as fetchBackupList, createBackup as doBackup, restoreBackup as doRestore } from '../../api/dataManage.js'

const activeTab = ref('backup')
const backupLoading = ref(false)
const restoreLoading = ref(false)
const restoreConfirmVisible = ref(false)
const archiveConfigVisible = ref(false)
const restoreTarget = ref(null)
const currentDictType = ref(null)

const backupList = ref([
  { id: '1', time: '2025-03-04 02:00:15', size: '128 MB', operator: '系统', status: '成功', remark: '定时备份' },
  { id: '2', time: '2025-03-03 02:00:12', size: '126 MB', operator: '系统', status: '成功', remark: '定时备份' },
  { id: '3', time: '2025-03-02 14:30:22', size: '125 MB', operator: 'admin', status: '成功', remark: '手动备份' },
])
const archiveList = ref([
  { time: '2025-03-04 02:05:00', type: '预约数据', count: 320, operator: '系统' },
  { time: '2025-03-04 02:05:12', type: '测评记录', count: 1560, operator: '系统' },
])
const archiveForm = ref({
  appointmentYears: 2,
  assessmentYears: 3,
  recordYears: 2,
})

const dictTypes = ref([
  { id: '1', code: 'risk_level', name: '风险等级' },
  { id: '2', code: 'problem_type', name: '问题类型' },
  { id: '3', code: 'college', name: '院系' },
])

const dictItemsData = ref({
  risk_level: [
    { id: 1, label: '绿色', value: 'green', sort: 1, status: '启用' },
    { id: 2, label: '黄色', value: 'yellow', sort: 2, status: '启用' },
    { id: 3, label: '橙色', value: 'orange', sort: 3, status: '启用' },
    { id: 4, label: '红色', value: 'red', sort: 4, status: '启用' },
  ],
  problem_type: [
    { id: 1, label: '学业压力', value: 'academic', sort: 1, status: '启用' },
    { id: 2, label: '人际关系', value: 'relationship', sort: 2, status: '启用' },
    { id: 3, label: '情绪困扰', value: 'emotion', sort: 3, status: '启用' },
  ],
  college: [
    { id: 1, label: '计算机学院', value: 'cs', sort: 1, status: '启用' },
    { id: 2, label: '经济学院', value: 'eco', sort: 2, status: '启用' },
  ],
})

const restoreList = computed(() => backupList.value.filter((b) => b.status === '成功'))

const dictItems = computed(() => {
  if (!currentDictType.value) return []
  return dictItemsData.value[currentDictType.value.code] || []
})

watch(activeTab, (val) => {
  if (val === 'backup' || val === 'restore') {
    loadBackupList()
  }
})

async function loadBackupList() {
  try {
    const res = await fetchBackupList()
    if (res?.code === 200 && Array.isArray(res.data)) {
      backupList.value = res.data
    }
  } catch {
    // 使用默认 mock 数据
  }
}

function handleBackup() {
  backupLoading.value = true
  doBackup()
    .then((res) => {
      if (res?.code === 200) {
        ElMessage.success('备份任务已提交，请稍后刷新列表查看')
        loadBackupList()
      } else {
        ElMessage.info('备份功能需后端接口支持，当前为演示模式')
        backupList.value.unshift({
          id: String(Date.now()),
          time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
          size: '--',
          operator: 'admin',
          status: '成功',
          remark: '演示备份',
        })
      }
    })
    .catch(() => {
      ElMessage.info('备份功能需后端接口支持，当前为演示模式')
      backupList.value.unshift({
        id: String(Date.now()),
        time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        size: '--',
        operator: 'admin',
        status: '成功',
        remark: '演示备份',
      })
    })
    .finally(() => {
      backupLoading.value = false
    })
}

function handleRestore(row) {
  restoreTarget.value = row
  restoreConfirmVisible.value = true
}

function handleRestoreConfirm(row) {
  restoreTarget.value = row
  restoreConfirmVisible.value = true
}

function executeRestore() {
  restoreLoading.value = true
  doRestore(restoreTarget.value?.id)
    .then((res) => {
      if (res?.code === 200) {
        ElMessage.success('恢复成功，请重新登录')
        restoreConfirmVisible.value = false
      } else {
        ElMessage.info('恢复功能需后端接口支持')
      }
    })
    .catch(() => {
      ElMessage.info('恢复功能需后端接口支持')
    })
    .finally(() => {
      restoreLoading.value = false
    })
}

function handleDownloadBackup(row) {
  ElMessage.info('下载功能需后端接口支持，备份文件：' + row.time)
}

function saveArchiveConfig() {
  ElMessage.success('归档规则已保存')
  archiveConfigVisible.value = false
}

function handleDictTypeSelect(row) {
  currentDictType.value = row || null
}

function handleAddDictType() {
  ElMessage.info('字典类型新增功能需后端接口支持')
}

function handleEditDictType() {
  ElMessage.info('字典类型编辑功能需后端接口支持')
}

function handleAddDictItem() {
  ElMessage.info('字典项新增功能需后端接口支持')
}

function handleEditDictItem() {
  ElMessage.info('字典项编辑功能需后端接口支持')
}

function handleDeleteDictItem(row) {
  ElMessageBox.confirm('确定删除该字典项吗？', '提示', {
    type: 'warning',
  })
    .then(() => {
      const code = currentDictType.value?.code
      const items = dictItemsData.value[code]
      if (items) {
        const idx = items.findIndex((i) => i.id === row.id)
        if (idx >= 0) {
          items.splice(idx, 1)
        }
      }
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

onMounted(() => {
  loadBackupList()
})
</script>

<style scoped>
.data-manage {
  max-width: 1100px;
}

.page-head {
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.page-head h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.data-tabs {
  background: #fff;
  padding: 16px 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.section-card {
  margin-bottom: 0;
  border: none;
  box-shadow: none;
}

.section-card :deep(.el-card__header) {
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-weight: 600;
  color: #1e293b;
}

.restore-alert {
  margin-bottom: 0;
}

.archive-list-header {
  margin: 20px 0 12px;
  font-weight: 600;
  color: #1e293b;
}

.form-suffix {
  margin-left: 8px;
  color: #64748b;
  font-size: 14px;
}
</style>
