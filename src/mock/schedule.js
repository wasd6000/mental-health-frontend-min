import { getSemester, getCounselors, getHolidays, getPeriods,getWeek } from '../api/mock'

export {
  getCounselors,
  getHolidays,
  getPeriods,
  getWeek,
  getSemester
}

// 内存排班数据（模拟数据库）
let schedule = []

const STORAGE_KEY = 'MOCK_WEEK_TEMPLATE'
const SCHEDULE_STORAGE_KEY = 'MOCK_SCHEDULE'  // 新增：排班持久化key

// 从localStorage读取排班数据
function loadScheduleFromStorage() {
  const cached = localStorage.getItem(SCHEDULE_STORAGE_KEY)
  if (cached) {
    try {
      schedule = JSON.parse(cached)
      console.log('从localStorage加载排班数据，条数:', schedule.length)
      return true
    } catch (e) {
      console.warn('解析localStorage排班数据失败', e)
    }
  }
  return false
}


// 保存排班数据到localStorage
function saveScheduleToStorage() {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule))
  console.log('排班数据已保存到localStorage')
}

// 在模块加载时尝试从localStorage恢复排班数据
loadScheduleFromStorage()

// 日期规范化工具（使用本地时间）
function toDay(d) {
  const dt = d instanceof Date ? d : new Date(d)
  if (isNaN(dt.getTime())) return ''
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 根据周排班生成学期每周排版模板
export function initSchedule() {
  console.log('initSchedule 被调用')

  // 检查localStorage中是否已有排班数据
  if (loadScheduleFromStorage()) {
    console.log('从localStorage恢复排班数据，共', schedule.length, '条')
    return schedule
  }

  // 首次初始化：每个时段分配一位随机咨询师（所有咨询师在表格中随机分布）
  schedule = [];
  const start = new Date('2026-03-01');
  const end = new Date('2026-07-10');
  let day = new Date(start);

  const counselors = getCounselors()   //  统一数据来源

  while (day <= end) {
    // 跳过周末
    const weekDay = day.getDay();
    if (weekDay === 0 || weekDay === 6) {
      day.setDate(day.getDate() + 1);
      continue;
    }

    const date = toDay(day);

    // 为每个工作日生成 7 个时段的排班
    getPeriods().forEach((time) => {
      // 随机选择一个咨询师
      const randomIndex = Math.floor(Math.random() * counselors.length);
      const counselor = counselors[randomIndex];

      schedule.push({
        date,
        time,
        counselorId: counselor.id,
        counselorName: counselor.name
      });
    });

    day.setDate(day.getDate() + 1);
  }

  console.log('schedule size =', schedule.length)
  // 持久化到localStorage
  saveScheduleToStorage()
  return schedule;
}

// 查询排班
export function fetchSchedule() {
    if (schedule.length === 0) {
      console.warn('⚠ schedule 为空，自动 init')
    initSchedule()
  }
  return Promise.resolve([...schedule])
}

// 修改排班
export function updateSchedule({ date, time, counselorId, counselorName }) {
  const idx = schedule.findIndex(i => i.date === date && i.time === time)
  if (idx !== -1)  {
    schedule[idx].counselorId = counselorId
    schedule[idx].counselorName = counselorName
  }
  else schedule.push({ date, time, counselorId, counselorName })
  // 持久化到localStorage
  saveScheduleToStorage()
  return Promise.resolve({ code: 200 })
}

// 清空
export function clearSchedule(date, time) {
  schedule = schedule.filter(i => !(i.date === date && i.time === time))
  // 持久化到localStorage
  saveScheduleToStorage()
  return Promise.resolve({ code: 200 })
}

let weekTemplate = null

try {
  const cached = localStorage.getItem(STORAGE_KEY)
  weekTemplate = cached ? JSON.parse(cached) : null
} catch (e) {
  weekTemplate = null
}

export function saveWeekTemplate(weekSchedule) {
  weekTemplate = JSON.parse(JSON.stringify(weekSchedule))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weekTemplate))
}

// 随机生成一学期每周的排班情况
export function generateFromTemplate() {
  if (!weekTemplate) return [];

  const semester = getSemester();
  const start = new Date(semester.start);
  const end = new Date(semester.end);

  const result = [];
  let day = new Date(start);

  while (day <= end) {
    // 跳过周末
    const weekDay = day.getDay();
    if (weekDay === 0 || weekDay === 6) {
      day.setDate(day.getDate() + 1);
      continue;
    }

    const date = toDay(day);

    // ✅ 根据星期几从模板中找到对应的排班
    const templateDay = weekTemplate.filter(
        i => new Date(i.date).getDay() === weekDay
    );

    // ✅ 为模板中的每个时段生成排班
    templateDay.forEach((templateItem) => {
      result.push({
        date,
        time: templateItem.time,
        counselorId: templateItem.counselorId,
        counselorName: templateItem.counselorName,
        consultant_college: templateItem.consultant_college,
        only_college: templateItem.only_college,
        unit_type: templateItem.unit_type,
        avoid_colleges: templateItem.avoid_colleges
      });
    });

    day.setDate(day.getDate() + 1);
  }

  return result;  // ✅ 返回正确的结果
}

export function getWeekTemplate() {
  if (!weekTemplate) {
    const cache = localStorage.getItem(STORAGE_KEY)
    weekTemplate = cache ? JSON.parse(cache) : []
  }
  return weekTemplate 
}

export function initWeekTemplate() {
  const cache = localStorage.getItem(STORAGE_KEY)
  if (cache) return   // 已经有就不覆盖
  // 统一字段：counselorId 用 mock.ts 的 id，avoid_colleges 用学院ID，且包含钱老师
  const demo = [
    {
      date: '2026-03-02',
      time: '09:00-09:50',
      counselorId: 'con001',
      counselorName: '张老师',
      consultant_college: '心理学院',
      only_college: true,
      unit_type: 'normal', // normal | single_unit
      avoid_colleges: ['c02'] // 回避学院ID（外国语学院）
    },
    {
      date: '2026-03-02',
      time: '10:00-10:50',
      counselorId: 'con002',
      counselorName: '钱老师',
      consultant_college: '北苑',
      only_college: false,
      unit_type: 'single_unit',
      avoid_colleges: ['c01','c03'] // 回避心理学院、计算机学院
    },
    {
      date: '2026-03-03',
      time: '09:00-09:50',
      counselorId: 'con001',
      counselorName: '张老师',
      consultant_college: '心理学院',
      only_college: false,
      unit_type: 'normal',
      avoid_colleges: ['c02'] // 回避外国语学院
    },
    {
      date: '2026-03-03',
      time: '10:00-10:50',
      counselorId: 'con002',
      counselorName: '钱老师',
      consultant_college: '北苑',
      only_college: false,
      unit_type: 'normal',
      avoid_colleges: ['c03'] // 回避心理学院
    }
  ]

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
}
