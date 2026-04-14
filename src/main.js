import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { ensureAnonymousToken } from './request.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

//测试用token：先于 mount 拉取/注入匿名 JWT（.env VITE_ANONYMOUS_TOKEN 等），与 request 拦截器配合实现全局 Bearer
ensureAnonymousToken().finally(() => {
  app.mount('#app')
})

// 延迟初始化排班模板
setTimeout(() => {
  try {
    import('./mock/schedule').then(m => m.initWeekTemplate())
  } catch (e) {
    console.error('initWeekTemplate error:', e)
  }
}, 100)
