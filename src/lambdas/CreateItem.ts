'use strict';

import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';

const inputSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 30 },
        description: { type: 'string', minLength: 1, maxLength: 30 },
        tags: { type: 'array', items: { type: 'string', minLength: 1, maxLength: 15 } },
        status: { type: 'string', minLength: 1, maxLength: 15 },
      },
      required: ['name', 'description', 'tags', 'status']
    }
  }
}

const createItem = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      }
    ),
  }
}


const handler = middy(createItem)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = { handler }