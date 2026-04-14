import { db } from './db'

// 家长端相关模拟数据

// 获取子女列表
export function getChildrenList() {
  const mockChildren = [
    {
      studentId: '2024001',
      studentName: '张三',
      studentNumber: '2024001',
      college: '计算机学院',
      major: '计算机科学与技术',
      grade: '2024级',
      className: '计算机科学与技术1班',
      avatar: '',
    },
    {
      studentId: '2024002',
      studentName: '李四',
      studentNumber: '2024002',
      college: '计算机学院',
      major: '软件工程',
      grade: '2024级',
      className: '软件工程2班',
      avatar: '',
    },
    {
      studentId: '2024003',
      studentName: '王五',
      studentNumber: '2024003',
      college: '心理与教育学院',
      major: '应用心理学',
      grade: '2024级',
      className: '应用心理学3班',
      avatar: '',
    },
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockChildren
  })
}

// 按学生查辅导员
export function getParentCounselor(studentId) {
  const mockCounselor = {
    id: '1',
    name: '王辅导员',
    title: '计算机学院辅导员',
    phone: '13800138002',
    email: 'wang@example.com',
    office: '行政楼301',
    workingHours: '周一至周五 8:30-17:30',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20counselor%20portrait&image_size=square'
  }
  
  return Promise.resolve({
    code: 200,
    data: mockCounselor
  })
}

// 发送留言
export function sendParentMessage(data) {
  return Promise.resolve({
    code: 200,
    data: { messageId: 'msg_' + Date.now() }
  })
}

// 我的留言记录
export function getParentMessages(params) {
  const mockMessages = [
    {
      id: '1',
      childId: '1',
      subject: '关于孩子最近的学习情况',
      content: '老师您好，我想了解一下孩子最近在学校的学习情况，是否有什么需要家长配合的地方？',
      urgency: 'medium',
      sendTime: '2026-02-20 14:30',
      status: '已回复',
      reply: {
        content: '家长您好，孩子最近学习态度认真，成绩稳定，希望继续保持。',
        replyTime: '2026-02-20 16:00'
      }
    },
    {
      id: '2',
      childId: '1',
      subject: '孩子的心理健康问题',
      content: '老师您好，孩子最近回家后情绪比较低落，请问在学校是否有类似情况？',
      urgency: 'high',
      sendTime: '2026-02-15 10:00',
      status: '已回复',
      reply: {
        content: '家长您好，我已经注意到孩子的情绪变化，建议带孩子到心理健康中心进行咨询。',
        replyTime: '2026-02-15 11:00'
      }
    },
    {
      id: '3',
      childId: '2',
      subject: '关于孩子的社团活动',
      content: '老师您好，孩子想参加学校的社团活动，请问有哪些推荐的社团？',
      urgency: 'low',
      sendTime: '2026-02-22 09:00',
      status: '未回复'
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockMessages
  })
}

// 获取子女测评情况
export function getChildAssessments(studentId) {
  const mockAssessments = [
    {
      id: '1',
      childId: '1',
      title: '心理健康状况评估',
      date: '2026-02-20',
      score: 75,
      level: 'normal',
      duration: 15,
      status: '已完成',
      summary:
        '综合评估显示，孩子当前心理状态总体稳定，情绪调节与人际适应良好。建议继续保持规律作息与适度运动，如遇持续情绪低落可及时与辅导员或心理中心联系。',
      dimensions: [
        { name: '情绪调节', score: 19, max: 25 },
        { name: '人际适应', score: 18, max: 25 },
        { name: '压力应对', score: 20, max: 25 },
        { name: '自我认知', score: 18, max: 25 }
      ]
    },
    {
      id: '2',
      childId: '1',
      title: '抑郁倾向测评',
      date: '2026-01-15',
      score: 60,
      level: 'normal',
      duration: 10,
      status: '已完成',
      summary:
        '测评结果处于常见范围内，未提示明显抑郁风险。若孩子近期出现睡眠、食欲或兴趣明显变化，建议多沟通并给予支持，必要时可预约面谈评估。',
      dimensions: [
        { name: '情绪低落', score: 8, max: 15 },
        { name: '兴趣减退', score: 7, max: 15 },
        { name: '躯体症状', score: 6, max: 15 },
        { name: '认知消极', score: 5, max: 15 },
        { name: '行为迟缓', score: 6, max: 15 }
      ]
    },
    {
      id: '3',
      childId: '1',
      title: '焦虑倾向测评',
      date: '2026-03-01',
      score: 0,
      level: '',
      duration: 0,
      status: '待完成'
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockAssessments
  })
}

// 获取子女预约咨询
export function getChildAppointments(studentId) {
  const mockAppointments = [
    {
      id: '1',
      childId: '1',
      counselor: '张老师',
      counselorTitle: '心理健康教育中心',
      date: '2026-02-26',
      time: '09:00-10:00',
      method: '线下咨询',
      venue: '心理健康中心 302 室',
      status: '已确认',
      createdAt: '2026-02-20 14:30',
      remark: '希望沟通近期学业压力与睡眠问题。'
    },
    {
      id: '2',
      childId: '1',
      counselor: '李老师',
      counselorTitle: '心理健康教育中心',
      date: '2026-02-20',
      time: '14:00-15:00',
      method: '线上咨询',
      venue: '腾讯会议（链接将短信通知）',
      status: '已完成',
      createdAt: '2026-02-18 10:00',
      remark: ''
    },
    {
      id: '3',
      childId: '1',
      counselor: '王老师',
      counselorTitle: '心理健康教育中心',
      date: '2026-02-15',
      time: '16:00-17:00',
      method: '线下咨询',
      venue: '心理健康中心 201 室',
      status: '已取消',
      createdAt: '2026-02-10 09:00',
      remark: '时间冲突，已改约。'
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockAppointments
  })
}

// 获取子女活动记录
export function getChildActivities(studentId) {
  const mockActivities = [
    {
      id: '1',
      childId: '1',
      title: '情绪管理工作坊',
      time: '2026-03-10 14:00-16:00',
      location: '心理健康中心活动室',
      organizer: '学生处 · 心理健康教育中心',
      description:
        '通过团体互动与练习，帮助参与者认识情绪、学习调节技巧。请提前 10 分钟到场签到。',
      status: '已报名',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mental%20health%20workshop%20activity&image_size=landscape_4_3'
    },
    {
      id: '2',
      childId: '1',
      title: '正念冥想体验',
      time: '2026-02-20 16:00-17:00',
      location: '瑜伽室',
      organizer: '心理健康教育中心',
      description: '引导式正念练习，缓解焦虑与压力，适合初次体验者。',
      status: '已完成',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mindfulness%20meditation%20activity&image_size=landscape_4_3'
    },
    {
      id: '3',
      childId: '1',
      title: '压力管理讲座',
      time: '2026-02-15 15:00-17:00',
      location: '学术报告厅',
      organizer: '心理健康教育中心',
      description: '面向全体学生的科普讲座，介绍压力来源与应对策略。',
      status: '已完成',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stress%20management%20lecture&image_size=landscape_4_3'
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockActivities
  })
}

// 获取子女成长档案（字段与前端 ProfileView 对齐，便于演示；接口亦可返回 assessments 等别名由前端归一化）
export function getChildProfile(studentId) {
  // 后端 ParentController /api/parent/children/detail 目前只返回 ChildVO 基本信息。
  const id = String(studentId || '2024001')
  const map = {
    '2024001': {
      studentId: id,
      studentName: '张三',
      studentNumber: '2024001',
      college: '计算机学院',
      major: '计算机科学与技术',
      grade: '2024级',
      className: '计算机科学与技术1班',
      avatar: ''
    },
    '2024002': {
      studentId: id,
      studentName: '李四',
      studentNumber: '2024002',
      college: '计算机学院',
      major: '软件工程',
      grade: '2024级',
      className: '软件工程2班',
      avatar: ''
    },
    '2024003': {
      studentId: id,
      studentName: '王五',
      studentNumber: '2024003',
      college: '心理与教育学院',
      major: '应用心理学',
      grade: '2024级',
      className: '应用心理学3班',
      avatar: ''
    }
  }
  const mockProfile = map[id] || map['2024001']

  return Promise.resolve({
    code: 200,
    data: mockProfile
  })
}

/** 学生发起绑定后，家长端「待确认」列表（演示数据） */
export function getPendingParentBinds() {
  return Promise.resolve({
    code: 200,
    data: [
      {
        relationId: 'pb1',
        studentName: '王五',
        studentId: '2024010',
        parentId: 'parent_1',
        relationType: 'mother',
        verificationStatus: 0,
        createdAt: '2026-03-28 09:15'
      }
    ]
  })
}

export function confirmParentBind(requestId) {
  return Promise.resolve({
    code: 200,
    message: '已确认关联',
    data: { requestId }
  })
}

export function rejectParentBind(requestId) {
  return Promise.resolve({
    code: 200,
    message: '已拒绝该关联申请',
    data: { requestId }
  })
}

// 绑定子女
export function bindChild(data) {
  return Promise.resolve({
    code: 200,
    message: '绑定成功'
  })
}

// 解绑子女
export function unbindChild(childId) {
  return Promise.resolve({
    code: 200,
    message: '解绑成功'
  })
}
