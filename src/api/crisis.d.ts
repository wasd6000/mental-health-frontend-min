// src/api/crisis.d.ts
export function getCrisesByConsultantAsync(counselorId: string): Promise<any>
export function getCrisisList(params?: any): Promise<any>
export function getCrisisDetail(id: string): Promise<any>
export function createCrisis(data: any): Promise<any>
export function updateCrisis(id: string, data: any): Promise<any>
