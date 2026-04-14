import axios from 'axios'
import request from './request.js'

async function requestWithFallback(primaryConfig, fallbackConfig) {
  try {
    return await request(primaryConfig)
  } catch (_) {
    return request(fallbackConfig)
  }
}

//测试用token：Authorization 由 src/request.js 拦截器全局附加（匿名或正式）
/** 图形验证码（文档 2.1） */
export function fetchVerificationCode(params = {}) {
  // psychological_platform 的验证码接口为：
  // GET /api/common/getVerificationCode
  // 返回 image/png 二进制，并通过响应头 key 返回验证码 key
  const mergedParams = { t: Date.now(), ...params }

  // 这里不用封装 request（它会按 JSON 规范化响应），否则 blob/png 会被错误解析
  return axios
    .get('/api/common/getVerificationCode', {
      params: mergedParams,
      responseType: 'blob',
    })
    .then((res) => {
      const key = res?.headers?.key || ''
      const blob = res?.data
      const image =
        typeof URL !== 'undefined' && blob ? URL.createObjectURL(blob) : ''
      return { code: 200, msg: 'ok', data: { image, key } }
    })
    .catch((e) => Promise.reject(e))
}

//测试用token：走全局拦截器带 Bearer；成功后组件内 setAuthToken 写入正式 token
/**
 * 账号密码登录（文档 2.2）
 */
export function login(data) {
  const { captchaKey, verificationCode, ...rest } = data || {}
  const headers = {}
  if (captchaKey) headers.key = captchaKey
  const verification = verificationCode ?? rest.verificationCode

  // psychological_platform 的登录接口为：
  // POST /api/common/login?username=...&password=...&verificationCode=...
  // Header: key: <captchaKey>
  return request({
    url: '/api/common/login',
    method: 'post',
    params: {
      username: rest.username,
      password: rest.password,
      verificationCode: verification,
    },
    headers,
  })
}

export function adminLogin(data) {
  return login(data)
}

export function userLogin(data) {
  return login(data)
}

//测试用token：全局 Bearer
/** 注册短信（文档 2.3.1） */
export function sendRegisterSms(body) {
  return requestWithFallback(
    { url: '/api/auth/send-sms', method: 'post', data: body },
    { url: '/api/auth/sms/send', method: 'post', data: body },
  )
}

//测试用token：全局 Bearer
/** 提交注册（文档 2.3.2） */
export function registerAccount(body) {
  return request.post('/api/auth/register', body)
}

//验证当前 Token 是否有效
export async function validateToken() {
  try {
    const res = await request({
      url: '/api/auth/validate-token',
      method: 'get',
      skipAuth: false,
    })
    return res?.code === 200 && res.data === true
  } catch (e) {
    console.warn('[Auth] Token 验证失败:', e?.message || e)
    return false
  }
}
