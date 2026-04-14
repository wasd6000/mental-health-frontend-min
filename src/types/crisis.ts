// src/types/crisis.ts - 危机管理完整类型定义

// 危机等级枚举
export type CrisisLevelType = 'red' | 'orange' | 'yellow' | 'blue' | 'green'

// 危机状态枚举
export type CrisisStatusType = 'pending' | 'processing' | 'intervening' | 'tracking' | 'closed' | 'cancelled'

// 危机类型枚举
export type CrisisTypeCode = 'suicide' | 'self_harm' | 'depression' | 'anxiety' | 'mental' | 'violence' | 'other'

// 危机等级配置
export interface CrisisLevelConfig {
  value: CrisisLevelType
  label: string
  shortLabel: string
  description: string
  color: string
  bgColor: string
  priority: number
  responseTime: string
  interventionMeasures: string[]
}

// 危机等级配置表
export const CRISIS_LEVELS: CrisisLevelConfig[] = [
  {
    value: 'red',
    label: '红色 - 极高危',
    shortLabel: '极高危',
    description: '出现严重自伤或伤人倾向，需要紧急干预',
    color: '#dc2626',
    bgColor: '#fef2f2',
    priority: 1,
    responseTime: '立即响应（15分钟内）',
    interventionMeasures: ['立即启动危机干预小组', '24小时陪护', '通知家长', '联系医疗机构', '报告学校主管部门']
  },
  {
    value: 'orange',
    label: '橙色 - 高危',
    shortLabel: '高危',
    description: '情绪极度不稳定，有自伤风险',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    priority: 2,
    responseTime: '2小时内响应',
    interventionMeasures: ['启动危机干预', '每日跟踪', '通知家长', '安排专业咨询', '宿舍同学关注']
  },
  {
    value: 'yellow',
    label: '黄色 - 中危',
    shortLabel: '中危',
    description: '情绪困扰明显，影响学习生活',
    color: '#eab308',
    bgColor: '#fefce8',
    priority: 3,
    responseTime: '24小时内响应',
    interventionMeasures: ['安排心理咨询', '每周跟踪', '班主任关注', '建立支持网络']
  },
  {
    value: 'blue',
    label: '蓝色 - 关注',
    shortLabel: '关注',
    description: '情绪波动，能正常学习生活但需关注',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    priority: 4,
    responseTime: '3天内响应',
    interventionMeasures: ['定期访谈', '心理健康教育', '同伴支持']
  },
  {
    value: 'green',
    label: '绿色 - 正常',
    shortLabel: '正常',
    description: '情绪稳定，学习生活正常',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    priority: 5,
    responseTime: '常规关注',
    interventionMeasures: ['日常关怀', '心理健康宣传']
  }
]

// 危机类型配置
export interface CrisisTypeConfig {
  value: CrisisTypeCode
  label: string
  description: string
  icon: string
}

export const CRISIS_TYPES: CrisisTypeConfig[] = [
  { value: 'suicide', label: '自杀倾向', description: '有自杀想法或计划', icon: 'Warning' },
  { value: 'self_harm', label: '自伤行为', description: '有自伤行为或倾向', icon: 'FirstAidKit' },
  { value: 'depression', label: '严重抑郁', description: '严重抑郁症状', icon: 'Cloudy' },
  { value: 'anxiety', label: '严重焦虑', description: '严重焦虑症状', icon: 'Lightning' },
  { value: 'mental', label: '精神障碍', description: '疑似或确诊精神障碍', icon: 'MagicStick' },
  { value: 'violence', label: '暴力倾向', description: '有暴力行为或倾向', icon: 'WarnTriangleFilled' },
  { value: 'other', label: '其他', description: '其他心理危机', icon: 'More' }
]

// 危机状态配置
export interface CrisisStatusConfig {
  value: CrisisStatusType
  label: string
  color: string
  tagType: 'danger' | 'warning' | 'info' | 'success' | ''
}

export const CRISIS_STATUS: CrisisStatusConfig[] = [
  { value: 'pending', label: '待审批', color: '#f59e0b', tagType: 'warning' },
  { value: 'processing', label: '处理中', color: '#3b82f6', tagType: '' },
  { value: 'intervening', label: '干预中', color: '#ef4444', tagType: 'danger' },
  { value: 'tracking', label: '跟踪中', color: '#8b5cf6', tagType: 'info' },
  { value: 'closed', label: '已结案', color: '#16a34a', tagType: 'success' },
  { value: 'cancelled', label: '已取消', color: '#94a3b8', tagType: 'info' }
]

// 学生基本信息
export interface StudentBasicInfo {
  id: string
  studentId: string
  name: string
  gender: '男' | '女'
  age?: number
  phone: string
  email?: string
  college: string
  major: string
  className: string
  grade: string
  dorm: string
  avatar?: string
}

// 紧急联系人信息
export interface EmergencyContact {
  name: string
  relation: string
  phone: string
  isNotified: boolean
  notifiedTime?: string
}

// 危机等级变更记录
export interface CrisisLevelHistory {
  id: string
  fromLevel: CrisisLevelType | null
  toLevel: CrisisLevelType
  reason: string
  operator: string
  operatorRole: string
  operateTime: string
  attachments?: string[]
}

// 干预记录
export interface InterventionRecord {
  id: string
  crisisId: string
  type: 'talk' | 'phone' | 'visit' | 'meeting' | 'medical' | 'other'
  typeLabel: string
  content: string
  participants: string[]
  result: string
  nextPlan?: string
  operator: string
  operatorRole: string
  createTime: string
  attachments?: string[]
}

// 干预团队成员
export interface InterventionTeamMember {
  id: string
  name: string
  role: string
  phone: string
  email?: string
  isLeader: boolean
  joinTime: string
}

// 审批记录
export interface ApprovalRecord {
  id: string
  crisisId: string
  approver: string
  approverRole: string
  action: 'approve' | 'reject' | 'transfer'
  actionLabel: string
  comment: string
  createTime: string
}

// 危机个案完整数据
export interface CrisisCase {
  id: string
  caseNo: string
  studentInfo: StudentBasicInfo
  emergencyContacts: EmergencyContact[]
  level: CrisisLevelType
  levelHistory: CrisisLevelHistory[]
  type: CrisisTypeCode
  typeLabel: string
  status: CrisisStatusType
  statusLabel: string
  description: string
  discoverTime: string
  discoverSource: string
  reporterId: string
  reporterName: string
  reporterRole: string
  reportTime: string
  initialMeasures: string
  interventionTeam: InterventionTeamMember[]
  interventionRecords: InterventionRecord[]
  approvalRecords: ApprovalRecord[]
  relatedAssessments?: string[]
  relatedAppointments?: string[]
  attachments?: string[]
  riskFactors?: string[]
  protectiveFactors?: string[]
  summary?: string
  closeTime?: string
  closeReason?: string
  createdAt: string
  updatedAt: string
}

// 危机列表查询参数
export interface CrisisQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  level?: CrisisLevelType | ''
  status?: CrisisStatusType | ''
  type?: CrisisTypeCode | ''
  college?: string
  startDate?: string
  endDate?: string
  reporterId?: string
}

// 危机上报表单
export interface CrisisReportForm {
  reportType: 'self' | 'other'
  studentId: string
  studentName: string
  gender: string
  college: string
  major: string
  className: string
  phone: string
  dorm: string
  level: CrisisLevelType
  type: CrisisTypeCode
  discoverTime: string
  description: string
  initialMeasures: string
  emergencyContact: string
  emergencyPhone: string
  emergencyRelation: string
  isNotifiedParent: boolean
  isEmergency: boolean
  attachments?: string[]
}

// 等级调整表单
export interface LevelAdjustForm {
  crisisId: string
  currentLevel: CrisisLevelType
  newLevel: CrisisLevelType
  reason: string
  attachments?: string[]
}

// 干预记录表单
export interface InterventionForm {
  crisisId: string
  type: InterventionRecord['type']
  content: string
  participants: string[]
  result: string
  nextPlan?: string
  attachments?: string[]
}

// 危机统计数据
export interface CrisisStatistics {
  total: number
  byLevel: Record<CrisisLevelType, number>
  byStatus: Record<CrisisStatusType, number>
  byType: Record<CrisisTypeCode, number>
  byCollege: { name: string; count: number; levelDistribution: Record<CrisisLevelType, number> }[]
  trend: { date: string; count: number; levelDistribution: Record<CrisisLevelType, number> }[]
  avgResponseTime: number
  avgInterventionDays: number
  closedRate: number
}

// 工具函数：获取等级配置
export function getLevelConfig(level: CrisisLevelType): CrisisLevelConfig | undefined {
  return CRISIS_LEVELS.find(l => l.value === level)
}

// 工具函数：获取状态配置
export function getStatusConfig(status: CrisisStatusType): CrisisStatusConfig | undefined {
  return CRISIS_STATUS.find(s => s.value === status)
}

// 工具函数：获取类型配置
export function getTypeConfig(type: CrisisTypeCode): CrisisTypeConfig | undefined {
  return CRISIS_TYPES.find(t => t.value === type)
}
