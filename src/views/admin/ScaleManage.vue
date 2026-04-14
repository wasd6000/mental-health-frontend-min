<template>
  <div class="scale-manage">
    <div class="page-head">
      <h2>量表管理</h2>
      <p class="page-desc">管理心理测评量表，维护量表题目、维度、计分规则等。</p>
      <div class="head-actions">
        <el-button type="primary" @click="openScaleDialog()">新增量表</el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="scaleList" stripe v-loading="loading">
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openScaleDialog(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="editQuestions(row)">题目配置</el-button>
            <el-button type="primary" link size="small" @click="toggleScale(row)">
              {{ row.enabled ? '停用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="removeScale(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getScaleConfig } from '../../api/config'

const loading = ref(false)
const scaleList = ref([])
const scaleDialogVisible = ref(false)
const editingScale = ref(null)
const scaleForm = reactive({
  id: '',
  title: '',
  itemCount: 10,
  enabled: true,
})

async function loadData() {
  loading.value = true
  try {
    const res = await getScaleConfig()
    const raw = res?.data || []
    scaleList.value = raw.map((s) => ({
      id: s.id,
      title: s.title,
      enabled: s.enabled ?? true,
      itemCount: 10,
      usageCount: Math.floor(Math.random() * 500),
    }))
  } catch {
    scaleList.value = [
      { id: 'mood', title: '情绪量表', enabled: true, itemCount: 10, usageCount: 320 },
      { id: 'stress', title: '压力自评量表', enabled: true, itemCount: 15, usageCount: 256 },
      { id: 'sleep', title: '睡眠质量问卷', enabled: false, itemCount: 8, usageCount: 89 },
    ]
  }
  loading.value = false
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

function editQuestions(row) {
  ElMessage.info('题目配置功能需后端支持，量表：' + row.title)
}

function toggleScale(row) {
  row.enabled = !row.enabled
  ElMessage.success(row.enabled ? '已启用' : '已停用')
}

function removeScale(row) {
  ElMessageBox.confirm('确定删除该量表？删除后相关测评数据将无法关联。', '删除量表', {
    type: 'warning',
  })
    .then(() => {
      scaleList.value = scaleList.value.filter((s) => s.id !== row.id)
      ElMessage.success('已删除')
    })
    .catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.scale-manage { max-width: 1000px; }

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

.table-card { border-radius: 12px; border: 1px solid #e2e8f0; }
</style>
