import axios from 'axios'
import { buildAuthHeaders } from '../request.js'

function nowStamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

function parseFileNameFromDisposition(disposition) {
  if (!disposition) return ''
  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8 && utf8[1]) {
    try {
      return decodeURIComponent(utf8[1].replace(/["']/g, '').trim())
    } catch (_) {}
  }
  const plain = disposition.match(/filename=([^;]+)/i)
  if (plain && plain[1]) {
    return plain[1].replace(/["']/g, '').trim()
  }
  return ''
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function normalizeFilename(filename, fallbackExt = 'xlsx') {
  const clean = (filename || '').trim()
  if (!clean) return `export-${nowStamp()}.${fallbackExt}`
  return /\.[a-z0-9]+$/i.test(clean) ? clean : `${clean}.${fallbackExt}`
}

/**
 * 通用文件导出：
 * - 优先调用后端导出接口并下载文件流
 * - 当接口不可用且传了 fallbackData 时，降级导出本地 JSON，保证按钮可用
 */
export async function exportByApi(options = {}) {
  const {
    url,
    method = 'get',
    params,
    data,
    filename = '',
    fallbackData,
    fallbackExt = 'json'
  } = options

  if (!url) throw new Error('缺少导出接口地址')

  const baseURL =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_API_BASE) ||
    ''

  try {
    const resp = await axios({
      baseURL,
      url,
      method,
      params,
      data,
      headers: buildAuthHeaders(),
      responseType: 'blob',
      timeout: 30000
    })

    const ct = String(resp?.headers?.['content-type'] || '').toLowerCase()
    if (ct.includes('application/json')) {
      const text = await resp.data.text()
      let message = '导出接口未返回文件流'
      try {
        const parsed = JSON.parse(text)
        message = parsed?.message || parsed?.msg || message
      } catch (_) {}
      throw new Error(message)
    }

    const finalName =
      normalizeFilename(
        filename || parseFileNameFromDisposition(resp?.headers?.['content-disposition']),
        'xlsx'
      )
    saveBlob(resp.data, finalName)
    return finalName
  } catch (err) {
    if (fallbackData !== undefined) {
      const finalName = normalizeFilename(filename || `export-${nowStamp()}`, fallbackExt)
      const fallbackBlob = new Blob([JSON.stringify(fallbackData, null, 2)], {
        type: 'application/json;charset=utf-8'
      })
      saveBlob(fallbackBlob, finalName)
      return finalName
    }
    throw err
  }
}
