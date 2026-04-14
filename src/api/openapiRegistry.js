/**
 * 按 openapi.json 自动生成的 API 封装，与后端路径一一对应。
 * 运行 scripts/gen-openapi-registry.mjs 重新生成。
 */
import request from './request.js'

function activityIdQueryConfig(data, config = {}) {
  const d = data && typeof data === 'object' ? data : {}
  const activityId = d.activityId ?? d.id ?? ''
  return {
    ...config,
    params: { ...config.params, activityId },
  }
}

/** 后端为 @RequestParam activityId，勿将 JSON 作为 body */
export function post_api_activity_cancel(data, config = {}) {
  return request.post('/api/activity/cancel', null, activityIdQueryConfig(data, config))
}
export function post_api_activity_checkin(data, config = {}) {
  return request.post('/api/activity/checkin', null, activityIdQueryConfig(data, config))
}
export function get_api_activity_detail(params, config = {}) { return request.get('/api/activity/detail', { ...config, params }) }
export function post_api_activity_join(data, config = {}) {
  return request.post('/api/activity/join', null, activityIdQueryConfig(data, config))
}
export function get_api_activity_list(params, config = {}) { return request.get('/api/activity/list', { ...config, params }) }
export function get_api_activity_my(params, config = {}) { return request.get('/api/activity/my', { ...config, params }) }
export function get_api_activity_my_list(params, config = {}) { return request.get('/api/activity/my-list', { ...config, params }) }
export function post_api_activity_signup(data, config = {}) {
  return request.post('/api/activity/signup', null, activityIdQueryConfig(data, config))
}
export function get_api_admin_stats_overview(params, config = {}) { return request.get('/api/admin/stats/overview', { ...config, params }) }
export function get_api_admin_student_list(params, config = {}) { return request.get('/api/admin/student/list', { ...config, params }) }
export function get_api_admin_user_list(params, config = {}) { return request.get('/api/admin/user/list', { ...config, params }) }
export function post_api_appointment_cancel(data, config = {}) { return request.post('/api/appointment/cancel', data, config) }
export function post_api_appointment_confirm(data, config = {}) { return request.post('/api/appointment/confirm', data, config) }
export function get_api_appointment_detail(params, config = {}) { return request.get('/api/appointment/detail', { ...config, params }) }
export function get_api_appointment_list(params, config = {}) { return request.get('/api/appointment/list', { ...config, params }) }
export function post_api_appointment_mark_no_show(data, config = {}) { return request.post('/api/appointment/mark-no-show', data, config) }
export function get_api_appointment_my_list(params, config = {}) { return request.get('/api/appointment/my-list', { ...config, params }) }
export function post_api_appointment_reject(data, config = {}) { return request.post('/api/appointment/reject', data, config) }
export function post_api_appointment_submit(data, config = {}) { return request.post('/api/appointment/submit', data, config) }
export function get_api_assessment_detail(params, config = {}) { return request.get('/api/assessment/detail', { ...config, params }) }
export function get_api_assessment_export(params, config = {}) { return request.get('/api/assessment/export', { ...config, params }) }
export function post_api_assessment_export(data, config = {}) { return request.post('/api/assessment/export', data, config) }
export function get_api_assessment_list(params, config = {}) { return request.get('/api/assessment/list', { ...config, params }) }
export function get_api_assessment_my(params, config = {}) { return request.get('/api/assessment/my', { ...config, params }) }
export function get_api_assessment_my_list(params, config = {}) { return request.get('/api/assessment/my-list', { ...config, params }) }
export function post_api_assessment_plan_create(data, config = {}) { return request.post('/api/assessment/plan/create', data, config) }
export function get_api_assessment_result(params, config = {}) { return request.get('/api/assessment/result', { ...config, params }) }
export function post_api_assessment_start(data, config = {}) { return request.post('/api/assessment/start', data, config) }
export function post_api_assessment_submit(data, config = {}) { return request.post('/api/assessment/submit', data, config) }
export function post_api_auth_register(data, config = {}) { return request.post('/api/auth/register', data, config) }
export function post_api_auth_send_sms(data, config = {}) { return request.post('/api/auth/send-sms', data, config) }
export function post_api_bind_confirm_studentId(data, config = {}, studentId) { return request.post(`/api/bind/confirm/${encodeURIComponent(studentId)}`, data, config) }
export function post_api_bind_reject_studentId(data, config = {}, studentId) { return request.post(`/api/bind/reject/${encodeURIComponent(studentId)}`, data, config) }
export function get_api_bind_status_studentId(studentId, config = {}) { return request.get(`/api/bind/status/${encodeURIComponent(studentId)}`, config) }
export function get_api_case_list(params, config = {}) { return request.get('/api/case/list', { ...config, params }) }
export function get_api_center_approval_consultation_list(params, config = {}) { return request.get('/api/center/approval/consultation/list', { ...config, params }) }
export function get_api_center_content_review_pending(params, config = {}) { return request.get('/api/center/content-review/pending', { ...config, params }) }
export function post_api_cms_cms_s(data, config = {}) { return request.post('/api/cms/cms-s', data, config) }
export function get_api_common_getVerificationCode(params, config = {}) { return request.get('/api/common/getVerificationCode', { ...config, params }) }
export function get_api_common_health(params, config = {}) { return request.get('/api/common/health', { ...config, params }) }
export function post_api_common_login(data, config = {}) { return request.post('/api/common/login', data, config) }
export function post_api_common_upload(data, config = {}) { return request.post('/api/common/upload', data, config) }
export function post_api_common_upload_image(data, config = {}) { return request.post('/api/common/upload/image', data, config) }
export function get_api_config_visit_form(params, config = {}) { return request.get('/api/config/visit-form', { ...config, params }) }
export function post_api_consulate_list(data, config = {}) { return request.post('/api/consulate/list', data, config) }
export function get_api_consultant_detail(params, config = {}) { return request.get('/api/consultant/detail', { ...config, params }) }
export function get_api_consultant_list(params, config = {}) { return request.get('/api/consultant/list', { ...config, params }) }
export function get_api_crisis_detail(params, config = {}) { return request.get('/api/crisis/detail', { ...config, params }) }
export function get_api_crisis_list(params, config = {}) { return request.get('/api/crisis/list', { ...config, params }) }
export function post_api_crisis_report(data, config = {}) { return request.post('/api/crisis/report', data, config) }
export function post_api_crisis_update_level(data, config = {}) { return request.post('/api/crisis/update-level', data, config) }
export function get_api_home_data(params, config = {}) { return request.get('/api/home/data', { ...config, params }) }
export function post_api_leave_apply(data, config = {}) { return request.post('/api/leave/apply', data, config) }
export function post_api_leave_approve(data, config = {}) { return request.post('/api/leave/approve', data, config) }
export function post_api_leave_cancel(data, config = {}) {
  const d = data && typeof data === 'object' ? data : {}
  const leaveId = d.leaveId ?? d.id ?? ''
  const params = { ...config.params, leaveId }
  if (d.reason != null && d.reason !== '') params.reason = d.reason
  return request.post('/api/leave/cancel', null, { ...config, params })
}
export function get_api_leave_list(params, config = {}) { return request.get('/api/leave/list', { ...config, params }) }
export function post_api_leave_reject(data, config = {}) { return request.post('/api/leave/reject', data, config) }
export function get_api_message_list(params, config = {}) { return request.get('/api/message/list', { ...config, params }) }
export function get_api_notice_list(params, config = {}) { return request.get('/api/notice/list', { ...config, params }) }
export function get_api_notice_detail(params, config = {}) { return request.get('/api/notice/detail', { ...config, params }) }
export function get_api_parent_children_activities(params, config = {}) { return request.get('/api/parent/children/activities', { ...config, params }) }
export function get_api_parent_children_appointments(params, config = {}) { return request.get('/api/parent/children/appointments', { ...config, params }) }
export function get_api_parent_children_assessments(params, config = {}) { return request.get('/api/parent/children/assessments', { ...config, params }) }
export function post_api_parent_children_bind(data, config = {}) { return request.post('/api/parent/children/bind', data, config) }
export function get_api_parent_children_detail(params, config = {}) { return request.get('/api/parent/children/detail', { ...config, params }) }
export function get_api_parent_children_list(params, config = {}) { return request.get('/api/parent/children/list', { ...config, params }) }
export function post_api_parent_children_unbind(data, config = {}) { return request.post('/api/parent/children/unbind', data, config) }
export function get_api_parent_counselor(params, config = {}) { return request.get('/api/parent/counselor', { ...config, params }) }
export function post_api_pre_assessment_submit(data, config = {}) { return request.post('/api/pre-assessment/submit', data, config) }
export function get_api_psychology_article(params, config = {}) { return request.get('/api/psychology/article', { ...config, params }) }
export function get_api_record_list(params, config = {}) { return request.get('/api/record/list', { ...config, params }) }
export function get_api_report_list(params, config = {}) { return request.get('/api/report/list', { ...config, params }) }
export function get_api_schedule_list(params, config = {}) { return request.get('/api/schedule/list', { ...config, params }) }
export function get_api_self_help_list(params, config = {}) { return request.get('/api/self-help/list', { ...config, params }) }
export function get_api_teacher_message_inbox(params, config = {}) { return request.get('/api/teacher/message/inbox', { ...config, params }) }
export function post_api_user_change_password(data, config = {}) { return request.post('/api/user/change-password', data, config) }
export function get_api_user_info(params, config = {}) { return request.get('/api/user/info', { ...config, params }) }
export function post_api_user_reset_password(data, config = {}) { return request.post('/api/user/reset-password', data, config) }
export function post_api_user_send_code(data, config = {}) { return request.post('/api/user/send-code', data, config) }
export function put_api_user_update(data, config = {}) { return request.put('/api/user/update', data, config) }

/** 全部导出名称（供脚本校验） */
export const OPENAPI_REGISTRY_KEYS = [
  "post_api_activity_cancel",
  "post_api_activity_checkin",
  "get_api_activity_detail",
  "post_api_activity_join",
  "get_api_activity_list",
  "get_api_activity_my",
  "get_api_activity_my_list",
  "post_api_activity_signup",
  "get_api_admin_stats_overview",
  "get_api_admin_student_list",
  "get_api_admin_user_list",
  "post_api_appointment_cancel",
  "post_api_appointment_confirm",
  "get_api_appointment_detail",
  "get_api_appointment_list",
  "post_api_appointment_mark_no_show",
  "get_api_appointment_my_list",
  "post_api_appointment_reject",
  "post_api_appointment_submit",
  "get_api_assessment_detail",
  "get_api_assessment_export",
  "post_api_assessment_export",
  "get_api_assessment_list",
  "get_api_assessment_my",
  "get_api_assessment_my_list",
  "post_api_assessment_plan_create",
  "get_api_assessment_result",
  "post_api_assessment_start",
  "post_api_assessment_submit",
  "post_api_auth_register",
  "post_api_auth_send_sms",
  "post_api_bind_confirm_studentId",
  "post_api_bind_reject_studentId",
  "get_api_bind_status_studentId",
  "get_api_case_list",
  "get_api_center_approval_consultation_list",
  "get_api_center_content_review_pending",
  "post_api_cms_cms_s",
  "get_api_common_getVerificationCode",
  "get_api_common_health",
  "post_api_common_login",
  "post_api_common_upload",
  "post_api_common_upload_image",
  "get_api_config_visit_form",
  "post_api_consulate_list",
  "get_api_consultant_detail",
  "get_api_consultant_list",
  "get_api_crisis_detail",
  "get_api_crisis_list",
  "post_api_crisis_report",
  "post_api_crisis_update_level",
  "get_api_home_data",
  "post_api_leave_apply",
  "post_api_leave_approve",
  "post_api_leave_cancel",
  "get_api_leave_list",
  "post_api_leave_reject",
  "get_api_message_list",
  "get_api_notice_list",
  "get_api_notice_detail",
  "get_api_parent_children_activities",
  "get_api_parent_children_appointments",
  "get_api_parent_children_assessments",
  "post_api_parent_children_bind",
  "get_api_parent_children_detail",
  "get_api_parent_children_list",
  "post_api_parent_children_unbind",
  "get_api_parent_counselor",
  "post_api_pre_assessment_submit",
  "get_api_psychology_article",
  "get_api_record_list",
  "get_api_report_list",
  "get_api_schedule_list",
  "get_api_self_help_list",
  "get_api_teacher_message_inbox",
  "post_api_user_change_password",
  "get_api_user_info",
  "post_api_user_reset_password",
  "post_api_user_send_code",
  "put_api_user_update"
]
