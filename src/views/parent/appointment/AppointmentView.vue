<template>
  <div class="appointment-view">
    <h2>预约咨询查看</h2>
    
    <!-- 子女切换器 -->
    <div class="child-selector">
      <label>选择子女：</label>
      <select v-model="selectedChild" @change="switchChild">
        <option v-for="child in children" :key="child.id" :value="child.id">
          {{ child.name }} ({{ child.studentId }})
        </option>
      </select>
    </div>

    <!-- 预约记录 -->
    <div class="appointment-records">
      <h3>预约记录</h3>
      <div v-if="currentAppointments.length === 0" class="empty-state">
        <p>暂无预约记录</p>
      </div>
      <div v-else class="records-list">
        <div v-for="appointment in currentAppointments" :key="appointment.id" class="appointment-card">
          <div class="appointment-header">
            <h4>{{ appointment.counselor }}</h4>
            <span :class="['status', appointment.status]">{{ appointment.status }}</span>
          </div>
          <div class="appointment-body">
            <div class="appointment-info">
              <p><span class="label">预约时间：</span>{{ appointment.date }} {{ appointment.time }}</p>
              <p><span class="label">咨询方式：</span>{{ appointment.method }}</p>
              <p><span class="label">提交时间：</span>{{ appointment.createdAt }}</p>
            </div>
            <div class="appointment-actions">
              <button class="action-btn view-btn" @click="viewAppointment(appointment)">
                查看详情
              </button>
              <button 
                v-if="appointment.status === '已确认'" 
                class="action-btn cancel-btn" 
                @click="cancelAppointment(appointment.id)"
              >
                取消预约
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="appointment-stats">
      <h3>预约统计</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ currentAppointments.length }}</span>
          <span class="stat-label">总预约次数</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ confirmedAppointments }}</span>
          <span class="stat-label">已确认</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ completedAppointments }}</span>
          <span class="stat-label">已完成</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ cancelledAppointments }}</span>
          <span class="stat-label">已取消</span>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      title="预约详情"
      width="min(520px, 92vw)"
      destroy-on-close
      class="parent-appointment-detail-dialog"
    >
      <template v-if="detailAppointment">
        <el-descriptions :column="1" border size="small" class="detail-desc">
          <el-descriptions-item label="咨询师">{{ detailAppointment.counselor }}</el-descriptions-item>
          <el-descriptions-item v-if="detailAppointment.counselorTitle" label="所属机构">
            {{ detailAppointment.counselorTitle }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="['status', detailAppointment.status]">{{ detailAppointment.status }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="预约日期">{{ detailAppointment.date }}</el-descriptions-item>
          <el-descriptions-item label="时段">{{ detailAppointment.time }}</el-descriptions-item>
          <el-descriptions-item label="咨询方式">{{ detailAppointment.method }}</el-descriptions-item>
          <el-descriptions-item v-if="detailAppointment.venue" label="地点 / 方式说明">
            {{ detailAppointment.venue }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ detailAppointment.createdAt }}</el-descriptions-item>
          <el-descriptions-item v-if="detailAppointment.remark" label="预约备注">
            {{ detailAppointment.remark }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getChildrenList, getChildAppointments } from '../../../api/parent.js'

const selectedChild = ref('1')
const loading = ref(false)
const children = ref([])
const appointments = ref([])
const detailVisible = ref(false)
const detailAppointment = ref(null)

onMounted(async () => {
  await loadChildren()
  await loadAppointments()
})

watch(selectedChild, async () => {
  await loadAppointments()
})

const loadChildren = async () => {
  try {
    loading.value = true
    const res = await getChildrenList()
    children.value = res.data || []
    if (children.value.length > 0) {
      selectedChild.value = String(children.value[0].id)
    }
  } catch (error) {
    console.error('加载子女列表失败', error)
  } finally {
    loading.value = false
  }
}

const loadAppointments = async () => {
  try {
    loading.value = true
    const child = children.value.find(c => String(c.id) === String(selectedChild.value))
    if (child) {
      const res = await getChildAppointments(child.studentId)
      appointments.value = res.data || []
    }
  } catch (error) {
    console.error('加载预约记录失败', error)
  } finally {
    loading.value = false
  }
}

const currentAppointments = computed(() => {
  return appointments.value.filter(appointment => String(appointment.childId) === String(selectedChild.value))
})

const confirmedAppointments = computed(() => {
  return currentAppointments.value.filter(appointment => appointment.status === '已确认').length
})

const completedAppointments = computed(() => {
  return currentAppointments.value.filter(appointment => appointment.status === '已完成').length
})

const cancelledAppointments = computed(() => {
  return currentAppointments.value.filter(appointment => appointment.status === '已取消').length
})

const switchChild = () => {
  // 切换子女逻辑
  console.log('切换到子女：', selectedChild.value)
}

const viewAppointment = (appointment) => {
  detailAppointment.value = appointment ? { ...appointment } : null
  detailVisible.value = !!detailAppointment.value
}

const cancelAppointment = (id) => {
  if (confirm('确定要取消该预约吗？')) {
    const appointment = appointments.value.find(a => a.id === id)
    if (appointment) {
      appointment.status = '已取消'
      alert('预约已取消')
    }
  }
}
</script>

<style scoped>
.appointment-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 子女切换器 */
.child-selector {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.child-selector label {
  font-weight: 500;
  color: #333;
  font-size: 1rem;
}

.child-selector select {
  flex: 1;
  max-width: 400px;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.appointment-records {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.appointment-records h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.2rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.appointment-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.appointment-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.appointment-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
}

.status.已确认 {
  background: #17a2b8;
}

.status.已完成 {
  background: #28a745;
}

.status.已取消 {
  background: #6c757d;
}

.appointment-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.appointment-info {
  flex: 1;
}

.appointment-info p {
  margin: 8px 0;
  color: #555;
  font-size: 0.95rem;
}

.appointment-info .label {
  font-weight: 500;
  color: #666;
}

.appointment-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;
}

.view-btn:hover {
  background: #e9ecef;
}

.cancel-btn {
  background: #dc3545;
  color: white;
}

.cancel-btn:hover {
  background: #c82333;
}

.appointment-stats {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.appointment-stats h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.2rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: #666;
}

@media (max-width: 768px) {
  .appointment-view {
    padding: 15px;
  }

  .child-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .child-selector select {
    max-width: none;
  }

  .appointment-records,
  .appointment-stats {
    padding: 20px;
  }

  .appointment-body {
    flex-direction: column;
    gap: 15px;
  }

  .appointment-actions {
    flex-direction: row;
    justify-content: flex-end;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
