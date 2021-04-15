export interface Report {
    id: string
    created: Date
    s3Key: string
    startDate: Date
    stopDate: Date
    status: ReportStatus
}


export type ReportStatus = 'STARTING' | 'RUNNING' | 'COMPLETED' | 'LOCKED'