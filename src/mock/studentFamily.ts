// 学生端：发起家长绑定、查看状态（演示数据，接口就绪后对接 /api/student/parent-bind/*）

export function listStudentParentInvites() {
  return Promise.resolve({
    code: 200,
    data: [
      {
        relationId: 'inv1',
        parentId: '138****8000',
        studentId: '2024001',
        studentName: '张三',
        relationType: 'father',
        verificationStatus: 0,
        verificationInfo: '待家长在家长端确认',
        createdAt: '2026-03-28 10:20'
      },
      {
        relationId: 'inv0',
        parentId: '139****0001',
        studentId: '2024002',
        studentName: '李四',
        relationType: 'mother',
        verificationStatus: 1,
        verificationInfo: '已关联',
        createdAt: '2026-02-01 14:00'
      }
    ]
  })
}

export function createStudentParentInvite(data: {
  parentId: string
  relationType: string
}) {
  return Promise.resolve({
    code: 200,
    message: '邀请已发送，请通知家长登录确认',
    data: {
      relationId: 'inv_' + Date.now(),
      studentId: '2024001',
      studentName: '张三',
      verificationStatus: 0,
      verificationInfo: '待家长在家长端确认',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        .replace(/\.\d{3}Z$/, '')
        .trim(),
      ...data
    }
  })
}
