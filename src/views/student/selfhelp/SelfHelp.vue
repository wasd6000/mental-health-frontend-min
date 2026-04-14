<template>
  <div class="self-help">
    <header class="page-header">
      <h1 class="page-title">心理自助</h1>
      <p class="page-subtitle">探索心理健康知识，提升心理素养</p>
    </header>
    <div class="page-content">
      <div class="help-grid">
        <div class="help-card" @click="goTo('/wiki')">
          <div class="card-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
            <el-icon :size="32"><Reading /></el-icon>
          </div>
          <div class="card-content">
            <h3>心理百科</h3>
            <p>了解心理健康知识，学习心理调适方法</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="help-card" @click="goTo('/articles')">
          <div class="card-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
            <el-icon :size="32"><Document /></el-icon>
          </div>
          <div class="card-content">
            <h3>心理美文</h3>
            <p>阅读心理健康相关文章，获得心灵慰藉</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="help-card" @click="goTo('/student/self-help/micro-course')">
          <div class="card-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%)">
            <el-icon :size="32"><VideoPlay /></el-icon>
          </div>
          <div class="card-content">
            <h3>心理微课</h3>
            <p>观看心理健康短视频，快速学习心理知识</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="help-card" @click="goTo('/student/self-help/music-therapy')">
          <div class="card-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
            <el-icon :size="32"><Headset /></el-icon>
          </div>
          <div class="card-content">
            <h3>音乐调节</h3>
            <p>聆听舒缓音乐，放松身心，调节情绪</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="help-card" @click="goTo('/student/self-help/health-course')">
          <div class="card-icon" style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%)">
            <el-icon :size="32"><School /></el-icon>
          </div>
          <div class="card-content">
            <h3>心理健康课程</h3>
            <p>系统学习心理健康知识，提升心理素养</p>
          </div>
          <div class="card-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Reading, Document, VideoPlay, Headset, School, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

function goTo(path) {
  router.push(path)
}
</script>

<style scoped>
.self-help {
  min-height: 100vh;
  padding: 28px 24px 48px;
  background: linear-gradient(160deg, #f0f4ff 0%, #e8f0fe 35%, #f5f7fa 70%, #fafbfc 100%);
}

.page-header {
  margin-bottom: 32px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(30, 79, 156, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.12);
}

.page-title {
  margin: 0 0 6px 0;
  font-size: 26px;
  font-weight: 700;
  color: #1e3a5f;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.page-content {
  max-width: 960px;
  margin: 0 auto;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.help-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.help-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(30, 79, 156, 0.14);
}

.card-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-content h3 {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.card-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #64748b;
}

.card-arrow {
  flex-shrink: 0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  transition: color 0.2s, transform 0.2s;
}

.help-card:hover .card-arrow {
  color: #3b82f6;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .help-grid {
    grid-template-columns: 1fr;
  }
}
</style>