import request from './request.js'

export function getStatsOverview(params) {
  return request.get('/api/admin/stats/overview', { params })
}

export function getStatisticsFunnel(params) {
  return request.get('/api/admin/statistics/funnel', { params })
}

export function getStatisticsCollege(params) {
  return request.get('/api/admin/statistics/college', { params })
}

export function getStatisticsTrend(params) {
  return request.get('/api/admin/statistics/trend', { params })
}
