// src/api/notice.js
import { normalizeId } from '../utils/idHelper'

export function getNoticeDetail(id) {
  // 公告模块使用自增 ID，转换为数字
  const normalizedId = normalizeId(id, 'notice')

  return request.get('/api/notice/detail', {
    params: { id: normalizedId }
  })
}
