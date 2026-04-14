// mock.ts - 多学院多用户mock数据种子，字段严格对齐数据库说明文档
import { db } from './db'
import type { User } from '../types/user'
import type { Student } from '../types/student'
import type { Consultant } from '../types/consultant'
import type { College } from '../types/college'

// 多学院
export const colleges: College[] = [
  { id: 'c01', name: '心理学院', code: 'PSY', campus: '南苑', student_count: 2000, teacher_count: 30, has_secondary_station: true, status: 'active' },
  { id: 'c02', name: '外国语学院', code: 'FL', campus: '北苑', student_count: 1800, teacher_count: 25, has_secondary_station: false, status: 'active' },
  { id: 'c03', name: '计算机学院', code: 'CS', campus: '南苑', student_count: 2200, teacher_count: 28, has_secondary_station: true, status: 'active' },
]

// 多用户（学生/咨询师/家长/辅导员）
export const users: User[] = [
  // 学生
  { id: 'stu001', account: 'stu001', password: '123456', name: '张三', role: 'student', college: '心理学院', college_id: 'c01', major: '心理学', grade: '2023', phone: '13800000001', email: 'stu001@school.edu.cn', status: 'active', avatar: '', created_at: '', updated_at: '' },
  { id: 'stu002', account: 'stu002', password: '123456', name: '李四', role: 'student', college: '外国语学院', college_id: 'c02', major: '英语', grade: '2022', phone: '13800000002', email: 'stu002@school.edu.cn', status: 'active', avatar: '', created_at: '', updated_at: '' },
  { id: 'stu003', account: 'stu003', password: '123456', name: '王五', role: 'student', college: '计算机学院', college_id: 'c03', major: '计算机科学', grade: '2021', phone: '13800000003', email: 'stu003@school.edu.cn', status: 'active', avatar: '', created_at: '', updated_at: '' },
  // 咨询师
  { id: 'con001', account: 'con001', password: '123456', name: '张老师', role: 'counselor', college: '心理学院', college_id: 'c01', phone: '13900000001', email: 'con001@school.edu.cn', status: 'active', avatar: '', avoid_college_ids: ['c02'], created_at: '', updated_at: '' },
  { id: 'con002', account: 'con002', password: '123456', name: '钱老师', role: 'counselor', college: '北苑', college_id: 'c02', phone: '13900000002', email: 'con002@school.edu.cn', status: 'active', avatar: '', avoid_college_ids: ['c01','c03'], created_at: '', updated_at: '' },
  // 家长
  { id: 'par001', account: 'par001', password: '123456', name: '张三家长', role: 'parent', college: '心理学院', college_id: 'c01', phone: '13700000001', email: 'par001@school.edu.cn', status: 'active', avatar: '', created_at: '', updated_at: '' },
  // 辅导员
  { id: 'tut001', account: 'tut001', password: '123456', name: '辅导员A', role: 'tutor', college: '外国语学院', college_id: 'c02', phone: '13600000001', email: 'tut001@school.edu.cn', status: 'active', avatar: '', created_at: '', updated_at: '' },
  // 校领导
  { id: 'lea001', account: 'lea001', password: '123456', name: '校领导A', role: 'leader', college: '', college_id: '', phone: '13500000001', email: 'lea001@school.edu.cn', status: 'active', avatar: '', created_at: '', updated_at: '' },
  // 二级学院
  { id: 'col001', account: 'col001', password: '123456', name: '二级学院A', role: 'college', college: '外国语学院', college_id: 'c02', phone: '13400000001', email: 'col001@school.edu.cn', status: 'active', avatar: '', created_at: '', updated_at: '' },
  // 心理中心
  { id: 'cen001', account: 'cen001', password: '123456', name: '心理中心A', role: 'center', college: '', college_id: '', phone: '13300000001', email: 'cen001@school.edu.cn', status: 'active', avatar: '', created_at: '', updated_at: '' },
  // 管理员
  { id: 'adm001', account: 'adm001', password: '123456', name: '管理员A', role: 'admin', college: '', college_id: '', phone: '13200000001', email: 'adm001@school.edu.cn', status: 'active', avatar: '', created_at: '', updated_at: '' },
]

// 咨询师
export const consultants: Consultant[] = [
  { id: 'con001', name: '张老师', campus: '南苑', title: '国家二级心理咨询师', phone: '13900000001', avatar: '', college_id: 'c01',specialties: ['情绪管理', '压力应对'], specialty_text: '情绪管理,压力应对', experience: '5年', description: '擅长青少年心理', location: '心理中心A101', room_id: 'r101', room_name: 'A101', is_part_time: false, is_secondary_station: false, avoid_college_ids: ['c02'], rating: 4.8, consultation_count: 120, available: true, status: 'active', created_at: '', updated_at: '' },
    { id: 'con002', name: '钱老师', college_id: 'c02', campus: '北苑', title: '国家三级心理咨询师', phone: '13900000002', avatar: '', specialties: ['人际关系'], specialty_text: '人际关系', experience: '3年', description: '专注人际关系', location: '心理中心B202', room_id: 'r202', room_name: 'B202', is_part_time: true, is_secondary_station: true, secondary_station_college_id: 'c02', avoid_college_ids: ['c01','c03'], rating: 4.5, consultation_count: 80, available: true, status: 'active', created_at: '', updated_at: '' },
  ]

// 学生
export const students: Student[] = [
  { id: 'stu001', name: '张三', college_id: 'c01', major_id: 'm01', grade_id: 'g01', class_id: 'cl01', gender: '男', phone: '13800000001', email: 'stu001@school.edu.cn', college_name: '心理学院', major_name: '心理学', grade_name: '2023', class_name: '心理2301', campus: '南苑', status: 'normal', risk_level: 'green', avatar: '', student_type: 'undergraduate', created_at: '', updated_at: '' },
  { id: 'stu002', name: '李四', college_id: 'c02', major_id: 'm02', grade_id: 'g02', class_id: 'cl02', gender: '女', phone: '13800000002', email: 'stu002@school.edu.cn', college_name: '外国语学院', major_name: '英语', grade_name: '2022', class_name: '英语2201', campus: '北苑', status: 'normal', risk_level: 'blue', avatar: '', student_type: 'undergraduate', created_at: '', updated_at: '' },
  { id: 'stu003', name: '王五', college_id: 'c03', major_id: 'm03', grade_id: 'g03', class_id: 'cl03', gender: '男', phone: '13800000003', email: 'stu003@school.edu.cn', college_name: '计算机学院', major_name: '计算机科学', grade_name: '2021', class_name: '计科2101', campus: '南苑', status: 'focus', risk_level: 'yellow', avatar: '', student_type: 'undergraduate', created_at: '', updated_at: '' },
];

// 初始化写入 localStorage（只在首次加载时）
(function seedMock() {
  if (!localStorage.getItem('MOCK_COLLEGES')) {
    localStorage.setItem('MOCK_COLLEGES', JSON.stringify(colleges))
  }
  if (!localStorage.getItem('MOCK_USERS')) {
    localStorage.setItem('MOCK_USERS', JSON.stringify(users))
  }
  if (!localStorage.getItem('MOCK_CONSULTANTS')) {
    localStorage.setItem('MOCK_CONSULTANTS', JSON.stringify(consultants))
  }
  if (!localStorage.getItem('MOCK_STUDENTS')) {
    localStorage.setItem('MOCK_STUDENTS', JSON.stringify(students))
  }
})()
