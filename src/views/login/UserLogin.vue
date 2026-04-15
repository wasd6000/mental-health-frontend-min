<template>
  <div class="login-page">
    <!-- 导航栏 - 蓝色主题 -->
    <PortalNavBar active-key="" theme="blue" />

    <!-- 主内容区 -->
    <div class="login-content">
      <!-- 顶部学校信息 -->
      <div class="school-header">
        <h1 class="school-name">四川文理学院</h1>
        <h2 class="school-english">Sichuan University of Arts and Science</h2>
        <div class="platform-name">心理健康服务平台 - 用户端</div>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card">
        <div class="card-header">
          <h3>欢迎使用心理健康服务平台</h3>
          <p class="subtitle">请选择身份登录</p>
        </div>

        <!-- 身份选择 -->
        <div class="identity-select">
          <div
              class="identity-option"
              :class="{ 'active': identity === 'student' }"
              @click="identity = 'student'"
          >
            <div class="identity-text">
              <div class="identity-title">学生</div>
              <div class="identity-desc">在校学生</div>
            </div>
          </div>
          <div
              class="identity-option"
              :class="{ 'active': identity === 'parent' }"
              @click="identity = 'parent'"
          >
            <div class="identity-text">
              <div class="identity-title">家长</div>
              <div class="identity-desc">学生家长</div>
            </div>
          </div>
        </div>

        <!-- 登录表单 -->
        <div class="login-form">
          <div class="form-group">
            <label for="username">
              <span v-if="identity === 'student'">学号</span>
              <span v-else>手机号</span>
            </label>
            <input
                id="username"
                v-model="form.username"
                :placeholder="identity === 'student' ? '请输入学号' : '请输入手机号'"
                type="text"
                class="form-input"
                @keyup.enter="login"
            />
          </div>

          <div class="form-group">
            <label for="password">
              密码
            </label>
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
                {{ showPassword ? '显示' : '隐藏' }}
              </button>
            </div>
          </div>

          <div class="form-group captcha-row">
            <label for="captcha-input">图形验证码</label>
            <div class="captcha-line">
              <input
                  id="captcha-input"
                  v-model="form.verificationCode"
                  type="text"
                  class="form-input captcha-input"
                  placeholder="请输入图形验证码"
                  autocomplete="off"
                  :disabled="captchaLoading"
                  @keyup.enter="login"
              />
              <img
                  v-if="captchaImg"
                  :src="captchaImg"
                  class="captcha-img"
                  alt="验证码"
                  @click="loadCaptcha"
                  title="点击刷新"
              />
              <button
                  v-else
                  type="button"
                  class="captcha-reload-btn"
                  :disabled="captchaLoading"
                  @click="loadCaptcha"
              >
                {{ captchaLoading ? '加载中…' : captchaLoadError ? '重新加载验证码' : '加载验证码' }}
              </button>
            </div>
            <p v-if="captchaLoadError" class="captcha-hint">{{ captchaLoadError }}</p>
          </div>

          <!-- 登录按钮 -->
          <button
              class="login-btn"
              @click="login"
              :disabled="!form.username || !form.password || loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>

          <!-- 底部链接 -->
          <div class="form-footer">
            <button
                class="footer-link forgot-password-btn"
                @click="showForgotPasswordModal = true"
            >
              忘记密码？
            </button>
            <button
                class="footer-link register-btn"
                @click="showRegisterModal = true"
            >
              立即注册
            </button>
          </div>

          <div v-if="casLoginUrl" class="cas-block">
            <div class="cas-divider">或</div>
            <button type="button" class="cas-btn" @click="goCasLogin">
              统一身份认证（CAS）登录
            </button>
            <p class="cas-hint">
              规划与学校统一身份对接；配置环境变量 VITE_CAS_LOGIN_URL 后启用，换票与 Token 由后端完成。
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <div v-if="showForgotPasswordModal" class="modal-overlay" @click.self="showForgotPasswordModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>忘记密码</h3>
          <button class="close-btn" @click="showForgotPasswordModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="forgot-username">
              <span v-if="identity === 'student'">学号</span>
              <span v-else>手机号</span>
            </label>
            <input
              id="forgot-username"
              v-model="forgotPasswordForm.username"
              :placeholder="identity === 'student' ? '请输入学号' : '请输入手机号'"
              type="text"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="forgot-email">邮箱</label>
            <input
              id="forgot-email"
              v-model="forgotPasswordForm.email"
              placeholder="请输入注册时的邮箱"
              type="email"
              class="form-input"
            />
          </div>
          <button 
            class="submit-btn"
            @click="submitForgotPassword"
            :disabled="!forgotPasswordForm.username || !forgotPasswordForm.email"
          >
            提交验证
          </button>
        </div>
      </div>
    </div>

    <!-- 注册弹窗 -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
      <div class="modal-content register-modal">
        <div class="modal-header">
          <h3>用户注册</h3>
          <button class="close-btn" @click="showRegisterModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label for="register-realname">真实姓名 <span class="required">*</span></label>
              <input
                id="register-realname"
                v-model="registerForm.real_name"
                placeholder="请输入真实姓名"
                type="text"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="register-gender">性别 <span class="required">*</span></label>
              <select
                id="register-gender"
                v-model="registerForm.gender"
                class="form-input select-input"
              >
                <option value="">请选择性别</option>
                <option value="0">女</option>
                <option value="1">男</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="register-username">
              <span v-if="identity === 'student'">学号 <span class="required">*</span></span>
              <span v-else>手机号 <span class="required">*</span></span>
            </label>
            <input
              id="register-username"
              v-model="registerForm.username"
              :placeholder="identity === 'student' ? '请输入学号' : '请输入手机号'"
              type="text"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="register-mobile">手机号码 <span class="required">*</span></label>
            <input
              id="register-mobile"
              v-model="registerForm.mobile"
              placeholder="请输入手机号码"
              type="tel"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="register-email">邮箱 <span class="required">*</span></label>
            <input
              id="register-email"
              v-model="registerForm.email"
              placeholder="请输入邮箱地址"
              type="email"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="register-code">验证码 <span class="required">*</span></label>
            <div class="code-row">
              <input
                id="register-code"
                v-model="registerForm.verify_code"
                placeholder="请输入6位验证码"
                type="text"
                class="form-input"
              />
              <button
                class="code-btn"
                type="button"
                :disabled="codeSending || codeCooldown > 0"
                @click="sendCode"
              >
                <span v-if="codeCooldown > 0">{{ codeCooldown }}s</span>
                <span v-else>获取验证码</span>
              </button>
            </div>
            <div class="code-hint">
              默认发送到手机号（也会在控制台输出验证码，便于联调）
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="register-password">密码 <span class="required">*</span></label>
              <input
                id="register-password"
                v-model="registerForm.password"
                :type="showRegisterPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="register-confirm-password">确认密码 <span class="required">*</span></label>
              <input
                id="register-confirm-password"
                v-model="registerForm.confirm_password"
                :type="showRegisterPassword ? 'text' : 'password'"
                placeholder="请再次输入密码"
                class="form-input"
              />
            </div>
          </div>

          <div class="password-toggle">
            <label class="checkbox-label">
              <input type="checkbox" v-model="showRegisterPassword" />
              <span class="checkmark"></span>
              显示密码
            </label>
          </div>

          <button 
            class="submit-btn register-submit-btn"
            @click="submitRegister"
            :disabled="!isRegisterFormValid"
          >
            注册
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PortalNavBar from '@/components/portal/PortalNavBar.vue'
import { adminLogin } from '../../api/mock'
import { login as apiLogin, fetchVerificationCode, sendRegisterSms, registerAccount } from '@/api/auth'
import { setAuthToken } from '@/api/request'
import { ArrowLeft } from '@element-plus/icons-vue'
import { sendVerificationCode, getCooldownRemainingSeconds, verifyCode } from '@/utils/verificationCode'
import { clearStaffSessionKeys } from '@/utils/portalSession.js'

const router = useRouter()

const loading = ref(false)

const goBack = () => {
  router.push('/')
}

const casLoginUrl = computed(() => (import.meta.env.VITE_CAS_LOGIN_URL || '').trim())

function goCasLogin() {
  if (!casLoginUrl.value) return
  const service = encodeURIComponent(`${window.location.origin}/cas/callback`)
  const url = casLoginUrl.value.includes('?')
    ? `${casLoginUrl.value}&service=${service}`
    : `${casLoginUrl.value}?service=${service}`
  window.location.href = url
}

const identity = ref('student')
const showPassword = ref(false)
const showForgotPasswordModal = ref(false)

const form = reactive({
  username: '',
  password: '',
  verificationCode: ''
})

const captchaImg = ref('')
const captchaKey = ref('')
const captchaLoading = ref(false)
const captchaLoadError = ref('')

const loadCaptcha = async () => {
  captchaLoading.value = true
  captchaLoadError.value = ''
  try {
    const res = await fetchVerificationCode()
    if (res?.code === 200 && res.data?.image) {
      // revoke old blob url to avoid memory leak
      if (typeof captchaImg.value === 'string' && captchaImg.value.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(captchaImg.value)
        } catch (_) {}
      }
      captchaImg.value = res.data.image
      captchaKey.value = res.data.key || ''
      form.verificationCode = ''
      if (!captchaKey.value) {
        captchaLoadError.value = '未收到验证码 key（请确认后端响应头 key 可被读取）'
      }
    } else {
      if (typeof captchaImg.value === 'string' && captchaImg.value.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(captchaImg.value)
        } catch (_) {}
      }
      captchaImg.value = ''
      captchaKey.value = ''
      captchaLoadError.value = '无法获取验证码图片，请稍后重试'
    }
  } catch (_) {
    if (typeof captchaImg.value === 'string' && captchaImg.value.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(captchaImg.value)
      } catch (_) {}
    }
    captchaImg.value = ''
    captchaKey.value = ''
    captchaLoadError.value = '验证码接口不可用（请检查 Vite 代理是否指向后端、路径 /api/common/getVerificationCode）'
  } finally {
    captchaLoading.value = false
  }
}

onMounted(() => {
  loadCaptcha()
})

const forgotPasswordForm = reactive({
  username: '',
  email: ''
})

const submitForgotPassword = () => {
  if (!forgotPasswordForm.username || !forgotPasswordForm.email) {
    alert('请输入学号/手机号和邮箱')
    return
  }

  console.log('忘记密码验证信息：', {
    identity: identity.value,
    ...forgotPasswordForm
  })

  alert('验证信息已提交，我们将通过邮件发送重置密码链接')
  showForgotPasswordModal.value = false
  
  // 清空表单
  forgotPasswordForm.username = ''
  forgotPasswordForm.email = ''
}

const showRegisterModal = ref(false)
const showRegisterPassword = ref(false)

const registerForm = reactive({
  real_name: '',
  gender: '',
  username: '',
  mobile: '',
  email: '',
  verify_code: '',
  password: '',
  confirm_password: ''
})

const isRegisterFormValid = computed(() => {
  return registerForm.real_name && 
         registerForm.gender !== '' && 
         registerForm.username && 
         registerForm.mobile && 
         registerForm.email && 
         registerForm.verify_code &&
         registerForm.password && 
         registerForm.confirm_password &&
         registerForm.password === registerForm.confirm_password
})

const validateMobile = (mobile) => {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(mobile)
}

const validateEmail = (email) => {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return reg.test(email)
}

const codeCooldown = ref(0)
const codeSending = ref(false)
let cooldownTimer = null

const tickCooldown = () => {
  if (codeCooldown.value <= 0) return
  codeCooldown.value -= 1
}

const syncCooldown = () => {
  const remain = getCooldownRemainingSeconds('sms', registerForm.mobile || '')
  codeCooldown.value = remain
  if (cooldownTimer) clearInterval(cooldownTimer)
  if (remain > 0) {
    cooldownTimer = setInterval(() => tickCooldown(), 1000)
  }
}

const sendCode = async () => {
  if (!registerForm.mobile) {
    alert('请先输入手机号码')
    return
  }
  if (!validateMobile(registerForm.mobile)) {
    alert('请输入正确的手机号码')
    return
  }
  codeSending.value = true
  try {
    try {
      const apiRes = await sendRegisterSms({ phone: registerForm.mobile })
      if (apiRes?.code === 200) {
        alert('验证码已发送')
        syncCooldown()
        return
      }
    } catch (_) {}
    const res = sendVerificationCode({ channel: 'sms', target: registerForm.mobile })
    console.log('[DEV] 注册验证码（短信）=', res.code, '有效期至', new Date(res.expiresAt).toLocaleString())
    alert('验证码已发送（开发环境可在控制台查看）')
    syncCooldown()
  } catch (e) {
    alert(e?.message || '发送失败')
  } finally {
    codeSending.value = false
  }
}

const submitRegister = async () => {
  if (!registerForm.real_name) {
    alert('请输入真实姓名')
    return
  }

  if (registerForm.gender === '') {
    alert('请选择性别')
    return
  }

  if (!registerForm.username) {
    alert(`请输入${identity.value === 'student' ? '学号' : '手机号'}`)
    return
  }

  if (!registerForm.mobile) {
    alert('请输入手机号码')
    return
  }

  if (!validateMobile(registerForm.mobile)) {
    alert('请输入正确的手机号码')
    return
  }

  if (!registerForm.email) {
    alert('请输入邮箱地址')
    return
  }

  if (!validateEmail(registerForm.email)) {
    alert('请输入正确的邮箱地址')
    return
  }

  if (!registerForm.verify_code) {
    alert('请输入验证码')
    return
  }

  if (!registerForm.password) {
    alert('请输入密码')
    return
  }

  if (registerForm.password.length < 6) {
    alert('密码长度至少为6位')
    return
  }

  if (registerForm.password !== registerForm.confirm_password) {
    alert('两次输入的密码不一致')
    return
  }

  const v = verifyCode({ channel: 'sms', target: registerForm.mobile, code: registerForm.verify_code })
  if (!v.ok) {
    alert(v.reason || '验证码校验失败')
    return
  }

  try {
    const regRes = await registerAccount({
      account: registerForm.username,
      password: registerForm.password,
      name: registerForm.real_name,
      role: identity.value === 'student' ? 'student' : 'parent',
      phone: registerForm.mobile,
      smsCode: registerForm.verify_code,
    })
    if (regRes?.code === 200) {
      alert('注册成功！请登录')
      showRegisterModal.value = false
      registerForm.real_name = ''
      registerForm.gender = ''
      registerForm.username = ''
      registerForm.mobile = ''
      registerForm.email = ''
      registerForm.verify_code = ''
      registerForm.password = ''
      registerForm.confirm_password = ''
      showRegisterPassword.value = false
      return
    }
  } catch (_) {}

  const registerData = {
    role: identity.value === 'student' ? 'student' : 'parent',
    real_name: registerForm.real_name,
    gender: parseInt(registerForm.gender),
    username: registerForm.username,
    mobile: registerForm.mobile,
    email: registerForm.email,
    password: registerForm.password
  }

  console.log('注册信息：', registerData)

  // 将注册信息存储到localStorage
  let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
  users.push(registerData)
  localStorage.setItem('registeredUsers', JSON.stringify(users))

  alert('注册成功！请登录')
  showRegisterModal.value = false
  
  // 清空表单
  registerForm.real_name = ''
  registerForm.gender = ''
  registerForm.username = ''
  registerForm.mobile = ''
  registerForm.email = ''
  registerForm.verify_code = ''
  registerForm.password = ''
  registerForm.confirm_password = ''
  showRegisterPassword.value = false
}

// 测试账号
const TEST_ACCOUNTS = {
  student: {
    username: 'student',
    password: '123456',
  },
  parent: {
    username: '13800138001',
    password: '123456',
  }
}

const login = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }

  const role = identity.value === 'student' ? 'student' : 'parent'

  try {
    // 后端强制要求验证码校验：key（请求头）+ verificationCode（参数）
    if (captchaImg.value && !captchaKey.value) {
      await loadCaptcha()
      ElMessage.warning('请先获取图形验证码')
      return
    }
    if (captchaImg.value && !form.verificationCode) {
      ElMessage.warning('请输入图形验证码')
      return
    }

    loading.value = true

    const payload = {
      username: form.username,
      password: form.password,
      role,
      verificationCode: form.verificationCode,
      captchaKey: captchaKey.value,
    }
    const apiRes = await apiLogin(payload)
    if (apiRes?.code === 200 && apiRes.data) {
      const d = apiRes.data

      // psychological_platform: 成功返回 { "<role_name>": "<jwt>" }
      // 失败返回 { "false": "验证码错误/用户名不存在..." }
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

      if (!token || typeof token !== 'string' || !token.includes('.')) {
        throw new Error(apiRes?.msg || '登录失败')
      }

      clearStaffSessionKeys()
      setAuthToken(token)
      localStorage.setItem('access_token', token)
      localStorage.setItem('User_token', token)

      // 从 JWT token 中解析用户信息
      try {
        const { getJwtSubject, getJwtRoleCode } = await import('../../utils/jwtPayload.js')
        const sub = getJwtSubject(token)
        const roleCode = getJwtRoleCode(token)

        // 存储 userId（JWT subject）
        if (sub) {
          localStorage.setItem('userId', sub)
        }

        // 关键：使用 JWT 中的 role_code 作为用户角色（转换为小写）
        if (roleCode) {
          const normalizedRole = roleCode.toLowerCase()
          localStorage.setItem('User_role', normalizedRole)
          console.log('[UserLogin] 从 JWT 解析到角色:', roleCode, '->', normalizedRole)
        } else {
          // 降级：如果 JWT 中没有 role_code，使用前端选择的角色
          localStorage.setItem('User_role', role)
          console.warn('[UserLogin] JWT 中未找到 role_code，使用前端选择:', role)
        }
      } catch (e) {
        console.error('[UserLogin] 解析 JWT 失败:', e)
        // 降级处理
        localStorage.setItem('User_role', role)
      }

      // 当前后端 common/login 不返回用户详细信息：用户名仅作展示 / mock
      localStorage.setItem('studentId', form.username)
      localStorage.setItem('User_name', form.username)

      ElMessage.success('登录成功')

      const redirectPath =
          router.currentRoute.value.query.redirect ||
          (role === 'parent' ? '/parent/dashboard' : '/student/dashboard')
      await router.push(redirectPath)
      return
    }

    throw new Error(apiRes?.msg || '登录失败')
  } catch (e) {
    console.log('接口登录失败:', e)
    await loadCaptcha()
    ElMessage.error(e?.message || '登录失败')
    return
  } finally {
    loading.value = false
  }

  // ========================
  // 1 先走 mock 后端登录
  // ========================
  try {
    const res = await adminLogin({
      username: form.username,
      password: form.password,
      role

    })


    const user = res.data

    clearStaffSessionKeys()
    localStorage.setItem('studentId', user.account)
    if (user.college_id) {
      localStorage.setItem('student_college_id', user.college_id)
    }

    localStorage.setItem('User_token', user.role + '_' + Date.now())
    localStorage.setItem('User_role', user.role)
    localStorage.setItem('User_name', user.name || user.username)

    const redirectPath =
        router.currentRoute.value.query.redirect ||
        (role === 'parent' ? '/parent/dashboard' : '/student/dashboard')

    console.log('登录成功，跳转到:', redirectPath)
    await router.push(redirectPath)
    return

  } catch (e) {
    console.log('mock登录失败，尝试其他方式:', e)
  }

  // ========================
  // 2 测试账号
  // ========================
  const testAccount = TEST_ACCOUNTS[role]
  if (form.username === testAccount.username && form.password === testAccount.password) {

    clearStaffSessionKeys()
    localStorage.setItem('studentId', testAccount.username)
    localStorage.setItem('User_token', role + '_' + Date.now())
    localStorage.setItem('User_role', role)
    localStorage.setItem('User_name', testAccount.username)

    const redirectPath =
        router.currentRoute.value.query.redirect ||
        (role === 'parent' ? '/parent/dashboard' : '/student/dashboard')

    console.log('测试账号登录成功，跳转到:', redirectPath)
    await router.push(redirectPath)
    return
  }

  // ========================
  // 3 本地注册用户
  // ========================
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
  const user = users.find(
      u => u.username === form.username && u.role === role
  )

  if (!user) {
    ElMessage.warning('账号未注册，请先注册')
    return
  }

  if (user.password !== form.password) {
    ElMessage.error('密码错误')
    return
  }

  clearStaffSessionKeys()
  localStorage.setItem('studentId', user.username)

  if (user.college_id) {
    localStorage.setItem('student_college_id', user.college_id)
  }

  localStorage.setItem('User_token', user.role + '_' + Date.now())
  localStorage.setItem('User_role', user.role)
  localStorage.setItem('User_name', user.real_name || user.username)

  const redirectPath =
      router.currentRoute.value.query.redirect ||
      (role === 'parent' ? '/parent/dashboard' : '/student/dashboard')

  console.log('本地用户登录成功，跳转到:', redirectPath)
  await router.push(redirectPath)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-image: url('/background.jpg');
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
  position: relative;
  z-index: 1;
}

.school-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  padding: 40px 60px;
  background: rgba(30, 79, 156, 0.85);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(30, 79, 156, 0.3);
  max-width: 800px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.school-name {
  margin: 0 0 12px 0;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 3px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-card {
  background: rgb(241, 242, 247);
  border-radius: 15px;
  box-shadow: 0 20px 60px rgb(57, 77, 83);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(23, 14, 114, 0.3);
}

.card-header {
  padding: 30px 30px 20px;
  text-align: center;
  background: linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%);
  color: white;
  border-bottom: none;
}

.card-header h3 {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 8px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.identity-select {
  display: flex;
  padding: 20px 30px;
  gap: 15px;
  border-bottom: 1px solid #130c4b;
}

.identity-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 2px solid #150c49;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.identity-option:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.identity-option.active {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 5px 15px rgba(37, 99, 235, 0.2);
}

.identity-text {
  text-align: center;
}

.identity-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
  font-size: 1.1rem;
}

.identity-desc {
  font-size: 0.85rem;
  color: #666;
}

.login-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.password-input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.9);
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.captcha-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-input {
  flex: 1;
}

.captcha-img {
  height: 44px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #ddd;
}

.captcha-reload-btn {
  flex-shrink: 0;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
}

.captcha-reload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.captcha-hint {
  margin: 6px 0 0;
  font-size: 0.8rem;
  color: #c45656;
  line-height: 1.4;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
  color: #666;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.toggle-password:hover {
  background-color: #e9e9e9;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: 10px;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.4);
  background: linear-gradient(135deg, #2563eb 0%, #1e4f9c 100%);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.forgot-password {
  text-align: right;
  margin-top: 10px;
}

.forgot-password-btn {
  color: #2563eb;
}

.forgot-password-btn:hover {
  color: #1e4f9c;
  text-decoration: underline;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 25px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #1e4f9c 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: 10px;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(37, 99, 235, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 表单底部链接 */
.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.footer-link {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px 0;
  transition: color 0.3s ease;
}

.forgot-password-btn {
  color: #667eea;
}

.forgot-password-btn:hover {
  color: #5568d3;
  text-decoration: underline;
}

.register-btn {
  color: #28a745;
}

.register-btn:hover {
  color: #218838;
  text-decoration: underline;
}

/* 注册弹窗样式 */
.register-modal {
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.code-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.code-btn {
  flex: 0 0 110px;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.code-btn:hover:not(:disabled) {
  background: #1e4f9c;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.code-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.code-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.required {
  color: #dc3545;
}

.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.password-toggle {
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background-color: #2563eb;
  border-color: #2563eb;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.register-submit-btn {
  margin-top: 20px;
}

.cas-block {
  margin-top: 18px;
  text-align: center;
}

.cas-divider {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.cas-btn {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.cas-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.cas-hint {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 8px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-content {
    padding: 70px 16px 30px;
  }

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

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .register-modal {
    max-width: 95%;
    margin: 10px;
  }

  .login-card {
    border-radius: 10px;
  }

  .card-header,
  .identity-select,
  .login-form {
    padding: 20px;
  }

  .identity-select {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .login-content {
    padding: 70px 12px 20px;
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

  .captcha-line {
    flex-direction: column;
    align-items: stretch;
  }

  .captcha-img {
    width: 100%;
    height: 50px;
  }
}

/* 如果图片加载失败，使用渐变背景作为回退 */
@supports not (background-image: url('/background.jpg')) {
  .login-page {
    background: linear-gradient(135deg, #374aa1ff 0%, #0f0b37 100%);
  }
  
  .login-page::before {
    display: none;
  }
}
</style>