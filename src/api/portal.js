import request from './request'
import { getHomeData } from './home'
import { getNoticeList, getNoticeDetail as fetchNoticeDetailReq } from './notice'
import {
  unwrapListPayload,
  normalizeNoticeItem,
  mapSelfHelpToPortalItem,
  mapActivityToPortalItem,
} from './helpers'

/** 心理百科/CMS 接口前缀：开发默认 `/cms`（Vite 重写为 `/api/cms`）；直连后端时可设 `VITE_CMS_API_PREFIX=/api/cms` */
const CMS_API_PREFIX =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_CMS_API_PREFIX) ||
  '/cms'

// 活动风采（优先 /api/home/data、/api/activity/list）
export const getActivities = async () => {
  try {
    const home = await getHomeData()
    if (home?.code === 200 && home.data?.activities?.length) {
      return home.data.activities.map(mapActivityToPortalItem)
    }
  } catch (e) {
    console.warn('获取首页活动数据失败', e)
  }
  try {
    const res = await request.get('/api/activity/list', { params: { pageSize: 30 } })
    const raw = unwrapListPayload(res?.data)
    if (raw.length) return raw.map(mapActivityToPortalItem)
  } catch (e) {
    console.warn('获取活动列表失败', e)
  }
  return []
}

// 心理百科（心理健康基础知识）- 从后端 CMS 获取
export const getWiki = async (params = {}) => {
  try {
    /** GET /cms/wiki → 后端 `/api/cms/wiki`（PageResult.records；Query：page、pageSize、keyWords） */
    const res = await request.get(`${CMS_API_PREFIX}/wiki`, {
      params: {
        page: 1,
        pageSize: 500,
        keyWords: params.keyword?.trim() || undefined,
      },
    })
    let list = unwrapListPayload(res?.data).map(mapSelfHelpToPortalItem)
    if (list.length) {
      if (params.keyword) {
        const k = params.keyword.trim().toLowerCase()
        list = list.filter(
          item =>
            item.title.toLowerCase().includes(k) ||
            (item.summary && item.summary.toLowerCase().includes(k)) ||
            (item.category && item.category.includes(k))
        )
      }
      if (params.category) {
        list = list.filter(item => item.category === params.category)
      }
      return list
    }
    return []
  } catch (e) {
    console.warn('获取心理百科失败', e)
    return []
  }
}

export const getWikiDetail = async (id) => {
  try {
    const res = await request.get(`${CMS_API_PREFIX}/detail`, { params: { id } })
    if (res?.code === 200 && res.data) {
      const d = res.data
      return {
        id: d.id,
        title: d.title,
        summary: d.summary || d.description || '',
        category: d.category || d.sourceOrg || '',
        date: d.publishTime || d.date || d.createTime || '',
        content: d.content || '<p>暂无内容</p>',
      }
    }
  } catch (e) {
    console.warn('获取心理百科详情失败', e)
  }
  try {
    const res = await request.get('/api/self-help/detail', { params: { id } })
    if (res?.code === 200 && res.data) {
      const d = res.data
      return {
        id: d.id,
        title: d.title,
        summary: d.summary || d.description || '',
        category: d.category || '',
        date: d.publishTime || d.date || '',
        content: d.content || '<p>暂无内容</p>',
      }
    }
  } catch (e) {
    console.warn('获取自助详情失败', e)
  }
  return null
}

// 心理美文（心理活动优秀文章）- 从后端获取
export const getArticles = async (params = {}) => {
  try {
    const res = await request.get('/api/psychology/article', {
      params: { category: params.category || undefined },
    })
    let list = unwrapListPayload(res?.data).map(mapSelfHelpToPortalItem)
    if (!list.length) {
      const res2 = await request.get('/api/self-help/list', {
        params: { category: params.category || undefined },
      })
      list = unwrapListPayload(res2?.data).map(mapSelfHelpToPortalItem)
    }
    if (list.length) {
      if (params.keyword) {
        const k = params.keyword.trim().toLowerCase()
        list = list.filter(
          item =>
            item.title.toLowerCase().includes(k) ||
            (item.summary && item.summary.toLowerCase().includes(k)) ||
            (item.category && item.category.includes(k))
        )
      }
      if (params.category) {
        list = list.filter(item => item.category === params.category)
      }
      return list
    }
    return []
  } catch (e) {
    console.warn('获取心理美文失败', e)
    return []
  }
}

export const getArticleDetail = async (id) => {
  try {
    const res = await request.get('/api/self-help/detail', { params: { id } })
    if (res?.code === 200 && res.data) {
      const d = res.data
      return {
        id: d.id,
        title: d.title,
        summary: d.summary || '',
        category: d.category || '',
        date: d.publishTime || d.date || '',
        content: d.content || '<p>暂无内容</p>',
      }
    }
  } catch (e) {
    console.warn('获取心理美文详情失败', e)
  }
  return null
}

// 朋辈互助（朋辈互助知识、信息及活动）- 从后端获取
export const getPeerList = async (params = {}) => {
  try {
    const res = await request.get('/api/peer/content/list', {
      params: { type: params.type || undefined, keyword: params.keyword || undefined }
    })
    if (res?.code === 200 && res.data) {
      let list = unwrapListPayload(res.data)
      if (params.keyword) {
        const k = params.keyword.trim().toLowerCase()
        list = list.filter(item => item.title.toLowerCase().includes(k) || (item.summary && item.summary.includes(k)) || (item.type && item.type.includes(k)))
      }
      if (params.type) {
        list = list.filter(item => item.type === params.type)
      }
      return list
    }
    return []
  } catch (e) {
    console.warn('获取朋辈互助列表失败', e)
    return []
  }
}

export const getPeerDetail = async (id) => {
  try {
    const res = await request.get('/api/peer/content/detail', { params: { id } })
    if (res?.code === 200 && res.data) {
      const d = res.data
      return {
        id: d.id,
        title: d.title,
        summary: d.summary || '',
        type: d.type || '',
        date: d.createTime || d.date || '',
        content: d.content || '<p>暂无内容</p>',
      }
    }
  } catch (e) {
    console.warn('获取朋辈互助详情失败', e)
  }
  return null
}

// 通知公告（支持发布、管理、定向推送与浏览）- 从后端获取
export const getNotices = async (params = {}) => {
  try {
    const res = await getNoticeList({ page: params.page || 1, pageSize: params.pageSize || 50, keyword: params.keyword, isTop: params.isTop })
    if (res?.code === 200 && res.data) {
      let list = unwrapListPayload(res.data).map(normalizeNoticeItem)
      if (params.keyword) {
        const k = params.keyword.trim().toLowerCase()
        list = list.filter(item => item.title.toLowerCase().includes(k) || (item.summary && item.summary.includes(k)))
      }
      if (params.isTop !== undefined && params.isTop !== '') {
        list = list.filter(item => !!item.isTop === !!params.isTop)
      }
      return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    }
  } catch (e) {
    console.warn('获取通知公告列表失败', e)
  }
  return []
}

export const getNoticeDetail = async (id) => {
  try {
    const res = await fetchNoticeDetailReq(id)
    if (res?.code === 200 && res.data) {
      const d = res.data
      return {
        id: d.id,
        title: d.title,
        summary: d.summary || '',
        date: d.date || d.publishTime || '',
        isTop: d.isTop,
        content: d.content || '<p>暂无内容</p>',
        publishTime: d.publishTime,
        publisher: d.publisher,
      }
    }
  } catch (e) {
    console.warn('获取通知公告详情失败', e)
  }
  return null
}
