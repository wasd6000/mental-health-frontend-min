import request from './request.js'
import { visitFormConfig } from '../mock/formConfig'
import { scaleConfig } from '../mock/scaleConfig'
import { consentConfig } from '../mock/consentConfig'

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV

export async function getVisitFormConfig() {
  if (isDev) {
    return { code: 200, data: visitFormConfig }
  }
  try {
    const res = await request.get('/api/appointment/pre-assessment')
    if (res?.code === 200 && res.data) return res
  } catch (_) {}
  return { code: 200, data: visitFormConfig }
}

export async function getScaleConfig() {
  if (isDev) {
    return { code: 200, data: scaleConfig }
  }
  return { code: 200, data: scaleConfig }
}

export async function getConsentConfig() {
  if (isDev) {
    return { code: 200, data: consentConfig }
  }
  try {
    const res = await request.get('/api/appointment/consent')
    if (res?.code === 200 && res.data) return res
  } catch (_) {}
  return { code: 200, data: consentConfig }
}
