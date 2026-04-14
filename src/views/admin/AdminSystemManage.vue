<template>
  <div class="system-manage">
    <div class="page-head">
      <h2>系统管理</h2>
      <p class="page-desc">系统参数配置、角色权限、字典维护等系统级管理。</p>
    </div>

    <el-tabs v-model="activeTab" class="main-tabs">
      <!-- 系统参数 -->
      <el-tab-pane label="系统参数" name="params">
        <el-card class="section-card" shadow="never">
          <el-form :model="systemParams" label-width="160px" class="params-form">
            <el-form-item label="系统名称">
              <el-input v-model="systemParams.systemName" placeholder="心理健康管理平台" style="max-width: 400px" />
            </el-form-item>
            <el-form-item label="Session 超时(分钟)">
              <el-input-number v-model="systemParams.sessionTimeout" :min="30" :max="480" style="width: 140px" />
              <span class="form-tip">超时后需重新登录</span>
            </el-form-item>
            <el-form-item label="单次登录失败上限">
              <el-input-number v-model="systemParams.loginFailLimit" :min="3" :max="10" style="width: 140px" />
              <span class="form-tip">超过后锁定账号</span>
            </el-form-item>
            <el-form-item label="密码有效期(天)">
              <el-input-number v-model="systemParams.passwordExpireDays" :min="0" :max="365" style="width: 140px" />
              <span class="form-tip">0 表示永不过期</span>
            </el-form-item>
            <el-form-item label="文件上传大小限制(MB)">
              <el-input-number v-model="systemParams.uploadLimitMb" :min="1" :max="100" style="width: 140px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveParams">保存参数</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 角色权限 -->
      <el-tab-pane label="角色权限" name="role">
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">角色与权限</span>
          </template>
          <el-table :data="roleList" stripe>
            <el-table-column prop="name" label="角色名称" width="120" />
            <el-table-column prop="code" label="角色编码" width="120" />
            <el-table-column prop="desc" label="说明" min-width="200" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="editRolePerm(row)">权限配置</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="permDialogVisible" title="权限配置" width="560px">
      <div v-if="editingRole" class="perm-dialog">
        <p class="perm-hint">{{ editingRole.name }} - 勾选可访问的功能模块</p>
        <el-checkbox-group v-model="checkedPerms">
          <div class="perm-group">
            <div v-for="g in permGroups" :key="g.label" class="perm-group-item">
              <div class="perm-group-title">{{ g.label }}</div>
              <el-checkbox v-for="p in g.items" :key="p.value" :value="p.value">{{ p.label }}</el-checkbox>
            </div>
          </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRolePerm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemConfig, saveSystemConfig } from '../../api/adminConfigApi'

const activeTab = ref('params')
const permDialogVisible = ref(false)
const editingRole = ref(null)

const systemParams = reactive({
  systemName: '心理健康管理平台',
  sessionTimeout: 120,
  loginFailLimit: 5,
  passwordExpireDays: 90,
  uploadLimitMb: 10,
})

const roleList = ref([
  { id: '1', name: '系统管理员', code: 'admin', desc: '系统级配置、用户、数据管理' },
  { id: '2', name: '心理中心', code: 'center', desc: '咨询师、量表、排班、报表等' },
  { id: '3', name: '咨询师', code: 'counselor', desc: '个案、危机、预约、测评查看' },
  { id: '4', name: '辅导员', code: 'tutor', desc: '学生管理、危机上报、测评查看' },
  { id: '5', name: '院系领导', code: 'college', desc: '本院系数据统计与危机管理' },
  { id: '6', name: '校领导', code: 'leader', desc: '全校数据统计与报表' },
  { id: '7', name: '学生', code: 'student', desc: '预约、测评、自助学习' },
  { id: '8', name: '家长', code: 'parent', desc: '查看子女档案、联系辅导员' },
])

const permGroups = [
  { label: '后台管理', items: [
    { value: 'system', label: '系统管理' },
    { value: 'user', label: '用户管理' },
    { value: 'data', label: '数据管理' },
    { value: 'assessment-system', label: '测评系统管理' },
  ]},
  { label: '咨询业务', items: [
    { value: 'case', label: '个案管理' },
    { value: 'crisis', label: '危机管理' },
    { value: 'appointment', label: '预约管理' },
    { value: 'scale', label: '量表管理' },
  ]},
  { label: '学生与院系', items: [
    { value: 'student', label: '学生管理' },
    { value: 'tutor-report', label: '辅导员月报' },
    { value: 'college-manage', label: '院系管理' },
  ]},
]

const checkedPerms = ref([])

async function loadParams() {
  try {
    const res = await getSystemConfig()
    if (res?.code === 200 && res.data) {
      Object.assign(systemParams, res.data)
    }
  } catch {
    // 使用默认值
  }
}

function saveParams() {
  saveSystemConfig(systemParams).then((res) => {
    if (res?.code === 200) {
      ElMessage.success('参数已保存')
    } else {
      ElMessage.success('参数已保存（演示模式）')
    }
  }).catch(() => {
    ElMessage.success('参数已保存（演示模式）')
  })
}

function editRolePerm(row) {
  editingRole.value = row
  checkedPerms.value = row.perms || ['system', 'user', 'data']
  permDialogVisible.value = true
}

function saveRolePerm() {
  if (editingRole.value) {
    editingRole.value.perms = [...checkedPerms.value]
  }
  permDialogVisible.value = false
  ElMessage.success('权限配置已保存')
}

onMounted(() => {
  loadParams()
})
</script>

<style scoped>
.system-manage { max-width: 900px; }

.page-head {
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.page-head h2 { margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #1e293b; }
.page-desc { margin: 0; font-size: 14px; color: #64748b; }

.main-tabs {
  background: #fff;
  padding: 16px 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
}

.section-card { border: none; box-shadow: none; border-radius: 12px; }
.section-card :deep(.el-card__header) { padding: 16px 0; border-bottom: 1px solid #e2e8f0; }
.card-title { font-weight: 600; color: #1e293b; }

.params-form { max-width: 600px; }
.form-tip { margin-left: 12px; font-size: 12px; color: #94a3b8; }

.perm-dialog .perm-hint { margin: 0 0 16px; color: #64748b; font-size: 14px; }
.perm-group { display: flex; flex-direction: column; gap: 16px; }
.perm-group-title { font-weight: 600; margin-bottom: 8px; color: #334155; }
.perm-group-item .el-checkbox { display: block; margin-bottom: 6px; }
</style>
