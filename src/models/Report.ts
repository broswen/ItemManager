export interface Report {
    id: string
    created: Date
    s3Key: string
    itemIds: string[]
    status: ReportStatus
}


export type ReportStatus = 'STARTING' | 'RUNNING' | 'COMPLETED' | 'LOCKED'