// 学院表类型定义，严格对齐数据库说明文档
export interface College {
  id: string; // 主键
  name: string; // 学院名称
  code?: string; // 学院代码
  campus?: string; // 所在校区
  student_count?: number; // 学生数量
  teacher_count?: number; // 辅导员数量
  has_secondary_station?: boolean; // 是否有二级辅导站
  status?: string; // active / inactive
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}
