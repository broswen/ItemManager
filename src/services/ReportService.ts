import { Report } from "../models/Report";

export interface ReportService {
    startReport(id: string, itemIds: string[]): Promise<string>
    getReportStatus(id: string): Promise<Report>
    getReportUrl(id: string): Promise<string>
}