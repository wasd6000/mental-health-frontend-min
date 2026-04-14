import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

  /** 代理到后端时把 Origin/Referer 改成目标站点，避免 Spring 等框架因「来源为 dev 地址」返回 403 */
  const createBackendProxy = (rewrite) => ({
    target: proxyTarget,
    changeOrigin: true,
    ...(rewrite ? { rewrite } : {}),
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq) => {
        try {
          const u = new URL(proxyTarget)
          proxyReq.setHeader('origin', u.origin)
          proxyReq.setHeader('referer', `${u.origin}/`)
        } catch (_) {
          /* ignore */
        }
      })
    },
  })

  return {
  plugins: [vue()],
  server: {
    // 监听 0.0.0.0，避免仅用 127.0.0.1 时用 localhost/局域网 IP 访问异常
    host: true,
    port: 5173,
    strictPort: true,
    /**
     * Vite 6+ Host 校验过严会导致整站 403；开发环境允许任意 Host（勿将 dev 暴露公网）。
     * 也可在 .env 设置 __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS 追加主机名。
     */
    allowedHosts: true,
    /** 项目路径含括号/位于子目录时，放宽对上级工作区的静态资源读取，避免 /@fs 等 403 */
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), path.resolve(__dirname, '..')],
    },
    proxy: {
      '/api': createBackendProxy(),
      /** 心理百科等：前端请求 /cms/*，转发为后端 CmsController 的 /api/cms/* */
      '/cms': createBackendProxy((path) => '/api' + path),
      '/getVerificationCode': createBackendProxy(),
      '/user': createBackendProxy(),
    },
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  }
})
