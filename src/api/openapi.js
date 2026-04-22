import request from './request'

// Auto-generated API entry points from Default module.openapi.json
//
// Token：由 src/request.js 拦截器统一附加 Authorization: Bearer <token>（优先 localStorage auth_token，并兼容 access_token 等）。
// 调用时可传第三个参数 config，例如：
//   { token: '临时JWT' } — 仅本次请求使用该令牌
//   { skipAuth: true } — 不附加 Bearer（极少数调试场景；默认均带 Bearer）
//   { headers: { 'X-Custom': '1' } } — 合并请求头

// 报表查看
// GET /api/report/list - 报表查看
export function getReportList(params = {}, data, config = {}) {
  return request({
    url: '/api/report/list',
    method: 'get',
    params,
    ...config
  })
}

// 报告生成器
// GET /api/report/export - 导出报告文件
export function exportReportFile(params = {}, data, config = {}) {
  return request({
    url: '/api/report/export',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/report/generate - 生成报告
export function generateReport(params = {}, data, config = {}) {
  return request({
    url: '/api/report/generate',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/report/history - 获取报告历史
export function getReportHistory(params = {}, data, config = {}) {
  return request({
    url: '/api/report/history',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/report/preview - 预览报告
export function previewReport(params = {}, data, config = {}) {
  return request({
    url: '/api/report/preview',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 测评答题
// GET /api/assessment/my-list - 获取我的测评列表
export function myAssessments(params = {}, data, config = {}) {
  return request({
    url: '/api/assessment/my-list',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/assessment/result - 获取测评结果
export function getAssessmentResult(params = {}, data, config = {}) {
  return request({
    url: '/api/assessment/result',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/assessment/start - 开始测评
export function startAssessment(params = {}, data, config = {}) {
  return request({
    url: '/api/assessment/start',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/assessment/submit - 提交测评答案
export function submitAssessment(params = {}, data, config = {}) {
  return request({
    url: '/api/assessment/submit',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 测评计划
// POST /api/assessment/plan/create - 创建测评计划
export function createAssessmentPlan(params = {}, data, config = {}) {
  return request({
    url: '/api/assessment/plan/create',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/assessment/plan/list - 获取测评计划列表
export function getAssessmentPlanList(params = {}, data, config = {}) {
  return request({
    url: '/api/assessment/plan/list',
    method: 'get',
    params,
    ...config
  })
}

// 二级辅导站配置
// GET /api/admin/config/station - 获取辅导站配置
export function getStationConfig(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/station',
    method: 'get',
    params,
    ...config
  })
}

// PUT /api/admin/config/station - 保存辅导站配置
export function saveStationConfig(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/station',
    method: 'put',
    data: data ?? params,
    ...config
  })
}

// 干预团队批量调整
// GET /api/crisis/team/available-members - 获取可选团队成员
export function getAvailableTeamMembers(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/team/available-members',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/crisis/team/batch-add - 批量添加团队成员
export function batchAddTeamMembers(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/team/batch-add',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/crisis/team/batch-history - 获取批量操作历史
export function getBatchOperationHistory(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/team/batch-history',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/crisis/team/batch-remove - 批量移除团队成员
export function batchRemoveTeamMember(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/team/batch-remove',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/crisis/team/batch-replace - 批量替换干预团队
export function batchReplaceTeam(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/team/batch-replace',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/crisis/team/stats - 获取团队成员统计
export function getTeamMembersStats(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/team/stats',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 公共数据
// GET /api/common/colleges - 获取学院列表
export function getCollegeList(params = {}, data, config = {}) {
  return request({
    url: '/api/common/colleges',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/common/risk-levels - 获取风险等级配置
export function getRiskLevels(params = {}, data, config = {}) {
  return request({
    url: '/api/common/risk-levels',
    method: 'get',
    params,
    ...config
  })
}

// 活动报名与审核
// POST /api/activity/batch-review - 批量审核报名
export function batchReviewActivity(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/batch-review',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/activity/cancel - 取消报名活动
export function cancelSignup(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/cancel',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/activity/review - 审核报名
export function reviewActivityApplication(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/review',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/activity/signup - 报名活动
export function signupActivity(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/signup',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 活动发布与管理
// POST /api/activity/create - 创建活动
export function createActivity(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/create',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// PUT /api/activity/update - 编辑活动
export function updateActivity(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/update',
    method: 'put',
    data: data ?? params,
    ...config
  })
}

// 活动签到
// POST /api/activity/checkin - 学生扫码签到
export function checkInActivity(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/checkin',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/activity/generate-qrcode - 生成签到二维码
export function generateCheckInQRCode(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/generate-qrcode',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/activity/manual-checkin - 手动签到
export function manualCheckIn(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/manual-checkin',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 活动展示
// GET /api/activity/detail - 获取活动详情
export function getActivityDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/detail',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/activity/list - 获取活动列表
export function getActivityList(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/list',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/activity/my-list - 我的活动列表
export function myActivities(params = {}, data, config = {}) {
  return request({
    url: '/api/activity/my-list',
    method: 'get',
    params,
    ...config
  })
}

// 角色权限管理
// GET /api/admin/role/list - 获取角色列表
export function getRoleList(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/role/list',
    method: 'get',
    params,
    ...config
  })
}

// PUT /api/admin/role/update-permissions - 更新角色权限
export function updateRolePermissions(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/role/update-permissions',
    method: 'put',
    data: data ?? params,
    ...config
  })
}

// 节假日配置
// GET /api/admin/config/holidays - 获取节假日列表
export function getHolidayList(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/holidays',
    method: 'get',
    params,
    ...config
  })
}

// PUT /api/admin/config/holidays - 保存节假日列表
export function saveHolidayList(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/holidays',
    method: 'put',
    data: data ?? params,
    ...config
  })
}

// 科研与导入
// POST /api/admin/scale/import - 导入量表（Excel/手动）
export function importScale(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/scale/import',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/assessment/export - 科研数据导出
export function exportAssessmentData(params = {}, data, config = {}) {
  return request({
    url: '/api/assessment/export',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 量表库
// GET /api/assessment/scales - 获取量表列表
export function getScaleList(params = {}, data, config = {}) {
  return request({
    url: '/api/assessment/scales',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/assessment/scales/{scaleId} - 获取量表详情
export function getScaleDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/assessment/scales/{scaleId}',
    method: 'get',
    params,
    ...config
  })
}

// 内容互动
// POST /api/self-help/collect - 收藏文章/内容
export function collectArticle(params = {}, data, config = {}) {
  return request({
    url: '/api/self-help/collect',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/self-help/like - 点赞文章/内容
export function likeArticle(params = {}, data, config = {}) {
  return request({
    url: '/api/self-help/like',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 排班与规则
// GET /api/config/campus-rule - 获取当前校区规则
export function getCampusRule(params = {}, data, config = {}) {
  return request({
    url: '/api/config/campus-rule',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/schedule/list - 获取咨询师排班
export function getSchedule(params = {}, data, config = {}) {
  return request({
    url: '/api/schedule/list',
    method: 'get',
    params,
    ...config
  })
}

// 请假审批
// GET /api/leave/approval/list - 获取请假审批列表
export function getLeaveApprovalList(params = {}, data, config = {}) {
  return request({
    url: '/api/leave/approval/list',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/leave/approve - 通过请假
export function approveLeave(params = {}, data, config = {}) {
  return request({
    url: '/api/leave/approve',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/leave/batch-approve - 批量通过请假
export function batchApproveLeave(params = {}, data, config = {}) {
  return request({
    url: '/api/leave/batch-approve',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/leave/batch-reject - 批量驳回请假
export function batchRejectLeave(params = {}, data, config = {}) {
  return request({
    url: '/api/leave/batch-reject',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/leave/reject - 驳回请假
export function rejectLeave(params = {}, data, config = {}) {
  return request({
    url: '/api/leave/reject',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 谈话阈值配置
// GET /api/admin/config/conversation-thresholds - 获取谈话次数阈值
export function getConversationThresholds(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/conversation-thresholds',
    method: 'get',
    params,
    ...config
  })
}

// PUT /api/admin/config/conversation-thresholds - 保存谈话次数阈值
export function saveConversationThresholds(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/conversation-thresholds',
    method: 'put',
    data: data ?? params,
    ...config
  })
}

// 谈心谈话管理
// GET /api/conversation/detail - 获取谈话详情
export function getConversationDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/conversation/detail',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/conversation/list - 谈话记录列表
export function getConversationList(params = {}, data, config = {}) {
  return request({
    url: '/api/conversation/list',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/conversation/save - 创建/编辑谈话记录
export function saveConversation(params = {}, data, config = {}) {
  return request({
    url: '/api/conversation/save',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 通知公告
// GET /api/notice/detail - 获取通知详情
export function getNoticeDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/notice/detail',
    method: 'get',
    params,
    ...config
  })
}

// GET /cms/notices → /api/cms/notices 通知公告列表
export function getNoticeList(params = {}, data, config = {}) {
  const cms =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_CMS_API_PREFIX) ||
    '/cms'
  return request({
    url: `${cms}/notices`,
    method: 'get',
    params,
    ...config
  })
}

// POST /api/notice/read - 标记通知已读
export function markNoticeRead(params = {}, data, config = {}) {
  return request({
    url: '/api/notice/read',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 统计概览
// GET /api/stats/crisis - 危机统计
export function getCrisisStatistics(params = {}, data, config = {}) {
  return request({
    url: '/api/stats/crisis',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/stats/overview - 统计概览
export function getStatisticsOverview(params = {}, data, config = {}) {
  return request({
    url: '/api/stats/overview',
    method: 'get',
    params,
    ...config
  })
}

// 危机列表与详情
// GET /api/crisis/detail - 获取危机详情
export function getCrisisDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/detail',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/crisis/list - 获取危机列表
export function getCrisisList(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/list',
    method: 'get',
    params,
    ...config
  })
}

// 危机评估与干预
// POST /api/crisis/assessment - 提交危机评估
export function submitCrisisAssessment(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/assessment',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/crisis/intervention/add - 添加干预记录
export function addInterventionRecord(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/intervention/add',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/crisis/update-level - 调整危机等级
export function updateCrisisLevel(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/update-level',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 危机上报
// POST /api/crisis/report - 提交危机上报
export function submitCrisisReport(params = {}, data, config = {}) {
  return request({
    url: '/api/crisis/report',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 危机审批
// POST /api/center/approval/crisis/approve - 通过危机审批
export function approveCrisis(params = {}, data, config = {}) {
  return request({
    url: '/api/center/approval/crisis/approve',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/center/approval/crisis/list - 获取危机审批列表
export function getCrisisApprovalList(params = {}, data, config = {}) {
  return request({
    url: '/api/center/approval/crisis/list',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/center/approval/crisis/reject - 驳回危机审批
export function rejectCrisis(params = {}, data, config = {}) {
  return request({
    url: '/api/center/approval/crisis/reject',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 微课管理
// GET /api/course/detail - 微课详情
export function getMicroCourseDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/course/detail',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/course/list - 微课课程列表
export function getMicroCourseList(params = {}, data, config = {}) {
  return request({
    url: '/api/course/list',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/course/my-list - 我的课程
export function getMyCourseList(params = {}, data, config = {}) {
  return request({
    url: '/api/course/my-list',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/course/progress - 更新课程进度
export function updateCourseProgress(params = {}, data, config = {}) {
  return request({
    url: '/api/course/progress',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 系统配置
// GET /api/admin/config/system - 获取系统配置
export function getSystemConfig(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/system',
    method: 'get',
    params,
    ...config
  })
}

// PUT /api/admin/config/system - 保存系统配置
export function saveSystemConfig(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/system',
    method: 'put',
    data: data ?? params,
    ...config
  })
}

// GET /api/admin/config/teacher-query-password - 获取辅导员查询密码配置
export function getTeacherQueryPasswordConfig(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/teacher-query-password',
    method: 'get',
    params,
    ...config
  })
}

// PUT /api/admin/config/teacher-query-password - 保存辅导员查询密码配置
export function saveTeacherQueryPasswordConfig(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/teacher-query-password',
    method: 'put',
    data: data ?? params,
    ...config
  })
}

// POST /api/admin/reset/teacher-query-password - 重置辅导员查询密码
export function resetTeacherQueryPassword(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/reset/teacher-query-password',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/admin/verify/teacher-query-password - 验证辅导员查询密码
export function verifyTeacherQueryPassword(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/verify/teacher-query-password',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 消息通知
// DELETE /api/message/delete - 删除消息
export function deleteMessages(params = {}, data, config = {}) {
  return request({
    url: '/api/message/delete',
    method: 'delete',
    params,
    ...config
  })
}

// GET /api/message/list - 获取消息列表
export function getMessages(params = {}, data, config = {}) {
  return request({
    url: '/api/message/list',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/message/mark-read - 标记消息已读
export function markMessagesRead(params = {}, data, config = {}) {
  return request({
    url: '/api/message/mark-read',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/message/mark-unread - 标记消息未读
export function markMessagesUnread(params = {}, data, config = {}) {
  return request({
    url: '/api/message/mark-unread',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/message/send - 发送消息
export function sendMessage(params = {}, data, config = {}) {
  return request({
    url: '/api/message/send',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 校区规则配置
// GET /api/admin/config/campus-rules - 获取校区规则
export function getCampusRules(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/campus-rules',
    method: 'get',
    params,
    ...config
  })
}

// PUT /api/admin/config/campus-rules - 保存校区规则
export function saveCampusRules(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/config/campus-rules',
    method: 'put',
    data: data ?? params,
    ...config
  })
}

// 学生档案
// GET /api/center/archive/student/detail - 获取学生档案详情
export function getStudentArchiveDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/center/archive/student/detail',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/center/archive/students - 获取学生档案列表
export function getStudentArchiveList(params = {}, data, config = {}) {
  return request({
    url: '/api/center/archive/students',
    method: 'get',
    params,
    ...config
  })
}

// 用户管理
// GET /api/admin/user/list - 获取用户列表
export function getUserList(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/user/list',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/admin/user/reset-password - 重置密码
export function resetUserPassword(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/user/reset-password',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/admin/user/toggle-status - 启用/禁用用户
export function toggleUserStatus(params = {}, data, config = {}) {
  return request({
    url: '/api/admin/user/toggle-status',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/admin/user/create - 创建用户
export function createUser(data, config = {}) {
  return request({
    url: '/api/admin/user/create',
    method: 'post',
    data,
    ...config
  })
}

// PUT /api/admin/user/update - 更新用户
export function updateUser(data, config = {}) {
  return request({
    url: '/api/admin/user/update',
    method: 'put',
    data,
    ...config
  })
}

// DELETE /api/admin/user/delete - 删除用户
export function deleteUser(userId, config = {}) {
  return request({
    url: '/api/admin/user/delete',
    method: 'delete',
    params: { id: userId },
    ...config
  })
}

// 用户认证与个人信息
// GET /api/auth/captcha - 获取验证码
export function getVerificationCode(params = {}, data, config = {}) {
  return request({
    url: '/api/auth/captcha',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/auth/login - 登录
export function loginReal(params = {}, data, config = {}) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/auth/logout - 退出登录
export function logout(params = {}, data, config = {}) {
  return request({
    url: '/api/auth/logout',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/auth/register - 注册
export function registerReal(params = {}, data, config = {}) {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/auth/send-sms - 发送注册短信验证码
export function sendRegisterSmsCode(params = {}, data, config = {}) {
  return request({
    url: '/api/auth/send-sms',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/auth/wechat-login - 微信登录/绑定
export function wechatLogin(params = {}, data, config = {}) {
  return request({
    url: '/api/auth/wechat-login',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/auth/wechat-work - 企业微信授权地址
export function wechatWorkAuth(params = {}, data, config = {}) {
  return request({
    url: '/api/auth/wechat-work',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/user/info - 获取用户信息
export function getUserInfo(params = {}, data, config = {}) {
  return request({
    url: '/api/user/info',
    method: 'get',
    params,
    ...config
  })
}

// PUT /api/user/update - 更新用户信息
export function updateUserInfo(params = {}, data, config = {}) {
  return request({
    url: '/api/user/update',
    method: 'put',
    data: data ?? params,
    ...config
  })
}

// POST /api/user/upload-avatar - 上传头像
export function uploadAvatar(params = {}, data, config = {}) {
  return request({
    url: '/api/user/upload-avatar',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 预约排队
// POST /api/appointment/queue/cancel - 取消排队
export function cancelQueue(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/queue/cancel',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/appointment/queue/join - 加入排队
export function joinQueue(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/queue/join',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/appointment/queue/list - 获取排队列表
export function getQueueList(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/queue/list',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/appointment/queue/status - 查询排队状态
export function getQueueStatus(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/queue/status',
    method: 'get',
    params,
    ...config
  })
}

// 转介审批
// POST /api/center/approval/referral/approve - 通过转介审批
export function approveReferral(params = {}, data, config = {}) {
  return request({
    url: '/api/center/approval/referral/approve',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/center/approval/referral/list - 获取转介审批列表
export function getReferralApprovalList(params = {}, data, config = {}) {
  return request({
    url: '/api/center/approval/referral/list',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/center/approval/referral/reject - 驳回转介审批
export function rejectReferral(params = {}, data, config = {}) {
  return request({
    url: '/api/center/approval/referral/reject',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 咨询记录
// GET /api/consultation/record/detail - 获取咨询记录详情
export function getConsultationRecordDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/consultation/record/detail',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/consultation/record/save - 保存咨询记录
export function saveConsultationRecord(params = {}, data, config = {}) {
  return request({
    url: '/api/consultation/record/save',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/consultation/records - 获取咨询记录列表
export function getConsultationRecords(params = {}, data, config = {}) {
  return request({
    url: '/api/consultation/records',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/consultation/referral/apply - 发起转介申请
export function referralApply(params = {}, data, config = {}) {
  return request({
    url: '/api/consultation/referral/apply',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 咨询审批
// POST /api/center/approval/approve - 审批通过
export function approveApproval(params = {}, data, config = {}) {
  return request({
    url: '/api/center/approval/approve',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/center/approval/list - 获取审批列表
export function getApprovalList(params = {}, data, config = {}) {
  return request({
    url: '/api/center/approval/list',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/center/approval/reject - 审批拒绝
export function rejectApproval(params = {}, data, config = {}) {
  return request({
    url: '/api/center/approval/reject',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// 咨询师档案
// GET /api/center/archive/counselor/detail - 获取咨询师档案详情
export function getCounselorArchiveDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/center/archive/counselor/detail',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/center/archive/counselors - 获取咨询师档案列表
export function getCounselorArchiveList(params = {}, data, config = {}) {
  return request({
    url: '/api/center/archive/counselors',
    method: 'get',
    params,
    ...config
  })
}

// 咨询预约管理
// POST /api/appointment/cancel - 取消预约
export function cancelAppointment(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/cancel',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/appointment/confirm - 咨询师确认预约
export function confirmAppointment(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/confirm',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/appointment/detail - 获取预约详情
export function getAppointmentDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/detail',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/appointment/evaluate - 提交评价
export function submitEvaluation(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/evaluate',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/appointment/mark-no-show - 标记爽约
export function markAppointmentNoShow(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/mark-no-show',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/appointment/my-list - 获取我的预约列表
export function myAppointments(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/my-list',
    method: 'get',
    params,
    ...config
  })
}

// POST /api/appointment/reject - 咨询师拒绝预约
export function rejectAppointment(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/reject',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// POST /api/appointment/submit - 提交预约
export function submitAppointment(params = {}, data, config = {}) {
  return request({
    url: '/api/appointment/submit',
    method: 'post',
    data: data ?? params,
    ...config
  })
}

// GET /api/consultant/detail - 获取咨询师详情
export function getConsultantDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/consultant/detail',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/consultant/list - 获取咨询师列表
export function getConsultantList(params = {}, data, config = {}) {
  return request({
    url: '/api/consultant/list',
    method: 'get',
    params,
    ...config
  })
}

// 自助内容展示
// GET /api/self-help/detail - 获取文章详情
export function getSelfHelpDetail(params = {}, data, config = {}) {
  return request({
    url: '/api/self-help/detail',
    method: 'get',
    params,
    ...config
  })
}

// GET /api/self-help/list - 获取内容列表
export function getSelfHelpList(params = {}, data, config = {}) {
  return request({
    url: '/api/self-help/list',
    method: 'get',
    params,
    ...config
  })
}

export const openApiEndpointCount = 129
