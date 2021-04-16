'use strict';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import createError from 'http-errors';
import { ReportNotFoundError } from '../../models/Errors';
import { Report } from '../../models/Report';
import { ReportService } from '../../services/ReportService';
import { ReportServiceImpl } from '../../services/ReportServiceImpl';


const reportService: ReportService = new ReportServiceImpl(new DynamoDBClient({}))

const inputSchema = {
  type: 'object',
  properties: {
    pathParemeters: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 1, maxLength: 30 },
      },
      required: ['id']
    }
  }
}

const getReportStatus = async (event) => {

  let report: Report
  try {
    report = await reportService.getReportStatus(event.pathParameters.id)
  } catch (error) {
    console.error(error)

    if (error instanceof ReportNotFoundError) {
      throw new createError(404)
    }

    throw new createError(500)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(report),
  }
}

const handler = middy(getReportStatus)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = { handler }