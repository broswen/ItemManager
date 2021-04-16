'use strict';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import createError from 'http-errors';
import { ReportNotFoundError } from '../../models/Errors';
import { ReportService } from '../../services/ReportService';
import { ReportServiceImpl } from '../../services/ReportServiceImpl';


const reportService: ReportService = new ReportServiceImpl(new DynamoDBClient({}), new S3Client({}))

const inputSchema = {
  type: 'object',
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 1, maxLength: 30 },
      },
      required: ['id']
    }
  }
}

const getReportUrl = async (event) => {

  let url: string
  try {
    url = await reportService.getReportUrl(event.pathParameters.id)
  } catch (error) {
    console.error(error)

    if (error instanceof ReportNotFoundError) {
      throw new createError(404)
    }

    throw new createError(500)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ url }),
  }
}

const handler = middy(getReportUrl)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = { handler }