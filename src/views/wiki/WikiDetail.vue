<template>
  <div class="wiki-detail">
    <PortalNavBar active-key="wiki" />
    <header class="page-header" :style="{ background: categoryGradient }">
      <div class="header-decoration">
        <div class="deco-circle deco-circle-1"></div>
        <div class="deco-circle deco-circle-2"></div>
      </div>
      <div class="header-content">
        <router-link to="/wiki" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </router-link>
        <div class="header-category" v-if="detail">
          {{ detail.category || '心理百科' }}
        </div>
      </div>
    </header>

    <div class="page-content">
      <div v-if="loading" class="loading-wrap">
        <div class="loading-spinner">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <span>正在加载内容...</span>
      </div>

      <template v-else-if="detail">
        <article class="detail-article">
          <div class="article-header">
            <h1 class="article-title">{{ detail.title }}</h1>
            <div class="article-meta">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ detail.date }}</span>
              </div>
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ detail.views || 256 }} 次阅读</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>约 {{ readingTime }} 分钟</span>
              </div>
            </div>
          </div>

          <div class="article-divider">
            <span class="divider-icon" :style="{ background: categoryGradient }">
              <el-icon><Reading /></el-icon>
            </span>
          </div>

          <div class="article-body" v-html="detail.content"></div>

          <div class="article-footer">
            <div class="footer-tags" v-if="detail.tags && detail.tags.length">
              <span class="tag-label">相关标签：</span>
              <span v-for="tag in detail.tags" :key="tag" class="article-tag">{{ tag }}</span>
            </div>

            <div class="footer-actions">
              <button 
                class="action-btn helpful-btn"
                :class="{ active: isHelpful }"
                @click="markHelpful"
              >
                <el-icon><CircleCheck /></el-icon>
                <span>{{ isHelpful ? '已标记有帮助' : '这篇文章有帮助' }}</span>
              </button>
            </div>
          </div>
        </article>

        <div class="related-section" v-if="relatedWiki.length > 0">
          <h3 class="section-title">
            <el-icon><Collection /></el-icon>
            相关知识
          </h3>
          <div class="related-list">
            <div 
              v-for="item in relatedWiki" 
              :key="item.id" 
              class="related-card"
              @click="goDetail(item.id)"
            >
              <div class="related-icon" :style="{ background: getRelatedGradient(item.category) }">
                <el-icon><Document /></el-icon>
              </div>
              <div class="related-info">
                <h4 class="related-title">{{ item.title }}</h4>
                <span class="related-category">{{ item.category }}</span>
              </div>
              <el-icon class="related-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <div class="nav-section">
          <router-link to="/wiki" class="nav-link" :style="{ background: categoryGradient }">
            <el-icon><ArrowLeft /></el-icon>
            <span>浏览更多心理百科</span>
          </router-link>
        </div>
      </template>

      <div v-else class="empty-tip">
        <div class="empty-illustration">
          <el-icon class="empty-icon"><Document /></el-icon>
        </div>
        <p class="empty-text">未找到该百科内容</p>
        <router-link to="/wiki" class="empty-link">
          <el-icon><ArrowLeft /></el-icon>
          返回心理百科列表
        </router-link>
      </div>
    </div>

    <div class="reading-progress" :style="{ width: readingProgress + '%', background: categoryGradient }"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PortalNavBar from '@/components/portal/PortalNavBar.vue'
import { getWikiDetail, getWiki } from '@/api/portal'
import { 
  ArrowLeft, Loading, Calendar, View, Clock, 
  Reading, Collection, Document, ArrowRight, CircleCheck
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const detail = ref(null)
const isHelpful = ref(false)
const readingProgress = ref(0)
const relatedWiki = ref([])

const categoryColors = {
  '基础知识': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  '情绪管理': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  '压力应对': 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  '人际交往': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  '自我认知': 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
  '心理疾病': 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  '成长发展': 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  'default': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
}

const categoryGradient = computed(() => {
  if (!detail.value) {
    return categoryColors['default']
  }
  return categoryColors[detail.value.category] || categoryColors['default']
})

const readingTime = computed(() => {
  if (!detail.value || !detail.value.content) {
    return 3
  }
  const text = detail.value.content.replace(/<[^>]*>/g, '')
  return Math.max(1, Math.ceil(text.length / 400))
})

function getRelatedGradient(category) {
  return categoryColors[category] || categoryColors['default']
}

function fetchDetail() {
  const id = route.params.id
  if (!id) {
    loading.value = false
    return
  }
  loading.value = true
  getWikiDetail(id).then(res => {
    detail.value = res || null
    loading.value = false
    if (res && res.category) {
      fetchRelated(res.category, id)
    }
  }).catch(() => {
    detail.value = null
    loading.value = false
  })
}

function fetchRelated(category, currentId) {
  getWiki({ category }).then(res => {
    const list = Array.isArray(res) ? res : []
    relatedWiki.value = list.filter(item => item.id !== currentId).slice(0, 4)
  })
}

function goDetail(id) {
  router.push(`/wiki/${id}`)
}

function markHelpful() {
  isHelpful.value = !isHelpful.value
  ElMessage.success(isHelpful.value ? '感谢您的反馈' : '已取消标记')
}

function updateReadingProgress() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  readingProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
}

onMounted(() => {
  fetchDetail()
  window.addEventListener('scroll', updateReadingProgress)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateReadingProgress)
})

watch(() => route.params.id, fetchDetail)
</script>

<style scoped>
.wiki-detail {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%);
}

.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  z-index: 1000;
  transition: width 0.1s;
}

.page-header {
  position: relative;
  padding: 30px;
  color: white;
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
  width: 200px;
  height: 200px;
  top: -80px;
  right: -40px;
}

.deco-circle-2 {
  width: 120px;
  height: 120px;
  bottom: -40px;
  left: 10%;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-4px);
}

.header-category {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.page-content {
  max-width: 900px;
  margin: -20px auto 0;
  padding: 0 24px 60px;
  position: relative;
  z-index: 10;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.detail-article {
  background: white;
  border-radius: 20px;
  padding: 50px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
}

.article-header {
  text-align: center;
  margin-bottom: 30px;
}

.article-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
}

.meta-item .el-icon {
  color: #10b981;
}

.article-divider {
  position: relative;
  height: 40px;
  margin: 30px 0;
}

.article-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #d1fae5, transparent);
}

.divider-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.article-body {
  font-size: 17px;
  line-height: 2;
  color: #334155;
}

.article-body :deep(p) {
  margin: 0 0 20px 0;
  text-indent: 2em;
}

.article-body :deep(h2),
.article-body :deep(h3) {
  margin: 32px 0 16px;
  color: #1e293b;
  font-weight: 600;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  margin: 16px 0;
  padding-left: 2em;
}

.article-body :deep(li) {
  margin: 8px 0;
}

.article-body :deep(blockquote) {
  margin: 24px 0;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-left: 4px solid #10b981;
  border-radius: 0 12px 12px 0;
  font-style: italic;
  color: #065f46;
}

.article-footer {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e2e8f0;
}

.footer-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.tag-label {
  font-size: 14px;
  color: #64748b;
}

.article-tag {
  padding: 6px 14px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 20px;
  font-size: 13px;
  color: #059669;
}

.footer-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
  background: white;
  font-size: 15px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: #10b981;
  color: #10b981;
}

.helpful-btn.active {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
  color: #059669;
}

.related-section {
  margin-top: 40px;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title .el-icon {
  color: #10b981;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.related-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #f1f5f9;
}

.related-card:hover {
  background: #f8fafc;
  border-color: #d1fae5;
  transform: translateX(4px);
}

.related-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
  flex-shrink: 0;
}

.related-info {
  flex: 1;
  min-width: 0;
}

.related-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-category {
  font-size: 12px;
  color: #10b981;
}

.related-arrow {
  color: #94a3b8;
  font-size: 16px;
}

.nav-section {
  margin-top: 30px;
  text-align: center;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 30px;
  color: white;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.nav-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
}

.empty-tip {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.08);
}

.empty-illustration {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 48px;
  color: #10b981;
}

.empty-text {
  font-size: 18px;
  color: #334155;
  margin: 0 0 20px 0;
}

.empty-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  border-radius: 25px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}

.empty-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .detail-article {
    padding: 30px 20px;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .related-list {
    grid-template-columns: 1fr;
  }
}
</style>
