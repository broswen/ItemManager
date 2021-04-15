'use strict';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import createError from 'http-errors';
import { ItemService } from '../services/ItemService';
import { ItemServiceImpl } from '../services/ItemServiceImpl';

const itemService: ItemService = new ItemServiceImpl(new DynamoDBClient({}))

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

const deleteItem = async (event) => {

  let id: string
  try {
    id = await itemService.deleteItem(event.pathParameters.id)
  } catch (error) {
    console.error(error)
    throw new createError(500)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      id
    }),
  }
}

const handler = middy(deleteItem)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = { handler }