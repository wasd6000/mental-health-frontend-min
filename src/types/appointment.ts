// src/types/appointment.ts

// 预约状态枚举
export type AppointmentStatus =
  | 'draft'            // 草稿（刚创建）
  | 'info_done'        // 来访登记完成
  | 'scale_done'       // 前测量表完成
  | 'sign_done'        // 知情同意书已签署
  | 'completed'        // 整个预约完成
  | 'form_completed'   // 已完成来访登记 & 前测
  | 'consent_signed'   // 已签署知情同意书
  | 'submitted'        // 已提交
  | 'confirmed'        // 已确认
  | 'cancelled'        // 已取消
  | 'checked_in'      // 已签到
  | 'report_done'    // 咨询报告完成
  | 'closed'         // 结案


// 预约表类型定义，严格对齐数据库说明文档
export interface Appointment {
  timeline: any;
  id: string; // 主键
  studentId: string; // 学生ID
  counselorId: string; // 咨询师ID
  date: string; // 预约日期
  create_time: string; // 开始时间
  end_time: string; // 结束时间
  type: string; // student / teacher（学生自约 / 辅导员代约）
  status: string; // pending / confirmed / completed / cancelled / no_show
  student_name?: string; // 学生姓名（冗余）
  counselorName?: string; // 咨询师姓名（冗余）
  location?: string; // 地点
  campus?: string; // 校区
  form_data?: any; // 来访登记：reason, urgency, previousConsultation 等
  teacher_appointment?: {
    teacher_id: string;
    teacher_name: string;
    reason: string;
    created_at: string;
  };
  cancelled_by?: string; // 取消人
  cancel_reason?: string; // 取消原因
  cancelled_at?: string; // 取消时间
  completed_at?: string; // 完成时间
  consultation_record_id?: string; // 关联咨询记录ID
  evaluation?: {
    rating: number;
    content: string;
    anonymous: boolean;
  };
  check_in?: {
    checked: boolean;
    checked_at: string;
    method: string;
  };
  created_at?: string; // 创建时间
  updated_at?: string; // 更新时间
}

