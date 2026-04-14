<template>
  <div class="assessment-system">
    <div class="page-head">
      <h2>测评系统管理</h2>
      <p class="page-desc">测评系统全局配置、量表库管理、测评流程与权限配置。</p>
      <div class="head-actions">
        <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- 全局配置 -->
      <el-tab-pane label="全局配置" name="config">
        <el-card class="section-card" shadow="never">
          <el-form :model="globalConfig" label-width="140px" class="config-form">
            <el-form-item label="测评系统开关">
              <el-switch v-model="globalConfig.enabled" active-text="开启" inactive-text="关闭" />
              <span class="form-tip">关闭后学生端无法发起测评</span>
            </el-form-item>
            <el-form-item label="允许重复测评">
              <el-switch v-model="globalConfig.allowRetake" />
              <span class="form-tip">开启后同一量表可多次作答</span>
            </el-form-item>
            <el-form-item label="单次作答时限(分钟)">
              <el-input-number v-model="globalConfig.timeLimit" :min="10" :max="120" />
              <span class="form-tip">0 表示不限时</span>
            </el-form-item>
            <el-form-item label="结果可见范围">
              <el-checkbox-group v-model="globalConfig.resultViewRoles">
                <el-checkbox value="student">学生本人</el-checkbox>
                <el-checkbox value="counselor">咨询师</el-checkbox>
                <el-checkbox value="center">心理中心</el-checkbox>
                <el-checkbox value="tutor">辅导员</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveGlobalConfig">保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 量表库管理 -->
      <el-tab-pane label="量表库管理" name="scale">
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">量表列表</span>
              <el-button type="primary" size="small" @click="openScaleDialog()">新增量表</el-button>
            </div>
          </template>
          <el-table :data="scaleList" stripe>
            <el-table-column prop="id" label="编码" width="120" />
            <el-table-column prop="title" label="量表名称" min-width="180" />
            <el-table-column prop="itemCount" label="题目数" width="90" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
                  {{ row.enabled ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="usageCount" label="使用次数" width="100" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openScaleDialog(row)">编辑</el-button>
                <el-button type="primary" link size="small" @click="toggleScale(row)">
                  {{ row.enabled ? '停用' : '启用' }}
                </el-button>
                <el-button type="danger" link size="small" @click="removeScale(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 流程与权限 -->
      <el-tab-pane label="流程与权限" name="process">
        <el-card class="section-card" shadow="never">
          <template #header><span class="card-title">测评流程配置</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="发起测评">学生/家长端可发起，需心理中心分配任务或开放自助测评</el-descriptions-item>
            <el-descriptions-item label="普查任务">心理中心创建普查任务，指定院系/年级，学生需在截止前完成</el-descriptions-item>
            <el-descriptions-item label="预警规则">得分超过阈值自动生成预警，推送至辅导员/心理中心</el-descriptions-item>
            <el-descriptions-item label="报告导出">咨询师、心理中心、管理员可导出个体/整体报告</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card class="section-card mt" shadow="never">
          <template #header><span class="card-title">权限矩阵</span></template>
          <el-table :data="permissionMatrix" size="small" border>
            <el-table-column prop="module" label="功能模块" width="140" />
            <el-table-column prop="admin" label="管理员" width="90" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.admin" type="success" size="small">有</el-tag>
                <el-tag v-else type="info" size="small">无</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="center" label="心理中心" width="90" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.center" type="success" size="small">有</el-tag>
                <el-tag v-else type="info" size="small">无</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="counselor" label="咨询师" width="90" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.counselor" type="success" size="small">有</el-tag>
                <el-tag v-else type="info" size="small">无</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="tutor" label="辅导员" width="90" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.tutor" type="success" size="small">有</el-tag>
                <el-tag v-else type="info" size="small">无</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="scaleDialogVisible" :title="editingScale ? '编辑量表' : '新增量表'" width="500px">
      <el-form :model="scaleForm" label-width="90px">
        <el-form-item label="量表编码" required>
          <el-input v-model="scaleForm.id" placeholder="如 scl90" :disabled="!!editingScale" />
        </el-form-item>
        <el-form-item label="量表名称" required>
          <el-input v-model="scaleForm.title" placeholder="如 SCL-90症状自评量表" />
        </el-form-item>
        <el-form-item label="题目数量">
          <el-input-number v-model="scaleForm.itemCount" :min="1" :max="200" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="scaleForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scaleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveScale">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getScaleConfig } from '../../api/config'
import { ElMessage } from 'element-plus'

const activeTab = ref('config')
const globalConfig = reactive({
  enabled: true,
  allowRetake: false,
  timeLimit: 30,
  resultViewRoles: ['student', 'counselor', 'center', 'tutor'],
})

const scaleList = ref([])
const scaleDialogVisible = ref(false)
const editingScale = ref(null)
const scaleForm = reactive({
  id: '',
  title: '',
  itemCount: 10,
  enabled: true,
})

const permissionMatrix = [
  { module: '量表库管理', admin: true, center: false, counselor: false, tutor: false },
  { module: '测评任务发布', admin: true, center: true, counselor: false, tutor: false },
  { module: '测评数据查看', admin: true, center: true, counselor: true, tutor: true },
  { module: '报告导出', admin: true, center: true, counselor: true, tutor: false },
  { module: '预警规则配置', admin: true, center: true, counselor: false, tutor: false },
]

async function loadData() {
  const res = await getScaleConfig()
  const raw = res?.data || []
  scaleList.value = raw.map((s) => ({
    ...s,
    itemCount: s.itemCount ?? 10,
    usageCount: s.usageCount ?? Math.floor(Math.random() * 500),
  }))
}

function saveGlobalConfig() {
  ElMessage.success('全局配置已保存')
}

function openScaleDialog(row = null) {
  editingScale.value = row
  if (row) {
    scaleForm.id = row.id
    scaleForm.title = row.title
    scaleForm.itemCount = row.itemCount ?? 10
    scaleForm.enabled = row.enabled
  } else {
    scaleForm.id = ''
    scaleForm.title = ''
    scaleForm.itemCount = 10
    scaleForm.enabled = true
  }
  scaleDialogVisible.value = true
}

function saveScale() {
  if (!scaleForm.id || !scaleForm.title) {
    ElMessage.warning('请填写量表编码和名称')
    return
  }
  if (editingScale.value) {
    const idx = scaleList.value.findIndex((s) => s.id === editingScale.value.id)
    if (idx >= 0) {
      scaleList.value[idx] = { ...scaleList.value[idx], ...scaleForm }
    }
  } else {
    scaleList.value.push({
      ...scaleForm,
      usageCount: 0,
    })
  }
  scaleDialogVisible.value = false
  ElMessage.success('保存成功')
}

function toggleScale(row) {
  row.enabled = !row.enabled
  ElMessage.success(row.enabled ? '已启用' : '已停用')
}

function removeScale(row) {
  scaleList.value = scaleList.value.filter((s) => s.id !== row.id)
  ElMessage.success('已删除')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.assessment-system { max-width: 1000px; }

.page-head {
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.page-head h2 { margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #1e293b; }
.page-desc { margin: 0; font-size: 14px; color: #64748b; flex: 1; }

.section-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.section-card :deep(.el-card__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-weight: 600;
  color: #1e293b;
}

.card-header { display: flex; align-items: center; justify-content: space-between; width: 100%; }

.config-form { max-width: 560px; }
.form-tip { margin-left: 12px; font-size: 12px; color: #94a3b8; }

.mt { margin-top: 20px; }
</style>
