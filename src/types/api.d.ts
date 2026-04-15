/**
 * API 响应统一结构类型定义
 */

export interface ApiResponse<T = any> {
  code: number
  msg?: string
  message?: string
  data: T
}

export interface PageResult<T = any> {
  list: T[]
  total: number
  page?: number
  pageSize?: number
}

export interface PageResponse<T = any> extends ApiResponse<PageResult<T>> {}

/**
 * 扩展 Axios 请求配置，支持自定义选项
 */
declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean
    token?: string
  }

  interface AxiosResponse<T = any> {
    code?: number
    msg?: string
    message?: string
    data: T
  }
}