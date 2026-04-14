<template>
  <div class="crisis-detail-panel" v-if="crisis">
    <div class="detail-header">
      <div class="student-profile">
        <el-avatar :size="64" :src="crisis.studentInfo?.avatar">
          {{ crisis.studentInfo?.name?.charAt(0) }}
        </el-avatar>
        <div class="profile-info">
          <h3>{{ crisis.studentInfo?.name }}</h3>
          <p>{{ crisis.studentInfo?.studentId }} · {{ crisis.studentInfo?.college }}</p>
        </div>
      </div>
      <div class="level-status">
        <el-tag 
          size="large"
          effect="dark"
          :style="{ backgroundColor: getLevelConfig(crisis.level)?.color }"
        >
          {{ getLevelConfig(crisis.level)?.shortLabel }}
        </el-tag>
        <el-tag :type="getStatusConfig(crisis.status)?.tagType">
          {{ getStatusConfig(crisis.status)?.label || '待审批' }}
        </el-tag>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="basic">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="个案编号">{{ crisis.caseNo }}</el-descriptions-item>
          <el-descriptions-item label="危机类型">{{ crisis.typeLabel }}</el-descriptions-item>
          <el-descriptions-item label="发现时间">{{ crisis.discoverTime }}</el-descriptions-item>
          <el-descriptions-item label="上报时间">{{ crisis.reportTime }}</el-descriptions-item>
          <el-descriptions-item label="上报人">{{ crisis.reporterName }} ({{ crisis.reporterRole }})</el-descriptions-item>
          <el-descriptions-item label="发现来源">{{ crisis.discoverSource || '-' }}</el-descriptions-item>
          <el-descriptions-item label="危机描述" :span="2">{{ crisis.description }}</el-descriptions-item>
          <el-descriptions-item label="初始措施" :span="2">{{ crisis.initialMeasures || '-' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">学生详细信息</h4>
        <el-descriptions :column="3" border size="small">
          <el-descriptions-item label="姓名">{{ crisis.studentInfo?.name }}</el-descriptions-item>
          <el-descriptions-item label="学号">{{ crisis.studentInfo?.studentId }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ crisis.studentInfo?.gender }}</el-descriptions-item>
          <el-descriptions-item label="学院">{{ crisis.studentInfo?.college }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ crisis.studentInfo?.major }}</el-descriptions-item>
          <el-descriptions-item label="班级">{{ crisis.studentInfo?.className }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ crisis.studentInfo?.phone }}</el-descriptions-item>
          <el-descriptions-item label="宿舍">{{ crisis.studentInfo?.dorm }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ crisis.studentInfo?.email || '-' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">紧急联系人</h4>
        <el-table :data="crisis.emergencyContacts || []" size="small" v-if="crisis.emergencyContacts?.length">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="relation" label="关系" />
          <el-table-column prop="phone" label="电话" />
          <el-table-column label="是否已通知">
            <template #default="{ row }">
              <el-tag :type="row.isNotified ? 'success' : 'info'" size="small">
                {{ row.isNotified ? '已通知' : '未通知' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无紧急联系人信息" :image-size="60" />
      </el-tab-pane>

      <el-tab-pane label="干预记录" name="intervention">
        <el-timeline v-if="crisis.interventionRecords?.length">
          <el-timeline-item
            v-for="record in crisis.interventionRecords"
            :key="record.id"
            :timestamp="record.createTime"
            placement="top"
          >
            <div class="intervention-item">
              <div class="intervention-head">
                <el-tag size="small" type="info">{{ record.typeLabel }}</el-tag>
                <span class="operator">{{ record.operator }}</span>
              </div>
              <p class="intervention-content">{{ record.content }}</p>
              <p class="intervention-result" v-if="record.result">
                <strong>结果：</strong>{{ record.result }}
              </p>
              <p class="intervention-plan" v-if="record.nextPlan">
                <strong>后续计划：</strong>{{ record.nextPlan }}
              </p>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无干预记录" :image-size="80" />
      </el-tab-pane>

      <el-tab-pane label="等级变更" name="level">
        <el-timeline v-if="crisis.levelHistory?.length">
          <el-timeline-item
            v-for="record in crisis.levelHistory"
            :key="record.id"
            :timestamp="record.operateTime"
            :color="getLevelConfig(record.toLevel)?.color"
            placement="top"
          >
            <div class="level-change-item">
              <div class="level-change">
                <span 
                  v-if="record.fromLevel"
                  class="level-from"
                  :style="{ color: getLevelConfig(record.fromLevel)?.color }"
                >
                  {{ getLevelConfig(record.fromLevel)?.shortLabel }}
                </span>
                <span v-else>初始建档</span>
                <el-icon><Right /></el-icon>
                <span 
                  class="level-to"
                  :style="{ 
                    backgroundColor: getLevelConfig(record.toLevel)?.color,
                    color: '#fff'
                  }"
                >
                  {{ getLevelConfig(record.toLevel)?.shortLabel }}
                </span>
              </div>
              <p class="change-reason">{{ record.reason }}</p>
              <span class="change-operator">{{ record.operator }} · {{ record.operatorRole }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无等级变更记录" :image-size="80" />
      </el-tab-pane>

      <el-tab-pane label="干预团队" name="team">
        <div class="team-list" v-if="crisis.interventionTeam?.length">
          <div v-for="member in crisis.interventionTeam" :key="member.id" class="team-member">
            <el-avatar :size="48">{{ member.name?.charAt(0) }}</el-avatar>
            <div class="member-info">
              <div class="member-name">
                {{ member.name }}
                <el-tag v-if="member.isLeader" size="small" type="warning">负责人</el-tag>
              </div>
              <div class="member-role">{{ member.role }}</div>
              <div class="member-contact">
                <span>{{ member.phone }}</span>
                <span v-if="member.email">· {{ member.email }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂未组建干预团队" :image-size="80" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Right } from '@element-plus/icons-vue'
import { getLevelConfig, getStatusConfig } from '../../../types/crisis'

const props = defineProps({
  crisis: {
    type: Object,
    default: () => null
  }
})

const activeTab = ref('basic')
</script>

<style scoped>
.crisis-detail-panel {
  padding: 0 10px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.student-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #1e293b;
}

.profile-info p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.level-status {
  display: flex;
  gap: 8px;
}

.section-title {
  margin: 24px 0 12px;
  font-size: 15px;
  color: #1e293b;
}

.intervention-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.intervention-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.operator {
  font-size: 12px;
  color: #94a3b8;
}

.intervention-content {
  margin: 0 0 8px;
  color: #334155;
  line-height: 1.5;
}

.intervention-result,
.intervention-plan {
  margin: 4px 0 0;
  font-size: 13px;
  color: #64748b;
}

.level-change-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.level-change {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.level-from {
  font-weight: 600;
}

.level-to {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.change-reason {
  margin: 0 0 8px;
  color: #475569;
  line-height: 1.5;
}

.change-operator {
  font-size: 12px;
  color: #94a3b8;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 10px;
}

.member-info {
  flex: 1;
}

.member-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.member-role {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.member-contact {
  font-size: 12px;
  color: #94a3b8;
}
</style>
