// 班级表类型定义，严格对齐数据库说明文档
export interface Class {
  id: string; // 主键
  name: string; // 班级名称
  college_id: string; // 学院ID
  major_id: string; // 专业ID
  grade_id: string; // 年级ID
  college_name?: string; // 学院名称
  major_name?: string; // 专业名称
  grade_name?: string; // 年级名称
  teacher_id?: string; // 辅导员ID
  student_count?: number; // 学生人数
  status?: string; // active / graduated
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}
