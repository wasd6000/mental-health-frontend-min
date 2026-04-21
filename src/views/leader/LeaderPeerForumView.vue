<template>
  <div class="leader-peer-forum-view">
    <div class="page-header">
      <h2>朋辈互助</h2>
      <p class="desc">浏览朋辈互助帖子，您可以查看和评论</p>
    </div>

    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索标题..." clearable style="width: 240px" @keyup.enter="loadPosts" />
      <el-select v-model="category" placeholder="板块" clearable style="width: 160px" @change="loadPosts">
        <el-option label="全部" value="" />
        <el-option label="话题讨论" value="话题讨论" />
        <el-option label="经验分享" value="经验分享" />
        <el-option label="互助知识" value="互助知识" />
        <el-option label="朋辈咨询" value="朋辈咨询" />
        <el-option label="心理委员值班" value="心理委员值班" />
        <el-option label="志愿服务" value="志愿服务" />
      </el-select>
      <el-button type="primary" @click="loadPosts">刷新</el-button>
    </div>

    <div class="post-grid" v-loading="loading">
      <div v-for="post in postList" :key="post.id" class="post-card" @click="goDetail(post.id)">
        <div class="card-header">
          <span class="category-tag">{{ post.category }}</span>
          <span class="post-time">{{ formatDate(post.createdAt) }}</span>
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-content">{{ truncateContent(post.content, 100) }}</p>
        <div class="card-footer">
          <span class="author">{{ post.authorDisplay }}</span>
          <div class="stats">
            <span><el-icon><View /></el-icon> {{ post.viewCount || 0 }}</span>
            <span><el-icon><ChatDotRound /></el-icon> {{ post.replyCount || 0 }}</span>
            <span><el-icon><Pointer /></el-icon> {{ post.likeCount || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-empty v-if="!loading && postList.length === 0" description="暂无帖子" />

    <div class="pager" v-if="total > pageSize">
      <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          layout="prev, pager, next"
          :total="total"
          @current-change="loadPosts"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, ChatDotRound, Pointer } from '@element-plus/icons-vue'
import { listPosts } from '@/api/peerForumApi.js'
import type { ForumPost } from '@/types/peerForum.js'

const router = useRouter()

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function truncateContent(content: string, maxLen: number) {
  if (!content) return ''
  return content.length > maxLen ? content.substring(0, maxLen) + '...' : content
}

const loading = ref(false)
const postList = ref<ForumPost[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)
const keyword = ref('')
const category = ref('')

async function loadPosts() {
  loading.value = true
  try {
    const res = await listPosts({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      category: category.value || undefined,
      status: 'approved', // 只显示已通过的帖子
    })
    postList.value = res.list
    total.value = res.total
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function goDetail(id: string) {
  const role = localStorage.getItem('admin_role') || localStorage.getItem('user_role')
  const leaderRoles = ['leader', 'school_leader', 'college', 'college_leader']
  const isLeader = leaderRoles.includes(role)

  if (isLeader) {
    // 领导角色使用独立路由
    const isCollegeLeader = ['college', 'college_leader'].includes(role)
    const pathPrefix = isCollegeLeader ? 'college' : 'leader'
    router.push(`/admin/${pathPrefix}-peer-support/${id}`)
  } else {
    // 非领导角色使用 peer-forum-view 路由
    router.push(`/admin/peer-forum-view/${id}`)
  }
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.leader-peer-forum-view {
  padding: 20px;
  background: #f8fafc;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.desc {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.post-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-tag {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.post-time {
  font-size: 12px;
  color: #94a3b8;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 10px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-content {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.author {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}

.stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #94a3b8;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stats .el-icon {
  font-size: 14px;
}

.pager {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

@media (max-width: 768px) {
  .post-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar .el-input,
  .toolbar .el-select {
    width: 100% !important;
  }
}
</style>
