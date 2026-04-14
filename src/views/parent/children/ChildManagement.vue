<template>
  <div class="child-management">
    <h2 class="page-title">子女管理</h2>

    <el-alert
      type="info"
      show-icon
      :closable="false"
      title="双向绑定说明"
      description="家长在本页提交绑定后，状态为「待学生确认」；学生登录学生端后会收到提示，或在「关联家长」页处理。学生确认后状态变为已绑定。"
      class="mb"
    />

    <el-card shadow="never" class="mb">
      <template #header>
        <span>发起绑定（待学生确认）</span>
      </template>
      <p class="hint">参数与后端 ParentBindChildDTO 一致；学生 ID 须为系统中的 userId（UUID），与 JWT subject 一致。</p>
      <el-form :model="newChild" label-width="100px" class="bind-form">
        <el-form-item label="学生ID" required>
          <el-input v-model="newChild.studentId" placeholder="例：c2437fc2-ca09-48f0-a23e-bf7a22b42181" />
        </el-form-item>
        <el-form-item label="学生姓名" required>
          <el-input v-model="newChild.studentName" placeholder="用于核对" />
        </el-form-item>
        <el-form-item label="关系">
          <el-select v-model="newChild.relationType" placeholder="可选" clearable style="width: 100%">
            <el-option label="父亲" value="father" />
            <el-option label="母亲" value="mother" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="验证信息">
          <el-input
            v-model="newChild.verificationInfo"
            type="textarea"
            :rows="2"
            placeholder="如身份证号后四位等，按学校要求填写"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="binding" @click="submitBind">提交绑定</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <template #header>
        <span>我的子女（已确认绑定）</span>
      </template>
      <el-empty v-if="!children.length" description="暂无已关联子女" />
      <div v-else class="children-grid">
        <el-card
          v-for="child in children"
          :key="child.studentId"
          shadow="hover"
          class="child-card"
        >
          <div class="child-info">
            <h4>{{ child.studentName }}</h4>
            <p class="student-id">{{ child.studentId }}</p>
            <div class="child-details">
              <p><span class="label">班级：</span>{{ child.className || '—' }}</p>
              <p><span class="label">学院：</span>{{ child.college || '—' }}</p>
            </div>
          </div>
          <div class="child-actions">
            <el-button size="small" @click="router.push('/parent/profile')">成长档案</el-button>
            <el-button type="danger" plain size="small" @click="doUnbind(child.studentId)">解绑</el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getChildrenList,
  bindChild as apiBindChild,
  unbindChild as apiUnbindChild,
} from '../../../api/parent.js'

const router = useRouter()
const loading = ref(false)
const binding = ref(false)
const children = ref([])

const newChild = ref({
  studentId: '',
  studentName: '',
  relationType: '',
  verificationInfo: '',
})

async function load() {
  loading.value = true
  try {
    const listRes = await getChildrenList()
    children.value = listRes.data || []
  } catch (e) {
    console.error(e)
    ElMessage.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

async function submitBind() {
  const c = newChild.value
  if (!c.studentId?.trim() || !c.studentName?.trim()) {
    ElMessage.warning('请填写学生 ID 与姓名')
    return
  }
  binding.value = true
  try {
    await apiBindChild({
      studentId: c.studentId.trim(),
      studentName: c.studentName.trim(),
      relationType: c.relationType || '',
      verificationInfo: c.verificationInfo?.trim() || '',
    })
    ElMessage.success('已提交，等待学生确认')
    newChild.value = {
      studentId: '',
      studentName: '',
      relationType: '',
      verificationInfo: '',
    }
    await load()
  } catch (e) {
    console.error(e)
    ElMessage.error(e?.response?.data?.msg || e?.message || '绑定失败')
  } finally {
    binding.value = false
  }
}

async function doUnbind(studentId) {
  try {
    await ElMessageBox.confirm('解绑后需重新关联才可查看该生数据。是否继续？', '解绑', {
      type: 'warning',
    })
    await apiUnbindChild(studentId)
    ElMessage.success('已解绑')
    await load()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
      ElMessage.error('解绑失败')
    }
  }
}

onMounted(load)
</script>

<style scoped>
.child-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin: 0 0 16px;
  font-size: 1.35rem;
}

.mb {
  margin-bottom: 20px;
}

.hint {
  margin: 0 0 16px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.bind-form {
  max-width: 560px;
}

.children-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.child-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.child-info h4 {
  margin: 0 0 4px;
}

.student-id {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 14px;
}

.child-details p {
  margin: 6px 0;
  font-size: 14px;
}

.child-details .label {
  color: #94a3b8;
}

.child-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
