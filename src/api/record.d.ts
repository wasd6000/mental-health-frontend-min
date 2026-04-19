// src/api/record.d.ts
export interface RecordParams {
  counselorId?: string
  studentId?: string
  page?: number
  pageSize?: number
  [key: string]: any
}

export function getCounselorRecords(params?: RecordParams): Promise<any>
export function getStudentRecords(params?: RecordParams): Promise<any>
export function getRecordDetail(id: string): Promise<any>
export function createRecord(data: any): Promise<any>
export function updateRecord(id: string, data: any): Promise<any>
export function autosaveRecord(data: any): Promise<any>
