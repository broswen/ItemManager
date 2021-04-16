'use strict';

import { BatchGetItemCommand, BatchGetItemCommandInput, BatchGetItemCommandOutput, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { Report } from "../../../models/Report";
import { ReportService } from "../../../services/ReportService";
import { ReportServiceImpl } from "../../../services/ReportServiceImpl";

const s3Client: S3Client = new S3Client({})
const ddbClient: DynamoDBClient = new DynamoDBClient({})
const reportService: ReportService = new ReportServiceImpl(ddbClient)

module.exports.handler = async (event: { id: string }) => {
  console.log(event)

  const key = `${event.id}_${new Date().toISOString()}`

  console.log(key)

  let report: Report
  try {
    report = await reportService.getReportStatus(event.id)
  } catch (error) {
    console.error(error)
    throw error
  }

  // doesn't take into account 100 item batch limit
  // should check count of itemIds and loop over batches
  const params: BatchGetItemCommandInput = {
    RequestItems: {
      [process.env.ITEMSTABLE]: {
        Keys: report.itemIds.map(id => ({
          PK: {
            S: `I#${id}`
          },
          SK: {
            S: `I#${id}`
          }
        }))
      }
    }
  }

  console.log(params)

  let response: BatchGetItemCommandOutput
  try {
    response = await ddbClient.send(new BatchGetItemCommand(params))
  } catch (error) {
    console.error(error)
    throw error
  }

  // doesn't take into account file size, should use multipart if greater than 100MB
  const params2: PutObjectCommandInput = {
    Bucket: process.env.REPORTSBUCKET,
    Key: key,
    Body: Buffer.from(response.Responses[process.env.ITEMSTABLE].map(item => itemToCSV(item, false)).join('\n'))
  }

  try {
    await s3Client.send(new PutObjectCommand(params2))
  } catch (error) {
    console.error(error)
    throw error
  }

  return { id: event.id, s3Key: key }
}

const itemToCSV = (item, newline: boolean): string => {
  return `${item.id.S},${item.name.S},${item.description.S},${item.status.S},${item.created.S},${item.modified.S}${newline ? '\n' : ''}`
}