<template>
  <div class="counselor-manage">
    <div class="page-head">
      <h2>咨询师档案</h2>
      <p class="page-desc">管理咨询师信息与档案。</p>
      <div class="head-actions">
        <el-button type="primary" @click="openCounselorDialog()">新增咨询师</el-button>
        <el-button :icon="Refresh" @click="loadData">刷新</el-button>
      </div>
    </div>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filter" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="filter.keyword" placeholder="姓名/工号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filter.status" placeholder="全部" clearable style="width: 100px">
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="paginatedList" stripe v-loading="loading">
        <el-table-column prop="workNo" label="工号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="title" label="职称" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="specialty" label="擅长领域" min-width="160" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openCounselorDialog(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="viewSchedule(row)">排班</el-button>
            <el-button type="danger" link size="small" @click="toggleStatus(row)">
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
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

    <el-dialog v-model="counselorDialogVisible" :title="editingCounselor ? '编辑咨询师' : '新增咨询师'" width="500px">
      <el-form :model="counselorForm" label-width="100px" :rules="formRules" ref="counselorFormRef">
        <el-form-item label="工号" prop="workNo">
          <el-input v-model="counselorForm.workNo" placeholder="如 C001" :disabled="!!editingCounselor" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="counselorForm.name" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="counselorForm.phone"
            placeholder="手机号码"
            maxlength="11"
            @input="counselorForm.phone = counselorForm.phone.replace(/\D/g, '').slice(0, 11)"
          />
        </el-form-item>
        <el-form-item v-if="!editingCounselor" label="初始密码" prop="password">
          <el-input v-model="counselorForm.password" type="password" placeholder="默认为 123456" show-password />
        </el-form-item>
        <el-form-item label="职称">
          <el-input v-model="counselorForm.title" placeholder="如 心理咨询师" />
        </el-form-item>
        <el-form-item label="擅长领域">
          <el-input v-model="counselorForm.specialty" type="textarea" :rows="2" placeholder="如 情绪管理、学业压力" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="counselorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCounselor" :loading="loading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import {
  getAdminCounselors,
  createAdminCounselor,
  updateAdminCounselor,
  deleteAdminCounselor
} from '../../api/adminApi'

const router = useRouter()
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const counselorList = ref([])
const counselorDialogVisible = ref(false)
const editingCounselor = ref(null)

const filter = reactive({
  keyword: '',
  status: '',
})

const counselorForm = reactive({
  workNo: '',
  name: '',
  phone: '',
  password: '',
  title: '',
  specialty: '',
})

const counselorFormRef = ref(null)

const formRules = {
  workNo: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { min: 11, max: 11, message: '手机号必须为11位数字', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ]
}

const filteredList = computed(() => {
  let list = counselorList.value
  if (filter.keyword) {
    const k = filter.keyword.toLowerCase()
    list = list.filter((c) => (c.name && c.name.toLowerCase().includes(k)) || (c.workNo && c.workNo.toLowerCase().includes(k)))
  }
  if (filter.status) list = list.filter((c) => c.status === filter.status)
  return list
})

const paginatedList = computed(() => {
  const list = filteredList.value
  const start = (page.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

async function loadData() {
  loading.value = true
  try {
    const res = await getAdminCounselors(filter)
    if (res?.code === 200 && Array.isArray(res.data)) {
      counselorList.value = res.data
    } else {
      counselorList.value = []
      ElMessage.warning('获取数据失败')
    }
  } catch (e) {
    console.error('加载咨询师列表失败:', e)
    counselorList.value = []
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function resetFilter() {
  filter.keyword = ''
  filter.status = ''
  page.value = 1
  loadData()
}

function openCounselorDialog(row = null) {
  editingCounselor.value = row
  if (row) {
    counselorForm.workNo = row.workNo
    counselorForm.name = row.name
    counselorForm.phone = row.phone || ''
    counselorForm.password = ''
    counselorForm.title = row.title || ''
    counselorForm.specialty = row.specialty || ''
  } else {
    counselorForm.workNo = ''
    counselorForm.name = ''
    counselorForm.phone = ''
    counselorForm.password = ''
    counselorForm.title = ''
    counselorForm.specialty = ''
  }
  counselorDialogVisible.value = true
}

async function saveCounselor() {
  // 表单验证
  const valid = await counselorFormRef.value?.validate().catch(() => false)
  if (!valid) return

  // 去除手机号前后空格
  const phone = counselorForm.phone?.trim()
  if (!phone) {
    ElMessage.warning('请输入手机号')
    return
  }

  loading.value = true
  try {
    let res
    if (editingCounselor.value) {
      // 更新现有咨询师
      res = await updateAdminCounselor(editingCounselor.value.id, {
        realName: counselorForm.name,
        phone: phone,
        title: counselorForm.title,
        expertiseAreas: counselorForm.specialty
      })
    } else {
      // 创建新咨询师
      res = await createAdminCounselor({
        employeeNumber: counselorForm.workNo?.trim(),
        realName: counselorForm.name?.trim(),
        phone: phone,
        password: counselorForm.password || '123456',
        title: counselorForm.title,
        expertiseAreas: counselorForm.specialty
      })
    }

    if (res?.code === 200) {
      ElMessage.success('保存成功')
      counselorDialogVisible.value = false
      await loadData()
    } else {
      ElMessage.error(res?.msg || '保存失败')
    }
  } catch (e) {
    console.error('保存咨询师失败:', e)
    ElMessage.error(e?.response?.data?.msg || e?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

function viewSchedule(row) {
  router.push({ path: '/admin/schedule', query: { counselorId: row.id } })
}

async function toggleStatus(row) {
  const action = row.status === 'active' ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(
        `确定要${action}咨询师"${row.name}"吗？`,
        '提示',
        { type: 'warning' }
    )

    loading.value = true
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    const res = await updateAdminCounselor(row.id, { status: newStatus })

    if (res?.code === 200) {
      ElMessage.success(`${action}成功`)
      await loadData()
    } else {
      ElMessage.error(res?.msg || `${action}失败`)
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error('切换状态失败:', e)
      ElMessage.error(e?.response?.data?.msg || e?.message || `${action}失败`)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.counselor-manage { max-width: 1100px; }

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

.filter-card, .table-card { margin-bottom: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
.filter-form { margin-bottom: 0; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
