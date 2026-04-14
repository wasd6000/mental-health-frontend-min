// 学生表类型定义，严格对齐数据库说明文档
export interface Student {
  id: string; // 学号，主键
  name: string; // 姓名
  college_id: string; // 学院ID
  major_id: string; // 专业ID
  grade_id: string; // 年级ID
  class_id: string; // 班级ID
  user_id?: string; // 关联users.id
  gender?: string; // 男/女
  phone?: string; // 联系电话
  email?: string; // 邮箱
  college_name?: string; // 学院名称
  major_name?: string; // 专业名称
  grade_name?: string; // 年级名称
  class_name?: string; // 班级名称
  campus?: string; // 所在校区
  status?: string; // normal / attention / focus / crisis
  risk_level?: string; // green / blue / yellow / orange / red
  avatar?: string; // 头像
  student_type?: string; // undergraduate / graduate
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}
