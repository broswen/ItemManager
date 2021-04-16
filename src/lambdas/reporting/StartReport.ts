'use strict';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import createError from 'http-errors';
import KSUID from 'ksuid';
import { ReportService } from '../../services/ReportService';
import { ReportServiceImpl } from '../../services/ReportServiceImpl';

const reportService: ReportService = new ReportServiceImpl(new DynamoDBClient({}))

const inputSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        itemIds: { type: 'array', items: { type: 'string', minLength: 1, maxLength: 30 } },
      },
      required: ['itemIds']
    }
  }
}

const startReport = async (event) => {

  const ksuid = await KSUID.random();
  const id: string = ksuid.string
  const now: Date = new Date()

  let reportId: string
  try {
    reportId = await reportService.startReport(id, event.body.itemIds)
  } catch (error) {
    console.error(error)
    throw new createError(500)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ reportId })
  }
}

const handler = middy(startReport)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = { handler }