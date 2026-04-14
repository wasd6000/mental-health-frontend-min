/**
 * Axios 实例定义在 src/request.js。
 * //测试用token：全局拦截器自动加 Authorization: Bearer（匿名或正式），见 ensureAnonymousToken、setAuthToken
 * 此处重新导出，保持原有 `import request from './request.js'` 路径不变。
 */
export {
  default,
  AUTH_TOKEN_STORAGE_KEY,
  ANON_TOKEN_STORAGE_KEY,
  setAuthToken,
  getStoredAccessToken,
  clearAuthTokens,
  buildAuthHeaders,
  ensureAnonymousToken,
} from '../request.js'
