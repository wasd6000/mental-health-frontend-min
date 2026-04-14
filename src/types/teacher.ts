// 辅导员表类型定义，严格对齐数据库说明文档
export interface Teacher {
  id: string; // 工号，主键
  name: string; // 姓名
  college_id: string; // 学院ID
  user_id?: string; // 关联users.id
  college_name?: string; // 学院名称
  phone?: string; // 联系电话
  email?: string; // 邮箱
  title?: string; // 辅导员
  avatar?: string; // 头像
  managed_class_ids?: string[]; // 管理的班级ID数组
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
  office?: string; // 办公室
  officeHours?: string; // 办公时间
  intro?: string; // 简介
}
