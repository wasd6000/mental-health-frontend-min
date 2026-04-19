// 消息中心路由配置
// 请在 router/index.js 中添加以下路由

{
  path: '/messages',
  name: 'NewMessageCenter',
  component: () => import('@/views/message/NewMessageCenter.vue'),
  meta: {
    title: '消息中心',
    requiresAuth: true
  }
},

// 或者替换原有的消息中心路由
// 请将原有的 /message 路由修改为：
{
  path: '/message',
  name: 'MessageCenter',
  component: () => import('@/views/message/NewMessageCenter.vue'),
  meta: {
    title: '消息中心',
    requiresAuth: true
  }
}