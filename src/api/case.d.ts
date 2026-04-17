// src/api/case.d.ts
export interface CaseParams {
  counselorId?: string
  page?: number
  pageSize?: number
  keyword?: string
  [key: string]: any
}

export function getCounselorCases(params?: CaseParams): Promise<any>
export function getCaseDetail(id: string): Promise<any>
export function fetchCaseDetail(id: string): Promise<any>
export function createCase(data: any): Promise<any>
export function updateCase(data: any): Promise<any>
export function fetchCaseStats(params?: Record<string, any>): Promise<any[]>
