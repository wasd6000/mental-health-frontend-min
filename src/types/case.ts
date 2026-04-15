// src/types/case.js

// 危机个案表类型定义，严格对齐数据库说明文档
export interface Case {
  id: string;
  studentId: string;
  counselorId?: string;
  level?: string;
  status?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
