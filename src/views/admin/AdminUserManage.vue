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
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="getRoleTagType(row.roleCode)">
              {{ row.role || '未知' }}
            </el-tag>
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
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @current-change="loadData"
            @size-change="loadData"
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
import { getUserList, resetUserPassword, toggleUserStatus } from '../../api/openapi'

const roleOptions = [
  { value: 'student', label: '学生' },
  { value: 'parent', label: '家长' },
  { value: 'counselor', label: '咨询师' },
  { value: 'tutor', label: '辅导员' },
  { value: 'center', label: '心理中心' },
  { value: 'admin', label: '管理员' },
]

// 角色代码到中文的映射（支持大写和小写）
const roleCodeToLabel = {
  'student': '学生',
  'STUDENT': '学生',
  'parent': '家长',
  'PARENT': '家长',
  'counselor': '咨询师',
  'COUNSELOR': '咨询师',
  'tutor': '辅导员',
  'INSTRUCTOR': '辅导员',
  'tutor': '辅导员',
  'center': '心理中心',
  'CENTER': '心理中心',
  'admin': '管理员',
  'ADMIN': '管理员',
  'leader': '校领导',
  'SCHOOL_LEADER': '校领导',
  'college_leader': '院系领导',
  'COLLEGE_LEADER': '院系领导',
}

const roleMap = Object.fromEntries(roleOptions.map((r) => [r.value, r.label]))

// 角色标签颜色
function getRoleTagType(roleCode) {
  const typeMap = {
    'STUDENT': '',
    'student': '',
    'PARENT': 'success',
    'parent': 'success',
    'COUNSELOR': 'warning',
    'counselor': 'warning',
    'INSTRUCTOR': 'warning',
    'tutor': 'warning',
    'CENTER': 'primary',
    'center': 'primary',
    'ADMIN': 'danger',
    'admin': 'danger',
    'SCHOOL_LEADER': 'info',
    'COLLEGE_LEADER': 'info',
  }
  return typeMap[roleCode] || 'info'
}

const filter = reactive({
  role: '',
  status: '',
  keyword: '',
})
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const userList = ref([])
const total = ref(0)
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
  return userList.value
})

const paginatedList = computed(() => {
  return userList.value
})

async function loadData() {
  loading.value = true
  try {
    const params = {
      pageNum: page.value,
      pageSize: pageSize.value,
    }
    if (filter.role) params.role = filter.role
    if (filter.status) params.status = filter.status
    if (filter.keyword) params.keyword = filter.keyword

    const res = await getUserList(params)
    console.log('📊 后端返回的完整响应:', res)

    if (res?.code === 200 && res.data) {
      const rawData = res.data.records || res.data.list || (Array.isArray(res.data) ? res.data : [])
      console.log('📋 原始用户数据（第一条）:', rawData[0])

      userList.value = rawData.map(item => {
        const roleCode = item.role_code || item.roleCode || item.role || ''
        const roleLabel = roleCodeToLabel[roleCode] || roleCode || '未知角色'

        return {
          id: item.userId || item.id || item.user_id,
          account: item.username || item.account || item.loginName || '',
          name: item.realName || item.real_name || item.name || item.nickname || '',
          role: roleLabel,
          roleCode: roleCode,
          phone: item.mobile || item.phone || item.phoneNumber || item.tel || '',
          status: (item.status === 1 || item.status === '1' || item.status === 'enabled' || item.enabled === true || item.status === true) ? 'enabled' : 'disabled',
          lastLogin: item.lastLoginTime || item.last_login_time || item.lastLogin || item.loginTime || '-',
          createTime: item.createTime || item.create_time || item.createdAt || item.created_at || '-',
        }
      })

      total.value = res.data.total ?? rawData.length
      console.log('✅ 映射后的数据（第一条）:', userList.value[0])
    } else {
      ElMessage.warning(res?.msg || '获取用户列表失败')
      userList.value = []
    }
  } catch (e) {
    console.error('❌ 加载用户列表失败:', e)
    ElMessage.error(e?.message || '网络请求失败')
    userList.value = []
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  filter.role = ''
  filter.status = ''
  filter.keyword = ''
  page.value = 1
  loadData()
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

async function saveUser() {
  if (!userForm.account || !userForm.name || !userForm.role) {
    ElMessage.warning('请填写账号、姓名并选择角色')
    return
  }
  if (!editingUser.value && !userForm.password) {
    ElMessage.warning('请输入初始密码')
    return
  }

  try {
    loading.value = true
    // TODO: 需要后端提供新增/编辑用户的 API
    // 目前先提示功能待实现
    ElMessage.info('新增/编辑用户功能待后端接口支持')
    userDialogVisible.value = false
  } catch (e) {
    console.error('保存用户失败:', e)
    ElMessage.error(e?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

async function toggleStatus(row) {
  try {
    const newStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
    const res = await toggleUserStatus({}, {
      userId: row.id,
      status: newStatus,
    })

    if (res?.code === 200) {
      row.status = newStatus
      ElMessage.success(newStatus === 'enabled' ? '已启用' : '已停用')
    } else {
      ElMessage.error(res?.msg || '操作失败')
    }
  } catch (e) {
    console.error('切换状态失败:', e)
    ElMessage.error(e?.message || '网络请求失败')
  }
}

async function resetPwd(row) {
  try {
    await ElMessageBox.confirm('确定重置该用户密码为默认密码？', '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const res = await resetUserPassword({}, {
      userId: row.id,
    })

    if (res?.code === 200) {
      ElMessage.success('密码已重置为默认密码')
    } else {
      ElMessage.error(res?.msg || '重置失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('重置密码失败:', e)
      ElMessage.error(e?.message || '网络请求失败')
    }
  }
}

async function removeUser(row) {
  try {
    await ElMessageBox.confirm('确定删除该用户？删除后不可恢复。', '删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // TODO: 需要后端提供删除用户的 API
    ElMessage.info('删除用户功能待后端接口支持')
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除用户失败:', e)
      ElMessage.error(e?.message || '网络请求失败')
    }
  }
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
