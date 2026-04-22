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

const STATIC_ACTIVITIES = [
  { id: 1, title: '心理健康月开幕式圆满举行', date: '2025-02-20' },
  { id: 2, title: '各学院心理委员培训顺利开展', date: '2025-02-18' },
  { id: 3, title: '校心理中心开放日活动回顾', date: '2025-02-15' },
]

// 活动风采（优先 /api/home/data、/api/activity/list）
export const getActivities = async () => {
  try {
    const home = await getHomeData()
    if (home?.code === 200 && home.data?.activities?.length) {
      return home.data.activities.map(mapActivityToPortalItem)
    }
  } catch (_) {}
  try {
    const res = await request.get('/api/activity/list', { params: { pageSize: 30 } })
    const raw = unwrapListPayload(res?.data)
    if (raw.length) return raw.map(mapActivityToPortalItem)
  } catch (_) {}
  return STATIC_ACTIVITIES
}

// 心理百科（心理健康基础知识）
const WIKI_LIST = [
  { id: 1, title: '认识焦虑情绪', summary: '了解焦虑的成因、表现与区分正常焦虑与焦虑障碍，掌握基本的自我觉察方法。', category: '情绪管理', date: '2025-02-20' },
  { id: 2, title: '如何进行压力管理', summary: '学习识别压力源、评估压力水平，掌握时间管理、放松训练等实用减压技巧。', category: '压力与应对', date: '2025-02-18' },
  { id: 3, title: '情绪调节的有效方法', summary: '介绍认知重评、正念呼吸、运动宣泄等科学有效的情绪调节策略。', category: '情绪管理', date: '2025-02-15' },
  { id: 4, title: '保持心理健康的小技巧', summary: '日常作息、社交支持、兴趣爱好等有助于维护心理健康的简单方法。', category: '自我关怀', date: '2025-02-12' },
  { id: 5, title: '睡眠与心理健康', summary: '睡眠质量如何影响情绪与认知，以及改善睡眠的实用建议。', category: '自我关怀', date: '2025-02-10' },
  { id: 6, title: '人际边界与自我照顾', summary: '如何在人际交往中设立健康边界，避免过度付出与耗竭。', category: '人际关系', date: '2025-02-08' }
]

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
  } catch (_) {}
  let list = [...WIKI_LIST]
  if (params.keyword) {
    const k = params.keyword.trim().toLowerCase()
    list = list.filter(item => item.title.toLowerCase().includes(k) || (item.summary && item.summary.includes(k)) || (item.category && item.category.includes(k)))
  }
  if (params.category) {
    list = list.filter(item => item.category === params.category)
  }
  return list
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
  } catch (_) {}
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
  } catch (_) {}
  const numId = Number(id)
  const item = WIKI_LIST.find(w => w.id === numId)
  if (!item) return null
  return {
    ...item,
    content: getWikiContent(numId)
  }
}

function getWikiContent(id) {
  const contents = {
    1: `<p>焦虑是一种常见的情绪反应，在面临考试、面试或陌生情境时出现是正常的。本文帮助您区分正常焦虑与需要关注的焦虑障碍。</p><p><strong>常见表现：</strong>心慌、出汗、坐立不安、反复担心、回避某些场合等。</p><p><strong>自我照料建议：</strong>规律作息、适度运动、减少咖啡因、练习腹式呼吸与正念，必要时寻求心理咨询。</p>`,
    2: `<p>压力来自学业、人际、就业等多方面，适度的压力能促进行动，过度则影响身心。学会评估与管理压力至关重要。</p><p><strong>压力管理步骤：</strong>识别压力源 → 评估可控性 → 制定小目标 → 时间管理 → 放松与休息。</p><p><strong>实用技巧：</strong>番茄工作法、清单排序、运动释放、与信任的人倾诉。</p>`,
    3: `<p>情绪调节不是压抑情绪，而是用更健康的方式理解和表达。以下方法经心理学研究验证有效。</p><p><strong>认知重评：</strong>换一种角度看待引发情绪的事件，减少灾难化想法。</p><p><strong>正念与呼吸：</strong>通过观察呼吸和身体感受，让情绪自然流动而不被裹挟。</p><p><strong>行为激活：</strong>适度运动、参与喜欢的活动，有助于改善情绪状态。</p>`,
    4: `<p>心理健康如同身体健康，需要日常维护。以下小习惯能显著提升心理韧性。</p><p><strong>作息：</strong>固定作息、充足睡眠、减少熬夜。</p><p><strong>社交：</strong>保持适量人际联系，与亲友分享感受。</p><p><strong>兴趣：</strong>保留至少一项让自己放松或获得成就感的爱好。</p><p><strong>求助：</strong>感到持续低落或焦虑时，及时寻求心理咨询或专业帮助。</p>`,
    5: `<p>睡眠与情绪、注意力、记忆力密切相关。长期睡眠不足或质量差会增加焦虑、抑郁风险。</p><p><strong>改善建议：</strong>固定就寝与起床时间、睡前减少屏幕使用、营造安静暗环境、避免睡前大量进食或咖啡因。</p>`,
    6: `<p>人际边界是指在关系中明确什么是可以接受的、什么需要拒绝或协商。健康的边界有助于减少内耗、保护精力。</p><p><strong>实践要点：</strong>识别自己的底线、用温和而坚定的方式表达界限、允许他人失望、优先照顾自己的基本需求。</p>`
  }
  return contents[id] || '<p>暂无详细内容。</p>'
}

// 心理美文（心理活动优秀文章）
const ARTICLE_LIST = [
  { id: 1, title: '给自己一段温柔时光', summary: '在忙碌的学业与生活中，留出一点时间与自己相处，感受当下的宁静与温柔。', category: '心灵感悟', date: '2025-02-22' },
  { id: 2, title: '与情绪和解', summary: '情绪无需被消灭，学会与各种情绪共处，它们会告诉我们内心真实的需要。', category: '情绪与成长', date: '2025-02-19' },
  { id: 3, title: '心灵的栖息地', summary: '每个人都需要一个让心灵休息的地方，或许是爱好、自然或一段安稳的关系。', category: '心灵感悟', date: '2025-02-16' },
  { id: 4, title: '倾听内心的声音', summary: '在众多外界声音中，学会分辨并倾听自己内心的声音，做出属于自己的选择。', category: '自我探索', date: '2025-02-14' },
  { id: 5, title: '成长中的不安与勇气', summary: '面对未知与变化时的忐忑是正常的，带着勇气迈出一小步，就是成长。', category: '情绪与成长', date: '2025-02-11' }
]

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
  } catch (_) {}
  let list = [...ARTICLE_LIST]
  if (params.keyword) {
    const k = params.keyword.trim().toLowerCase()
    list = list.filter(item => item.title.toLowerCase().includes(k) || (item.summary && item.summary.includes(k)) || (item.category && item.category.includes(k)))
  }
  if (params.category) {
    list = list.filter(item => item.category === params.category)
  }
  return list
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
  } catch (_) {}
  const numId = Number(id)
  const item = ARTICLE_LIST.find(a => a.id === numId)
  if (!item) return null
  return { ...item, content: getArticleContent(numId) }
}

function getArticleContent(id) {
  const contents = {
    1: `<p>我们总在赶路：赶作业、赶考试、赶各种待办。偶尔停下来，给自己一段温柔时光，不是偷懒，而是给心灵充电。</p><p>可以是一杯茶、一段音乐、一次散步，或只是安静地发一会儿呆。在这段时间里，不评判、不计划，只是存在。</p><p><strong>愿你常有这样的小时光，与自己的内心温柔相待。</strong></p>`,
    2: `<p>愤怒、悲伤、焦虑……我们常想“不要有这些情绪”，但情绪本身是信使，在告诉我们：这里有一份需要被看见的感受。</p><p>与情绪和解，不是压制或放纵，而是承认它的存在，允许它流动，再选择如何回应。当你愿意倾听情绪，它往往会慢慢平静下来。</p><p><strong>与情绪做朋友，而不是敌人。</strong></p>`,
    3: `<p>心灵的栖息地，可以是某个地方、某件事，或某个人。在那里，你可以卸下防备，感到安全与放松。</p><p>有人从阅读中找到，有人在自然里找到，有人在一段稳定的关系里找到。重要的是，你有意识地为自己保留这样一块“心灵绿地”。</p><p><strong>找到你的栖息地，并时常回去歇一歇。</strong></p>`,
    4: `<p>外界的声音很多：家人、朋友、社会期待、网络信息……在嘈杂中，我们有时会忘记问自己：我真正想要什么？</p><p>倾听内心，需要一点安静的时间、一点自我觉察的练习。不必立刻得到答案，只要开始问、开始听，内心的声音会渐渐清晰。</p><p><strong>你的选择，可以来自内心而不是仅来自外界。</strong></p>`,
    5: `<p>成长往往伴随着不安：新的阶段、新的选择、未知的结果。这种不安是正常的，甚至说明你在认真面对生活。</p><p>勇气不意味着不害怕，而是带着害怕仍然愿意尝试。每一次小的尝试，都在积累面对下一次的底气。</p><p><strong>不必等不安消失再行动，带着不安也可以迈步。</strong></p>`
  }
  return contents[id] || '<p>暂无详细内容。</p>'
}

// 朋辈互助（朋辈互助知识、信息及活动）
const PEER_LIST = [
  { id: 1, title: '心理委员值班表', summary: '各学院心理委员值班时间与地点，方便同学就近寻求朋辈倾听与初步支持。', type: '信息', date: '2025-02-20' },
  { id: 2, title: '朋辈咨询预约', summary: '通过朋辈咨询员进行预约，获得同龄人的倾听与陪伴，适合轻量级情绪与学业困扰。', type: '服务', date: '2025-02-18' },
  { id: 3, title: '互助知识手册', summary: '朋辈互助常见话题与应对要点，帮助心理委员与热心同学更好地倾听与支持他人。', type: '知识', date: '2025-02-15' },
  { id: 4, title: '朋辈成长小组活动', summary: '定期开展的朋辈支持小组，在安全的小团体中分享与成长。', type: '活动', date: '2025-02-12' },
  { id: 5, title: '倾听技巧入门', summary: '如何倾听他人而不急于给建议，朋辈支持中的基本沟通原则与边界。', type: '知识', date: '2025-02-10' }
]

export const getPeerList = async (params = {}) => {
  let list = [...PEER_LIST]
  if (params.keyword) {
    const k = params.keyword.trim().toLowerCase()
    list = list.filter(item => item.title.toLowerCase().includes(k) || (item.summary && item.summary.includes(k)) || (item.type && item.type.includes(k)))
  }
  if (params.type) {
    list = list.filter(item => item.type === params.type)
  }
  return list
}

export const getPeerDetail = async (id) => {
  const numId = Number(id)
  const item = PEER_LIST.find(p => p.id === numId)
  if (!item) return null
  return { ...item, content: getPeerContent(numId) }
}

function getPeerContent(id) {
  const contents = {
    1: `<p>心理委员值班表每学期更新，覆盖各学院与主要宿舍区。值班时段以课余时间为主，方便同学来访。</p><p><strong>查看方式：</strong>各学院公示栏、班级群或本平台「朋辈预约」入口内查看当前学期值班表。</p><p><strong>说明：</strong>朋辈支持以倾听与陪伴为主，不替代专业心理咨询。若您感到需要专业帮助，可同时预约校心理中心咨询。</p>`,
    2: `<p>朋辈咨询由经过培训的在校生担任咨询员，为同学提供倾听与情绪支持。适合学业压力、人际困扰、轻度情绪波动等话题。</p><p><strong>预约方式：</strong>通过本平台「朋辈互助」栏目进入预约页面，选择时段并填写简要来由即可。</p><p><strong>原则：</strong>保密、尊重、不评判。若涉及危机或超出朋辈能力范围，咨询员会建议您转介专业资源。</p>`,
    3: `<p>手册内容包括：常见心理困扰的识别、倾听时的注意事项、何时建议对方寻求专业帮助、自我照顾与边界等。</p><p>面向对象：心理委员、宿舍长及对朋辈助人感兴趣的同学。可在心理中心或本平台「朋辈互助」栏目下载电子版。</p>`,
    4: `<p>朋辈成长小组由心理中心指导，由经过培训的带领者组织，每期 6–8 人，围绕情绪、人际、自我探索等主题开展 4–6 次活动。</p><p><strong>报名：</strong>每学期初通过本平台或心理中心公众号发布招募信息，额满即止。</p>`,
    5: `<p>有效倾听的核心是：少说多听、不急于给建议、不评判对方感受。用“听起来你……”这样的句式反馈，能让对方感到被理解。</p><p>同时要明确边界：朋辈不是替代心理咨询师，若对方有自伤/伤人或严重抑郁焦虑迹象，应鼓励其寻求专业帮助并告知老师。</p>`
  }
  return contents[id] || '<p>暂无详细内容。</p>'
}

// 通知公告（支持发布、管理、定向推送与浏览）
const NOTICE_LIST = [
  { id: 1, title: '关于开放本学期心理咨询预约的通知', summary: '校心理中心自即日起开放本学期心理咨询预约，面向全体在校生，可通过平台预约或现场登记。', date: '2025-02-20', isTop: true },
  { id: 2, title: '心理健康月活动安排', summary: '本学期心理健康月系列活动时间与主题安排，包括开幕式、讲座、团体活动等。', date: '2025-02-18', isTop: true },
  { id: 3, title: '心理委员培训通知', summary: '各学院心理委员参加本学期培训的时间、地点与考核方式。', date: '2025-02-15', isTop: false },
  { id: 4, title: '寒假心理咨询服务安排', summary: '寒假期间心理中心值班时间与线上咨询方式说明。', date: '2025-02-10', isTop: false },
  { id: 5, title: '朋辈咨询员招募启事', summary: '面向全校招募新一届朋辈咨询员，培训合格后参与值班与活动。', date: '2025-02-08', isTop: false }
]

function filterNotices(list, params) {
  let out = [...list]
  if (params.keyword) {
    const k = params.keyword.trim().toLowerCase()
    out = out.filter(item => item.title.toLowerCase().includes(k) || (item.summary && item.summary.includes(k)))
  }
  if (params.isTop !== undefined && params.isTop !== '') {
    out = out.filter(item => !!item.isTop === !!params.isTop)
  }
  return out.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
}

export const getNotices = async (params = {}) => {
  try {
    const home = await getHomeData()
    if (home?.code === 200 && home.data?.notices?.length) {
      return filterNotices(home.data.notices.map(normalizeNoticeItem), params)
    }
  } catch (_) {}
  try {
    const res = await getNoticeList({ page: params.page, pageSize: params.pageSize || 50 })
    const raw = unwrapListPayload(res?.data)
    if (raw.length) return filterNotices(raw.map(normalizeNoticeItem), params)
  } catch (_) {}
  return filterNotices([...NOTICE_LIST], params)
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
  } catch (_) {}
  const numId = Number(id)
  const item = NOTICE_LIST.find(n => n.id === numId)
  if (!item) return null
  return { ...item, content: getNoticeContent(numId) }
}

function getNoticeContent(id) {
  const contents = {
    1: `<p>为更好地服务全体在校生，校大学生心理健康教育与咨询中心自即日起开放本学期心理咨询预约。</p><p><strong>预约方式：</strong></p><ul><li>登录本平台，进入「在线预约」按提示选择时段与咨询师；</li><li>或于工作时间至心理中心现场登记预约。</li></ul><p><strong>服务对象：</strong>全体在校学生。</p><p><strong>开放时间：</strong>以系统排班为准，请提前预约。</p><p>心理中心将严格保护同学隐私，请放心预约。</p>`,
    2: `<p>本学期心理健康月主题为「关注心理健康，共创美好未来」，主要安排如下：</p><ul><li>开幕式暨主题讲座：时间地点另行通知；</li><li>各学院特色活动：由各院心理辅导站组织；</li><li>团体心理活动：通过本平台报名；</li><li>闭幕与总结：月末进行总结表彰。</li></ul><p>请关注本平台及各学院通知，欢迎积极参与。</p>`,
    3: `<p>为提升心理委员工作能力，本学期心理委员培训安排如下：</p><p><strong>时间：</strong>另行通知；<strong>地点：</strong>心理中心团体室。</p><p><strong>内容：</strong>常见心理问题识别、倾听技巧、危机识别与上报、保密与边界等。</p><p><strong>考核：</strong>培训结束后进行考核，合格者发放证书。请各院心理委员按时参加。</p>`,
    4: `<p>寒假期间心理中心实行轮值制度，具体值班时间见下表（略）。如需咨询，可优先通过平台留言或指定邮箱预约线上咨询。</p><p>祝同学们寒假愉快，身心安康。</p>`,
    5: `<p>校心理中心现面向全校招募新一届朋辈咨询员。要求：热心助人、善于倾听、有责任心，能保证培训与值班时间。</p><p><strong>报名方式：</strong>填写报名表并提交至心理中心或指定邮箱，截止时间见后续通知。</p><p>培训合格后将参与朋辈值班与相关活动，表现优秀者将获表彰。</p>`
  }
  return contents[id] || '<p>暂无详细内容。</p>'
}
