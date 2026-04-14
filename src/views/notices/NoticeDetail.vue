<template>
  <div class="notice-detail">
    <PortalNavBar active-key="notices" />
    <header class="page-header">
      <div class="header-decoration">
        <div class="deco-circle deco-circle-1"></div>
        <div class="deco-circle deco-circle-2"></div>
      </div>
      <div class="header-content">
        <router-link to="/notices" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </router-link>
        <div class="header-badge" v-if="detail && detail.isTop">
          <el-icon><Top /></el-icon>
          置顶公告
        </div>
        <div class="header-badge normal" v-else-if="detail">
          <el-icon><Bell /></el-icon>
          通知公告
        </div>
      </div>
    </header>

    <div class="page-content">
      <div v-if="loading" class="loading-wrap">
        <div class="loading-spinner">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <span>正在加载公告...</span>
      </div>

      <template v-else-if="detail">
        <article class="detail-article">
          <div class="article-header">
            <div class="header-tags">
              <span v-if="detail.isTop" class="top-tag">
                <el-icon><Top /></el-icon>
                置顶
              </span>
              <span class="type-tag">
                <el-icon><Bell /></el-icon>
                公告
              </span>
            </div>
            <h1 class="article-title">{{ detail.title }}</h1>
            <div class="article-meta">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>发布于 {{ detail.date }}</span>
              </div>
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ detail.views || 328 }} 次查看</span>
              </div>
            </div>
          </div>

          <div class="article-divider">
            <div class="divider-line"></div>
            <span class="divider-icon">
              <el-icon><Document /></el-icon>
            </span>
            <div class="divider-line"></div>
          </div>

          <div class="article-body" v-html="detail.content"></div>

          <div class="article-footer">
            <div class="footer-info">
              <div class="info-item">
                <span class="info-label">发布单位：</span>
                <span class="info-value">{{ detail.department || '心理健康中心' }}</span>
              </div>
            </div>
            <div class="footer-actions">
              <button class="action-btn" @click="printNotice">
                <el-icon><Printer /></el-icon>
                <span>打印公告</span>
              </button>
            </div>
          </div>
        </article>

        <div class="nav-section">
          <router-link to="/notices" class="nav-link">
            <el-icon><ArrowLeft /></el-icon>
            <span>查看更多通知公告</span>
          </router-link>
        </div>
      </template>

      <div v-else class="empty-tip">
        <div class="empty-illustration">
          <el-icon class="empty-icon"><Bell /></el-icon>
        </div>
        <p class="empty-text">未找到该公告</p>
        <router-link to="/notices" class="empty-link">
          <el-icon><ArrowLeft /></el-icon>
          返回通知公告列表
        </router-link>
      </div>
    </div>

    <div class="reading-progress" :style="{ width: readingProgress + '%' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import PortalNavBar from '@/components/portal/PortalNavBar.vue'
import { getNoticeDetail } from '@/api/portal'
import { ArrowLeft, Loading, Calendar, View, Document, Bell, Top, Printer } from '@element-plus/icons-vue'

const route = useRoute()
const loading = ref(true)
const detail = ref(null)
const readingProgress = ref(0)

function fetchDetail() {
  const id = route.params.id
  if (!id) {
    loading.value = false
    return
  }
  loading.value = true
  getNoticeDetail(id).then(res => {
    detail.value = res || null
    loading.value = false
  }).catch(() => {
    detail.value = null
    loading.value = false
  })
}

function printNotice() {
  window.print()
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
.notice-detail {
  min-height: 100vh;
  background: linear-gradient(180deg, #fef3c7 0%, #fefce8 100%);
}

.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
  z-index: 1000;
  transition: width 0.1s;
}

.page-header {
  position: relative;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
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
  background: rgba(255, 255, 255, 0.15);
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

.header-badge {
  display: flex;
  align-items: center;
  gap: 6px;
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
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
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

.header-tags {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.top-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: white;
}

.type-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: #fef3c7;
  border-radius: 20px;
  font-size: 13px;
  color: #b45309;
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
  color: #f59e0b;
}

.article-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 30px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #fde68a, transparent);
}

.divider-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
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

.article-body :deep(strong) {
  color: #92400e;
}

.article-footer {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #fde68a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  font-size: 14px;
}

.info-label {
  color: #64748b;
}

.info-value {
  color: #1e293b;
  font-weight: 500;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 2px solid #fde68a;
  border-radius: 25px;
  background: white;
  font-size: 14px;
  color: #b45309;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #fef3c7;
  border-color: #f59e0b;
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
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 30px;
  color: white;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
}

.nav-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4);
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
  margin: 0 0 20px 0;
}

.empty-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 25px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}

.empty-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
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
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media print {
  .page-header,
  .nav-section,
  .footer-actions,
  .reading-progress {
    display: none !important;
  }
  
  .page-content {
    margin: 0;
    padding: 0;
  }
  
  .detail-article {
    box-shadow: none;
    padding: 20px;
  }
}
</style>
