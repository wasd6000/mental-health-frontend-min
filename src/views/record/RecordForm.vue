<template>
  <div class="record-form-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">{{ isEdit ? '编辑咨询记录' : '新建咨询记录' }}</span>
    </div>

    <el-card>
      <el-form :model="form" label-width="120px" :disabled="isView">
      <el-form-item label="预约ID">
        <el-input v-model="form.appointmentId" placeholder="可选：关联预约编号"></el-input>
      </el-form-item>

      <el-form-item label="学生ID">
        <el-input v-model="form.studentId"></el-input>
      </el-form-item>

      <el-form-item label="咨询师">
        <el-input v-model="form.counselorName"></el-input>
      </el-form-item>

      <el-form-item label="咨询日期">
        <el-date-picker v-model="form.consultationDate" type="date" placeholder="选择日期" />
      </el-form-item>

      <el-form-item label="内容">
        <el-input type="textarea" v-model="form.content" rows="6" />
      </el-form-item>

      <el-form-item label="风险评估">
        <el-input type="textarea" v-model="form.riskAssessment" rows="3" />
      </el-form-item>

      <el-form-item label="附件(<=10MB)">
        <input type="file" @change="onFileChange" />
        <div v-if="form.attachments?.length">
          <div v-for="(f, idx) in form.attachments" :key="idx">
            <a :href="f.url" target="_blank">{{ f.name }}</a> ({{ (f.size/1024/1024).toFixed(2) }} MB)
            <el-button type="text" @click="removeAttachment(idx)">移除</el-button>
          </div>
        </div>
      </el-form-item>

      <el-form-item v-if="!isView">
        <el-button @click="$router.back()">取消</el-button>
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="submit">提交</el-button>
      </el-form-item>
    </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createRecordAsync, updateRecordAsync, autosaveRecordAsync } from '../../api/record'
import { getRecordByIdAsync } from '../../api/record'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getCounselorUserId } from '../../utils/counselorSession.js'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const isView = ref(false)
const recordId = (route.params.id as string) || ''

if (route.name === 'RecordView') {
  isView.value = true
}

// 日期规范化工具（使用本地时间）
function toDay(d: string | Date) {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt.getTime())) return ''
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const form = ref<any>({
  appointmentId: route.query.appointmentId || '',
  studentId: localStorage.getItem('studentId') || '',
  counselorId: getCounselorUserId(),
  counselorName: localStorage.getItem('user_name') || localStorage.getItem('User_name') || '',
  consultationDate: toDay(new Date()),
  content: '',
  riskAssessment: '',
  attachments: [] as any[],
})

let autosaveTimer: any = null

onMounted(async () => {
  if (recordId) {
    isEdit.value = true
    try {
      const res = await getRecordByIdAsync(recordId)
      Object.assign(form.value, res.data)
    } catch (e) {
      ElMessage.error('无法加载记录')
    }
  }

  // 每5分钟自动保存一次
  autosaveTimer = setInterval(() => {
    doAutosave()
  }, 5 * 60 * 1000)

  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  if (autosaveTimer) clearInterval(autosaveTimer)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

async function doAutosave() {
  try {
    if (isEdit.value && recordId) {
      const res = await autosaveRecordAsync(recordId, form.value)
      // no-op
    } else {
      const res = await autosaveRecordAsync(null, form.value)
      if (res.data?.id) {
        // 将创建后的 id 应用到当前页面以便后续更新
        router.replace(`/record/${res.data.id}/edit`)
        isEdit.value = true
      }
    }

    ElMessage.info('已自动保存草稿')
  } catch (e) {
    console.error(e)
  }
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  // 同步保存
  if (form.value) {
    // NOTE: 同步保存不能使用 async/await，这里做简单提示
    navigator.sendBeacon('/__autosave', JSON.stringify(form.value))
  }
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const f = input.files[0]
  if (f.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const url = reader.result as string
    form.value.attachments = form.value.attachments || []
    form.value.attachments.push({ name: f.name, size: f.size, url })
  }
  reader.readAsDataURL(f)
}

function removeAttachment(idx: number) {
  form.value.attachments.splice(idx, 1)
}

async function saveDraft() {
  try {
    if (isEdit.value && recordId) {
      await updateRecordAsync(recordId, '修改待审核', form.value)
      ElMessage.success('草稿已保存')
    } else {
      const res = await createRecordAsync(form.value)
      ElMessage.success('草稿已创建')
      router.replace(`/record/${res.data.id}/edit`)
      isEdit.value = true
    }
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function submit() {
  try {
    if (isEdit.value && recordId) {
      await updateRecordAsync(recordId, '未审核', form.value)
      ElMessage.success('提交成功，等待审核')
    } else {
      const res = await createRecordAsync(form.value)
      await updateRecordAsync(res.data.id, '未审核', res.data)
      ElMessage.success('提交成功，等待审核')
      router.replace(`/record/${res.data.id}/edit`)
      isEdit.value = true
    }
  } catch (e) {
    ElMessage.error('提交失败')
  }
}
</script>

<style scoped>
.record-form-page {
  padding: 20px;
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
</style>
