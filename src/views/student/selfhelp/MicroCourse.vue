<template>
  <div class="micro-course">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">心理微课</span>
    </div>
    <header class="page-header">
      <h1 class="page-title">心理微课</h1>
      <p class="page-subtitle">观看心理健康课程，提升心理素养</p>
    </header>
    <div class="page-content">
      <div class="course-layout">
        <div class="course-main">
          <div class="video-player">
            <video
              v-if="currentCourse"
              ref="videoRef"
              :src="currentCourse.videoUrl"
              :poster="currentCourse.poster"
              controls
              @timeupdate="onTimeUpdate"
              @ended="onVideoEnded"
              class="video-element"
            >
              您的浏览器不支持视频播放
            </video>
            <div v-else class="video-placeholder">
              <el-icon class="placeholder-icon"><VideoPlay /></el-icon>
              <p>请选择课程开始学习</p>
            </div>
          </div>

          <div v-if="currentCourse" class="course-info">
            <h2 class="course-title">{{ currentCourse.title }}</h2>
            <div class="course-meta">
              <span class="meta-item">
                <el-icon><User /></el-icon>
                {{ currentCourse.teacher }}
              </span>
              <span class="meta-item">
                <el-icon><Clock /></el-icon>
                {{ formatDuration(currentCourse.duration) }}
              </span>
              <span class="meta-item">
                <el-icon><View /></el-icon>
                {{ currentCourse.viewCount }}次播放
              </span>
            </div>
            <p class="course-description">{{ currentCourse.description }}</p>
            <div class="course-actions">
              <el-button type="primary" @click="toggleFavorite">
                <el-icon><Star /></el-icon>
                {{ currentCourse.isFavorite ? '已收藏' : '收藏课程' }}
              </el-button>
              <el-button @click="shareCourse">
                <el-icon><Share /></el-icon>
                分享
              </el-button>
            </div>
          </div>

          <div v-if="currentCourse" class="chapter-list">
            <h3 class="section-title">课程章节</h3>
            <div
              v-for="(chapter, index) in currentCourse.catalog"
              :key="chapter.id"
              class="chapter-item"
              :class="{ active: chapter.isCurrent, locked: chapter.isLocked }"
              @click="selectChapter(chapter)"
            >
              <div class="chapter-number">{{ index + 1 }}</div>
              <div class="chapter-content">
                <div class="chapter-title">{{ chapter.title }}</div>
                <div class="chapter-meta">
                  <span class="chapter-duration">{{ chapter.duration }}</span>
                  <span v-if="chapter.isLocked" class="chapter-locked">
                    <el-icon><Lock /></el-icon>
                    未解锁
                  </span>
                  <span v-else-if="chapter.isCurrent" class="chapter-current">
                    <el-icon><VideoPlay /></el-icon>
                    当前播放
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="course-sidebar">
          <div class="sidebar-section">
            <h3 class="section-title">我的课程</h3>
            <div class="my-courses">
              <div
                v-for="course in myCourses"
                :key="course.id"
                class="course-item"
                :class="{ active: currentCourse && currentCourse.id === course.id }"
                @click="selectCourse(course)"
              >
                <div class="course-cover">
                  <img v-if="course.poster" :src="course.poster" :alt="course.title" />
                  <div v-else class="cover-placeholder">
                    <el-icon><VideoCamera /></el-icon>
                  </div>
                  <div class="course-progress">
                    <div class="progress-bar" :style="{ width: course.progress + '%' }"></div>
                  </div>
                </div>
                <div class="course-item-info">
                  <div class="course-item-title">{{ course.title }}</div>
                  <div class="course-item-meta">
                    <span class="progress-text">进度: {{ course.progress }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h3 class="section-title">学习统计</h3>
            <div class="learning-stats">
              <div class="stat-item">
                <div class="stat-value">{{ learningStats.totalCourses }}</div>
                <div class="stat-label">已学课程</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ learningStats.totalHours }}</div>
                <div class="stat-label">学习时长</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ learningStats.finishedCourses }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMicroCourseList, getMicroCourseDetail, updateMicroCourseProgress } from '@/api/selfHelp'
import { VideoPlay, User, Clock, View, Star, Share, Lock, VideoCamera, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const videoRef = ref(null)
const currentCourse = ref(null)
const myCourses = ref([])
const learningStats = ref({
  totalCourses: 0,
  totalHours: 0,
  finishedCourses: 0
})

function selectCourse(course) {
  getMicroCourseDetail(course.id).then(res => {
    currentCourse.value = res
    if (videoRef.value) {
      videoRef.value.currentTime = res.progress || 0
    }
  })
}

function selectChapter(chapter) {
  if (chapter.isLocked) {
    ElMessage.warning('该章节尚未解锁，请先完成前面的章节')
    return
  }
  if (videoRef.value) {
    videoRef.value.currentTime = chapter.startTime || 0
    videoRef.value.play()
  }
}

function onTimeUpdate(event) {
  const currentTime = event.target.currentTime
  const duration = event.target.duration
  if (currentCourse.value && duration > 0) {
    const progress = Math.round((currentTime / duration) * 100)
    currentCourse.value.progress = progress
    
    updateMicroCourseProgress({
      id: currentCourse.value.id,
      progress: currentTime,
      isFinished: progress >= 95
    })
  }
}

function onVideoEnded() {
  if (currentCourse.value) {
    ElMessage.success('恭喜！课程学习完成')
    updateMicroCourseProgress({
      id: currentCourse.value.id,
      progress: currentCourse.value.duration,
      isFinished: true
    })
  }
}

function toggleFavorite() {
  if (currentCourse.value) {
    currentCourse.value.isFavorite = !currentCourse.value.isFavorite
    ElMessage.success(currentCourse.value.isFavorite ? '已收藏课程' : '已取消收藏')
  }
}

function shareCourse() {
  ElMessage.success('分享链接已复制到剪贴板')
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

onMounted(() => {
  getMicroCourseList().then(res => {
    myCourses.value = res || []
    learningStats.value.totalCourses = myCourses.value.length
    learningStats.value.finishedCourses = myCourses.value.filter(c => c.progress >= 95).length
    learningStats.value.totalHours = Math.round(myCourses.value.reduce((acc, c) => acc + (c.progress || 0), 0) / 60)
    
    if (myCourses.value.length > 0) {
      selectCourse(myCourses.value[0])
    }
  })
})
</script>

<style scoped>
.micro-course {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  background: linear-gradient(135deg, #1e4f9c 0%, #2d5fb4 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 10px 0;
  letter-spacing: 2px;
}

.page-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

.page-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
}

.course-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
}

.course-main {
  min-width: 0;
}

.video-player {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.video-element {
  width: 100%;
  display: block;
  max-height: 500px;
}

.video-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #999;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.course-info {
  margin-bottom: 30px;
}

.course-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.course-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.course-description {
  color: #666;
  line-height: 1.8;
  margin: 0 0 20px 0;
}

.course-actions {
  display: flex;
  gap: 12px;
}

.chapter-list {
  margin-top: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #1e4f9c;
}

.chapter-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chapter-item:hover {
  border-color: #1e4f9c;
  background: #f8f9fa;
}

.chapter-item.active {
  border-color: #1e4f9c;
  background: #e8f4fd;
}

.chapter-item.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.chapter-number {
  width: 32px;
  height: 32px;
  background: #1e4f9c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.chapter-content {
  flex: 1;
}

.chapter-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.chapter-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
}

.chapter-duration {
  color: #666;
}

.chapter-locked,
.chapter-current {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chapter-locked {
  color: #f56c6c;
}

.chapter-current {
  color: #1e4f9c;
  font-weight: 500;
}

.course-sidebar {
  min-width: 0;
}

.sidebar-section {
  margin-bottom: 30px;
}

.my-courses {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.course-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.course-item:hover {
  border-color: #1e4f9c;
  box-shadow: 0 2px 8px rgba(30, 79, 156, 0.1);
}

.course-item.active {
  border-color: #1e4f9c;
  background: #e8f4fd;
}

.course-cover {
  width: 100px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.course-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.3);
}

.progress-bar {
  height: 100%;
  background: #1e4f9c;
  transition: width 0.3s ease;
}

.course-item-info {
  flex: 1;
  min-width: 0;
}

.course-item-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-item-meta {
  font-size: 12px;
  color: #666;
}

.learning-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
  padding: 16px 8px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1e4f9c;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}
</style>