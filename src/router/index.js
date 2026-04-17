import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/portal/Home.vue')
  },

  // 个案管理
{
  path: '/case',
  name: 'CaseList',
  redirect: '/admin/case-list',
  meta: { needAuth: true, roles: ['counselor','center','admin'] }
},
{
  path: '/case/:id',
  name: 'CaseDetail',
  component: () => import('../views/case/CaseDetail.vue'),
  meta: { needAuth: true, roles: ['counselor','center','admin'] }
},
{
  path: '/case/stats',
  name: 'CaseStats',
  component: () => import('../views/case/CaseStats.vue'),
  meta: { needAuth: true, roles: ['counselor','center','admin'] }
},

// 危机管理
{
  path: '/crisis',
  name: 'CrisisList',
  redirect: '/admin/crisis-list',
  meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
},
{
  path: '/crisis/detail',
  name: 'CrisisDetail',
  component: () => import('../views/crisis/CrisisList.vue'),
  meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
},
{
  path: '/crisis/:id',
  name: 'CrisisAssess',
  component: () => import('../views/crisis/CrisisAssess.vue'),
  meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
},
{
  path: '/crisis/intervene',
  name: 'CrisisIntervene',
  component: () => import('../views/crisis/CrisisIntervene.vue'),
  meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
},
{
  path: '/crisis/:id/intervene',
  name: 'CrisisInterveneById',
  component: () => import('../views/crisis/CrisisIntervene.vue'),
  meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
},
{
  path: '/crisis/level',
  name: 'CrisisLevel',
  component: () => import('../views/crisis/CrisisLevel.vue'),
  meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
},
{
  path: '/crisis/:id/level',
  name: 'CrisisLevelById',
  component: () => import('../views/crisis/CrisisLevel.vue'),
  meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
},
{
  path: '/crisis/:id/close',
  name: 'CrisisClose',
  component: () => import('../views/crisis/CrisisClose.vue'),
  meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
},
{
  path: '/crisis/report',
  name: 'CrisisReportForm',
  component: () => import('../views/tutor/TutorCrisisReport.vue'),
  meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
},

// 危机干预团队管理
  {
    path: '/crisis/team',
    name: 'CrisisTeam',
    component: () => import('../views/crisis/CrisisTeam.vue'),
    meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
  },

// 危机进展跟踪
  {
    path: '/crisis/progress',
    name: 'CrisisProgress',
    component: () => import('../views/crisis/CrisisProgress.vue'),
    meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
  },

// 谈话记录管理
  {
    path: '/crisis/talk-record',
    name: 'CrisisTalkRecord',
    component: () => import('../views/crisis/CrisisTalkRecord.vue'),
    meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader'] }
  },

// 知情同意书
  {
    path: '/crisis/consent',
    name: 'CrisisConsent',
    component: () => import('../views/crisis/CrisisConsent.vue'),
    meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader','student'] }
  },

// 来访登记
  {
    path: '/crisis/visit-register',
    name: 'CrisisVisitRegister',
    component: () => import('../views/crisis/CrisisVisitRegister.vue'),
    meta: { needAuth: true, roles: ['counselor','center','admin','tutor','college','leader','student'] }
  },

// 咨询师请假管理
  {
    path: '/counselor/leave/apply',
    name: 'CounselorLeaveApply',
    component: () => import('../views/counselor/CounselorLeaveApply.vue'),
    meta: { needAuth: true, roles: ['counselor'] }
  },
  {
    path: '/counselor/leave/list',
    name: 'CounselorLeaveList',
    component: () => import('../views/counselor/CounselorLeaveList.vue'),
    meta: { needAuth: true, roles: ['counselor'] }
  },
  {
    path: '/admin/leave-approval',
    name: 'CounselorLeaveApproval',
    component: () => import('../views/admin/CounselorLeaveApproval.vue'),
    meta: { needAuth: true, roles: ['center', 'admin'] }
  },

  {
    path: '/counselor/schedule',
    component: () => import('../views/counselor/ScheduleCenter.vue'),
    meta: { needAuth: true, roles: ['counselor'] }
  },

// 请假管理（个人申请仅咨询师；管理员/心理中心在 /admin/leave 审批）
{
  path: '/leave/apply',
  name: 'LeaveApply',
  component: () => import('../views/leave/LeaveApply.vue'),
  meta: { needAuth: true, roles: ['counselor'] }
},
{
  path: '/leave/list',
  name: 'LeaveList',
  redirect: '/admin/leave-list',
  meta: { needAuth: true, roles: ['counselor'] }
},

// 测评查看
{
  path: '/assessment/list',
  name: 'AssessmentList',
  redirect: '/admin/assessment-list',
  meta: { needAuth: true, roles: ['counselor','center','admin'] }
},
{
  path: '/assessment/detail/:planId',
  name: 'AssessmentPlanDetail',
  redirect: (to) => ({ path: `/admin/assessment-detail/${to.params.planId}` }),
  meta: { needAuth: true, roles: ['counselor','center','admin'] }
},

// 团体活动管理（旧路径重定向到后台内嵌页，保留左侧菜单与布局）
{
  path: '/activity/create',
  redirect: '/admin/activity-create',
},
{
  path: '/activity/manage',
  redirect: '/admin/activity-manage',
},
{
  path: '/activity/sign',
  redirect: (to) => ({ path: '/admin/activity-sign', query: to.query }),
},
{
  path: '/activity/summary',
  redirect: (to) => ({ path: '/admin/activity-summary', query: to.query }),
},
/** 打开分享链接时：/activity/join?activityId= → 学生端报名落地页（内部调 POST /api/activity/join） */
{
  path: '/activity/join',
  redirect: (to) => ({ path: '/student/activity/join', query: to.query }),
},
/** /activity/cancel?activityId= → 取消报名落地页（POST /api/activity/cancel） */
{
  path: '/activity/cancel',
  redirect: (to) => ({ path: '/student/activity/cancel', query: to.query }),
},
/** /activity/checkin?activityId= → 签到落地页（POST /api/activity/checkin） */
{
  path: '/activity/checkin',
  redirect: (to) => ({ path: '/student/activity/checkin', query: to.query }),
},

{
  path: '/login/admin',
  component: () => import('../views/login/AdminLogin.vue')
},
{
  path: '/login/user',
  component: () => import('../views/login/UserLogin.vue')
},
{
  path: '/cas/callback',
  name: 'CasCallback',
  component: () => import('../views/login/CasCallback.vue')
},

{
  path: '/login/counselor',
  component: () => import('../views/login/CounselorLogin.vue')
},

{
    path: '/wiki',
    name: 'WikiList',
    component: () => import('../views/wiki/WikiList.vue')
  },
  {
    path: '/wiki/:id',
    name: 'WikiDetail',
    component: () => import('../views/wiki/WikiDetail.vue')
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('../views/articles/ArticleList.vue')
  },
  {
    path: '/articles/:id',
    name: 'ArticleDetail',
    component: () => import('../views/articles/ArticleDetail.vue')
  },
  {
    path: '/peer-support',
    redirect: '/student/peer-support'
  },
  {
    path: '/peer-support/:id',
    redirect: (to) => `/student/peer-support/${to.params.id}`
  },
  {
    path: '/notices',
    name: 'NoticeList',
    component: () => import('../views/notices/NoticeList.vue')
  },
{
  path: '/notices/:id',
  name: 'NoticeDetail',
  component: () => import('../views/notices/NoticeDetail.vue')
},
// 学生端：侧栏布局（与后台类似的顶栏 + 左侧菜单）
{
  path: '/student',
  component: () => import('../layouts/StudentLayout.vue'),
  meta: { needAuth: true },
  children: [
    { path: '', redirect: 'dashboard' },
    { path: 'dashboard', name: 'StudentDashboard', component: () => import('../views/student/StudentDashboard.vue') },
    { path: 'peer-support/:id', name: 'StudentPeerSupportDetail', component: () => import('../views/peer/PeerSupportDetail.vue') },
    { path: 'peer-support', name: 'StudentPeerSupport', component: () => import('../views/peer/PeerSupport.vue') },
    { path: 'assessment/:id/result', name: 'AssessmentResult', component: () => import('../views/student/assessment/AssessmentResult.vue') },
    { path: 'assessment/:id', name: 'Assessment', component: () => import('../views/student/assessment/Assessment.vue') },
    { path: 'assessment', name: 'StudentAssessmentList', component: () => import('../views/student/assessment/AssessmentList.vue') },
    { path: 'activity/join', name: 'ActivityJoinLanding', component: () => import('../views/student/activity/ActivityJoinLanding.vue') },
    { path: 'activity/cancel', name: 'ActivityCancelLanding', component: () => import('../views/student/activity/ActivityCancelLanding.vue') },
    { path: 'activity/checkin', name: 'ActivityCheckinLanding', component: () => import('../views/student/activity/ActivityCheckinLanding.vue') },
    { path: 'activity/my', name: 'MyActivities', component: () => import('../views/student/activity/MyActivities.vue') },
    { path: 'activity/:id', name: 'ActivityDetail', component: () => import('../views/student/activity/ActivityDetail.vue') },
    { path: 'activity', name: 'ActivityList', component: () => import('../views/student/activity/ActivityList.vue') },
    { path: 'crisis', name: 'CrisisReport', component: () => import('../views/student/crisis/CrisisReport.vue') },
    { path: 'contact', name: 'StudentContactCounselor', component: () => import('../views/student/contact/ContactCounselor.vue') },
    { path: 'parent-binding', name: 'StudentParentBinding', component: () => import('../views/student/family/StudentParentBinding.vue') },
    { path: 'profile', name: 'Profile', component: () => import('../views/student/profile/Profile.vue') },
    { path: 'psych-profile/:id', name: 'StudentPsychProfileDetail', component: () => import('../views/student/profile/StudentPsychProfile.vue') },
    { path: 'psych-profile', name: 'StudentPsychProfile', component: () => import('../views/student/profile/StudentPsychProfile.vue') },
    { path: 'self-help/micro-course', name: 'MicroCourse', component: () => import('../views/student/selfHelp/MicroCourse.vue') },
    { path: 'self-help/music-therapy', name: 'MusicTherapy', component: () => import('../views/student/selfHelp/MusicTherapy.vue') },
    { path: 'self-help/health-course', name: 'HealthCourse', component: () => import('../views/student/selfHelp/HealthCourse.vue') },
    { path: 'self-help', name: 'SelfHelp', component: () => import('../views/student/selfHelp/SelfHelp.vue') },
  ]
},
{
  path: '/message',
  component: () => import('../layouts/StudentLayout.vue'),
  meta: { needAuth: true },
  children: [
    { path: '', name: 'MessageCenter', component: () => import('../views/message/MessageCenter.vue') }
  ]
},
{
  path: '/my-appointment',
  component: () => import('../layouts/StudentLayout.vue'),
  meta: { needAuth: true },
  children: [
    { path: '', name: 'MyAppointment', component: () => import('../views/appointment/MyAppointments.vue') }
  ]
},
{
  path: '/appointment',
  component: () => import('../layouts/StudentLayout.vue'),
  meta: { needAuth: true },
  children: [
    { path: 'select', component: () => import('../views/appointment/SelectSlot.vue'), meta: { needAuth: true } },
    { path: ':id/detail', component: () => import('../views/appointment/AppointmentDetail.vue'), meta: { needAuth: true } },
    { path: ':id', component: () => import('../views/appointment/Appointment.vue'), meta: { needAuth: true } },
  ]
},
// 家长端：侧栏布局
{
  path: '/parent',
  component: () => import('../layouts/ParentLayout.vue'),
  meta: { needAuth: true },
  children: [
    { path: '', redirect: 'dashboard' },
    { path: 'dashboard', name: 'ParentDashboard', component: () => import('../views/parent/ParentDashboard.vue') },
    { path: 'children', name: 'ChildManagement', component: () => import('../views/parent/children/ChildManagement.vue') },
    { path: 'assessment', name: 'AssessmentView', component: () => import('../views/parent/assessment/AssessmentView.vue') },
    { path: 'appointment', name: 'AppointmentView', component: () => import('../views/parent/appointment/AppointmentView.vue') },
    { path: 'activity', name: 'ActivityView', component: () => import('../views/parent/activity/ActivityView.vue') },
    { path: 'profile', name: 'ProfileView', component: () => import('../views/parent/profile/ProfileView.vue') },
    { path: 'contact', name: 'ContactCounselor', component: () => import('../views/parent/contact/ContactCounselor.vue') },
    { path: 'message', name: 'ParentMessage', component: () => import('../views/parent/message/ParentMessage.vue') },
  ]
},

// 咨询记录模块
{
  path: '/record/new',
  name: 'RecordNew',
  component: () => import('../views/record/RecordForm.vue'),
  meta: { needAuth: true, roles: ['counselor'] }
},
{
  path: '/record/:id',
  name: 'RecordView',
  component: () => import('../views/record/RecordForm.vue'),
  meta: { needAuth: true, roles: ['counselor'] }
},
{
  path: '/record/:id/edit',
  name: 'RecordEdit',
  component: () => import('../views/record/RecordForm.vue'),
  meta: { needAuth: true, roles: ['counselor'] }
},

// 记录列表页
{
  path: '/records',
  name: 'RecordList',
  component: () => import('../views/record/RecordList.vue'),
  meta: { needAuth: true, roles: ['counselor'] }
},


{
  path: '/admin',
  component: () => import('../views/admin/AdminLayout.vue'),
  meta: { needAuth: true },
  redirect: '/admin/workbench',
  children: [
    {
      path: 'workbench',
      component: () => import('../views/admin/AdminWorkbench.vue'),
      meta: { needAuth: true }
    },
    {
      path: 'time',
        component: () => import('../views/admin/TimeRule.vue'),
          meta: { 
          needAuth: true,
          roles: ['admin', 'center', 'counselor', 'tutor']
        }
      },

      {
        path: 'counselor',
        component: () => import('../views/admin/Counselor.vue'),
        meta: { needAuth: true, roles: ['center'] }
      },

      {
        path: 'schedule',
        component: () => import('../views/admin/schedule/ScheduleCenter.vue'),
        meta: { needAuth: true,roles: ['center'] }
    },

      {
      path: 'counselor-work',
      component: () => import('../views/counselor/CounselorDashboard.vue'),
      meta: { needAuth: true, roles: ['counselor'] }
    },
    {
      path: 'appointments',
      component: () => import('../views/counselor/CounselorAppointments.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center'] }
    },
    {
      path: 'consult-records',
      component: () => import('../views/counselor/ConsultRecords.vue'),
      meta: { needAuth: true, roles: ['counselor'] }
    },
    {
      path: 'consult-record-change',
      component: () => import('../views/counselor/ConsultRecordChangeRequest.vue'),
      meta: { needAuth: true, roles: ['counselor'] }
    },
    {
      path: 'activity-manage',
      name: 'AdminActivityManage',
      component: () => import('../views/activity/ActivityManage.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center', 'admin', 'tutor'] }
    },
    {
      path: 'activity-create',
      name: 'AdminActivityCreate',
      component: () => import('../views/activity/ActivityCreate.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center', 'admin', 'tutor'] }
    },
    {
      path: 'activity-sign',
      name: 'AdminActivitySign',
      component: () => import('../views/activity/ActivitySign.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center', 'admin', 'tutor'] }
    },
    {
      path: 'activity-summary',
      name: 'AdminActivitySummary',
      component: () => import('../views/activity/ActivitySummary.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center', 'admin', 'tutor'] }
    },
    {
      path: 'assessment-list',
      name: 'AdminAssessmentList',
      component: () => import('../views/assessment/AssessmentList.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center', 'admin'] }
    },
    {
      path: 'case-list',
      name: 'AdminCaseList',
      component: () => import('../views/case/CaseList.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center', 'admin'] }
    },
    {
      path: 'crisis-list',
      name: 'AdminCrisisList',
      component: () => import('../views/crisis/CrisisList.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center', 'admin', 'tutor', 'college', 'leader'] }
    },
    {
      path: 'leave-list',
      name: 'AdminLeaveList',
      component: () => import('../views/leave/LeaveList.vue'),
      meta: { needAuth: true, roles: ['counselor'] }
    },
    {
      path: 'assessment-detail/:planId',
      name: 'AdminAssessmentPlanDetail',
      component: () => import('../views/assessment/AssessmentPlanDetail.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center', 'admin'] }
    },
    {
      path: 'students',
      component: () => import('../views/admin/AdminStudents.vue'),
      meta: { needAuth: true, roles: ['admin', 'center'] }
    },
    {
      path: 'leave',
      component: () => import('../views/admin/AdminLeave.vue'),
      meta: { needAuth: true, roles: ['admin', 'center'] }
    },
    {
      path: 'crisis',
      component: () => import('../views/admin/AdminCrisis.vue'),
      meta: { needAuth: true }
    },

    {
      path: 'peer-forum',
      component: () => import('../views/admin/AdminPeerForum.vue'),
      meta: { needAuth: true, roles: ['admin', 'center', 'counselor', 'tutor', 'instructor'] }
    },

    // 心理中心端专属
    {
      path: 'center-statistics',
      component: () => import('../views/admin/CenterStatistics.vue'),
      meta: { needAuth: true, roles: ['center'] }
    },
    {
      path: 'center-report-export',
      component: () => import('../views/admin/CenterReportExport.vue'),
      meta: { needAuth: true, roles: ['center'] }
    },
    {
      path: 'center-system-monitor',
      component: () => import('../views/admin/CenterSystemMonitor.vue'),
      meta: { needAuth: true, roles: ['center'] }
    },
    {
      path: 'scale-manage',
      component: () => import('../views/admin/ScaleManage.vue'),
      meta: { needAuth: true, roles: ['center'] }
    },
    {
      path: 'interview-manage',
      component: () => import('../views/admin/InterviewManage.vue'),
      meta: { needAuth: true, roles: ['center'] }
    },

    // 系统管理员端专属
    {
      path: 'system-manage',
      component: () => import('../views/admin/AdminSystemManage.vue'),
      meta: { needAuth: true, roles: ['admin'] }
    },
    {
      path: 'data-manage',
      component: () => import('../views/admin/AdminDataManage.vue'),
      meta: { needAuth: true, roles: ['admin'] }
    },
    {
      path: 'user-manage',
      component: () => import('../views/admin/AdminUserManage.vue'),
      meta: { needAuth: true, roles: ['admin'] }
    },
    {
      path: 'assessment-system',
      component: () => import('../views/admin/AdminAssessmentSystem.vue'),
      meta: { needAuth: true, roles: ['admin'] }
    },
    {
      path: 'system-monitor',
      component: () => import('../views/admin/AdminSystemMonitor.vue'),
      meta: { needAuth: true, roles: ['admin'] }
    },

    // 辅导员端路由
    {
      path: 'tutor-workbench',
      component: () => import('../views/tutor/TutorWorkbench.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },
    {
      path: 'tutor-students',
      component: () => import('../views/tutor/TutorStudents.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },
    {
      path: 'tutor-students/:id',
      component: () => import('../views/tutor/TutorStudents.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },
    {
      path: 'tutor-crisis-report',
      component: () => import('../views/tutor/TutorCrisisReport.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },
    {
      path: 'tutor-assessment',
      component: () => import('../views/tutor/TutorAssessment.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },
    {
      path: 'tutor-report',
      component: () => import('../views/tutor/TutorReport.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },
    {
      path: 'tutor-appointment',
      component: () => import('../views/tutor/TutorAppointment.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },
    {
      path: 'tutor-interview',
      component: () => import('../views/tutor/TutorInterview.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },
    {
      path: 'tutor-conversation',
      component: () => import('../views/tutor/TutorConversation.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },
    {
      path: 'tutor-parent-message',
      component: () => import('../views/tutor/TutorParentMessage.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },
    {
      path: 'tutor-message-center',
      component: () => import('../views/message/MessageCenter.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor', 'counselor', 'center', 'admin', 'college', 'leader'] }
    },
    {
      path: 'tutor-activity-manage',
      component: () => import('../views/tutor/TutorActivityManage.vue'),
      meta: { needAuth: true, roles: ['tutor', 'instructor'] }
    },

    // 咨询师端路由
    {
      path: 'counselor-work',
      component: () => import('../views/counselor/CounselorDashboard.vue'),
      meta: { needAuth: true, roles: ['counselor'] }
    },
    {
      path: 'consult-record-change',
      component: () => import('../views/counselor/ConsultRecordChangeRequest.vue'),
      meta: { needAuth: true, roles: ['counselor'] }
    },
    {
      path: 'case-list',
      component: () => import('../views/case/CaseList.vue'),
      meta: { needAuth: true, roles: ['counselor'] }
    },
    {
      path: 'crisis-list',
      component: () => import('../views/crisis/CrisisList.vue'),
      meta: { needAuth: true, roles: ['counselor'] }
    },
    {
      path: 'leave-list',
      component: () => import('../views/counselor/CounselorLeaveList.vue'),
      meta: { needAuth: true, roles: ['counselor'] }
    },
    {
      path: 'appointments',
      component: () => import('../views/counselor/CounselorAppointments.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center'] }
    },
    {
      path: 'assessment-list',
      component: () => import('../views/assessment/AssessmentList.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center'] }
    },
    {
      path: 'activity-manage',
      component: () => import('../views/activity/ActivityManage.vue'),
      meta: { needAuth: true, roles: ['counselor', 'center'] }
    },

    // 院系领导端路由
    {
      path: 'college-workbench',
      component: () => import('../views/college/CollegeWorkbench.vue'),
      meta: { needAuth: true, roles: ['college', 'college_leader'] }
    },
    {
      path: 'college-statistics',
      component: () => import('../views/college/CollegeStatistics.vue'),
      meta: { needAuth: true, roles: ['college', 'college_leader'] }
    },
    {
      path: 'college-report',
      component: () => import('../views/college/CollegeReport.vue'),
      meta: { needAuth: true, roles: ['college', 'college_leader'] }
    },
    {
      path: 'college-crisis',
      component: () => import('../views/college/CollegeCrisis.vue'),
      meta: { needAuth: true, roles: ['college', 'college_leader'] }
    },
    {
      path: 'college-students',
      component: () => import('../views/college/CollegeStudents.vue'),
      meta: { needAuth: true, roles: ['college', 'college_leader'] }
    },
    {
      path: 'college-manage',
      component: () => import('../views/college/CollegeManage.vue'),
      meta: { needAuth: true, roles: ['college', 'college_leader'] }
    },
    {
      path: 'college-tutors',
      component: () => import('../views/college/CollegeManage.vue'),
      meta: { needAuth: true, roles: ['college', 'college_leader'] }
    },
    {
      path: 'college-message-center',
      component: () => import('../views/message/MessageCenter.vue'),
      meta: { needAuth: true, roles: ['college', 'college_leader'] }
    },

    // 校领导端路由
    {
      path: 'leader-workbench',
      component: () => import('../views/leader/LeaderWorkbench.vue'),
      meta: { needAuth: true, roles: ['leader', 'school_leader'] }
    },
    {
      path: 'leader-statistics',
      component: () => import('../views/leader/LeaderStatistics.vue'),
      meta: { needAuth: true, roles: ['leader', 'school_leader'] }
    },
    {
      path: 'leader-report',
      component: () => import('../views/leader/LeaderReport.vue'),
      meta: { needAuth: true, roles: ['leader', 'school_leader'] }
    },
    {
      path: 'leader-crisis',
      component: () => import('../views/leader/LeaderCrisis.vue'),
      meta: { needAuth: true, roles: ['leader', 'school_leader'] }
    },
    {
      path: 'leader-colleges',
      component: () => import('../views/leader/LeaderColleges.vue'),
      meta: { needAuth: true, roles: ['leader', 'school_leader'] }
    },
    {
      path: 'leader-message-center',
      component: () => import('../views/message/MessageCenter.vue'),
      meta: { needAuth: true, roles: ['leader', 'school_leader'] }
    },
    {
      path: 'todo-list',
      name: 'TodoList',
      component: () => import('../views/admin/TodoList.vue'),
      meta: {
        needAuth: true,
        roles: ['tutor', 'instructor', 'college', 'college_leader', 'leader', 'school_leader', 'counselor', 'center', 'admin']
      }
    },
    {
      path: 'permission-manage',
      name: 'PermissionManage',
      component: () => import('../views/admin/PermissionManage.vue'),
      meta: {
        needAuth: true,
        roles: ['admin']
      }
    }
  ]
}

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const needAuth = to.meta?.needAuth === true

  // 1. 管理端
if (to.path.startsWith('/admin')) {
  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('access_token')

  // 优先从 admin_role 获取，其次 user_role（这两个字段现在都来自 JWT 的 role_code）
  let role = localStorage.getItem('admin_role')
  if (!role) {
    role = localStorage.getItem('user_role')
  }

  // 允许的角色列表，包含 instructor 和 tutor（都是辅导员）
  // 包含 college_leader 和 school_leader 的兼容
  const allowRoles = ['admin', 'counselor', 'center', 'tutor', 'instructor', 'college', 'college_leader', 'leader', 'school_leader']


  // 第一层：判断是否后台用户
  if (needAuth && (!token || !allowRoles.includes(role))) {
    return next('/login/admin')
  }

  // 根据角色重定向到对应工作台
  if (to.path === '/admin' || to.path === '/admin/workbench') {
    // instructor 和 tutor 都跳转到辅导员工作台
    if (role === 'tutor' || role === 'instructor') {
      return next('/admin/tutor-workbench')
    }
    if (role === 'college' || role === 'college_leader') {
      return next('/admin/college-workbench')
    }
    if (role === 'leader' || role === 'school_leader') {
      return next('/admin/leader-workbench')
    }
  }


  // 第二层：是否有该页面权限
  const routeRoles = to.meta?.roles
  if (routeRoles && !routeRoles.includes(role)) {
    return next('/login/admin')
  }
  return next()
}


  // 2. 学生/家长端（凡是需要登录的非 admin 页面）
  if (to.path.startsWith('/appointment') || to.path.startsWith('/my-appointment') || to.path.startsWith('/student') || to.path.startsWith('/parent') || to.path === '/message' || to.path.startsWith('/message/')) {
    const token =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('User_token') ||
      localStorage.getItem('access_token')

    // 从 User_role 获取（这个字段现在来自 JWT 的 role_code）
    let role = localStorage.getItem('User_role')
    if (!role) {
      role = localStorage.getItem('user_role')
    }

    if (needAuth && (!token || !role)) {
      return next({
        path: '/login/user',
        query: { redirect: to.fullPath }
      })
    }
    return next()
  }

  // 3. 咨询师端
  if (to.path.startsWith('/counselor')) {
    const token =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('user_token') ||
      localStorage.getItem('access_token')

    // 从 user_role 获取
    let role = localStorage.getItem('user_role')
    if (!role) {
      role = localStorage.getItem('admin_role')
    }

    if (to.meta?.needAuth && (!token || role !== 'counselor')) {
      return next('/login/admin')
    }
    return next()
  }

  // 4. 咨询师个人请假（/leave/*）：仅咨询师；管理员/心理中心统一进后台审批页
  if (to.path.startsWith('/leave')) {
    const needAuth = to.meta?.needAuth === true
    if (needAuth) {
      const token =
        localStorage.getItem('auth_token') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('access_token')

      // 从 admin_role 或 user_role 获取
      let role = localStorage.getItem('admin_role')
      if (!role) {
        role = localStorage.getItem('user_role')
      }

      if (!token) {
        return next({ path: '/login/admin', query: { redirect: to.fullPath } })
      }
      if (role === 'admin' || role === 'center') {
        return next('/admin/leave')
      }
      if (role !== 'counselor') {
        return next('/admin/workbench')
      }
    }
    return next()
  }

  /*
   * 与 /admin/* 共用 JWT 的顶层业务路由（如 /case、/crisis、/assessment/list）：
   * 此前仅校验 /admin、/counselor、/leave 等前缀，导致已声明 needAuth 的页面在未带 token 时仍能通过路由，
   * 请求 /api/** 时被 Spring Security 拒绝（常见 403）。
   */
  if (needAuth && Array.isArray(to.meta?.roles) && to.meta.roles.length > 0) {
    const staffRoles = ['counselor', 'center', 'admin', 'tutor', 'instructor', 'college', 'college_leader', 'leader', 'school_leader']
    const routeNeedsStaffSession = to.meta.roles.some((r) => staffRoles.includes(r))
    if (
        routeNeedsStaffSession &&
        !to.path.startsWith('/admin') &&
        !to.path.startsWith('/counselor') &&
        !to.path.startsWith('/leave')
    ) {
      const token =
          localStorage.getItem('auth_token') ||
          localStorage.getItem('admin_token') ||
          localStorage.getItem('access_token')

      // 从 admin_role 或 user_role 获取
      let role = localStorage.getItem('admin_role')
      if (!role) {
        role = localStorage.getItem('user_role')
      }

      if (!token) {
        return next({ path: '/login/admin', query: { redirect: to.fullPath } })
      }
      if (!role || !to.meta.roles.includes(role)) {
        return next({ path: '/login/admin', query: { redirect: to.fullPath } })
      }
      return next()
    }
  }

  next();
})



export default router
