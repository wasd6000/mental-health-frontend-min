<template>
  <div class="crisis-team-page">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">干预团队管理</span>
    </div>

    <div class="page-header">
      <div class="header-content">
        <h2>危机干预团队</h2>
        <p class="page-desc">组建和管理危机干预团队，协调多方资源共同应对危机</p>
      </div>
      <el-button
        type="primary"
        @click="showCreateTeamDialog"
        :icon="Plus"
        v-if="!teamInfo.teamId"
      >
        创建团队
      </el-button>
    </div>

    <!-- 团队基本信息 -->
    <el-card class="team-info-card" v-if="teamInfo.teamId">
      <template #header>
        <div class="card-header">
          <span>团队信息</span>
          <el-tag type="warning">{{ teamInfo.teamName }}</el-tag>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="团队ID">{{ teamInfo.teamId }}</el-descriptions-item>
        <el-descriptions-item label="危机报告ID">{{ teamInfo.reportId }}</el-descriptions-item>
        <el-descriptions-item label="团队负责人">
          <div class="leader-info">
            <el-avatar :size="32">{{ teamInfo.leaderName?.charAt(0) }}</el-avatar>
            <span>{{ teamInfo.leaderName }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="成员数量">{{ teamInfo.members?.length || 0 }}人</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(teamInfo.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatTime(teamInfo.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 团队成员列表 -->
    <el-card class="members-card">
      <template #header>
        <div class="card-header">
          <span>团队成员 ({{ teamInfo.members?.length || 0 }})</span>
          <el-button
            type="primary"
            size="small"
            @click="showAddMemberDialog"
            :icon="Plus"
            :disabled="!teamInfo.teamId"
          >
            添加成员
          </el-button>
        </div>
      </template>

      <el-table :data="teamInfo.members" v-loading="loading" stripe>
        <el-table-column label="成员信息" width="200">
          <template #default="{ row }">
            <div class="member-cell">
              <el-avatar :size="40">{{ row.userName?.charAt(0) }}</el-avatar>
              <div class="member-name-info">
                <span class="member-name">{{ row.userName }}</span>
                <span class="member-id">{{ row.userId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="角色" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :style="{
                backgroundColor: getMemberRoleConfig(row.memberRole)?.color + '20',
                color: getMemberRoleConfig(row.memberRole)?.color
              }"
              effect="plain"
            >
              {{ getMemberRoleConfig(row.memberRole)?.label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="responsibility" label="职责描述" min-width="200" show-overflow-tooltip />

        <el-table-column prop="contactPhone" label="联系电话" width="140" />

        <el-table-column label="加入时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.joinTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editMember(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="removeMember(row)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!teamInfo.members?.length && !loading" description="暂无团队成员" />
    </el-card>

    <!-- 创建团队对话框 -->
    <el-dialog v-model="createTeamVisible" title="创建干预团队" width="600px">
      <el-form
        :model="createTeamForm"
        :rules="createTeamRules"
        ref="createTeamFormRef"
        label-width="120px"
      >
        <el-form-item label="危机报告ID" prop="reportId">
          <el-input
            v-model="createTeamForm.reportId"
            placeholder="请输入危机报告ID"
            disabled
          />
        </el-form-item>
        <el-form-item label="团队负责人ID" prop="leaderId">
          <el-input
            v-model="createTeamForm.leaderId"
            placeholder="请输入负责人用户ID"
          />
        </el-form-item>
        <el-form-item label="团队名称" prop="teamName">
          <el-input
            v-model="createTeamForm.teamName"
            placeholder="请输入团队名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createTeamVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTeam" :loading="submitting">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加成员对话框 -->
    <el-dialog v-model="addMemberVisible" title="添加团队成员" width="600px">
      <el-form
        :model="addMemberForm"
        :rules="addMemberRules"
        ref="addMemberFormRef"
        label-width="120px"
      >
        <el-form-item label="成员用户ID" prop="userId">
          <el-input
            v-model="addMemberForm.userId"
            placeholder="请输入成员用户ID"
          />
        </el-form-item>
        <el-form-item label="成员角色" prop="memberRole">
          <el-select
            v-model="addMemberForm.memberRole"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="(config, key) in MEMBER_ROLE_MAP"
              :key="key"
              :label="config.label"
              :value="key"
            >
              <span :style="{ color: config.color }">{{ config.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职责描述" prop="responsibility">
          <el-input
            v-model="addMemberForm.responsibility"
            type="textarea"
            :rows="3"
            placeholder="请输入职责描述"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="addMemberForm.contactPhone"
            placeholder="请输入联系电话"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addMemberVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddMember" :loading="submitting">
          添加
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑成员对话框 -->
    <el-dialog v-model="editMemberVisible" title="编辑成员信息" width="600px">
      <el-form
        :model="editMemberForm"
        :rules="addMemberRules"
        ref="editMemberFormRef"
        label-width="120px"
      >
        <el-form-item label="成员角色" prop="memberRole">
          <el-select
            v-model="editMemberForm.memberRole"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="(config, key) in MEMBER_ROLE_MAP"
              :key="key"
              :label="config.label"
              :value="key"
            >
              <span :style="{ color: config.color }">{{ config.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职责描述" prop="responsibility">
          <el-input
            v-model="editMemberForm.responsibility"
            type="textarea"
            :rows="3"
            placeholder="请输入职责描述"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="editMemberForm.contactPhone"
            placeholder="请输入联系电话"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editMemberVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateMember" :loading="submitting">
          更新
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import {
  getInterventionTeam,
  createInterventionTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
  MEMBER_ROLE_MAP
} from '../../api/crisisInterventionApi'

const route = useRoute()
const loading = ref(false)
const submitting = ref(false)
const teamInfo = ref({})

// 创建团队相关
const createTeamVisible = ref(false)
const createTeamFormRef = ref(null)
const createTeamForm = ref({
  reportId: '',
  leaderId: '',
  teamName: ''
})
const createTeamRules = {
  reportId: [{ required: true, message: '请输入危机报告ID', trigger: 'blur' }],
  leaderId: [{ required: true, message: '请输入负责人ID', trigger: 'blur' }],
  teamName: [{ required: true, message: '请输入团队名称', trigger: 'blur' }]
}

// 添加成员相关
const addMemberVisible = ref(false)
const addMemberFormRef = ref(null)
const addMemberForm = ref({
  userId: '',
  memberRole: '',
  responsibility: '',
  contactPhone: ''
})
const addMemberRules = {
  userId: [{ required: true, message: '请输入成员用户ID', trigger: 'blur' }],
  memberRole: [{ required: true, message: '请选择成员角色', trigger: 'change' }]
}

// 编辑成员相关
const editMemberVisible = ref(false)
const editMemberFormRef = ref(null)
const editMemberForm = ref({
  memberId: '',
  memberRole: '',
  responsibility: '',
  contactPhone: ''
})

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const getMemberRoleConfig = (role) => {
  return MEMBER_ROLE_MAP[role] || { label: role, color: '#6b7280' }
}

const loadTeamInfo = async () => {
  const reportId = route.query.reportId
  if (!reportId) {
    ElMessage.warning('缺少危机报告ID参数')
    return
  }

  loading.value = true
  try {
    const res = await getInterventionTeam(reportId)
    if (res.code === 200) {
      teamInfo.value = res.data || {}
    } else {
      ElMessage.error(res.message || '加载团队信息失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('加载团队信息失败')
  } finally {
    loading.value = false
  }
}

const showCreateTeamDialog = () => {
  createTeamForm.value.reportId = route.query.reportId || ''
  createTeamVisible.value = true
}

const handleCreateTeam = async () => {
  try {
    await createTeamFormRef.value.validate()
    submitting.value = true
    const res = await createInterventionTeam(createTeamForm.value)
    if (res.code === 200) {
      ElMessage.success('团队创建成功')
      createTeamVisible.value = false
      loadTeamInfo()
    } else {
      ElMessage.error(res.message || '创建失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const showAddMemberDialog = () => {
  addMemberForm.value = {
    userId: '',
    memberRole: '',
    responsibility: '',
    contactPhone: ''
  }
  addMemberVisible.value = true
}

const handleAddMember = async () => {
  try {
    await addMemberFormRef.value.validate()
    submitting.value = true
    const data = {
      teamId: teamInfo.value.teamId,
      ...addMemberForm.value
    }
    const res = await addTeamMember(data)
    if (res.code === 200) {
      ElMessage.success('成员添加成功')
      addMemberVisible.value = false
      loadTeamInfo()
    } else {
      ElMessage.error(res.message || '添加失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const editMember = (row) => {
  editMemberForm.value = {
    memberId: row.memberId,
    memberRole: row.memberRole,
    responsibility: row.responsibility,
    contactPhone: row.contactPhone
  }
  editMemberVisible.value = true
}

const handleUpdateMember = async () => {
  try {
    await editMemberFormRef.value.validate()
    submitting.value = true
    const res = await updateTeamMember(
      editMemberForm.value.memberId,
      editMemberForm.value
    )
    if (res.code === 200) {
      ElMessage.success('成员信息更新成功')
      editMemberVisible.value = false
      loadTeamInfo()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const removeMember = async (row) => {
  try {
    await ElMessageBox.confirm('确定要移除该成员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    submitting.value = true
    const res = await removeTeamMember(row.memberId)
    if (res.code === 200) {
      ElMessage.success('成员移除成功')
      loadTeamInfo()
    } else {
      ElMessage.error(res.message || '移除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadTeamInfo()
})
</script>

<style scoped>
.crisis-team-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
  border-radius: 12px;
  border: 1px solid #bae6fd;
}

.header-content h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.page-desc {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.team-info-card,
.members-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.leader-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-name-info {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: 600;
  color: #1e293b;
}

.member-id {
  font-size: 12px;
  color: #94a3b8;
}
</style>