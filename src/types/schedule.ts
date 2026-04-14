// 排班表类型定义，严格对齐数据库说明文档
export interface Schedule {
  id: string; // 主键
  counselorId: string; // 咨询师ID
  date: string; // 排班日期 YYYY-MM-DD
  status?: string; // active / cancelled
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}

// 排班时段表
export interface SchedulePeriod {
  id: string; // 主键
  schedule_id: string; // 排班ID
  create_time: string; // 开始时间
  end_time: string; // 结束时间
  status: string; // available / booked / leave / unavailable
  appointment_id?: string; // 已预约时关联
  max_seats?: number; // 1=个体，>1=团体
  booked_seats?: number; // 已约人数
  type?: string; // 个体咨询 / 团体辅导
  title?: string; // 团体活动标题
}
