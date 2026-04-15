import request from './request.js'

export async function getVisitFormConfig() {
  try {
    const res = await request.get('/api/appointment/pre-assessment')
    if (res?.code === 200 && res.data) return res
  } catch (_) {}
  throw new Error('获取来访表单配置失败')
}

export async function getScaleConfig() {
  try {
    const res = await request.get('/api/config/scale')
    if (res?.code === 200 && res.data) return res
  } catch (_) {}
  throw new Error('获取量表配置失败')
}

export async function getConsentConfig() {
  try {
    const res = await request.get('/api/appointment/consent')
    if (res?.code === 200 && res.data) return res
  } catch (_) {}
  throw new Error('获取知情同意书配置失败')
}
