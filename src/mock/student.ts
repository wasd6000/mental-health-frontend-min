import { db } from './db'

// 学生测评相关模拟数据
export function getMyAssessments(params) {
  const mockAssessments = [
    {
      id: 1,
      title: '心理健康状况评估',
      description: '全面评估你的心理健康状况，包括情绪、压力、人际关系等方面',
      status: 'pending',
      deadline: '2026-03-31',
      duration: 20
    },
    {
      id: 2,
      title: '抑郁倾向测评',
      description: '评估你是否有抑郁倾向，及早发现并干预',
      status: 'completed',
      deadline: '2026-03-15',
      duration: 15
    },
    {
      id: 3,
      title: '焦虑水平测试',
      description: '测量你的焦虑水平，了解压力来源',
      status: 'pending',
      deadline: '2026-04-10',
      duration: 10
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockAssessments
  })
}

export function getAssessmentDetail(id) {
  const mockDetail = {
    id: id,
    title: '心理健康状况评估',
    description: '全面评估你的心理健康状况，包括情绪、压力、人际关系等方面',
    totalQuestions: 20,
    questions: [
      {
        id: 1,
        type: 'scale',
        content: '我感到情绪低落',
        options: [
          { value: 1, label: '完全不符合' },
          { value: 2, label: '不太符合' },
          { value: 3, label: '一般' },
          { value: 4, label: '比较符合' },
          { value: 5, label: '完全符合' }
        ]
      },
      {
        id: 2,
        type: 'scale',
        content: '我感到压力很大',
        options: [
          { value: 1, label: '完全不符合' },
          { value: 2, label: '不太符合' },
          { value: 3, label: '一般' },
          { value: 4, label: '比较符合' },
          { value: 5, label: '完全符合' }
        ]
      }
    ]
  }
  
  return Promise.resolve({
    code: 200,
    data: mockDetail
  })
}

export function startAssessment(data) {
  return Promise.resolve({
    code: 200,
    data: { assessmentId: data.assessmentId, sessionId: 'session_' + Date.now() }
  })
}

export function submitAssessment(data) {
  return Promise.resolve({
    code: 200,
    data: { resultId: 'result_' + Date.now() }
  })
}

export function getAssessmentResult(id) {
  const mockResult = {
    studentName: '张三',
    gender: '男',
    nation: '汉族',
    birthday: '2007-01-01',
    college: '计算机学院',
    major: '计算机科学与技术',
    studentId: '2024001',
    phone: '13800138000',
    level: '黄色',
    levelText: '中度风险',
    problemType: '焦虑倾向',
    score: 75,
    factors: [
      { name: '躯体化', score: 60 },
      { name: '强迫症状', score: 70 },
      { name: '人际关系敏感', score: 65 },
      { name: '抑郁', score: 75 },
      { name: '焦虑', score: 80 },
      { name: '敌对', score: 50 },
      { name: '恐怖', score: 45 },
      { name: '偏执', score: 55 },
      { name: '精神病性', score: 40 }
    ],
    suggestion: '建议进行心理咨询，学习情绪管理技巧',
    measures: '定期进行心理测评，保持良好的生活习惯',
    responsiblePerson: '张老师'
  }
  
  return Promise.resolve({
    code: 200,
    data: mockResult
  })
}

// 学生活动相关模拟数据
export function getActivityList(params) {
  const mockActivities = [
    {
      id: 1,
      title: '心理健康讲座',
      description: '邀请专业心理老师进行心理健康知识讲座',
      startTime: '2026-03-15 14:00',
      endTime: '2026-03-15 16:00',
      location: '学术报告厅',
      capacity: 200,
      registered: 150,
      status: 'upcoming',
      image: 'https://example.com/activity1.jpg'
    },
    {
      id: 2,
      title: '情绪管理工作坊',
      description: '学习情绪管理技巧，提升心理健康水平',
      startTime: '2026-03-20 10:00',
      endTime: '2026-03-20 12:00',
      location: '心理中心活动室',
      capacity: 50,
      registered: 45,
      status: 'upcoming',
      image: 'https://example.com/activity2.jpg'
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockActivities
  })
}

export function getActivityDetail(id) {
  const mockDetail = {
    id: id,
    title: '心理健康讲座',
    description: '邀请专业心理老师进行心理健康知识讲座，内容包括心理健康的重要性、常见心理问题的识别与应对、情绪管理技巧等',
    startTime: '2026-03-15 14:00',
    endTime: '2026-03-15 16:00',
    location: '学术报告厅',
    capacity: 200,
    registered: 150,
    status: 'upcoming',
    image: 'https://example.com/activity1.jpg',
    organizer: '心理中心',
    contact: '张老师 13800138000'
  }
  
  return Promise.resolve({
    code: 200,
    data: mockDetail
  })
}

export function joinActivity(data) {
  return Promise.resolve({
    code: 200,
    data: { success: true, message: '报名成功' }
  })
}

export function cancelActivityRegistration(data) {
  return Promise.resolve({
    code: 200,
    data: { success: true, message: '取消报名成功' }
  })
}

export function checkinActivity(data) {
  return Promise.resolve({
    code: 200,
    data: { success: true, message: '签到成功' }
  })
}

export function getMyActivities(params) {
  const mockMyActivities = [
    {
      id: 1,
      title: '心理健康讲座',
      startTime: '2026-03-15 14:00',
      endTime: '2026-03-15 16:00',
      location: '学术报告厅',
      status: 'registered',
      checkinStatus: 'not_checked_in'
    },
    {
      id: 2,
      title: '情绪管理工作坊',
      startTime: '2026-03-20 10:00',
      endTime: '2026-03-20 12:00',
      location: '心理中心活动室',
      status: 'registered',
      checkinStatus: 'not_checked_in'
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockMyActivities
  })
}

// 学生预约相关模拟数据
function now() {
  return new Date().toISOString()
}

function generateId() {
  return 'apt_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

export function createAppointmentForStudent(data) {
  const appointment = {
    id: generateId(),
    studentId: data.studentId,
    counselorId: data.counselorId,
    counselorName: data.counselorName,
    appointmentDate: data.appointmentDate,
    appointmentTime: data.appointmentTime,
    status: 'draft',
    create_time: now(),
    update_time: now(),
    timeline: [
      { status: 'draft', time: now() }
    ]
  }
  
  db.pushAppointment(appointment)
  
  return Promise.resolve({
    code: 200,
    data: { ...appointment },
  })
}

export function updateAppointmentStatus(id, status, payload) {
  const ok = db.updateAppointment(id, a => {
    a.status = status
    a.update_time = now()
    
    a.timeline.push({
      status,
      time: now(),
    })
    
    if (payload) {
      Object.assign(a, payload)
    }
  })
  
  if (!ok) {
    return Promise.reject({
      code: 404,
      message: '预约不存在',
    })
  }
  
  const appointment = db.appointments.find(a => a.id === id)
  
  return Promise.resolve({
    code: 200,
    data: appointment,
  })
}

export function getAppointmentsByStudent(studentId) {
  const list = db.appointments.filter(a => a.studentId === studentId)
  
  return Promise.resolve({
    code: 200,
    data: list,
  })
}

export function getAvailableSlots(date) {
  const schedule = [
    { date: date, time: '09:00-10:00', counselorId: '1', counselorName: '张老师' },
    { date: date, time: '10:00-11:00', counselorId: '1', counselorName: '张老师' },
    { date: date, time: '14:00-15:00', counselorId: '2', counselorName: '李老师' },
    { date: date, time: '15:00-16:00', counselorId: '2', counselorName: '李老师' }
  ]
  
  const used = db.appointments
    .filter(a => a.appointmentDate === date)
    .map(a => a.appointmentTime)
  
  const result = schedule.filter(s => !used.includes(s.time))
  
  return Promise.resolve(result)
}

export function getAvailableDates(start, days = 10) {
  const dates = []
  const startDay = new Date(start)
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDay)
    date.setDate(date.getDate() + i)
    dates.push(date.toISOString().slice(0, 10))
  }
  
  return Promise.resolve(dates)
}

// 心理微课相关模拟数据
export function getMicroCourseList() {
  const mockCourses = [
    {
      id: 1,
      title: '情绪管理基础',
      teacher: '张老师',
      duration: 1800,
      progress: 60,
      viewCount: 1234,
      isFavorite: true,
      poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=emotion%20management%20course&image_size=landscape_16_9',
      description: '本课程介绍情绪管理的基本原理和实用技巧，帮助学员更好地理解和管理自己的情绪。',
      catalog: [
        { id: 1, title: '情绪的本质', duration: '05:00', isLocked: false, isCurrent: true },
        { id: 2, title: '情绪的功能', duration: '08:00', isLocked: false, isCurrent: false },
        { id: 3, title: '情绪识别技巧', duration: '10:00', isLocked: true, isCurrent: false },
        { id: 4, title: '情绪调节方法', duration: '12:00', isLocked: true, isCurrent: false }
      ]
    },
    {
      id: 2,
      title: '压力应对策略',
      teacher: '李老师',
      duration: 2400,
      progress: 30,
      viewCount: 856,
      isFavorite: false,
      poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stress%20management%20course&image_size=landscape_16_9',
      description: '学习有效的压力应对策略，提升心理韧性，更好地应对生活和工作中的压力。',
      catalog: [
        { id: 1, title: '压力的来源', duration: '06:00', isLocked: false, isCurrent: true },
        { id: 2, title: '压力的影响', duration: '08:00', isLocked: false, isCurrent: false },
        { id: 3, title: '压力应对技巧', duration: '15:00', isLocked: true, isCurrent: false }
      ]
    },
    {
      id: 3,
      title: '人际关系建立',
      teacher: '王老师',
      duration: 2100,
      progress: 0,
      viewCount: 2341,
      isFavorite: false,
      poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=interpersonal%20relationships%20course&image_size=landscape_16_9',
      description: '学习建立和维护健康人际关系的方法，提升社交能力和人际沟通技巧。',
      catalog: [
        { id: 1, title: '人际交往基础', duration: '07:00', isLocked: false, isCurrent: false },
        { id: 2, title: '沟通技巧', duration: '10:00', isLocked: false, isCurrent: false },
        { id: 3, title: '冲突解决', duration: '12:00', isLocked: true, isCurrent: false }
      ]
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockCourses
  })
}

export function getMicroCourseDetail(id) {
  const mockDetail = {
    id: id,
    title: '情绪管理基础',
    teacher: '张老师',
    duration: 1800,
    progress: 60,
    viewCount: 1234,
    isFavorite: true,
    poster: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=emotion%20management%20course&image_size=landscape_16_9',
    videoUrl: 'https://example.com/video/emotion-management.mp4',
    description: '本课程介绍情绪管理的基本原理和实用技巧，帮助学员更好地理解和管理自己的情绪。通过理论讲解、案例分析、互动练习等方式，让学员掌握情绪识别、情绪表达和情绪调节的核心技能。',
    catalog: [
      { id: 1, title: '情绪的本质', duration: '05:00', isLocked: false, isCurrent: true, startTime: 0 },
      { id: 2, title: '情绪的功能', duration: '08:00', isLocked: false, isCurrent: false, startTime: 300 },
      { id: 3, title: '情绪识别技巧', duration: '10:00', isLocked: true, isCurrent: false, startTime: 780 },
      { id: 4, title: '情绪调节方法', duration: '12:00', isLocked: true, isCurrent: false, startTime: 1380 }
    ]
  }
  
  return Promise.resolve({
    code: 200,
    data: mockDetail
  })
}

export function updateMicroCourseProgress(data) {
  return Promise.resolve({
    code: 200,
    data: { success: true }
  })
}

// 音乐调节相关模拟数据
export function getMusicList() {
  const mockMusic = [
    {
      id: 1,
      title: '清晨阳光',
      artist: '心理音乐库',
      category: '放松',
      duration: 300,
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=relaxing%20music%20cover&image_size=square',
      description: '轻柔的钢琴曲，适合早晨聆听，帮助开启美好的一天。',
      isFavorite: true
    },
    {
      id: 2,
      title: '森林漫步',
      artist: '心理音乐库',
      category: '放松',
      duration: 420,
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forest%20music%20cover&image_size=square',
      description: '自然声音与轻音乐结合，带来森林漫步的宁静感受。',
      isFavorite: false
    },
    {
      id: 3,
      title: '海浪声',
      artist: '心理音乐库',
      category: '平静',
      duration: 600,
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ocean%20waves%20music%20cover&image_size=square',
      description: '海浪的自然声音，帮助放松身心，平静情绪。',
      isFavorite: false
    },
    {
      id: 4,
      title: '晨间活力',
      artist: '心理音乐库',
      category: '活力',
      duration: 240,
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=energetic%20music%20cover&image_size=square',
      description: '充满活力的音乐，适合早晨或需要提升精力时聆听。',
      isFavorite: false
    },
    {
      id: 5,
      title: '深度睡眠',
      artist: '心理音乐库',
      category: '助眠',
      duration: 900,
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sleep%20music%20cover&image_size=square',
      description: '舒缓的助眠音乐，帮助快速进入深度睡眠状态。',
      isFavorite: true
    },
    {
      id: 6,
      title: '专注时刻',
      artist: '心理音乐库',
      category: '专注',
      duration: 360,
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=focus%20music%20cover&image_size=square',
      description: '适合学习和工作时的背景音乐，帮助提升专注力。',
      isFavorite: false
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockMusic
  })
}

export function getMusicByEmotion(emotion) {
  const emotionMap = {
    relax: ['放松', '平静'],
    happy: ['愉悦', '活力'],
    calm: ['平静', '放松'],
    focus: ['专注'],
    sleep: ['助眠'],
    energy: ['活力']
  }
  
  const categories = emotionMap[emotion] || []
  const allMusic = []
  
  return getMusicList().then(res => {
    const filtered = res.data.filter(m => categories.includes(m.category))
    return Promise.resolve({
      code: 200,
      data: filtered
    })
  })
}

export function getMusicDetail(id) {
  return getMusicList().then(res => {
    const music = res.data.find(m => m.id === id)
    return Promise.resolve({
      code: 200,
      data: music
    })
  })
}

// 心理健康课程相关模拟数据
export function getHealthCourseList() {
  const mockCourses = [
    {
      id: 1,
      title: '大学生心理健康导论',
      teacher: '张教授',
      duration: 16,
      studentCount: 1234,
      rating: 4.8,
      reviewCount: 256,
      status: 'ongoing',
      enrolled: true,
      progress: 65,
      isFavorite: true,
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mental%20health%20course%20cover&image_size=landscape_16_9',
      description: '本课程系统介绍大学生心理健康的基本概念、常见问题及应对策略，帮助学生建立正确的心理健康观念，提升心理素养。',
      objectives: [
        '了解心理健康的基本概念和重要性',
        '识别大学生常见的心理问题',
        '掌握基本的心理调适方法',
        '建立积极的心理健康观念'
      ],
      audience: ['大一新生', '心理委员', '对心理健康感兴趣的学生'],
      chapters: [
        {
          id: 1,
          title: '心理健康概述',
          lessons: [
            { id: 1, title: '什么是心理健康', duration: '45分钟', type: '视频', locked: false, completed: true },
            { id: 2, title: '心理健康的重要性', duration: '30分钟', type: '视频', locked: false, completed: true },
            { id: 3, title: '心理健康标准', duration: '40分钟', type: '视频', locked: false, completed: false }
          ]
        },
        {
          id: 2,
          title: '常见心理问题',
          lessons: [
            { id: 4, title: '焦虑情绪', duration: '50分钟', type: '视频', locked: false, completed: true },
            { id: 5, title: '抑郁情绪', duration: '45分钟', type: '视频', locked: false, completed: false },
            { id: 6, title: '人际关系问题', duration: '40分钟', type: '视频', locked: true, completed: false }
          ]
        }
      ]
    },
    {
      id: 2,
      title: '压力管理与应对',
      teacher: '李教授',
      duration: 12,
      studentCount: 856,
      rating: 4.6,
      reviewCount: 189,
      status: 'upcoming',
      enrolled: false,
      progress: 0,
      isFavorite: false,
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stress%20management%20course%20cover&image_size=landscape_16_9',
      description: '本课程帮助学生认识压力的来源和影响，学习有效的压力应对策略，提升心理韧性。',
      objectives: [
        '了解压力的来源和机制',
        '识别压力的生理和心理反应',
        '掌握多种压力应对技巧',
        '建立健康的生活方式'
      ],
      audience: ['面临学业压力的学生', '面临就业压力的学生', '需要提升心理韧性的学生'],
      chapters: [
        {
          id: 1,
          title: '压力认识',
          lessons: [
            { id: 1, title: '压力的定义', duration: '40分钟', type: '视频', locked: false, completed: false },
            { id: 2, title: '压力的来源', duration: '45分钟', type: '视频', locked: false, completed: false }
          ]
        },
        {
          id: 2,
          title: '压力应对',
          lessons: [
            { id: 3, title: '认知应对策略', duration: '50分钟', type: '视频', locked: true, completed: false },
            { id: 4, title: '行为应对策略', duration: '45分钟', type: '视频', locked: true, completed: false }
          ]
        }
      ]
    },
    {
      id: 3,
      title: '情绪调节技巧',
      teacher: '王教授',
      duration: 10,
      studentCount: 1567,
      rating: 4.9,
      reviewCount: 342,
      status: 'upcoming',
      enrolled: false,
      progress: 0,
      isFavorite: false,
      cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=emotion%20regulation%20course%20cover&image_size=landscape_16_9',
      description: '本课程系统介绍情绪调节的理论基础和实践技巧，帮助学生更好地管理情绪，提升情绪智力。',
      objectives: [
        '理解情绪的本质和功能',
        '学习情绪识别和表达技巧',
        '掌握情绪调节的多种方法',
        '提升情绪管理能力'
      ],
      audience: ['情绪波动较大的学生', '希望提升情商的学生', '对情绪管理感兴趣的学生'],
      chapters: [
        {
          id: 1,
          title: '情绪基础',
          lessons: [
            { id: 1, title: '情绪的定义', duration: '35分钟', type: '视频', locked: false, completed: false },
            { id: 2, title: '情绪的类型', duration: '40分钟', type: '视频', locked: false, completed: false }
          ]
        }
      ]
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockCourses
  })
}

export function getHealthCourseDetail(id) {
  return getHealthCourseList().then(res => {
    const course = res.data.find(c => c.id === id)
    course.ratingDistribution = {
      5: 180,
      4: 50,
      3: 20,
      2: 5,
      1: 1
    }
    return Promise.resolve({
      code: 200,
      data: course
    })
  })
}

export function enrollHealthCourse(courseId) {
  return Promise.resolve({
    code: 200,
    data: { success: true }
  })
}

export function getHealthCourseReviews(courseId) {
  const mockReviews = [
    {
      id: 1,
      name: '张同学',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar&image_size=square',
      rating: 5,
      content: '课程内容非常实用，老师讲解清晰，学到了很多有用的情绪管理技巧。强烈推荐！',
      date: '2026-02-20',
      likeCount: 23
    },
    {
      id: 2,
      name: '李同学',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar&image_size=square',
      rating: 4,
      content: '课程结构合理，内容丰富，但有些章节可以更详细一些。总体来说很不错的课程。',
      date: '2026-02-18',
      likeCount: 15
    },
    {
      id: 3,
      name: '王同学',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=student%20avatar&image_size=square',
      rating: 5,
      content: '这门课程对我的帮助很大，特别是压力应对的部分，现在我能更好地应对学习和生活中的压力了。',
      date: '2026-02-15',
      likeCount: 31
    }
  ]
  
  return Promise.resolve({
    code: 200,
    data: mockReviews
  })
}

export function submitHealthCourseReview(data) {
  return Promise.resolve({
    code: 200,
    data: { success: true }
  })
}
