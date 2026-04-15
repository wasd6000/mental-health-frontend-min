<template>
  <div class="login-page">
    <!-- 导航栏 -->
    <PortalNavBar active-key="" />

    <!-- 主内容区 -->
    <div class="login-content">
      <!-- 顶部学校信息 - 黑色背景 -->
      <div class="school-header">
        <h1 class="school-name">四川文理学院</h1>
        <h2 class="school-english">Sichuan University of Arts and Science</h2>
        <div class="platform-name">心理健康服务平台 - 管理端</div>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card">
        <div class="card-header">
          <h3>管理员登录</h3>
          <p class="subtitle">请输入账号和密码登录系统</p>
        </div>

        <div class="login-form">
          <div class="form-group">
            <label for="username">账号</label>
            <input
              id="username"
              v-model="form.username"
              placeholder="请输入管理员账号"
              type="text"
              class="form-input"
              @keyup.enter="login"
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="form-input"
                @keyup.enter="login"
              />
              <button
                class="toggle-password"
                @click="showPassword = !showPassword"
                type="button"
              >
                {{ showPassword ? '隐藏' : '显示' }}
              </button>
            </div>
          </div>

          <div v-if="captchaImg" class="form-group captcha-row">
            <label for="captcha-input">图形验证码</label>
            <div class="captcha-line">
              <input
                id="captcha-input"
                v-model="form.verificationCode"
                type="text"
                class="form-input captcha-input"
                placeholder="请输入验证码"
                autocomplete="off"
                @keyup.enter="login"
              />
              <img
                :src="captchaImg"
                class="captcha-img"
                alt="验证码"
                @click="loadCaptcha"
                title="点击刷新"
              />
            </div>
          </div>

          <button
            class="login-btn"
            @click="login"
            :disabled="!form.username || !form.password || loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>

          <div class="login-tips">
            <p>💡 提示：登录后系统将根据您的账号自动识别角色权限</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PortalNavBar from '@/components/portal/PortalNavBar.vue'
import { login as apiLogin, fetchVerificationCode, validateToken } from '../../api/auth'
import { setAuthToken, getStoredAccessToken } from '../../api/request'

const router = useRouter()

const form = ref({
  username: '',
  password: '',
  verificationCode: ''
})

const showPassword = ref(false)
const loading = ref(false)
const captchaImg = ref('')
const captchaKey = ref('')

const loadCaptcha = async () => {
  try {
    const res = await fetchVerificationCode()
    if (res?.code === 200 && res.data?.image) {
      captchaImg.value = res.data.image
      captchaKey.value = res.data.key || ''
      form.value.verificationCode = ''
    }
  } catch (_) {
    captchaImg.value = ''
    captchaKey.value = ''
  }
}

onMounted(async () => {
  loadCaptcha()

  // 检查是否已登录
  const autoLoginSuccess = await checkAutoLogin()
  if (!autoLoginSuccess) {
    try {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_role')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('access_token')
    } catch (_) {
    }
  }
})

async function checkAutoLogin() {
  const token = getStoredAccessToken()

  if (!token) {
    return false
  }

  try {
    const isValid = await validateToken()

    if (isValid) {
      localStorage.setItem('access_token', token)
      localStorage.setItem('admin_token', token)

      const role = localStorage.getItem('user_role') ||
          localStorage.getItem('admin_role') ||
          'center'
      const userId = localStorage.getItem('user_id') || ''
      const userName = localStorage.getItem('user_name') || ''

      localStorage.setItem('user_role', role)
      localStorage.setItem('admin_role', role)
      if (userId) localStorage.setItem('user_id', userId)
      if (userName) localStorage.setItem('user_name', userName)

      ElMessage.success('自动登录成功')
      router.push('/admin/workbench')
      return true
    } else {
      ElMessage.warning('登录已过期，请重新登录')
      return false
    }
  } catch (e) {
    console.error('[AutoLogin] 验证异常:', e)
    return false
  }
}

const login = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  // 如果启用了验证码，必须填写
  if (captchaImg.value && !form.value.verificationCode) {
    ElMessage.warning('请输入图形验证码')
    return
  }

  loading.value = true
  try {
    const payload = {
      username: form.value.username,
      password: form.value.password,
      role: 'admin', // 管理端统一使用admin角色，后端会从JWT解析实际角色
    }

    if (captchaImg.value) {
      payload.verificationCode = form.value.verificationCode
      payload.captchaKey = captchaKey.value
    }

    const apiRes = await apiLogin(payload)

    if (apiRes?.code === 200 && apiRes.data) {
      const d = apiRes.data

      // 检查是否有错误信息
      const errMsg = d?.['false']
      if (typeof errMsg === 'string' && errMsg) {
        throw new Error(errMsg)
      }

      // 提取JWT Token
      const token =
        d?.token ||
        d?.accessToken ||
        Object.values(d || {}).find(
          (v) => typeof v === 'string' && v.includes('.'),
        )

      if (!token || typeof token !== 'string') {
        throw new Error(apiRes?.msg || '登录失败')
      }

      // 保存Token
      setAuthToken(token)
      localStorage.setItem('access_token', token)
      localStorage.setItem('admin_token', token)

      // 从 JWT token 中解析用户信息和角色
      try {
        const { getJwtSubject, getJwtRoleCode } = await import('../../utils/jwtPayload.js')
        const sub = getJwtSubject(token)
        const roleCode = getJwtRoleCode(token)

        // 存储 userId（JWT subject）
        if (sub) {
          localStorage.setItem('user_id', sub)
        }

        // 关键：使用 JWT 中的 role_code 作为用户角色（转换为小写）
        if (roleCode) {
          const normalizedRole = roleCode.toLowerCase()
          localStorage.setItem('user_role', normalizedRole)
          localStorage.setItem('admin_role', normalizedRole)
          console.log('[AdminLogin] 从 JWT 解析到角色:', roleCode, '->', normalizedRole)
        } else {
          // 降级处理
          localStorage.setItem('user_role', 'admin')
          localStorage.setItem('admin_role', 'admin')
          console.warn('[AdminLogin] JWT 中未找到 role_code，使用默认 admin')
        }
      } catch (e) {
        console.error('[AdminLogin] 解析 JWT 失败:', e)
        localStorage.setItem('user_role', 'admin')
        localStorage.setItem('admin_role', 'admin')
      }

      localStorage.setItem('user_name', form.value.username)

      ElMessage.success('登录成功')

      // 根据角色跳转到对应的工作台
      const role = localStorage.getItem('admin_role') || 'admin'
      const roleRoutes = {
        admin: '/admin/workbench',
        center: '/admin/center-statistics',
        counselor: '/admin/counselor-work',
        tutor: '/admin/tutor-workbench',
        instructor: '/admin/tutor-workbench',
        college: '/admin/college-workbench',
        college_leader: '/admin/college-workbench',
        leader: '/admin/leader-workbench',
        school_leader: '/admin/leader-workbench',
      }

      const redirectPath = roleRoutes[role] || '/admin/workbench'
      router.push(redirectPath)
    } else {
      throw new Error(apiRes?.msg || '登录失败')
    }
  } catch (err) {
    console.error('登录失败:', err)
    ElMessage.error(err.message || '登录失败，请检查账号密码')
    // 刷新验证码
    await loadCaptcha()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-image: url('/albackground.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px 40px;
  min-height: calc(100vh - 56px);
}

/* 顶部学校信息 - 黑色背景 */
.school-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  padding: 40px 60px;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 100%;
}

.school-name {
  margin: 0 0 12px 0;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 3px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.school-english {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 400;
  opacity: 0.95;
  letter-spacing: 1.5px;
}

.platform-name {
  font-size: 20px;
  font-weight: 600;
  padding: 10px 28px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 登录卡片 */
.login-card {
  width: 480px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 16px 56px rgba(0, 0, 0, 0.25);
  transform: translateY(-4px);
}

.card-header {
  background: linear-gradient(135deg, #a51c30 0%, #c9263e 100%);
  padding: 36px 24px;
  text-align: center;
  color: white;
}

.card-header h3 {
  margin: 0 0 8px 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  opacity: 0.85;
}

.login-form {
  padding: 36px 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #f9fafb;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1a1a1a;
  box-shadow: 0 0 0 4px rgba(26, 26, 26, 0.1);
  background: white;
}

.form-input:hover:not(:focus) {
  border-color: #d1d5db;
}

.password-input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
  font-weight: 500;
}

.toggle-password:hover {
  background: #f3f4f6;
  color: #1a1a1a;
}

.captcha-row .captcha-line {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  width: 130px;
  height: 50px;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  transition: all 0.2s;
  object-fit: cover;
}

.captcha-img:hover {
  border-color: #1a1a1a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #a51c30 0%, #c9263e 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
  box-shadow: 0 4px 16px rgba(165, 28, 48, 0.3);
  letter-spacing: 1px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(165, 28, 48, 0.4);
  background: linear-gradient(135deg, #c9263e 0%, #a51c30 100%);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-tips {
  margin-top: 20px;
  padding: 16px;
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
}

.login-tips p {
  margin: 0;
  font-size: 13px;
  color: #1e40af;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .school-header {
    padding: 30px 24px;
    margin-bottom: 30px;
  }

  .school-name {
    font-size: 28px;
    letter-spacing: 2px;
  }

  .school-english {
    font-size: 15px;
  }

  .platform-name {
    font-size: 17px;
    padding: 8px 20px;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
  }

  .card-header {
    padding: 28px 20px;
  }

  .card-header h3 {
    font-size: 22px;
  }

  .login-form {
    padding: 28px 24px;
  }

  .captcha-img {
    width: 110px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .login-content {
    padding: 70px 16px 30px;
  }

  .school-header {
    padding: 24px 20px;
  }

  .school-name {
    font-size: 24px;
  }

  .school-english {
    font-size: 13px;
  }

  .platform-name {
    font-size: 15px;
  }

  .login-card {
    max-width: 100%;
  }

  .captcha-row .captcha-line {
    flex-direction: column;
    align-items: stretch;
  }

  .captcha-img {
    width: 100%;
    height: 50px;
  }
}
</style>
