<template>
  <div class="health-course">
    <div class="page-nav">
      <el-button @click="$router.back()" :icon="ArrowLeft" text>返回上级</el-button>
      <span class="nav-title">心理健康课程</span>
    </div>
    <header class="page-header">
      <h1 class="page-title">心理健康课程</h1>
      <p class="page-subtitle">系统学习心理健康知识，提升心理素养</p>
    </header>
    <div class="page-content">
      <div class="course-layout">
        <div class="course-main">
          <div class="course-detail" v-if="currentCourse">
            <div class="course-banner">
              <img v-if="currentCourse.cover" :src="currentCourse.cover" :alt="currentCourse.title" />
              <div class="banner-overlay">
                <div class="course-badge" :class="currentCourse.status">
                  {{ getStatusText(currentCourse.status) }}
                </div>
              </div>
            </div>

            <div class="course-header">
              <h2 class="course-title">{{ currentCourse.title }}</h2>
              <div class="course-meta">
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ currentCourse.teacher }}
                </span>
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>
                  {{ currentCourse.duration }}课时
                </span>
                <span class="meta-item">
                  <el-icon><Reading /></el-icon>
                  {{ currentCourse.studentCount }}人学习
                </span>
                <span class="meta-item">
                  <el-icon><Star /></el-icon>
                  {{ currentCourse.rating }}分
                </span>
              </div>
            </div>

            <div class="course-tabs">
              <el-tabs v-model="activeTab">
                <el-tab-pane label="课程介绍" name="intro">
                  <div class="tab-content">
                    <div class="course-description">
                      <h3>课程简介</h3>
                      <p>{{ currentCourse.description }}</p>
                    </div>
                    <div class="course-objectives">
                      <h3>学习目标</h3>
                      <ul>
                        <li v-for="(objective, index) in currentCourse.objectives" :key="index">
                          {{ objective }}
                        </li>
                      </ul>
                    </div>
                    <div class="course-audience">
                      <h3>适合人群</h3>
                      <el-tag
                        v-for="(audience, index) in currentCourse.audience"
                        :key="index"
                        type="info"
                        size="large"
                        class="audience-tag"
                      >
                        {{ audience }}
                      </el-tag>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="课程大纲" name="outline">
                  <div class="tab-content">
                    <div class="course-outline">
                      <div
                        v-for="(chapter, chapterIndex) in currentCourse.chapters"
                        :key="chapterIndex"
                        class="chapter-section"
                      >
                        <div class="chapter-header">
                          <div class="chapter-number">第{{ chapterIndex + 1 }}章</div>
                          <div class="chapter-title">{{ chapter.title }}</div>
                        </div>
                        <div class="lessons-list">
                          <div
                            v-for="(lesson, lessonIndex) in chapter.lessons"
                            :key="lessonIndex"
                            class="lesson-item"
                            :class="{ locked: lesson.locked }"
                          >
                            <div class="lesson-icon">
                              <el-icon v-if="lesson.locked"><Lock /></el-icon>
                              <el-icon v-else-if="lesson.completed"><CircleCheck /></el-icon>
                              <el-icon v-else><Circle /></el-icon>
                            </div>
                            <div class="lesson-content">
                              <div class="lesson-title">{{ lesson.title }}</div>
                              <div class="lesson-meta">
                                <span class="lesson-duration">{{ lesson.duration }}</span>
                                <span v-if="lesson.type" class="lesson-type">{{ lesson.type }}</span>
                              </div>
                            </div>
                            <el-button
                              v-if="!lesson.locked"
                              type="primary"
                              size="small"
                              @click="startLesson(lesson)"
                            >
                              {{ lesson.completed ? '复习' : '开始学习' }}
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="课程评价" name="reviews">
                  <div class="tab-content">
                    <div class="course-reviews">
                      <div class="review-summary">
                        <div class="average-rating">
                          <div class="rating-number">{{ currentCourse.rating }}</div>
                          <div class="rating-stars">
                            <el-rate v-model="currentCourse.rating" disabled show-score />
                          </div>
                          <div class="rating-count">{{ currentCourse.reviewCount }}条评价</div>
                        </div>
                        <div class="rating-distribution">
                          <div v-for="star in 5" :key="star" class="rating-bar">
                            <span class="star-label">{{ 6 - star }}星</span>
                            <div class="bar-container">
                              <div class="bar-fill" :style="{ width: getRatingPercent(6 - star) + '%' }"></div>
                            </div>
                            <span class="bar-count">{{ getRatingCount(6 - star) }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="review-list">
                        <div v-for="review in reviews" :key="review.id" class="review-item">
                          <div class="review-header">
                            <div class="reviewer-info">
                              <div class="reviewer-avatar">
                                <img v-if="review.avatar" :src="review.avatar" :alt="review.name" />
                                <div v-else class="avatar-placeholder">
                                  <el-icon><User /></el-icon>
                                </div>
                              </div>
                              <div class="reviewer-name">{{ review.name }}</div>
                            </div>
                            <el-rate v-model="review.rating" disabled size="small" />
                          </div>
                          <div class="review-content">{{ review.content }}</div>
                          <div class="review-footer">
                            <span class="review-date">{{ review.date }}</span>
                            <div class="review-actions">
                              <el-button link @click="likeReview(review)">
                                <el-icon><Like /></el-icon>
                                {{ review.likeCount }}
                              </el-button>
                              <el-button link @click="replyReview(review)">
                                <el-icon><ChatDotRound /></el-icon>
                                回复
                              </el-button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>

            <div class="course-actions">
              <el-button type="primary" size="large" @click="enrollCourse">
                <el-icon><Select /></el-icon>
                {{ currentCourse.enrolled ? '继续学习' : '立即报名' }}
              </el-button>
              <el-button size="large" @click="toggleFavorite">
                <el-icon><Star /></el-icon>
                {{ currentCourse.isFavorite ? '已收藏' : '收藏课程' }}
              </el-button>
              <el-button size="large" @click="shareCourse">
                <el-icon><Share /></el-icon>
                分享
              </el-button>
            </div>
          </div>
        </div>

        <div class="course-sidebar">
          <div class="sidebar-section">
            <h3 class="section-title">课程列表</h3>
            <div class="course-list">
              <div
                v-for="course in courseList"
                :key="course.id"
                class="course-item"
                :class="{ active: currentCourse && currentCourse.id === course.id }"
                @click="selectCourse(course)"
              >
                <div class="course-item-cover">
                  <img v-if="course.cover" :src="course.cover" :alt="course.title" />
                  <div v-else class="cover-placeholder">
                    <el-icon><Reading /></el-icon>
                  </div>
                  <div class="course-item-progress" v-if="course.progress > 0">
                    <div class="progress-bar" :style="{ width: course.progress + '%' }"></div>
                  </div>
                </div>
                <div class="course-item-info">
                  <div class="course-item-title">{{ course.title }}</div>
                  <div class="course-item-meta">
                    <span class="progress-text" v-if="course.progress > 0">进度: {{ course.progress }}%</span>
                    <span class="course-item-teacher">{{ course.teacher }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h3 class="section-title">学习统计</h3>
            <div class="learning-stats">
              <div class="stat-item">
                <div class="stat-value">{{ learningStats.enrolledCourses }}</div>
                <div class="stat-label">已报名</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ learningStats.completedCourses }}</div>
                <div class="stat-label">已完成</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ learningStats.totalHours }}</div>
                <div class="stat-label">学习时长</div>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h3 class="section-title">相关课程</h3>
            <div class="related-courses">
              <div
                v-for="course in relatedCourses"
                :key="course.id"
                class="related-course-item"
                @click="selectCourse(course)"
              >
                <div class="related-course-cover">
                  <img v-if="course.cover" :src="course.cover" :alt="course.title" />
                  <div v-else class="cover-placeholder">
                    <el-icon><Reading /></el-icon>
                  </div>
                </div>
                <div class="related-course-info">
                  <div class="related-course-title">{{ course.title }}</div>
                  <div class="related-course-teacher">{{ course.teacher }}</div>
                </div>
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
import { getHealthCourseList, getHealthCourseDetail, enrollHealthCourse, getHealthCourseReviews } from '@/api/selfHelp'
import { User, Clock, Reading, Star, Lock, CircleCheck, Select, Share, ChatDotRound, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('intro')
const currentCourse = ref(null)
const courseList = ref([])
const relatedCourses = ref([])
const reviews = ref([])
const learningStats = ref({
  enrolledCourses: 0,
  completedCourses: 0,
  totalHours: 0
})

function normalizeCoursePayload(res) {
  if (res && typeof res === 'object' && 'data' in res && res.data != null) return res.data
  return res
}

function selectCourse(course) {
  getHealthCourseDetail(course.id).then((res) => {
    currentCourse.value = normalizeCoursePayload(res)
  })
  getHealthCourseReviews(course.id).then((res) => {
    const list = normalizeCoursePayload(res)
    reviews.value = Array.isArray(list) ? list : []
  })
}

function getStatusText(status) {
  const statusMap = {
    upcoming: '即将开始',
    ongoing: '进行中',
    finished: '已结束'
  }
  return statusMap[status] || status
}

function startLesson(lesson) {
  ElMessage.success(`开始学习：${lesson.title}`)
}

function enrollCourse() {
  if (currentCourse.value) {
    enrollHealthCourse(currentCourse.value.id).then(() => {
      currentCourse.value.enrolled = true
      ElMessage.success('报名成功！')
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

function likeReview(review) {
  review.likeCount++
  ElMessage.success('点赞成功')
}

async function replyReview(review) {
  try {
    const { value } = await ElMessageBox.prompt('请输入回复内容', '回复评价', {
      confirmButtonText: '发送',
      cancelButtonText: '取消',
      inputPlaceholder: '选填',
    })
    const text = (value || '').trim()
    reviews.value.unshift({
      id: `reply_${Date.now()}`,
      name: '我',
      avatar: '',
      rating: 5,
      content: text || '（已回复）',
      date: new Date().toLocaleString('zh-CN', { hour12: false }),
      likeCount: 0,
    })
    if (currentCourse.value) {
      currentCourse.value.reviewCount = (currentCourse.value.reviewCount || 0) + 1
    }
    ElMessage.success('回复已提交')
  } catch (e) {
    /* 用户取消 */
  }
}

function getRatingPercent(star) {
  if (!currentCourse.value || !currentCourse.value.ratingDistribution) return 0
  const total = currentCourse.value.reviewCount
  const count = currentCourse.value.ratingDistribution[star] || 0
  return total > 0 ? (count / total) * 100 : 0
}

function getRatingCount(star) {
  if (!currentCourse.value || !currentCourse.value.ratingDistribution) return 0
  return currentCourse.value.ratingDistribution[star] || 0
}

onMounted(() => {
  getHealthCourseList().then((res) => {
    const list = normalizeCoursePayload(res)
    courseList.value = Array.isArray(list) ? list : []
    relatedCourses.value = courseList.value.slice(0, 4)
    learningStats.value.enrolledCourses = courseList.value.filter(c => c.enrolled).length
    learningStats.value.completedCourses = courseList.value.filter(c => c.progress >= 100).length
    learningStats.value.totalHours = Math.round(courseList.value.reduce((acc, c) => acc + (c.progress || 0), 0) / 100)
    
    if (courseList.value.length > 0) {
      selectCourse(courseList.value[0])
    }
  })
})
</script>

<style scoped>
.health-course {
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

.course-banner {
  position: relative;
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.course-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5));
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 16px;
}

.course-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.course-badge.upcoming {
  background: #409eff;
}

.course-badge.ongoing {
  background: #67c23a;
}

.course-badge.finished {
  background: #909399;
}

.course-header {
  margin-bottom: 24px;
}

.course-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.course-tabs {
  margin-bottom: 24px;
}

.tab-content {
  padding: 20px 0;
}

.course-description,
.course-objectives,
.course-audience {
  margin-bottom: 24px;
}

.course-description h3,
.course-objectives h3,
.course-audience h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.course-description p {
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.course-objectives ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.course-objectives li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  color: #666;
  line-height: 1.6;
}

.course-objectives li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #67c23a;
  font-weight: bold;
}

.audience-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.course-outline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chapter-section {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.chapter-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
}

.chapter-number {
  padding: 4px 12px;
  background: #1e4f9c;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}

.chapter-title {
  font-weight: 600;
  color: #333;
  flex: 1;
}

.lessons-list {
  padding: 12px 20px;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.lesson-item:hover {
  border-color: #1e4f9c;
  background: #f8f9fa;
}

.lesson-item.locked {
  opacity: 0.6;
  cursor: not-allowed;
}

.lesson-icon {
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e4f9c;
}

.lesson-content {
  flex: 1;
}

.lesson-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.lesson-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.lesson-duration {
  display: flex;
  align-items: center;
  gap: 4px;
}

.lesson-type {
  padding: 2px 8px;
  background: #e8f4fd;
  color: #1e4f9c;
  border-radius: 4px;
}

.course-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
}

.course-sidebar {
  min-width: 0;
}

.sidebar-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #1e4f9c;
}

.course-list {
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
  margin-bottom: 12px;
}

.course-item:hover {
  border-color: #1e4f9c;
  box-shadow: 0 2px 8px rgba(30, 79, 156, 0.1);
}

.course-item.active {
  border-color: #1e4f9c;
  background: #e8f4fd;
}

.course-item-cover {
  width: 100px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.course-item-cover img {
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

.course-item-progress {
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

.related-courses {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-course-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.related-course-item:hover {
  border-color: #1e4f9c;
  box-shadow: 0 2px 8px rgba(30, 79, 156, 0.1);
}

.related-course-cover {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.related-course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-course-info {
  flex: 1;
  min-width: 0;
}

.related-course-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-course-teacher {
  font-size: 12px;
  color: #666;
}

.review-summary {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.average-rating {
  text-align: center;
}

.rating-number {
  font-size: 48px;
  font-weight: 600;
  color: #1e4f9c;
  margin-bottom: 8px;
}

.rating-stars {
  margin-bottom: 8px;
}

.rating-count {
  font-size: 14px;
  color: #666;
}

.rating-distribution {
  flex: 1;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.star-label {
  min-width: 40px;
  font-size: 14px;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #f7ba2a;
  border-radius: 4px;
}

.bar-count {
  min-width: 30px;
  text-align: right;
  font-size: 14px;
  color: #666;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.reviewer-name {
  font-weight: 600;
  color: #333;
}

.review-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-date {
  font-size: 12px;
  color: #999;
}

.review-actions {
  display: flex;
  gap: 12px;
}
</style>