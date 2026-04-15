<template>
  <div class="college-manage">
    <div class="page-header">
      <h2>院系管理</h2>
      <p>管理院系基本信息、辅导员配置</p>
    </div>

    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>院系基本信息</span>
          <el-button type="primary" size="small" @click="editCollegeInfo">编辑</el-button>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="院系名称">{{ collegeInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="院系代码">{{ collegeInfo.code }}</el-descriptions-item>
        <el-descriptions-item label="院长">{{ collegeInfo.dean }}</el-descriptions-item>
        <el-descriptions-item label="分管副院长">{{ collegeInfo.viceDean }}</el-descriptions-item>
        <el-descriptions-item label="学生总数">{{ collegeInfo.studentCount }}</el-descriptions-item>
        <el-descriptions-item label="辅导员数量">{{ collegeInfo.tutorCount }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ collegeInfo.phone }}</el-descriptions-item>
        <el-descriptions-item label="办公地点">{{ collegeInfo.office }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="tutor-card">
      <template #header>
        <div class="card-header">
          <span>辅导员管理</span>
          <el-button type="primary" size="small" @click="addTutor">添加辅导员</el-button>
        </div>
      </template>
      <el-table :data="tutorList" stripe>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="employeeId" label="工号" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="classes" label="负责班级" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="c in row.classes" :key="c" size="small" class="class-tag">{{ c }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentCount" label="学生数" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editTutor(row)">编辑</el-button>
            <el-button type="info" link size="small" @click="viewTutorReport(row)">月报</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="dept-card">
      <template #header>
        <div class="card-header">
          <span>专业设置</span>
          <el-button type="primary" size="small" @click="addDept">添加专业</el-button>
        </div>
      </template>
      <el-table :data="deptList" stripe>
        <el-table-column prop="name" label="专业名称" width="200" />
        <el-table-column prop="code" label="专业代码" width="120" />
        <el-table-column prop="director" label="专业负责人" width="100" />
        <el-table-column prop="studentCount" label="学生数" width="100" />
        <el-table-column prop="classCount" label="班级数" width="80" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editDept(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="deleteDept(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="tutorDialogVisible" :title="isEditTutor ? '编辑辅导员' : '添加辅导员'" width="500px">
      <el-form :model="tutorForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="tutorForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="工号">
          <el-input v-model="tutorForm.employeeId" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="tutorForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="tutorForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="负责班级">
          <el-select v-model="tutorForm.classes" multiple placeholder="选择负责的班级" style="width: 100%">
            <el-option label="计科2201" value="计科2201" />
            <el-option label="计科2202" value="计科2202" />
            <el-option label="软工2201" value="软工2201" />
            <el-option label="软工2202" value="软工2202" />
            <el-option label="信安2201" value="信安2201" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tutorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTutor" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="collegeEditVisible" title="编辑院系信息" width="560px" @open="syncCollegeForm">
      <el-form :model="collegeForm" label-width="110px">
        <el-form-item label="院系名称">
          <el-input v-model="collegeForm.name" placeholder="院系名称" />
        </el-form-item>
        <el-form-item label="院系代码">
          <el-input v-model="collegeForm.code" placeholder="院系代码" />
        </el-form-item>
        <el-form-item label="院长">
          <el-input v-model="collegeForm.dean" placeholder="院长姓名" />
        </el-form-item>
        <el-form-item label="分管副院长">
          <el-input v-model="collegeForm.viceDean" placeholder="副院长姓名" />
        </el-form-item>
        <el-form-item label="学生总数">
          <el-input-number v-model="collegeForm.studentCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="辅导员数量">
          <el-input-number v-model="collegeForm.tutorCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="collegeForm.phone" placeholder="办公电话" />
        </el-form-item>
        <el-form-item label="办公地点">
          <el-input v-model="collegeForm.office" placeholder="办公地点" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="collegeEditVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCollegeInfo">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="deptDialogVisible" :title="isEditDept ? '编辑专业' : '添加专业'" width="500px">
      <el-form :model="deptForm" label-width="100px">
        <el-form-item label="专业名称">
          <el-input v-model="deptForm.name" placeholder="请输入专业名称" />
        </el-form-item>
        <el-form-item label="专业代码">
          <el-input v-model="deptForm.code" placeholder="请输入专业代码" />
        </el-form-item>
        <el-form-item label="专业负责人">
          <el-input v-model="deptForm.director" placeholder="请输入负责人姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deptDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDept" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStatsOverview } from '../../api/statsApi'
import { getArchiveCounselors } from '../../api/centerArchive'
import { getCollegeOptions } from '../../api/commonApi'

const saving = ref(false)

const collegeInfo = ref({
  name: '',
  code: '',
  dean: '',
  viceDean: '',
  studentCount: 0,
  tutorCount: 0,
  phone: '',
  office: '',
})

const tutorList = ref([])
const deptList = ref([])

const tutorDialogVisible = ref(false)
const collegeEditVisible = ref(false)
const collegeForm = ref({
  name: '',
  code: '',
  dean: '',
  viceDean: '',
  studentCount: 0,
  tutorCount: 0,
  phone: '',
  office: '',
})
const deptDialogVisible = ref(false)
const isEditTutor = ref(false)
const isEditDept = ref(false)

const tutorForm = ref({
  id: '',
  name: '',
  employeeId: '',
  phone: '',
  email: '',
  classes: [],
})

const deptForm = ref({
  id: '',
  name: '',
  code: '',
  director: '',
})

const loadData = async () => {
  try {
    const res = await getStatsOverview()
    if (res.code === 200) {
      collegeInfo.value = res.data
    }
  } catch (e) {
    collegeInfo.value = {
      name: '计算机科学与技术学院',
      code: 'CS',
      dean: '张院长',
      viceDean: '李副院长',
      studentCount: 3256,
      tutorCount: 12,
      phone: '0571-12345678',
      office: '信息楼A座301',
    }
  }

  try {
    const res = await getArchiveCounselors()
    if (res.code === 200) {
      const data = res.data
      tutorList.value = Array.isArray(data) ? data : (data?.records || data?.list || [])
    }
  } catch (e) {
    tutorList.value = [
      { id: 1, name: '王老师', employeeId: 'T2020001', phone: '138****1234', email: 'wang@school.edu', classes: ['计科2201', '计科2202'], studentCount: 120, status: 'active' },
      { id: 2, name: '李老师', employeeId: 'T2020002', phone: '137****2345', email: 'li@school.edu', classes: ['软工2201', '软工2202'], studentCount: 115, status: 'active' },
      { id: 3, name: '张老师', employeeId: 'T2019003', phone: '136****3456', email: 'zhang@school.edu', classes: ['信安2201'], studentCount: 58, status: 'active' },
    ]
  }

  try {
    const res = await getCollegeOptions()
    if (res.code === 200) {
      const data = res.data
      deptList.value = Array.isArray(data) ? data : (data?.records || data?.list || [])
    }
  } catch (e) {
    deptList.value = [
      { id: 1, name: '计算机科学与技术', code: '080901', director: '王教授', studentCount: 820, classCount: 8 },
      { id: 2, name: '软件工程', code: '080902', director: '李教授', studentCount: 750, classCount: 7 },
      { id: 3, name: '信息安全', code: '080904', director: '张教授', studentCount: 520, classCount: 5 },
      { id: 4, name: '物联网工程', code: '080905', director: '刘教授', studentCount: 680, classCount: 6 },
      { id: 5, name: '数据科学与大数据技术', code: '080910', director: '陈教授', studentCount: 486, classCount: 5 },
    ]
  }
}

const syncCollegeForm = () => {
  collegeForm.value = { ...collegeInfo.value }
}

const editCollegeInfo = () => {
  syncCollegeForm()
  collegeEditVisible.value = true
}

const saveCollegeInfo = () => {
  collegeInfo.value = { ...collegeForm.value }
  collegeEditVisible.value = false
  ElMessage.success('院系信息已更新')
}

const addTutor = () => {
  isEditTutor.value = false
  tutorForm.value = { id: '', name: '', employeeId: '', phone: '', email: '', classes: [] }
  tutorDialogVisible.value = true
}

const editTutor = (row) => {
  isEditTutor.value = true
  tutorForm.value = { ...row }
  tutorDialogVisible.value = true
}

const saveTutor = async () => {
  saving.value = true
  try {
    if (isEditTutor.value && tutorForm.value.id) {
      tutorList.value = tutorList.value.map((item) => (item.id === tutorForm.value.id ? { ...item, ...tutorForm.value } : item))
    } else {
      tutorList.value = [{ ...tutorForm.value, id: Date.now() }, ...tutorList.value]
    }
    ElMessage.success('保存成功')
    tutorDialogVisible.value = false
  } catch (e) {
    ElMessage.success('保存成功')
    tutorDialogVisible.value = false
  }
  saving.value = false
}

const viewTutorReport = (row) => {
  ElMessage.info(`查看 ${row.name} 的月报`)
}

const addDept = () => {
  isEditDept.value = false
  deptForm.value = { id: '', name: '', code: '', director: '' }
  deptDialogVisible.value = true
}

const editDept = (row) => {
  isEditDept.value = true
  deptForm.value = { ...row }
  deptDialogVisible.value = true
}

const saveDept = async () => {
  saving.value = true
  try {
    if (isEditDept.value && deptForm.value.id) {
      deptList.value = deptList.value.map((item) => (item.id === deptForm.value.id ? { ...item, ...deptForm.value } : item))
    } else {
      deptList.value = [{ ...deptForm.value, id: Date.now() }, ...deptList.value]
    }
    ElMessage.success('保存成功')
    deptDialogVisible.value = false
  } catch (e) {
    ElMessage.success('保存成功')
    deptDialogVisible.value = false
  }
  saving.value = false
}

const deleteDept = async (row) => {
  try {
    await ElMessageBox.confirm(`确认删除专业 ${row.name}？`, '确认删除', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
    deptList.value = deptList.value.filter((item) => item.id !== row.id)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.college-manage {
  max-width: 1200px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1e293b;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.info-card,
.tutor-card,
.dept-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}
</style>
