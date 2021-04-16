import { DynamoDBClient, GetItemCommand, GetItemCommandInput, GetItemCommandOutput, PutItemCommand, PutItemCommandInput, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, GetObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { ReportNotFoundError, ServiceError } from "../models/Errors";
import { Report, ReportStatus } from "../models/Report";
import { ReportService } from "./ReportService";
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


export class ReportServiceImpl implements ReportService {
    ddbClient: DynamoDBClient
    s3Client: S3Client
    constructor(ddbClient: DynamoDBClient, s3Client?: S3Client) {
        this.ddbClient = ddbClient
        if (s3Client !== undefined) {
            this.s3Client = s3Client
        }
    }
    // put report in dynamodb to asynchronously start report
    // generate id, startdate, stopdate, status = starting
    async startReport(id: string, itemIds: string[]): Promise<string> {
        const params: PutItemCommandInput = {
            TableName: process.env.REPORTSTABLE,
            Item: {
                PK: {
                    S: `R#${id}`
                },
                SK: {
                    S: `R#${id}`
                },
                id: {
                    S: id
                },
                itemIds: {
                    L: itemIds.map(id => ({ S: id }))
                },
                status: {
                    S: 'STARTING'
                },
                created: {
                    S: new Date().toISOString()
                },
                s3Key: {
                    S: ''
                }
            }
        }

        let response: PutItemCommandOutput
        try {
            response = await this.ddbClient.send(new PutItemCommand(params))
        } catch (error) {
            throw error
        }

        return id
    }
    // return report item by id
    async getReportStatus(id: string): Promise<Report> {
        const params: GetItemCommandInput = {
            TableName: process.env.REPORTSTABLE,
            Key: {
                PK: {
                    S: `R#${id}`
                },
                SK: {
                    S: `R#${id}`
                }
            }
        }

        let response: GetItemCommandOutput
        try {
            response = await this.ddbClient.send(new GetItemCommand(params))
        } catch (error) {
            throw error
        }

        if (response.Item === undefined) {
            throw new ReportNotFoundError()
        }

        const report: Report = {
            id: response.Item.id.S,
            itemIds: response.Item.itemIds.L.map(val => val.S),
            status: response.Item.status.S as ReportStatus,
            s3Key: response.Item.s3Key.S,
            created: new Date(response.Item.created.S)
        }

        return report
    }

    //get s3key from from report id, generate presigned for 10min and return
    async getReportUrl(id: string): Promise<string> {
        if (this.s3Client === undefined) {
            throw new ServiceError('S3Client is undefined')
        }

        const report: Report = await this.getReportStatus(id)
        console.log(report)

        if (report.s3Key === '') {
            return ''
        }

        const params: GetObjectCommandInput = {
            Bucket: process.env.REPORTSBUCKET,
            Key: report.s3Key
        }

        const getObjectCommand: GetObjectCommand = new GetObjectCommand(params)

        const url = await getSignedUrl(this.s3Client, getObjectCommand, { expiresIn: 60 * 10 })

        return url
    }
}