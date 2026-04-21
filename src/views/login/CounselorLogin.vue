<template>
  <div class="login-page">
    <div class="back-btn" @click="goBack">
      <el-icon><ArrowLeft /></el-icon>
      <span>返回首页</span>
    </div>
    <div class="box">
      <h2>咨询师登录</h2>
      <p class="hint">使用账号密码登录</p>
      <input v-model="form.username" placeholder="账号" />
      <input v-model="form.password" type="password" placeholder="密码" />
      <div v-if="captchaImg" class="captcha-row">
        <input v-model="form.verificationCode" placeholder="图形验证码" />
        <img :src="captchaImg" class="captcha-img" alt="" @click="loadCaptcha" title="刷新" />
      </div>
    </div>
    <button @click="login">登录</button>
    <div class="quick-login-tips">
      <span class="tip-label">快捷测试：</span>
      <el-button size="small" @click="quickLogin('test_college_leader')">院系领导</el-button>
      <el-button size="small" @click="quickLogin('test_admin')">管理员</el-button>
      <el-button size="small" @click="quickLogin('test_counselor')">咨询师</el-button>
    </div>
  </div>
</template>

<script setup>import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { login as apiLogin, fetchVerificationCode } from '../../api/auth'
import { setAuthToken } from '../../api/request'
import { isApiSuccess } from '../../api/helpers.js'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

const goBack = () => {
  router.push('/')
}

const form = ref({
  username: '',
  password: '',
  verificationCode: ''
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

onMounted(() => loadCaptcha())

const quickLogin = (username) => {
  form.value.username = username
  form.value.password = '123456' // 请根据实际密码修改
  login()
}

const login = async () => {
  if (!form.value.username || !form.value.password) {
    alert('请输入账号和密码')
    return
  }
  try {
    let res
    try {
      const payload = {
        username: form.value.username,
        password: form.value.password,
        role: 'counselor',
      }
      if (captchaImg.value) {
        payload.verificationCode = form.value.verificationCode
        payload.captchaKey = captchaKey.value
      }
      const apiRes = await apiLogin(payload)
      if (isApiSuccess(apiRes) && apiRes.data) {
        const d = apiRes.data
        const errMsg = d?.['false']
        if (typeof errMsg === 'string' && errMsg) {
          throw new Error(errMsg)
        }
        const token =
            d.token ||
            d.accessToken ||
            Object.values(d || {}).find(
                (v) => typeof v === 'string' && v.includes('.'),
            )
        const user = d.userInfo || d
        if (token) {
          setAuthToken(token)
          localStorage.setItem('access_token', token)
          localStorage.setItem('admin_token', token)
        }
        let uid = user.id || ''
        try {
          const { getJwtSubject } = await import('../../utils/jwtPayload.js')
          const sub = getJwtSubject(token)
          if (sub) uid = sub
        } catch (_) {
          /* ignore */
        }
        localStorage.setItem('userId', uid)
        localStorage.setItem('user_id', uid)
        localStorage.setItem('user_token', user.username || form.value.username)
        localStorage.setItem(
            'user_role',
            (user.role || 'counselor').toLowerCase(),
        )
        localStorage.setItem('user_name', user.name || user.username || '')
        localStorage.setItem('admin_role', user.role || 'counselor')
        alert('登录成功')
        router.push('/admin')
        return
      }
    } catch (_) {
      loadCaptcha()
    }

    // 真实 API 调用失败后的错误提示
    alert('登录失败，请检查账号密码或联系管理员')
    loadCaptcha()
  } catch (err) {
    alert(err.message || '登录失败')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
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
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.box h2 {
  text-align: center;
  color: white;
  background: #1a365d;
  padding: 15px;
  margin: -25px -20px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 8px 8px 0 0;
}

.hint {
  font-size: 12px;
  color: #666;
  margin: -8px 0 12px 0;
}

input {
  width: 100%;
  margin-bottom: 15px;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #1a365d;
}

button {
  width: 100%;
  padding: 10px;
  background: #1a365d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  background: #2c5282;
}

.quick-login-tips {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tip-label {
  font-size: 12px;
  color: #999;
}
</style>
