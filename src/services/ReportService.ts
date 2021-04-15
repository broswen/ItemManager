import { Report } from "../models/Report";

export interface ReportService {
    startReport(id: string, startDate: Date, stopDate: Date): Promise<string>
    getReportStatus(id: string): Promise<Report>
    getReportUrl(id: string): Promise<string>
}