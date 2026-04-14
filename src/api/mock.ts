import { updateAppointmentStatus } from "../mock/appointment"
import { AppointmentStatus } from "../types/appointment"
import { fetchSchedule } from "../mock/schedule";
import { users } from '../mock/mock';

// ===== 模拟管理员账号 =====
// 开发者账号（便于本地查看功能，上线前可移除或改密）
// 管理端：dev / dev123，角色选「管理员」
// 咨询师端：dev_counselor / dev123
export const adminUsers = [
  { id: 'center_1', username: 'center', password: '123456', role: 'center', name: '心理中心' },
  { id: 'tutor_1', username: 'tutor', password: '123456', role: 'tutor', name: '辅导员' },
  { id: 'admin_1', username: 'admin', password: '123', role: 'admin', name: '管理员' },
  { id: 'con001', username: 'zhang', password: '123456', role: 'counselor', name: '张老师' },
  { id: 'con010', username: 'feng', password: '123456', role: 'counselor', name: '冯老师' },
]



// ===== 模拟登录接口 =====
export function adminLogin(data: { username: string; password: string; role: string }) {
  // users: account, adminUsers: username
  
  let user: any = users.find(
    u =>
      (u.account === data.username) &&
      u.password === data.password &&
      u.role === data.role
  );

  if (!user) {
    user = adminUsers.find(
      u =>
        (u.username === data.username) &&
        u.password === data.password &&
        u.role === data.role
    );
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (user) {
        //登录成功时存储学生信息
        if (user.role === 'student') {
          localStorage.setItem('studentId', user.id || user.account || '')
          localStorage.setItem('student_college_id', user.college_id || '')
          localStorage.setItem('student_college', user.college_name || '')
        }
        resolve({
          code: 200,
          data: {
            id: user.id,
            account: user.account || user.id, 
            username: user.username,
            name: user.name,
            role: user.role,
            token: 'mock-token-123'
          }
        })
      } else {
        reject({
          code: 401,
          message: '账号或密码错误'
        })
      }
    }, 500)
  })
  
}

// ===== 模拟数据 =====

// 学期信息
export function getSemester() {
  return {
    start: '2026-03-01',
    end: '2026-07-10',
  };
}

// 咨询师数据
export function getCounselors() {
  return [
    { id: 'con001', name: '张老师' },
    { id: 'con002', name: '钱老师' },
    { id: 'con003', name: '罗老师' },
    { id: 'con004', name: '穆老师' },
    { id: 'con005', name: '何老师' },
    { id: 'con006', name: '周老师' },
    { id: 'con007', name: '赵老师' },
    { id: 'con008', name: '李老师' },
    { id: 'con009', name: '王老师' },
    { id: 'con010', name: '冯老师' },
  ];
}

// 节假日数据
export function getHolidays() {
  return ['2026-04-05', '2026-05-01', '2026-06-10'];
}

// 时间段数据
export function getPeriods() {
  return [
    '09:00-09:50',
    '09:50-10:40',
    '10:40-11:30',
    '11:30-12:20',
    '15:00-15:50',
    '15:50-16:40',
    '16:40-17:30',
  ];
}

// 一周的日期数据
export function getWeek() {
  return ['周一', '周二', '周三', '周四', '周五'];
}

export function mockFlow(id: string) {
  const steps = ['confirmed', 'checked_in', 'report_done', 'closed']
  let i = 0
  const timer = setInterval(() => {
    if (i >= steps.length) return clearInterval(timer)
    updateAppointmentStatus(id, steps[i] as AppointmentStatus)
    i++
  }, 2000)
}



