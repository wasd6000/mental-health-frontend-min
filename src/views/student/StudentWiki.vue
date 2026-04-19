<template>
  <div class="student-wiki">
    <header class="page-header">
      <div class="header-decoration">
        <div class="deco-shape deco-shape-1"></div>
        <div class="deco-shape deco-shape-2"></div>
        <div class="deco-shape deco-shape-3"></div>
      </div>
      <div class="header-content">
        <div class="header-icon">
          <el-icon><Reading /></el-icon>
        </div>
        <h1 class="page-title">心理百科</h1>
        <p class="page-subtitle">探索心理健康知识，了解心理科学奥秘</p>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-num">{{ allList.length }}</span>
            <span class="stat-label">篇知识</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ categories.length }}</span>
            <span class="stat-label">个分类</span>
          </div>
        </div>
      </div>
    </header>

    <div class="main-layout">
      <aside class="sidebar">
        <div class="sidebar-card platform-card" @click="openLearningPlatform">
          <div class="platform-icon-wrap">
            <el-icon><Setting /></el-icon>
          </div>
          <div class="platform-info">
            <h4 class="platform-title">专属学习平台</h4>
            <p class="platform-desc">课程、视频与自助学习资源</p>
          </div>
          <el-icon class="platform-arrow"><ArrowRight /></el-icon>
        </div>

        <div class="sidebar-card category-card">
          <h3 class="sidebar-title">
            <el-icon><Collection /></el-icon>
            知识分类
          </h3>
          <div class="category-list">
            <div
              v-for="c in categoryStats"
              :key="c.name"
              class="category-item"
              :class="{ active: category === c.name }"
              :style="{ '--cat-color': getCategoryColor(c.name) }"
              @click="selectCategory(c.name)"
            >
              <span class="cat-icon" :style="{ background: getCategoryColor(c.name) }">
                <el-icon><component :is="getCategoryIcon(c.name)" /></el-icon>
              </span>
              <span class="cat-name">{{ c.name }}</span>
              <span class="cat-count">{{ c.count }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-card quick-links">
          <h3 class="sidebar-title">
            <el-icon><Link /></el-icon>
            快捷入口
          </h3>
          <div class="link-list">
            <router-link to="/student/self-help" class="quick-link">
              <el-icon><Document /></el-icon>
              <span>心理自助</span>
            </router-link>
            <router-link to="/student/peer-support" class="quick-link">
              <el-icon><UserFilled /></el-icon>
              <span>朋辈互助</span>
            </router-link>
            <router-link to="/appointment/select" class="quick-link">
              <el-icon><Calendar /></el-icon>
              <span>预约咨询</span>
            </router-link>
          </div>
        </div>
      </aside>

      <div class="content-area">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input
              v-model="keyword"
              placeholder="搜索百科标题、摘要..."
              clearable
              class="search-input"
              @input="onSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="category" placeholder="全部分类" clearable class="category-select" @change="loadList">
              <el-option label="全部分类" value="" />
              <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <div class="toolbar-right">
            <span class="result-text">共 {{ list.length }} 篇</span>
          </div>
        </div>

        <div class="wiki-cards">
          <div
            v-for="item in list"
            :key="item.id"
            class="wiki-card"
            :style="{ '--card-color': getCategoryColor(item.category) }"
            @click="goDetail(item.id)"
          >
            <div class="card-icon-area" :style="{ background: getCategoryGradient(item.category) }">
              <el-icon><component :is="getCategoryIcon(item.category)" /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-header">
                <span class="card-category" :style="{ color: getCategoryColor(item.category), background: getCategoryBg(item.category) }">
                  {{ item.category || '未分类' }}
                </span>
                <span class="card-date">{{ item.date }}</span>
              </div>
              <h3 class="card-title">{{ item.title }}</h3>
              <p class="card-summary">{{ item.summary }}</p>
              <div class="card-footer">
                <span class="read-more">
                  阅读全文
                  <el-icon><ArrowRight /></el-icon>
                </span>
              </div>
            </div>
            <div class="card-border-effect"></div>
          </div>
        </div>

        <div v-if="list.length === 0" class="empty-tip">
          <div class="empty-illustration">
            <el-icon class="empty-icon"><Document /></el-icon>
          </div>
          <p class="empty-text">暂无匹配的心理百科内容</p>
          <p class="empty-hint">换个关键词试试吧</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getWiki } from '@/api/portal'
import {
  Search, ArrowRight, Document, Reading, Collection,
  Link, Setting, UserFilled, Calendar,
  Star, CircleCheck, ChatDotRound, QuestionFilled, Flag, TrendCharts
} from '@element-plus/icons-vue'

const router = useRouter()
const keyword = ref('')
const category = ref('')
const list = ref([])
const allList = ref([])

const categoryConfig = {
  '基础知识': { color: '#10b981', icon: 'Reading' },
  '情绪管理': { color: '#f59e0b', icon: 'Star' },
  '压力应对': { color: '#ef4444', icon: 'TrendCharts' },
  '人际交往': { color: '#3b82f6', icon: 'ChatDotRound' },
  '自我认知': { color: '#8b5cf6', icon: 'CircleCheck' },
  '心理疾病': { color: '#ec4899', icon: 'QuestionFilled' },
  '成长发展': { color: '#06b6d4', icon: 'Flag' },
  'default': { color: '#6366f1', icon: 'Document' }
}

const categories = computed(() => {
  const set = new Set(allList.value.map(item => item.category).filter(Boolean))
  return [...set].sort()
})

const categoryStats = computed(() => {
  const map = {}
  allList.value.forEach(item => {
    const cat = item.category || '未分类'
    map[cat] = (map[cat] || 0) + 1
  })
  return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
})

function getCategoryColor(cat) {
  return categoryConfig[cat]?.color || categoryConfig['default'].color
}

function getCategoryIcon(cat) {
  return categoryConfig[cat]?.icon || categoryConfig['default'].icon
}

function getCategoryGradient(cat) {
  const color = getCategoryColor(cat)
  return `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
}

function getCategoryBg(cat) {
  const color = getCategoryColor(cat)
  return `${color}15`
}

function selectCategory(cat) {
  category.value = category.value === cat ? '' : cat
  loadList()
}

function loadList() {
  getWiki({ keyword: keyword.value, category: category.value || undefined }).then(res => {
    list.value = Array.isArray(res) ? res : []
  })
}

function onSearch() {
  loadList()
}

function goDetail(id) {
  window.open(`/wiki/${id}`, '_blank')
}

function openLearningPlatform() {
  window.open('https://www.example.com/mental-health-learning', '_blank')
}

onMounted(() => {
  getWiki().then(res => {
    const data = Array.isArray(res) ? res : []
    allList.value = data
    list.value = data
  })
})
</script>

<style scoped>
.student-wiki {
  min-height: 100%;
  background: linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
}

.page-header {
  position: relative;
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
  color: white;
  padding: 30px;
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

.deco-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.deco-shape-1 {
  width: 200px;
  height: 200px;
  top: -80px;
  right: -60px;
}

.deco-shape-2 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  left: -30px;
}

.deco-shape-3 {
  width: 80px;
  height: 80px;
  top: 40%;
  left: 15%;
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 28px;
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.page-subtitle {
  font-size: 14px;
  margin: 0 0 16px 0;
  opacity: 0.9;
}

.header-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 20px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.3);
}

.main-layout {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.platform-card {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #a7f3d0;
}

.platform-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
}

.platform-icon-wrap {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.platform-info {
  flex: 1;
}

.platform-title {
  font-size: 14px;
  font-weight: 600;
  color: #065f46;
  margin: 0 0 2px 0;
}

.platform-desc {
  font-size: 11px;
  color: #059669;
  margin: 0;
}

.platform-arrow {
  color: #10b981;
  font-size: 16px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sidebar-title .el-icon {
  color: #10b981;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: #f1f5f9;
}

.category-item.active {
  background: var(--cat-color);
  background: color-mix(in srgb, var(--cat-color) 10%, white);
}

.cat-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
}

.cat-name {
  flex: 1;
  font-size: 13px;
  color: #334155;
}

.cat-count {
  font-size: 11px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 8px;
}

.link-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  text-decoration: none;
  color: #475569;
  transition: all 0.2s;
  background: #f8fafc;
}

.quick-link:hover {
  background: #10b981;
  color: white;
}

.quick-link .el-icon {
  font-size: 16px;
}

.content-area {
  flex: 1;
  min-width: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.toolbar-left {
  display: flex;
  gap: 10px;
  flex: 1;
}

.search-input {
  flex: 1;
  max-width: 280px;
}

.category-select {
  width: 120px;
}

.result-text {
  font-size: 13px;
  color: #64748b;
}

.wiki-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.wiki-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
}

.wiki-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.card-icon-area {
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-category {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.card-date {
  font-size: 11px;
  color: #94a3b8;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-summary {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 auto 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: 10px;
}

.read-more {
  font-size: 12px;
  color: var(--card-color);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
}

.wiki-card:hover .read-more {
  text-decoration: underline;
}

.card-border-effect {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-color);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s;
}

.wiki-card:hover .card-border-effect {
  transform: scaleX(1);
}

.empty-tip {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.empty-illustration {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 40px;
  color: #10b981;
}

.empty-text {
  font-size: 16px;
  color: #334155;
  margin: 0 0 6px 0;
}

.empty-hint {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

@media (max-width: 1024px) {
  .main-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-card {
    flex: 1;
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }

  .page-title {
    font-size: 20px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }

  .search-input {
    max-width: none;
  }

  .wiki-cards {
    grid-template-columns: 1fr;
  }

  .wiki-card {
    flex-direction: column;
  }

  .card-icon-area {
    width: 100%;
    height: 60px;
  }
}
</style>