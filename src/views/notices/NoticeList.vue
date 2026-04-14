<template>
  <div class="notice-list">
    <PortalNavBar active-key="notices" />
    <header class="page-header">
      <div class="header-decoration">
        <div class="deco-wave"></div>
        <div class="deco-circle deco-circle-1"></div>
        <div class="deco-circle deco-circle-2"></div>
      </div>
      <div class="header-content">
        <div class="header-icon">
          <el-icon><Bell /></el-icon>
        </div>
        <h1 class="page-title">通知公告</h1>
        <p class="page-subtitle">及时了解最新通知与活动信息</p>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-num">{{ list.length }}</span>
            <span class="stat-label">条公告</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ topCount }}</span>
            <span class="stat-label">条置顶</span>
          </div>
        </div>
      </div>
    </header>

    <div class="page-content">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="keyword"
            placeholder="搜索公告标题或摘要..."
            clearable
            class="search-input"
            @input="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="toolbar-right">
          <div class="filter-tabs">
            <button 
              class="filter-tab" 
              :class="{ active: filterTop === '' }"
              @click="setFilter('')"
            >
              <el-icon><Tickets /></el-icon>
              全部
            </button>
            <button 
              class="filter-tab top-tab" 
              :class="{ active: filterTop === true }"
              @click="setFilter(true)"
            >
              <el-icon><Top /></el-icon>
              置顶
            </button>
          </div>
        </div>
      </div>

      <div class="notice-timeline" v-if="topList.length > 0 && filterTop !== true">
        <h3 class="section-title">
          <el-icon><Top /></el-icon>
          置顶公告
        </h3>
        <div class="top-notices">
          <div
            v-for="item in topList"
            :key="item.id"
            class="top-notice-card"
            @click="goDetail(item.id)"
          >
            <div class="top-badge">
              <el-icon><Top /></el-icon>
              置顶
            </div>
            <h3 class="top-title">{{ item.title }}</h3>
            <p class="top-summary">{{ item.summary }}</p>
            <div class="top-meta">
              <span class="top-date">
                <el-icon><Calendar /></el-icon>
                {{ item.date }}
              </span>
              <span class="top-link">
                查看详情
                <el-icon><ArrowRight /></el-icon>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="notice-section">
        <h3 class="section-title" v-if="filterTop !== true && topList.length > 0">
          <el-icon><Document /></el-icon>
          全部公告
        </h3>
        <div class="notice-cards">
          <div
            v-for="(item, index) in displayList"
            :key="item.id"
            class="notice-card"
            :style="{ '--delay': index * 0.05 + 's' }"
            @click="goDetail(item.id)"
          >
            <div class="card-indicator" :class="{ 'is-top': item.isTop }"></div>
            <div class="card-content">
              <div class="card-header">
                <span v-if="item.isTop" class="card-top-tag">
                  <el-icon><Top /></el-icon>
                  置顶
                </span>
                <span v-else class="card-normal-tag">
                  <el-icon><Document /></el-icon>
                  公告
                </span>
                <span class="card-date">
                  <el-icon><Calendar /></el-icon>
                  {{ item.date }}
                </span>
              </div>
              <h3 class="card-title">{{ item.title }}</h3>
              <p class="card-summary">{{ item.summary }}</p>
              <div class="card-footer">
                <span class="read-more">
                  查看全文 
                  <el-icon><ArrowRight /></el-icon>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="list.length === 0" class="empty-tip">
        <div class="empty-illustration">
          <el-icon class="empty-icon"><Bell /></el-icon>
        </div>
        <p class="empty-text">暂无匹配的通知公告</p>
        <p class="empty-hint">换个关键词试试吧</p>
      </div>

      <div v-if="list.length > 0" class="result-summary">
        共 {{ list.length }} 条公告
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PortalNavBar from '@/components/portal/PortalNavBar.vue'
import { getNotices } from '@/api/portal'
import { Search, ArrowRight, Document, Bell, Calendar, Top, Tickets } from '@element-plus/icons-vue'

const router = useRouter()
const keyword = ref('')
const filterTop = ref('')
const list = ref([])
const allList = ref([])

const topList = computed(() => {
  return allList.value.filter(item => item.isTop).slice(0, 3)
})

const topCount = computed(() => {
  return allList.value.filter(item => item.isTop).length
})

const displayList = computed(() => {
  if (filterTop.value === true) {
    return list.value
  }
  return list.value.filter(item => !item.isTop || topList.value.length === 0)
})

function setFilter(val) {
  filterTop.value = val
  loadList()
}

function loadList() {
  const params = { keyword: keyword.value }
  if (filterTop.value === true) {
    params.isTop = true
  }
  getNotices(params).then(res => {
    list.value = Array.isArray(res) ? res : []
  })
}

function onSearch() {
  loadList()
}

function goDetail(id) {
  router.push(`/notices/${id}`)
}

onMounted(() => {
  getNotices().then(res => {
    allList.value = Array.isArray(res) ? res : []
    list.value = allList.value
  })
})
</script>

<style scoped>
.notice-list {
  min-height: 100vh;
  background: linear-gradient(180deg, #fef3c7 0%, #fef9c3 50%, #fefce8 100%);
}

.page-header {
  position: relative;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%);
  color: white;
  padding: 50px 30px 60px;
  text-align: center;
  overflow: hidden;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.deco-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 100'%3E%3Cpath fill='%23fef3c7' d='M0,50 C360,100 720,0 1080,50 C1260,75 1350,75 1440,50 L1440,100 L0,100 Z'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: cover;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.deco-circle-1 {
  width: 250px;
  height: 250px;
  top: -100px;
  right: -60px;
}

.deco-circle-2 {
  width: 150px;
  height: 150px;
  bottom: 20px;
  left: -40px;
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: 4px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 16px;
  margin: 0 0 30px 0;
  opacity: 0.95;
}

.header-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.4);
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 24px 60px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
  padding: 16px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.toolbar-left {
  flex: 1;
}

.search-input {
  max-width: 360px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 10px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  border-color: #f59e0b;
  color: #f59e0b;
}

.filter-tab.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title .el-icon {
  color: #f59e0b;
}

.top-notices {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.top-notice-card {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #fcd34d;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.top-notice-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(245, 158, 11, 0.2);
}

.top-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.top-title {
  font-size: 17px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.top-summary {
  font-size: 14px;
  color: #a16207;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.top-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #b45309;
}

.top-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #f59e0b;
  font-weight: 500;
}

.notice-section {
  margin-top: 20px;
}

.notice-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-card {
  display: flex;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  animation: fadeInUp 0.4s ease both;
  animation-delay: var(--delay);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notice-card:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.card-indicator {
  width: 6px;
  background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
  flex-shrink: 0;
}

.card-indicator.is-top {
  background: linear-gradient(180deg, #f59e0b 0%, #fbbf24 100%);
}

.card-content {
  flex: 1;
  padding: 20px 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-top-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #f59e0b;
  background: #fef3c7;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
}

.card-normal-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
}

.card-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #94a3b8;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.card-summary {
  font-size: 14px;
  color: #64748b;
  line-height: 1.7;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #f59e0b;
  font-weight: 500;
}

.notice-card:hover .read-more {
  text-decoration: underline;
}

.empty-tip {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.empty-illustration {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  color: #f59e0b;
}

.empty-text {
  font-size: 18px;
  color: #334155;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.result-summary {
  text-align: center;
  margin-top: 30px;
  font-size: 14px;
  color: #64748b;
}

@media (max-width: 768px) {
  .page-header {
    padding: 40px 20px 50px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    max-width: none;
  }
  
  .filter-tabs {
    justify-content: center;
  }
  
  .top-notices {
    grid-template-columns: 1fr;
  }
}
</style>
