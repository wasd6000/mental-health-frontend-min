// src/types/record.ts

// 咨询过程记录表类型定义，严格对齐数据库说明文档
export interface AppointmentRecord {
  id: string; // 主键
  appointment_id: string; // 预约ID
  studentId: string; // 学生ID
  student_name: string; // 学生姓名
  content: string; // 咨询过程正文
  appointment_date?: string; // 预约日期
  appointment_time?: string; // 预约时段
  summary?: string; // 摘要
  problem_type?: string; // 问题类型
  images?: string[]; // 附件图片URL
  record_status?: string; // pending / filled / submitted
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}
