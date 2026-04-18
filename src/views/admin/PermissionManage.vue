<template>
  <div class="permission-manage">
    <div class="page-head">
      <h2>权限管理</h2>
      <p class="page-desc">管理系统角色、权限及角色权限分配</p>
      <div class="head-actions">
        <el-button type="primary" :icon="Plus" @click="openRoleDialog()">新增角色</el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="permission-tabs" @tab-change="handleTabChange">
      <!-- 角色管理标签页 -->
      <el-tab-pane label="角色管理" name="roles">
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">角色列表</span>
          </template>

          <el-table :data="roleList" stripe v-loading="loading" border>
            <el-table-column prop="roleCode" label="角色编码" width="120" />
            <el-table-column prop="roleName" label="角色名称" width="120" />
            <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.isSystem ? 'warning' : 'info'" size="small">
                  {{ row.isSystem ? '系统' : '自定义' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openPermConfig(row)">
                  权限配置
                </el-button>
                <el-button type="primary" link size="small" @click="openRoleDialog(row)">
                  编辑
                </el-button>
                <el-button
                  v-if="!row.isSystem"
                  type="danger"
                  link
                  size="small"
                  @click="deleteRoleItem(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 权限列表标签页 -->
      <el-tab-pane label="权限列表" name="permissions">
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="perm-list-header">
              <span class="card-title">权限列表</span>
              <div class="perm-actions">
                <el-input
                    v-model="permSearch.keyword"
                    placeholder="搜索权限名称"
                    clearable                  style="width: 200px; margin-right: 12px"
                    @keyup.enter="handleSearch"
                    @clear="handleSearch"
                >
                  <template #prefix><el-icon><Search /></el-icon></template>
                </el-input>
                <el-select
                    v-model="permSearch.type"
                    placeholder="权限类型"
                    clearable                  style="width: 120px; margin-right: 12px"
                    @change="handleSearch"
                >
                  <el-option label="全部" value="" />
                  <el-option label="菜单" value="menu" />
                  <el-option label="按钮" value="button" />
                </el-select>
                <el-button type="primary" :icon="Plus" @click="openPermDialog()">新增权限</el-button>
              </div>
            </div>
          </template>

          <el-table
            :data="permissionList"
            stripe
            v-loading="permLoading"
            border
            @selection-change="handlePermSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="id" label="权限ID" width="180" show-overflow-tooltip />
            <el-table-column prop="permissionName" label="权限名称" width="150" />
            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <el-tag :type="row.type === 'menu' ? 'primary' : 'success'" size="small">
                  {{ row.type === 'menu' ? '菜单' : '按钮' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="path" label="路由路径" width="200" show-overflow-tooltip />
            <el-table-column prop="icon" label="图标" width="100" show-overflow-tooltip />
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column prop="permissionCode" label="权限编码" width="180" show-overflow-tooltip />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openPermDialog(row)">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click="deletePermItem(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
                v-model:current-page="permPagination.page"
                v-model:page-size="permPagination.pageSize"
                :total="permPagination.total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="loadPermissionList"
                @size-change="handleSizeChange"
            />
          </div>

          <div v-if="selectedPerms.length > 0" class="batch-actions">
            <el-button type="danger" :icon="Delete" @click="batchDeletePerms">
              批量删除 ({{ selectedPerms.length }})
            </el-button>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="editingRole ? '编辑角色' : '新增角色'"
      width="500px"
    >
      <el-form :model="roleForm" label-width="100px">
        <el-form-item label="角色编码" required>
          <el-input
            v-model="roleForm.roleCode"
            placeholder="如: custom_admin"
            :disabled="!!editingRole"
          />
        </el-form-item>
        <el-form-item label="角色名称" required>
          <el-input v-model="roleForm.roleName" placeholder="如: 自定义管理员" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="角色职责描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="roleForm.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>

    <!-- 权限编辑对话框 -->
    <el-dialog
      v-model="permDialogVisible"
      :title="editingPerm ? '编辑权限' : '新增权限'"
      width="600px"
    >
      <el-form :model="permForm" label-width="100px">
        <el-form-item label="权限类型" required>
          <el-radio-group v-model="permForm.type">
            <el-radio value="menu">菜单</el-radio>
            <el-radio value="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限名称" required>
          <el-input v-model="permForm.permissionName" placeholder="如: 咨询预约管理" />
        </el-form-item>
        <el-form-item label="路由路径" v-if="permForm.type === 'menu'">
          <el-input v-model="permForm.path" placeholder="如: /admin/appointments" />
        </el-form-item>
        <el-form-item label="权限编码">
          <el-input v-model="permForm.permissionCode" placeholder="如: menu_appointment" />
        </el-form-item>
        <el-form-item label="图标" v-if="permForm.type === 'menu'">
          <el-input v-model="permForm.icon" placeholder="如: Calendar" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="permForm.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="父级权限">
          <el-tree-select
            v-model="permForm.parentId"
            :data="permissionTree"
            :props="{ label: 'permissionName', children: 'children' }"
            placeholder="选择父级权限（可选）"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="permForm.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePermission">保存</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permConfigVisible"
      title="权限配置"
      width="700px"
    >
      <div v-if="currentRole" class="perm-config">
        <p class="config-hint">
          为角色 <strong>{{ currentRole.roleName }}</strong> 配置可访问的功能模块和操作权限
        </p>

        <el-tree
          ref="permTreeRef"
          :data="permissionTree"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedPermIds"
          :props="{ label: 'permissionName', children: 'children' }"
          default-expand-all
          class="perm-tree"
        >
          <template #default="{ node, data }">
            <span class="perm-node">
              <el-icon v-if="data.type === 'menu'"><Menu /></el-icon>
              <el-icon v-else><Operation /></el-icon>
              <span>{{ node.label }}</span>
              <el-tag v-if="data.permissionCode" size="small" type="info" class="perm-code">
                {{ data.permissionCode }}
              </el-tag>
            </span>
          </template>
        </el-tree>
      </div>
      <template #footer>
        <el-button @click="permConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRolePermissions">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Menu, Operation, Search, Delete } from '@element-plus/icons-vue'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  assignRolePermissions,
  getPermissionTree,
  getPermissionList,
  createPermission,
  updatePermission,
  deletePermission,
  batchDeletePermissions,
} from '../../api/permissionApi'

const loading = ref(false)
const permLoading = ref(false)
const activeTab = ref('roles')
const roleList = ref([])
const permissionTree = ref([])
const permissionList = ref([])
const selectedPerms = ref([])
const roleDialogVisible = ref(false)
const permDialogVisible = ref(false)
const permConfigVisible = ref(false)
const editingRole = ref(null)
const editingPerm = ref(null)
const currentRole = ref(null)
const checkedPermIds = ref([])
const permTreeRef = ref(null)

const roleForm = reactive({
  roleCode: '',
  roleName: '',
  description: '',
  status: 'enabled',
})

const permForm = reactive({
  type: 'menu',
  permissionName: '',
  path: '',
  permissionCode: '',
  icon: '',
  sort: 0,
  parentId: null,
  status: 'enabled',
})

const permSearch = reactive({
  keyword: '',
  type: '',
})

const permPagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([loadRoles(), loadPermissionTree()])
  } catch (e) {
    console.error('加载数据失败:', e)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载角色列表
const loadRoles = async () => {
  const res = await getRoleList({ page: 1, pageSize: 100 })
  if (res.code === 200 && res.data) {
    roleList.value = res.data.list || []
  }
}

// 加载权限树
const loadPermissionTree = async () => {
  const res = await getPermissionTree()
  if (res.code === 200 && res.data) {
    permissionTree.value = res.data
  }
}

// 加载权限列表
const loadPermissionList = async () => {
  permLoading.value = true
  try {
    const params = {
      page: permPagination.page,
      pageSize: permPagination.pageSize,
    }
    if (permSearch.keyword) {
      params.keyword = permSearch.keyword
    }
    if (permSearch.type) {
      params.type = permSearch.type
    }

    console.log('🔍 请求参数:', params)

    const res = await getPermissionList(params)

    console.log('✅ 响应数据:', res)

    if (res.code === 200 && res.data) {
      permissionList.value = res.data.list || []
      permPagination.total = res.data.total || 0
      console.log('✨ 加载成功:', permissionList.value.length, '条')
    } else {
      console.warn('⚠️ 响应异常:', res)
      ElMessage.warning(res.message || '加载失败')
    }
  } catch (e) {
    console.error('❌ 加载失败详情:')
    console.error('  - 状态码:', e.response?.status)
    console.error('  - 错误信息:', e.response?.data?.message || e.message)
    console.error('  - 完整响应:', e.response?.data)

    const errorMsg = e.response?.data?.message || e.response?.data?.error || '服务器内部错误'
    ElMessage.error('加载权限列表失败：' + errorMsg)
  } finally {
    permLoading.value = false
  }
}

// 处理每页数量变化（重置到第一页）
const handleSizeChange = () => {
  permPagination.page = 1
  loadPermissionList()
}

// 搜索处理（重置到第一页）
const handleSearch = () => {
  permPagination.page = 1
  loadPermissionList()
}


// 权限选择变化
const handlePermSelectionChange = (selection) => {
  selectedPerms.value = selection
}

// 打开角色编辑对话框
const openRoleDialog = (row = null) => {
  editingRole.value = row
  if (row) {
    roleForm.roleCode = row.roleCode
    roleForm.roleName = row.roleName
    roleForm.description = row.description || ''
    roleForm.status = row.status
  } else {
    roleForm.roleCode = ''
    roleForm.roleName = ''
    roleForm.description = ''
    roleForm.status = 'enabled'
  }
  roleDialogVisible.value = true
}

// 保存角色
const saveRole = async () => {
  if (!roleForm.roleCode || !roleForm.roleName) {
    ElMessage.warning('请填写角色编码和名称')
    return
  }

  try {
    if (editingRole.value) {
      await updateRole(editingRole.value.roleId, {
        roleName: roleForm.roleName,
        description: roleForm.description,
        status: roleForm.status,
      })
      ElMessage.success('更新成功')
    } else {
      await createRole({
        roleCode: roleForm.roleCode,
        roleName: roleForm.roleName,
        description: roleForm.description,
        permissions: [],
      })
      ElMessage.success('创建成功')
    }
    roleDialogVisible.value = false
    loadRoles()
  } catch (e) {
    console.error('保存角色失败:', e)
    ElMessage.error('保存失败')
  }
}

// 删除角色
const deleteRoleItem = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定删除角色"${row.roleName}"？删除后不可恢复。`,
        '删除角色',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    await deleteRole(row.roleId)
    ElMessage.success('删除成功')
    loadRoles()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除角色失败:', e)
      ElMessage.error('删除失败')
    }
  }
}

// 打开权限编辑对话框
const openPermDialog = (row = null) => {
  editingPerm.value = row
  if (row) {
    permForm.type = row.type || 'menu'
    permForm.permissionName = row.permissionName || ''
    permForm.path = row.path || ''
    permForm.permissionCode = row.permissionCode || ''
    permForm.icon = row.icon || ''
    permForm.sort = row.sort || 0
    permForm.parentId = row.parentId || null
    permForm.status = row.status || 'enabled'
  } else {
    permForm.type = 'menu'
    permForm.permissionName = ''
    permForm.path = ''
    permForm.permissionCode = ''
    permForm.icon = ''
    permForm.sort = 0
    permForm.parentId = null
    permForm.status = 'enabled'
  }
  permDialogVisible.value = true
}

// 保存权限
const savePermission = async () => {
  if (!permForm.permissionName) {
    ElMessage.warning('请填写权限名称')
    return
  }

  try {
    const data = {
      type: permForm.type,
      permissionName: permForm.permissionName,
      permissionCode: permForm.permissionCode,
      sort: permForm.sort,
      status: permForm.status,
    }

    if (permForm.type === 'menu') {
      data.path = permForm.path
      data.icon = permForm.icon
    }

    if (permForm.parentId) {
      data.parentId = permForm.parentId
    }

    if (editingPerm.value) {
      await updatePermission(editingPerm.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await createPermission(data)
      ElMessage.success('创建成功')
    }
    permDialogVisible.value = false
    loadPermissionList()
    loadPermissionTree()
  } catch (e) {
    console.error('保存权限失败:', e)
    ElMessage.error('保存失败')
  }
}

// 删除权限
const deletePermItem = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定删除权限"${row.permissionName}"？删除后不可恢复。`,
        '删除权限',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    await deletePermission(row.id)
    ElMessage.success('删除成功')
    loadPermissionList()
    loadPermissionTree()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('删除权限失败:', e)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除权限
const batchDeletePerms = async () => {
  if (selectedPerms.value.length === 0) {
    ElMessage.warning('请选择要删除的权限')
    return
  }

  try {
    await ElMessageBox.confirm(
        `确定删除选中的 ${selectedPerms.value.length} 个权限？删除后不可恢复。`,
        '批量删除权限',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    const ids = selectedPerms.value.map(item => item.id)
    await batchDeletePermissions(ids)
    ElMessage.success('批量删除成功')
    selectedPerms.value = []
    loadPermissionList()
    loadPermissionTree()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('批量删除权限失败:', e)
      ElMessage.error('批量删除失败')
    }
  }
}

// 打开权限配置对话框
const openPermConfig = async (row) => {
  currentRole.value = row
  permConfigVisible.value = true

  try {
    const res = await getRolePermissions(row.roleId)
    if (res.code === 200 && res.data) {
      checkedPermIds.value = res.data
    }
  } catch (e) {
    console.error('获取角色权限失败:', e)
    checkedPermIds.value = []
  }
}

// 保存角色权限
const saveRolePermissions = async () => {
  if (!currentRole.value || !permTreeRef.value) return

  const checkedKeys = permTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = permTreeRef.value.getHalfCheckedKeys()
  const allKeys = [...checkedKeys, ...halfCheckedKeys]

  try {
    await assignRolePermissions(currentRole.value.roleId, allKeys)
    ElMessage.success('权限配置已保存')
    permConfigVisible.value = false
  } catch (e) {
    console.error('保存权限失败:', e)
    ElMessage.error('保存失败')
  }
}

// 标签页切换
const handleTabChange = (tabName) => {
  if (tabName === 'permissions' && permissionList.value.length === 0) {
    loadPermissionList()
  }
}

onMounted(() => {
  loadData()
  // 预加载权限列表，避免切换标签页时才加载
  loadPermissionList()
})
</script>

<style scoped>
.permission-manage {
  max-width: 1400px;
  margin: 0 auto;
}

.page-head {
  margin-bottom: 24px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border-radius: 16px;
  border: 1px solid #e0f2fe;
  box-shadow: 0 2px 8px rgba(30, 79, 156, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.page-head h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  flex: 1;
}

.permission-tabs {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.card-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
}

.perm-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.perm-actions {
  display: flex;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.batch-actions {
  margin-top: 16px;
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
  display: flex;
  justify-content: flex-end;
}

.perm-config .config-hint {
  margin: 0 0 16px;
  color: #64748b;
  font-size: 14px;
}

.perm-tree {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.perm-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.perm-code {
  margin-left: 8px;
  font-size: 11px;
}

:deep(.el-tree-node__content) {
  height: 36px;
}

:deep(.el-tree-node__label) {
  display: flex;
  align-items: center;
}
</style>
