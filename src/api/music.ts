// src/api/music.ts
import request from './request.js'

/**
 * 根据情绪获取推荐音乐
 */
export function getMusicByEmotion(emotion: string) {
  return request.get('/api/student/music/emotion', {
    params: { emotion }
  })
}

/**
 * 获取音乐分类列表
 */
export function getMusicCategories() {
  return request.get('/api/student/music/categories')
}

/**
 * 获取音乐列表
 */
export function getMusicList(params?: {
  category?: string
  emotion?: string
  page?: number
  pageSize?: number
}) {
  return request.get('/api/student/music/list', {
    params: {
      page: 1,
      pageSize: 20,
      ...params
    }
  })
}

/**
 * 获取音乐详情
 */
export function getMusicDetail(id: number) {
  return request.get('/api/student/music/detail', {
    params: { id }
  })
}
