<template>
  <div class="home">
    <PortalNavBar active-key="home" />

    <section class="hero-banner">
      <div class="hero-content">
        <div class="hero-badge">四川文理学院</div>
        <h1 class="hero-title">关注心理健康</h1>
        <h2 class="hero-subtitle">共创美好未来</h2>
        <p class="hero-desc">提供专业的心理健康服务与支持，守护每一位学子的心灵成长</p>
        <div class="hero-actions">
          <button class="hero-btn primary" @click="goAppointment">立即预约咨询</button>
          <router-link to="/wiki" class="hero-btn secondary">探索心理百科</router-link>
        </div>
      </div>
      <div class="hero-stats">
        <div class="stat-card">
          <span class="stat-number">{{ wiki.length || 50 }}+</span>
          <span class="stat-label">知识文章</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ activities.length || 20 }}+</span>
          <span class="stat-label">心理活动</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">24h</span>
          <span class="stat-label">在线服务</span>
        </div>
      </div>
    </section>

    <main class="main-content">
      <section class="quick-services">
        <div class="service-card" @click="goAppointment">
          <div class="service-icon purple">📅</div>
          <h4>预约咨询</h4>
          <p>专业心理咨询师一对一服务</p>
        </div>
        <router-link to="/wiki" class="service-card">
          <div class="service-icon green">📚</div>
          <h4>心理百科</h4>
          <p>丰富的心理健康知识库</p>
        </router-link>
        <router-link to="/articles" class="service-card">
          <div class="service-icon orange">📝</div>
          <h4>心理美文</h4>
          <p>温暖治愈的心灵文字</p>
        </router-link>
        <div class="service-card" @click="goPeerSupport">
          <div class="service-icon pink">🤝</div>
          <h4>朋辈互助</h4>
          <p>同学间的温暖支持</p>
        </div>
      </section>

      <div class="content-grid">
        <section class="content-card">
          <div class="card-header orange">
            <h3>🎯 活动风采</h3>
            <span class="header-badge">校/院级心理活动</span>
          </div>
          <div class="card-body">
            <div v-for="item in activities.slice(0, 5)" :key="item.id" class="activity-item">
              <span class="activity-dot"></span>
              <span class="activity-title">{{ item.title }}</span>
              <span class="activity-date">{{ item.date }}</span>
            </div>
            <div v-if="activities.length === 0" class="empty-hint">暂无活动</div>
          </div>
        </section>

        <section class="content-card">
          <div class="card-header green">
            <h3>📖 心理百科</h3>
            <router-link to="/wiki" class="header-more">更多 →</router-link>
          </div>
          <div class="card-body">
            <div v-for="item in wiki.slice(0, 5)" :key="item.id" class="list-item" @click="goDetail('wiki', item.id)">
              <span class="item-title">{{ item.title }}</span>
              <span class="item-arrow">→</span>
            </div>
            <div v-if="wiki.length === 0" class="empty-hint">暂无内容</div>
          </div>
        </section>

        <section class="content-card">
          <div class="card-header purple">
            <h3>✨ 心理美文</h3>
            <router-link to="/articles" class="header-more">更多 →</router-link>
          </div>
          <div class="card-body">
            <div v-for="item in articles.slice(0, 5)" :key="item.id" class="list-item" @click="goDetail('article', item.id)">
              <span class="item-title">{{ item.title }}</span>
              <span class="item-arrow">→</span>
            </div>
            <div v-if="articles.length === 0" class="empty-hint">暂无内容</div>
          </div>
        </section>

        <section class="content-card">
          <div class="card-header pink">
            <h3>💝 朋辈互助</h3>
            <span class="header-more" @click="goPeerSupport" style="cursor: pointer;">更多 →</span>
          </div>
          <div class="card-body">
            <div class="peer-link" @click="goDetail('peer', 1)">
              <span class="peer-icon">🕐</span>
              <span>心理委员值班表</span>
            </div>
            <div class="peer-link" @click="goDetail('peer', 2)">
              <span class="peer-icon">💬</span>
              <span>朋辈咨询预约</span>
            </div>
            <div class="peer-link" @click="goDetail('peer', 3)">
              <span class="peer-icon">📋</span>
              <span>互助知识手册</span>
            </div>
          </div>
        </section>
      </div>

      <section class="notice-section">
        <div class="notice-header">
          <h3>📢 通知公告</h3>
          <router-link to="/notices" class="notice-more">查看全部 →</router-link>
        </div>
        <div class="notice-list">
          <div
            v-for="item in notices.slice(0, 6)"
            :key="item.id"
            class="notice-item"
            @click="goDetail('notice', item.id)"
          >
            <span v-if="item.isTop" class="notice-top">置顶</span>
            <span v-else class="notice-dot"></span>
            <span class="notice-text">{{ item.title }}</span>
            <span class="notice-date">{{ item.date }}</span>
          </div>
          <div v-if="notices.length === 0" class="empty-hint">暂无公告</div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-logo-area">
            <img src="@/assets/logo.png" alt="校徽" class="footer-logo" />
            <h4>四川文理学院心理健康服务平台</h4>
          </div>
          <p>关爱心理健康，守护美好未来</p>
        </div>
        <div class="footer-links">
          <router-link to="/wiki">心理百科</router-link>
          <router-link to="/articles">心理美文</router-link>
          <span @click="goPeerSupport" style="cursor: pointer;">朋辈互助</span>
          <router-link to="/notices">通知公告</router-link>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2025 四川文理学院心理健康中心 版权所有</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PortalNavBar from '@/components/portal/PortalNavBar.vue'
import { getNotices, getWiki, getArticles, getActivities } from '../../api/portal'
import { validateToken } from '../../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()

const notices = ref([])
const wiki = ref([])
const articles = ref([])
const activities = ref([])

onMounted(async () => {
  await checkAutoLogin()

  try {
    notices.value = await getNotices()
    wiki.value = await getWiki()
    articles.value = await getArticles()
    activities.value = await getActivities()
  } catch (e) {
    console.error('加载数据失败', e)
  }
})

async function checkAutoLogin() {
  const token = localStorage.getItem('auth_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('User_token') ||
      localStorage.getItem('admin_token')

  if (!token) {
    return
  }

  try {
    const isValid = await validateToken()

    if (isValid) {
      console.log('[Home] Token 验证成功，保持登录状态')

      const role = localStorage.getItem('user_role') ||
          localStorage.getItem('User_role') ||
          localStorage.getItem('admin_role')

      // Deleted:if (role) {
      // Deleted:  ElMessage.success(`欢迎回来,${localStorage.getItem('user_name') || localStorage.getItem('User_name') || '用户'}`)
      // Deleted:}
    } else {
      console.log('[Home] Token 已失效')
    }
  } catch (e) {
    console.error('[Home] Token 验证异常:', e)
  }
}

const goAppointment = () => {
  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('User_token') ||
    localStorage.getItem('access_token')
  const role = localStorage.getItem('User_role')
  if (!token || !role) {
    router.push({ path: '/login/user', query: { redirect: '/appointment/select' } })
  } else {
    router.push('/appointment/select')
  }
}

const goDetail = (type, id) => {
  const pathMap = { wiki: '/wiki', article: '/articles', peer: '/student/peer-support', notice: '/notices' }
  const base = pathMap[type]
  if (base) router.push(id ? `${base}/${id}` : base)
}

const goPeerSupport = () => {
  const token = localStorage.getItem('auth_token') ||
      localStorage.getItem('User_token') ||
      localStorage.getItem('access_token')

  if (!token) {
    router.push('/student/peer-support')
    return
  }

  const role = localStorage.getItem('user_role') ||
      localStorage.getItem('User_role') ||
      localStorage.getItem('admin_role')

  if (['center', 'college', 'college_leader'].includes(role)) {
    router.push('/admin/peer-forum')
  } else if (['admin', 'counselor', 'tutor', 'instructor', 'leader', 'school_leader'].includes(role)) {
    router.push('/admin/peer-forum')
  } else {
    router.push('/student/peer-support')
  }
}
</script>


<style scoped>
.home {
  min-height: 100vh;
  background: #f8f9fa;
}

.hero-banner {
  background: url('/hero-bg.jpg') center/cover no-repeat;
  padding: 100px 40px;
  text-align: center;
  color: #333;
  position: relative;
  overflow: hidden;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.75);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  padding: 10px 28px;
  background: #a51c30;
  color: white;
  border-radius: 4px;
  font-size: 15px;
  margin-bottom: 28px;
  font-weight: 500;
  letter-spacing: 2px;
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 8px;
  color: #a51c30;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 40px;
  font-weight: 400;
  margin: 0 0 24px 0;
  color: #a51c30;
  letter-spacing: 6px;
}

.hero-desc {
  font-size: 18px;
  color: #555;
  margin: 0 0 40px 0;
  line-height: 1.8;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 36px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.hero-btn.primary {
  background: #a51c30;
  color: white;
  box-shadow: 0 6px 20px rgba(165, 28, 48, 0.3);
}

.hero-btn.primary:hover {
  transform: translateY(-3px);
  background: #8b1728;
  box-shadow: 0 10px 30px rgba(165, 28, 48, 0.4);
}

.hero-btn.secondary {
  background: white;
  color: #a51c30;
  border: 2px solid #a51c30;
}

.hero-btn.secondary:hover {
  background: #a51c30;
  color: white;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-top: 60px;
  position: relative;
  z-index: 1;
}

.stat-card {
  text-align: center;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stat-number {
  display: block;
  font-size: 36px;
  font-weight: 700;
  color: #a51c30;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.main-content {
  max-width: 1300px;
  margin: 0 auto;
  padding: 50px 24px;
}

.quick-services {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 50px;
  margin-top: -80px;
  position: relative;
  z-index: 20;
}

.service-card {
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
}

.service-icon {
  width: 70px;
  height: 70px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
}

.service-icon.purple { background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); }
.service-icon.green { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); }
.service-icon.orange { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); }
.service-icon.pink { background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); }

.service-card h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 10px 0;
}

.service-card p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
  margin-bottom: 50px;
}

.content-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  color: white;
}

.card-header h3 {
  font-size: 17px;
  margin: 0;
  font-weight: 600;
}

.card-header.orange { background: linear-gradient(135deg, #a51c30 0%, #c23a4a 100%); }
.card-header.green { background: linear-gradient(135deg, #2d8a6e 0%, #3da882 100%); }
.card-header.purple { background: linear-gradient(135deg, #5c6bc0 0%, #7986cb 100%); }
.card-header.pink { background: linear-gradient(135deg, #c9a227 0%, #d4b33c 100%); }

.header-badge {
  font-size: 12px;
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 15px;
}

.header-more {
  color: white;
  text-decoration: none;
  font-size: 14px;
  opacity: 0.9;
}

.header-more:hover {
  opacity: 1;
}

.card-body {
  padding: 20px 24px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 8px;
  height: 8px;
  background: #a51c30;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-title {
  flex: 1;
  font-size: 14px;
  color: #334155;
}

.activity-date {
  font-size: 12px;
  color: #94a3b8;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px dashed #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  padding-left: 8px;
}

.list-item:hover .item-arrow {
  opacity: 1;
  transform: translateX(4px);
}

.item-title {
  font-size: 14px;
  color: #334155;
}

.item-arrow {
  color: #94a3b8;
  font-size: 14px;
  opacity: 0;
  transition: all 0.2s;
}

.peer-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: linear-gradient(135deg, #fef9e7 0%, #fdf3d1 100%);
}

.peer-link:last-child {
  margin-bottom: 0;
}

.peer-link:hover {
  transform: translateX(6px);
  box-shadow: 0 4px 15px rgba(201, 162, 39, 0.2);
}

.peer-icon {
  font-size: 20px;
}

.peer-link span:last-child {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.notice-section {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
}

.notice-header h3 {
  font-size: 20px;
  color: #1e293b;
  margin: 0;
  font-weight: 600;
}

.notice-more {
  color: #a51c30;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.notice-more:hover {
  text-decoration: underline;
}

.notice-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
}

.notice-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.notice-top {
  font-size: 11px;
  padding: 3px 10px;
  background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
  color: white;
  border-radius: 6px;
  font-weight: 600;
}

.notice-dot {
  width: 6px;
  height: 6px;
  background: #a51c30;
  border-radius: 50%;
  flex-shrink: 0;
}

.notice-text {
  flex: 1;
  font-size: 14px;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-date {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}

.empty-hint {
  text-align: center;
  padding: 24px;
  color: #94a3b8;
  font-size: 14px;
}

.site-footer {
  background: #a51c30;
  color: white;
  margin-top: 60px;
}

.footer-content {
  max-width: 1300px;
  margin: 0 auto;
  padding: 50px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.footer-logo {
  height: 48px;
  width: auto;
  object-fit: contain;
  border-radius: 4px;
  background: white;
  padding: 4px;
}

.footer-info h4 {
  font-size: 20px;
  margin: 0;
}

.footer-info p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.footer-links {
  display: flex;
  gap: 32px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
  text-align: center;
}

.footer-bottom p {
  margin: 0;
  font-size: 13px;
  opacity: 0.7;
}

@media (max-width: 1200px) {
  .quick-services {
    grid-template-columns: repeat(2, 1fr);
  }
  .content-grid {
    grid-template-columns: 1fr;
  }
  .notice-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    padding: 15px;
    gap: 15px;
  }
  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
  }
  .hero-title {
    font-size: 32px;
  }
  .hero-subtitle {
    font-size: 24px;
  }
  .hero-stats {
    gap: 30px;
  }
  .quick-services {
    grid-template-columns: 1fr;
    margin-top: -40px;
  }
  .footer-content {
    flex-direction: column;
    gap: 30px;
    text-align: center;
  }
}
</style>
