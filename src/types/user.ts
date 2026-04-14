// 用户表类型定义，严格对齐数据库说明文档
export interface User {
  id: string; // 主键，用户唯一ID
  account: string; // 账号（学号/工号）
  password?: string; // 密码（仅 mock 测试用，可选）
  name: string; // 姓名
  role: string; // 角色
  avatar?: string; // 头像URL
  phone?: string; // 手机号
  email?: string; // 邮箱
  college?: string; // 学院名称
  college_id?: string; // 学院ID
  major?: string; // 专业
  grade?: string; // 年级
  status?: string; // active / disabled
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}
