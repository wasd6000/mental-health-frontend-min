// 咨询师表类型定义，严格对齐数据库说明文档
export interface Consultant {
  id: string; // 主键
  name: string; // 姓名
  campus: string; // 所在校区
  user_id?: string; // 关联users.id
  title?: string; // 咨询师头衔
  avatar?: string; // 头像
  phone?: string; // 联系电话
  specialties?: string[]; // 擅长领域
  specialty_text?: string; // 展示用，逗号分隔
  experience?: string; // 经验年限
  description?: string; // 简介
  location?: string; // 咨询地点
  room_id?: string; // 房间ID
  room_name?: string; // 房间名称
  is_part_time?: boolean; // 是否兼职
  is_secondary_station?: boolean; // 是否二级辅导站咨询师
  secondary_station_college_id?: string; // 所属二级站学院ID
  avoid_college_ids?: string[]; // 回避学院ID数组
  rating?: number; // 评分
  consultation_count?: number; // 咨询次数
  available?: boolean; // 是否可预约
  status?: string; // active
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}
