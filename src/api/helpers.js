/**
 * 与《后端接口API文档》一致的列表/成功判断工具
 */

export function isApiSuccess(res) {
  if (!res || typeof res !== 'object') return false
  const c = res.code
  return c === 200 || c === 0 || res.success === true || Number(c) === 200
}

/**
 * POST/PUT 等写操作后的统一 R 体解析（含 msg / data），便于页面提示与分支
 * @returns {{ ok: boolean, msg: string, data: any, raw: any }}
 */
export function unwrapMutationResponse(res) {
  if (!res || typeof res !== 'object') {
    return { ok: false, msg: '响应异常', data: undefined, raw: res }
  }
  const ok = isApiSuccess(res)
  const msg = res.msg ?? res.message ?? (ok ? '操作成功' : '操作失败')
  return { ok, msg, data: res.data, raw: res }
}

/** 解析统一响应里的 data（列表或分页） */
export function unwrapListPayload(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  return data.list ?? data.records ?? data.data ?? []
}

export function normalizeNoticeItem(row) {
  if (!row || typeof row !== 'object') return row
  return {
    ...row,
    summary: row.summary ?? row.description ?? row.content ?? '',
    date: row.date ?? row.publishTime ?? row.publishTimeStr ?? row.createdAt ?? '',
  }
}

export function mapSelfHelpToPortalItem(row) {
  if (!row || typeof row !== 'object') return row
  const pt = row.publishTime ?? row.createTime
  const date =
    pt == null
      ? row.date ?? ''
      : typeof pt === 'string'
        ? pt
        : Array.isArray(pt)
          ? pt.slice(0, 3).join('-')
          : String(pt)
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? row.description ?? '',
    category: row.category ?? row.sourceOrg ?? '',
    date,
  }
}

export function mapActivityToPortalItem(row) {
  if (!row || typeof row !== 'object') return row
  return {
    id: row.id,
    title: row.title,
    date: row.time ?? row.date ?? row.startTime ?? '',
  }
}
