<template>
  <div class="login-page">
    <div class="back-btn" @click="goBack">
      <el-icon><ArrowLeft /></el-icon>
      <span>返回首页</span>
    </div>
    <div class="box">
      <h2>管理端登录</h2>

      <input v-model="form.username" placeholder="账号" />
      <input v-model="form.password" type="password" placeholder="密码" />

      <div v-if="captchaImg" class="captcha-row">
        <input v-model="form.verificationCode" placeholder="图形验证码" />
        <img :src="captchaImg" class="captcha-img" alt="" @click="loadCaptcha" title="刷新" />
      </div>

      <select v-model="form.role">
        <option value="center">心理中心</option>
        <option value="college">二级学院</option>
        <option value="leader">校领导</option>
        <option value="counselor">咨询师</option>
        <option value="tutor">辅导员</option>
        <option value="admin">管理员</option>
      </select>

      <button @click="login">登录</button>

      <!-- 开发者快速登录通道 -->
      <div class="dev-panel">
        <div class="dev-title">开发者快速登录</div>
        <div class="dev-buttons">
          <button class="dev-btn tutor" @click="quickLogin('tutor')">辅导员</button>
          <button class="dev-btn college" @click="quickLogin('college')">院系领导</button>
          <button class="dev-btn leader" @click="quickLogin('leader')">校领导</button>
          <button class="dev-btn center" @click="quickLogin('center')">心理中心</button>
          <button class="dev-btn counselor" @click="quickLogin('counselor')">咨询师</button>
          <button class="dev-btn admin" @click="quickLogin('admin')">管理员</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminLogin } from '../../api/mock'
import { login as apiLogin, fetchVerificationCode, validateToken } from '../../api/auth'
import { setAuthToken, getStoredAccessToken } from '../../api/request'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

const goBack = () => {
  router.push('/')
}

const form = ref({
  username: '',
  password: '',
  verificationCode: '',
  role: 'center'
})

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

  const autoLoginSuccess = await checkAutoLogin()

  if (!autoLoginSuccess) {
    try {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_role')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('access_token')
      console.log('[AutoLogin] 自动登录失败，已清除无效 Token')
    } catch (_) {
    }
  }
})

async function checkAutoLogin() {
  const token = getStoredAccessToken()

  if (!token) {
    console.log('[AutoLogin] 无可用 Token，等待用户手动登录')
    return false
  }

  console.log('[AutoLogin] 检测到 Token，开始验证...')

  try {
    const isValid = await validateToken()

    if (isValid) {
      console.log('[AutoLogin] Token 验证通过，自动登录')

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
      router.push('/admin')
      return true
    } else {
      console.log('[AutoLogin] Token 已失效，请重新登录')
      ElMessage.warning('登录已过期，请重新登录')
      return false
    }
  } catch (e) {
    console.error('[AutoLogin] 验证异常:', e)
    return false
  }
}

const ROLE_MAP = {
  center: '心理中心',
  counselor: '咨询师',
  tutor: '辅导员',
  leader: '校领导',
  college: '二级学院',
  admin: '管理员'
}


const login = async () => {
  try {
    let res
    try {
      const payload = {
        username: form.value.username,
        password: form.value.password,
        role: form.value.role,
      }
      if (captchaImg.value) {
        payload.verificationCode = form.value.verificationCode
        payload.captchaKey = captchaKey.value
      }
      const apiRes = await apiLogin(payload)
      if (apiRes?.code === 200 && apiRes.data) {
        const d = apiRes.data
        // psychological_platform 的登录返回值：{ "<role_name>": "<jwt>" } 或 { "false": "原因" }
        const errMsg = d?.['false']
        if (typeof errMsg === 'string' && errMsg) {
          throw new Error(errMsg)
        }

        const token =
          d?.token ||
          d?.accessToken ||
          Object.values(d || {}).find(
            (v) => typeof v === 'string' && v.includes('.'),
          )

        if (!token || typeof token !== 'string') {
          throw new Error(apiRes?.msg || '登录失败')
        }

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
            // 降级：如果 JWT 中没有 role_code，使用页面选择的 role
            const role = String(form.value.role || '').toLowerCase()
            localStorage.setItem('user_role', role)
            localStorage.setItem('admin_role', role)
            console.warn('[AdminLogin] JWT 中未找到 role_code，使用前端选择:', role)
          }
        } catch (e) {
          console.error('[AdminLogin] 解析 JWT 失败:', e)
          // 降级处理
          const role = String(form.value.role || '').toLowerCase()
          localStorage.setItem('user_role', role)
          localStorage.setItem('admin_role', role)
        }
        localStorage.setItem('user_name', form.value.username)

        ElMessage.success('登录成功')
        router.push('/admin')
        return
      }
    } catch (_) {
      loadCaptcha()
    }
// ... existing code ...


    res = await adminLogin(form.value)
    console.log('接口原始返回 res = ', res)

    const user = res.data
    console.log('res.data = ', user)
    if (!user) {
      ElMessage.warning('账号或密码错误')
      return
    }

    // 保存登录信息
    localStorage.setItem('user_id', user.id)
    localStorage.setItem('user_token', user.username)
    localStorage.setItem('user_role', user.role)
    localStorage.setItem('user_name', user.name)

    console.log('存进去后的 user_id =', localStorage.getItem('user_id'))
    console.log('存进去后的 user_name =', localStorage.getItem('user_name'))
    localStorage.setItem('admin_token', user.role + Date.now())
    localStorage.setItem('admin_role', user.role)

    ElMessage.success('登录成功')
    router.push('/admin')

  } catch (err) {
    ElMessage.error(err.message || '登录失败')
  }
}

const quickLogin = (role) => {
  const roleNames = {
    tutor: '辅导员',
    college: '院系领导',
    leader: '校领导',
    center: '心理中心',
    counselor: '咨询师',
    admin: '管理员'
  }
  
  localStorage.setItem('user_id', `dev_${role}_001`)
  localStorage.setItem('user_token', `dev_${role}`)
  localStorage.setItem('user_role', role)
  localStorage.setItem('user_name', `测试${roleNames[role]}`)
  localStorage.setItem('admin_token', role + Date.now())
  localStorage.setItem('admin_role', role)

  console.log(`[DEV] 快速登录: ${roleNames[role]}`)
  router.push('/admin')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('/albackground.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #1a365d;
  font-size: 14px;
  font-weight: 500;
  z-index: 100;
}

.back-btn:hover {
  background: #fff;
  transform: translateX(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.back-btn .el-icon {
  font-size: 16px;
}

.box {
  width: 380px;
  background: white;
  padding: 25px 20px;
  border-radius: 4px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.box h2 {
  text-align: center;
  color: white;
  background: #1a365d;
  padding: 15px;
  margin: -25px -20px 20px;
  font-size: 16px;
  font-weight: bold;
  font-family: 'SimSun', serif;
  border-bottom: 2px solid #2c5282;
}

input, select {
  width: 100%;
  margin-bottom: 15px;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 2px;
  font-size: 13px;
  transition: all 0.3s ease;
  background: #f9f9f9;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: #1a365d;
  box-shadow: 0 0 0 2px rgba(26, 54, 93, 0.1);
  background: white;
}

input:hover, select:hover {
  border-color: #1a365d;
}

select {
  cursor: pointer;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #1a365d 50%),
    linear-gradient(135deg, #1a365d 50%, transparent 50%);
  background-position: calc(100% - 15px) calc(1em + 1px),
    calc(100% - 10px) calc(1em + 1px);
  background-size: 4px 4px, 4px 4px;
  background-repeat: no-repeat;
}

button {
  width: 100%;
  padding: 10px;
  background: #1a365d;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(26, 54, 93, 0.3);
}

button:hover {
  background: #2c5282;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 54, 93, 0.4);
}

button:active {
  transform: translateY(0);
}

/* 开发者快速登录面板 */
.dev-panel {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
}

.dev-title {
  font-size: 12px;
  color: #888;
  text-align: center;
  margin-bottom: 10px;
}

.dev-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.dev-btn {
  padding: 8px 4px;
  font-size: 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: normal;
  box-shadow: none;
  margin-top: 0;
}

.dev-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.dev-btn.tutor {
  background: #10b981;
  color: white;
}

.dev-btn.college {
  background: #8b5cf6;
  color: white;
}

.dev-btn.leader {
  background: #ef4444;
  color: white;
}

.dev-btn.center {
  background: #3b82f6;
  color: white;
}

.dev-btn.counselor {
  background: #f59e0b;
  color: white;
}

.dev-btn.admin {
  background: #6366f1;
  color: white;
}

/* 底部信息 */
.footer {
  margin-top: 15px;
  text-align: center;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.footer p {
  color: #666;
  font-size: 11px;
  margin: 0;
}

/* 导航按钮 */
.nav-buttons {
  position: absolute;
  top: 50%;
  left: 20px;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  z-index: 10;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .box {
    width: 90%;
    max-width: 360px;
  }
  
  .nav-buttons {
    left: 10px;
    right: 10px;
  }
  
  .nav-btn {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
}
</style>
