<template>
  <div class="user-manage">
    <div class="page-head">
      <h2>用户管理</h2>
      <p class="page-desc">管理所有端用户账号，含学生、家长、咨询师、辅导员等角色的账号与权限。</p>
      <div class="head-actions">
        <el-button type="primary" @click="openUserDialog()">新增用户</el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filter" class="filter-form">
        <el-form-item label="角色">
          <el-select v-model="filter.role" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部" clearable style="width: 100px">
            <el-option label="正常" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filter.keyword" placeholder="账号/姓名" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="paginatedList" stripe v-loading="loading">
        <el-table-column prop="account" label="账号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ roleMap[row.role] || row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="160" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openUserDialog(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="openRoleAssignDialog(row)">分配角色</el-button>
            <el-button type="primary" link size="small" @click="toggleStatus(row)">
              {{ row.status === 'enabled' ? '停用' : '启用' }}
            </el-button>
            <el-button type="primary" link size="small" @click="resetPwd(row)">重置密码</el-button>
            <el-button type="danger" link size="small" @click="removeUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="filteredList.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </el-card>

    <el-dialog v-model="userDialogVisible" :title="editingUser ? '编辑用户' : '新增用户'" width="480px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="账号" required>
          <el-input v-model="userForm.account" placeholder="登录账号" :disabled="!!editingUser" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="userForm.name" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="userForm.role" placeholder="请选择" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.value" :label="r.label" :value="r.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" placeholder="选填" />
        </el-form-item>
        <el-form-item v-if="!editingUser" label="密码" required>
          <el-input v-model="userForm.password" type="password" placeholder="初始密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const roleOptions = [
  { value: 'student', label: '学生' },
  { value: 'parent', label: '家长' },
  { value: 'counselor', label: '咨询师' },
  { value: 'tutor', label: '辅导员' },
  { value: 'center', label: '心理中心' },
  { value: 'admin', label: '管理员' },
]

const roleMap = Object.fromEntries(roleOptions.map((r) => [r.value, r.label]))

const filter = reactive({
  role: '',
  status: '',
  keyword: '',
})
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const userList = ref([])
const userDialogVisible = ref(false)
const editingUser = ref(null)
const userForm = reactive({
  account: '',
  name: '',
  role: 'student',
  phone: '',
  password: '',
})

const filteredList = computed(() => {
  let list = userList.value
  if (filter.role) list = list.filter((u) => u.role === filter.role)
  if (filter.status) list = list.filter((u) => u.status === filter.status)
  if (filter.keyword) {
    const k = filter.keyword.toLowerCase()
    list = list.filter(
      (u) =>
        (u.account && u.account.toLowerCase().includes(k)) ||
        (u.name && u.name.toLowerCase().includes(k))
    )
  }
  return list
})

const paginatedList = computed(() => {
  const list = filteredList.value
  const start = (page.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

function loadData() {
  loading.value = true
  setTimeout(() => {
    userList.value = [
      { id: '1', account: 'student001', name: '张三', role: 'student', phone: '13800138001', status: 'enabled', lastLogin: '2025-03-04 09:20', createTime: '2024-09-01 10:00' },
      { id: '2', account: 'parent_li', name: '李四', role: 'parent', phone: '13800138002', status: 'enabled', lastLogin: '2025-03-03 14:30', createTime: '2024-09-05 11:00' },
      { id: '3', account: 'counselor_wang', name: '王老师', role: 'counselor', phone: '13800138003', status: 'enabled', lastLogin: '2025-03-04 08:15', createTime: '2024-08-01 09:00' },
      { id: '4', account: 'tutor_zhang', name: '张辅导员', role: 'tutor', phone: '13800138004', status: 'enabled', lastLogin: '2025-03-03 16:00', createTime: '2024-08-15 10:00' },
      { id: '5', account: 'center_01', name: '心理中心管理员', role: 'center', phone: '13800138005', status: 'enabled', lastLogin: '2025-03-04 10:00', createTime: '2024-07-01 09:00' },
      { id: '6', account: 'admin', name: '系统管理员', role: 'admin', phone: '', status: 'enabled', lastLogin: '2025-03-04 10:32', createTime: '2024-06-01 08:00' },
      { id: '7', account: 'student002', name: '赵六', role: 'student', phone: '13800138006', status: 'disabled', lastLogin: '2025-02-20 12:00', createTime: '2024-09-10 14:00' },
    ]
    loading.value = false
  }, 300)
}

function resetFilter() {
  filter.role = ''
  filter.status = ''
  filter.keyword = ''
  page.value = 1
}

function openUserDialog(row = null) {
  editingUser.value = row
  if (row) {
    userForm.account = row.account
    userForm.name = row.name
    userForm.role = row.role
    userForm.phone = row.phone || ''
    userForm.password = ''
  } else {
    userForm.account = ''
    userForm.name = ''
    userForm.role = 'student'
    userForm.phone = ''
    userForm.password = '123456'
  }
  userDialogVisible.value = true
}

function saveUser() {
  if (!userForm.account || !userForm.name || !userForm.role) {
    ElMessage.warning('请填写账号、姓名并选择角色')
    return
  }
  if (!editingUser.value && !userForm.password) {
    ElMessage.warning('请输入初始密码')
    return
  }
  if (editingUser.value) {
    const u = userList.value.find((x) => x.id === editingUser.value.id)
    if (u) {
      u.name = userForm.name
      u.role = userForm.role
      u.phone = userForm.phone
    }
  } else {
    userList.value.push({
      id: String(Date.now()),
      account: userForm.account,
      name: userForm.name,
      role: userForm.role,
      phone: userForm.phone,
      status: 'enabled',
      lastLogin: '-',
      createTime: new Date().toLocaleString('zh-CN'),
    })
  }
  userDialogVisible.value = false
  ElMessage.success('保存成功')
}

function toggleStatus(row) {
  row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  ElMessage.success(row.status === 'enabled' ? '已启用' : '已停用')
}

function resetPwd(row) {
  ElMessageBox.confirm('确定重置该用户密码为默认密码？', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('密码已重置')
  }).catch(() => {})
}

function removeUser(row) {
  ElMessageBox.confirm('确定删除该用户？删除后不可恢复。', '删除用户', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userList.value = userList.value.filter((u) => u.id !== row.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-manage { max-width: 1100px; }

.page-head {
  margin-bottom: 20px;
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

.filter-card, .table-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.filter-form { margin-bottom: 0; }

.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
