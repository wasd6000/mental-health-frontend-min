/**
 * 读取 openapi.json（支持剔除独立行 // 注释），对每台服务器逐一请求，
 * 分别使用咨询师 / 管理员 JWT，汇总 HTTP 状态码（不写后端、不改 openapi 文件本体）。
 *
 * 用法：
 *   node scripts/openapi-smoke-roles.mjs
 * 环境变量：
 *   SMOKE_BASE_URL=http://localhost:8080
 *   SMOKE_TOKEN_COUNSELOR=...
 *   SMOKE_TOKEN_ADMIN=...
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const openapiPath = path.join(root, 'openapi.json')

const BASE =
  process.env.SMOKE_BASE_URL ||
  'http://localhost:8080'

const TOKENS = {
  COUNSELOR: process.env.SMOKE_TOKEN_COUNSELOR || '',
  ADMIN: process.env.SMOKE_TOKEN_ADMIN || '',
}

function stripJsonComments(content) {
  return content
    .split(/\r?\n/)
    .filter((line) => !/^\s*\/\//.test(line))
    .join('\n')
}

function placeholderForSchema(param) {
  const s = param.schema || {}
  const t = s.type
  const fmt = s.format
  const name = (param.name || '').toLowerCase()
  if (param.in === 'path') {
    if (name.includes('studentid') || name.includes('id') || fmt === 'uuid')
      return '00000000-0000-0000-0000-000000000001'
    return '1'
  }
  if (t === 'integer' || t === 'number') {
    if (name.includes('page')) return 1
    if (name.includes('pagesize') || name.includes('size')) return 10
    return 1
  }
  if (t === 'boolean') return true
  return 'test'
}

function buildUrlAndQuery(pathKey, parameters = []) {
  let pth = pathKey
  const search = new URLSearchParams()
  for (const param of parameters) {
    if (param.in === 'path') {
      const v = encodeURIComponent(
        String(placeholderForSchema(param)),
      )
      pth = pth.replace(`{${param.name}}`, v)
    } else if (param.in === 'query') {
      const v = placeholderForSchema(param)
      if (param.required) search.set(param.name, String(v))
      else {
        // 可选：不传，减少噪声；部分列表接口无参也可 200
      }
    }
  }
  const names = new Set((parameters || []).map((p) => p.name))
  if (names.has('page') && !search.has('page')) search.set('page', '1')
  if (names.has('pageSize') && !search.has('pageSize')) search.set('pageSize', '20')
  const q = search.toString()
  return q ? `${pth}?${q}` : pth
}

async function tryRequest(method, urlPath, op, role, token, tagLabel) {
  const m = method.toUpperCase()
  const headers = {
    Accept: 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  let body
  const rb = op.requestBody?.content?.['application/json']
  if (rb && ['POST', 'PUT', 'PATCH'].includes(m)) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify({})
  }

  const url = `${BASE.replace(/\/$/, '')}${urlPath}`
  const init = { method: m, headers }
  if (body) init.body = body

  try {
    const res = await fetch(url, init)
    const text = await res.text()
    let snippet = text.slice(0, 120).replace(/\s+/g, ' ')
    return {
      role,
      tags: tagLabel,
      method: m,
      path: urlPath,
      status: res.status,
      ok: res.ok,
      snippet,
    }
  } catch (e) {
    return {
      role,
      tags: tagLabel,
      method: m,
      path: urlPath,
      status: -1,
      ok: false,
      snippet: e?.message || String(e),
    }
  }
}

async function main() {
  const raw = fs.readFileSync(openapiPath, 'utf8')
  const spec = JSON.parse(stripJsonComments(raw))
  const paths = spec.paths || {}

  const rows = []
  for (const [pathKey, pathItem] of Object.entries(paths)) {
    for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
      const op = pathItem[method]
      if (!op) continue
      const params = op.parameters || []
      const urlPath = buildUrlAndQuery(pathKey, params)
      const tagLabel = (op.tags || []).join('|')

      if (TOKENS.COUNSELOR) {
        rows.push(
          await tryRequest(method, urlPath, op, 'COUNSELOR', TOKENS.COUNSELOR, tagLabel),
        )
      }
      if (TOKENS.ADMIN) {
        rows.push(
          await tryRequest(method, urlPath, op, 'ADMIN', TOKENS.ADMIN, tagLabel),
        )
      }
    }
  }

  const bad = rows.filter(
    (r) =>
      !r.ok &&
      r.status !== 400 &&
      r.status !== 404 &&
      r.status !== 422 &&
      r.status !== -1,
  )

  console.log('--- openapi smoke (role hints, placeholder params) ---')
  console.log('BASE:', BASE)
  console.log('total requests:', rows.length)
  console.log('non-2xx (excl 400/404/422):', bad.length)
  for (const r of bad.slice(0, 80)) {
    console.log(
      [r.role, r.method, r.status, r.path].join(' | '),
      '|',
      r.snippet,
    )
  }
  if (bad.length > 80) console.log('... and', bad.length - 80, 'more')

  const out = path.join(root, 'tmp-openapi-smoke-results.json')
  fs.writeFileSync(out, JSON.stringify({ base: BASE, rows }, null, 2), 'utf8')
  console.log('wrote', out)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
