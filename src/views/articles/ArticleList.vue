<template>
  <div class="article-list">
    <PortalNavBar active-key="articles" />
    <header class="page-header">
      <div class="header-decoration">
        <div class="deco-circle deco-circle-1"></div>
        <div class="deco-circle deco-circle-2"></div>
        <div class="deco-circle deco-circle-3"></div>
      </div>
      <div class="header-content">
        <div class="header-icon">
          <el-icon><Reading /></el-icon>
        </div>
        <h1 class="page-title">心理美文</h1>
        <p class="page-subtitle">阅读心灵美文，感受温暖力量，让文字治愈心灵</p>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-num">{{ allList.length }}</span>
            <span class="stat-label">篇美文</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ categories.length }}</span>
            <span class="stat-label">个分类</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ totalViews }}</span>
            <span class="stat-label">次阅读</span>
          </div>
        </div>
      </div>
    </header>

    <div class="main-layout">
      <aside class="sidebar">
        <div class="sidebar-card recommend-card">
          <h3 class="sidebar-title">
            <el-icon><Star /></el-icon>
            推荐阅读
          </h3>
          <div class="recommend-list">
            <div 
              v-for="(item, index) in recommendList" 
              :key="item.id" 
              class="recommend-item"
              @click="goDetail(item.id)"
            >
              <span class="recommend-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
              <span class="recommend-title">{{ item.title }}</span>
            </div>
            <div v-if="recommendList.length === 0" class="no-recommend">
              暂无推荐
            </div>
          </div>
        </div>

        <div class="sidebar-card category-cloud">
          <h3 class="sidebar-title">
            <el-icon><Collection /></el-icon>
            分类标签
          </h3>
          <div class="tag-cloud">
            <span 
              v-for="c in categoryStats" 
              :key="c.name"
              class="category-tag"
              :class="{ active: category === c.name }"
              :style="{ '--tag-color': getCategoryColor(c.name).primary }"
              @click="selectCategory(c.name)"
            >
              {{ c.name }}
              <span class="tag-count">{{ c.count }}</span>
            </span>
          </div>
        </div>

        <div class="sidebar-card quick-tips">
          <h3 class="sidebar-title">
            <el-icon><Sunny /></el-icon>
            心灵小贴士
          </h3>
          <div class="tip-content">
            <p class="tip-text">"{{ currentTip }}"</p>
            <button class="tip-refresh" @click="refreshTip">
              <el-icon><Refresh /></el-icon>
              换一条
            </button>
          </div>
        </div>
      </aside>

      <div class="content-area">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-input
              v-model="keyword"
              placeholder="搜索美文标题、摘要..."
              clearable
              class="search-input"
              @input="onSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select 
              v-model="category" 
              placeholder="全部分类" 
              clearable 
              class="category-select" 
              @change="loadList"
            >
              <el-option label="全部分类" value="" />
              <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <div class="toolbar-right">
            <el-radio-group v-model="sortBy" size="small" @change="sortList">
              <el-radio-button value="latest">最新</el-radio-button>
              <el-radio-button value="popular">热门</el-radio-button>
            </el-radio-group>
            <div class="view-toggle">
              <el-icon 
                :class="{ active: viewMode === 'grid' }" 
                @click="viewMode = 'grid'"
              >
                <Menu />
              </el-icon>
              <el-icon 
                :class="{ active: viewMode === 'list' }" 
                @click="viewMode = 'list'"
              >
                <Tickets />
              </el-icon>
            </div>
          </div>
        </div>

        <div class="article-cards" :class="viewMode">
          <div
            v-for="item in displayList"
            :key="item.id"
            class="article-card"
            :style="{ '--card-color': getCategoryColor(item.category).primary, '--card-bg': getCategoryColor(item.category).bg }"
            @click="goDetail(item.id)"
          >
            <div class="card-cover" :style="{ background: getCategoryColor(item.category).gradient }">
              <el-icon class="cover-icon"><Document /></el-icon>
              <div class="cover-category">{{ item.category || '未分类' }}</div>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ item.title }}</h3>
              <p class="card-summary">{{ item.summary }}</p>
              <div class="card-footer">
                <div class="card-meta">
                  <span class="meta-date">
                    <el-icon><Calendar /></el-icon>
                    {{ item.date }}
                  </span>
                  <span class="meta-views">
                    <el-icon><View /></el-icon>
                    {{ item.views || 0 }}
                  </span>
                </div>
                <div class="card-actions">
                  <span 
                    class="action-btn like-btn"
                    :class="{ liked: isLiked(item.id) }"
                    @click.stop="toggleLike(item.id)"
                  >
                    <el-icon><component :is="isLiked(item.id) ? 'StarFilled' : 'Star'" /></el-icon>
                    {{ item.likes || 0 }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
        </div>

        <div v-if="displayList.length === 0" class="empty-tip">
          <div class="empty-illustration">
            <el-icon class="empty-icon"><Document /></el-icon>
          </div>
          <p class="empty-text">暂无匹配的心理美文</p>
          <p class="empty-hint">换个关键词试试吧</p>
        </div>

        <div v-if="displayList.length > 0 && displayList.length < list.length" class="load-more">
          <el-button type="primary" plain @click="loadMore">
            加载更多
            <el-icon><ArrowDown /></el-icon>
          </el-button>
        </div>

        <div v-if="displayList.length > 0" class="pagination-wrap">
          <span class="result-count">共 {{ list.length }} 篇美文</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PortalNavBar from '@/components/portal/PortalNavBar.vue'
import { getArticles } from '@/api/portal'
import { 
  Search, ArrowRight, Document, Star, StarFilled, 
  Calendar, View, Reading, Collection, Sunny, 
  Refresh, Menu, Tickets, ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const keyword = ref('')
const category = ref('')
const sortBy = ref('latest')
const viewMode = ref('grid')
const list = ref([])
const allList = ref([])
const pageSize = 12
const currentPage = ref(1)
const likedArticles = ref(new Set())

const tips = [
  '每一天都是新的开始，给自己一个微笑',
  '接受自己的不完美，是成长的第一步',
  '深呼吸，让焦虑随风而去',
  '与自己和解，是最温柔的力量',
  '今天的你，比昨天更勇敢',
  '允许自己休息，也是一种进步',
  '情绪没有对错，只是需要被理解',
  '温柔地对待自己，世界也会温柔待你'
]
const currentTip = ref(tips[0])

const categoryColors = {
  '心灵感悟': { primary: '#667eea', bg: '#eef2ff', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  '情绪与成长': { primary: '#f093fb', bg: '#fdf2f8', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  '自我探索': { primary: '#4facfe', bg: '#eff6ff', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  '人际关系': { primary: '#43e97b', bg: '#ecfdf5', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  '压力管理': { primary: '#fa709a', bg: '#fff1f2', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  '正念冥想': { primary: '#a8edea', bg: '#f0fdfa', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  'default': { primary: '#6366f1', bg: '#eef2ff', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }
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

const totalViews = computed(() => {
  return allList.value.reduce((sum, item) => sum + (item.views || Math.floor(Math.random() * 500)), 0)
})

const recommendList = computed(() => {
  return [...allList.value]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
})

const displayList = computed(() => {
  return list.value.slice(0, currentPage.value * pageSize)
})

function getCategoryColor(category) {
  return categoryColors[category] || categoryColors['default']
}

function loadList() {
  getArticles({ keyword: keyword.value, category: category.value || undefined }).then(res => {
    list.value = Array.isArray(res) ? res : []
    currentPage.value = 1
    sortList()
  })
}

function sortList() {
  if (sortBy.value === 'popular') {
    list.value.sort((a, b) => (b.views || 0) - (a.views || 0))
  } else {
    list.value.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
}

function onSearch() {
  loadList()
}

function selectCategory(cat) {
  category.value = category.value === cat ? '' : cat
  loadList()
}

function goDetail(id) {
  router.push(`/articles/${id}`)
}

function isLiked(id) {
  return likedArticles.value.has(id)
}

function toggleLike(id) {
  if (likedArticles.value.has(id)) {
    likedArticles.value.delete(id)
  } else {
    likedArticles.value.add(id)
  }
}

function loadMore() {
  currentPage.value++
}

function refreshTip() {
  const idx = Math.floor(Math.random() * tips.length)
  currentTip.value = tips[idx]
}

onMounted(() => {
  getArticles().then(res => {
    const data = Array.isArray(res) ? res : []
    allList.value = data
    list.value = data
    sortList()
  })
  refreshTip()
})
</script>

<style scoped>
.article-list {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

.page-header {
  position: relative;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
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

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.deco-circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -50px;
}

.deco-circle-2 {
  width: 200px;
  height: 200px;
  top: 50%;
  right: -30px;
}

.deco-circle-3 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  left: 40%;
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
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
  opacity: 0.9;
  letter-spacing: 1px;
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
  opacity: 0.8;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

.main-layout {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: -30px auto 0;
  padding: 0 24px 40px;
  position: relative;
  z-index: 10;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-title .el-icon {
  color: #6366f1;
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.recommend-item:hover {
  background: #f1f5f9;
}

.recommend-rank {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background: #94a3b8;
}

.recommend-rank.rank-1 {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
}

.recommend-rank.rank-2 {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.recommend-rank.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #a0522d 100%);
}

.recommend-title {
  flex: 1;
  font-size: 14px;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-recommend {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
  font-size: 14px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: var(--tag-color);
  background: color-mix(in srgb, var(--tag-color) 10%, white);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-tag:hover,
.category-tag.active {
  background: var(--tag-color);
  color: white;
}

.tag-count {
  font-size: 11px;
  opacity: 0.8;
}

.tip-content {
  text-align: center;
}

.tip-text {
  font-size: 14px;
  line-height: 1.8;
  color: #64748b;
  font-style: italic;
  margin: 0 0 16px 0;
  padding: 16px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
}

.tip-refresh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tip-refresh:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.content-area {
  flex: 1;
  min-width: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.toolbar-left {
  display: flex;
  gap: 12px;
  flex: 1;
}

.search-input {
  flex: 1;
  max-width: 320px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.category-select {
  width: 140px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-toggle {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 8px;
}

.view-toggle .el-icon {
  padding: 8px;
  font-size: 18px;
  cursor: pointer;
  border-radius: 6px;
  color: #94a3b8;
  transition: all 0.2s;
}

.view-toggle .el-icon.active,
.view-toggle .el-icon:hover {
  background: white;
  color: #6366f1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.article-cards {
  display: grid;
  gap: 24px;
}

.article-cards.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.article-cards.list {
  grid-template-columns: 1fr;
}

.article-cards.list .article-card {
  display: flex;
  flex-direction: row;
}

.article-cards.list .card-cover {
  width: 200px;
  height: auto;
  min-height: 150px;
  border-radius: 12px 0 0 12px;
}

.article-cards.list .card-body {
  flex: 1;
}

.article-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.article-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.card-cover {
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.cover-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.cover-category {
  padding: 4px 16px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 12px;
  color: white;
  font-weight: 500;
}

.card-body {
  padding: 20px;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 10px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  justify-content: space-between;
  align-items: center;
}

.card-meta {
  display: flex;
  gap: 16px;
}

.meta-date,
.meta-views {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
}

.like-btn.liked {
  color: #f59e0b;
}

.like-btn.liked .el-icon {
  color: #f59e0b;
}

.card-hover-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-color);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s;
}

.article-card:hover .card-hover-effect {
  transform: scaleX(1);
}

.empty-tip {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
}

.empty-illustration {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  color: #94a3b8;
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

.load-more {
  text-align: center;
  margin-top: 32px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.result-count {
  font-size: 14px;
  color: #64748b;
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
    min-width: 280px;
  }
}

@media (max-width: 640px) {
  .page-header {
    padding: 30px 20px 50px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .header-stats {
    gap: 20px;
  }
  
  .stat-num {
    font-size: 22px;
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
  
  .toolbar-right {
    justify-content: space-between;
  }
  
  .article-cards.grid {
    grid-template-columns: 1fr;
  }
  
  .sidebar-card {
    min-width: 100%;
  }
}
</style>
