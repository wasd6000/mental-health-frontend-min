<template>
  <div class="crisis-report">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">危机上报</span>
    </div>
    <div class="page-header">
      <h2>危机上报</h2>
      <p>发现学生存在心理危机风险时，请及时上报</p>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="report-form">
      <el-card class="form-section">
        <template #header>
          <span class="section-title">学生信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学生姓名" prop="studentName">
              <el-input v-model="form.studentName" placeholder="请输入学生姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号" prop="studentId">
              <el-input v-model="form.studentId" placeholder="请输入学号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio value="男">男</el-radio>
                <el-radio value="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="className">
              <el-input v-model="form.className" placeholder="请输入班级" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宿舍" prop="dorm">
              <el-input v-model="form.dorm" placeholder="请输入宿舍号" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="form-section">
        <template #header>
          <span class="section-title">危机信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="危机等级" prop="level">
              <el-select v-model="form.level" placeholder="请选择危机等级" style="width: 100%">
                <el-option label="红色 - 极高危" value="red">
                  <span class="level-option"><span class="level-dot red"></span>红色 - 极高危</span>
                </el-option>
                <el-option label="橙色 - 高危" value="orange">
                  <span class="level-option"><span class="level-dot orange"></span>橙色 - 高危</span>
                </el-option>
                <el-option label="黄色 - 中危" value="yellow">
                  <span class="level-option"><span class="level-dot yellow"></span>黄色 - 中危</span>
                </el-option>
                <el-option label="蓝色 - 关注" value="blue">
                  <span class="level-option"><span class="level-dot blue"></span>蓝色 - 关注</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="危机类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择危机类型" style="width: 100%">
                <el-option label="自杀倾向" value="suicide" />
                <el-option label="自伤行为" value="self_harm" />
                <el-option label="严重抑郁" value="depression" />
                <el-option label="严重焦虑" value="anxiety" />
                <el-option label="精神障碍" value="mental" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="发现时间" prop="discoverTime">
              <el-date-picker
                v-model="form.discoverTime"
                type="datetime"
                placeholder="选择发现时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="危机描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="请详细描述学生的危机表现、行为特征、诱发因素等"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="已采取措施" prop="measures">
              <el-input
                v-model="form.measures"
                type="textarea"
                :rows="3"
                placeholder="请描述已采取的应急措施"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="form-section">
        <template #header>
          <span class="section-title">联系人信息</span>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人电话" prop="emergencyPhone">
              <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系人电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人关系" prop="emergencyRelation">
              <el-input v-model="form.emergencyRelation" placeholder="如：父亲、母亲" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否已通知家长" prop="notifiedParent">
              <el-radio-group v-model="form.notifiedParent">
                <el-radio :value="true">已通知</el-radio>
                <el-radio :value="false">未通知</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <div class="form-actions">
        <el-button @click="$router.back()">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">提交上报</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  reportCrisis,
  buildCrisisReportCreateBody,
  isApiSuccess,
} from '../../api/crisisApi'
import { getCounselorUserId } from '../../utils/counselorSession.js'

const route = useRoute()
const router = useRouter()

const formRef = ref()
const submitting = ref(false)

const form = ref({
  studentName: '',
  studentId: '',
  gender: '',
  className: '',
  phone: '',
  dorm: '',
  level: '',
  type: '',
  discoverTime: new Date(),
  description: '',
  measures: '',
  emergencyContact: '',
  emergencyPhone: '',
  emergencyRelation: '',
  notifiedParent: false,
})

const rules = {
  studentName: [{ required: true, message: '请输入学生姓名', trigger: 'blur' }],
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  level: [{ required: true, message: '请选择危机等级', trigger: 'change' }],
  type: [{ required: true, message: '请选择危机类型', trigger: 'change' }],
  description: [{ required: true, message: '请描述危机情况', trigger: 'blur' }],
  discoverTime: [{ required: true, message: '请选择发现时间', trigger: 'change' }],
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  try {
    await ElMessageBox.confirm('确认提交危机上报？提交后将通知相关负责人进行处理。', '确认提交', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  submitting.value = true
  try {
    const payload = buildCrisisReportCreateBody({
      ...form.value,
      counselorId: getCounselorUserId(),
    })
    const res = await reportCrisis(payload)
    if (isApiSuccess(res)) {
      ElMessage.success(res?.msg || '危机上报成功')
      if (route.path.includes('/admin')) {
        router.push('/admin/tutor-workbench')
      } else {
        router.push('/crisis')
      }
    } else {
      ElMessage.error(res?.msg || '上报失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error(e?.message || '上报失败')
  }
  submitting.value = false
}

onMounted(() => {
  if (route.query.studentId) {
    form.value.studentId = route.query.studentId
  }
  if (route.query.studentName) {
    form.value.studentName = route.query.studentName
  }
})
</script>

<style scoped>
.crisis-report {
  max-width: 900px;
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

.form-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: 600;
  color: #1e293b;
}

.level-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.level-dot.red {
  background: #dc2626;
}

.level-dot.orange {
  background: #f59e0b;
}

.level-dot.yellow {
  background: #eab308;
}

.level-dot.blue {
  background: #3b82f6;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
