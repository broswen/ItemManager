'use strict';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import createError from 'http-errors';
import { ItemNotFoundError } from '../models/Errors';
import { Item } from '../models/Item';
import { ItemService } from '../services/ItemService';
import { ItemServiceImpl } from '../services/ItemServiceImpl';

const itemService: ItemService = new ItemServiceImpl(new DynamoDBClient({}))

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

const getItem = async (event) => {

  let item: Item
  try {
    item = await itemService.getItem(event.pathParameters.id)
  } catch (error) {
    console.error(error)

    if (error instanceof ItemNotFoundError) {
      throw new createError(404)
    }

    throw new createError(500)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(item),
  }
}

const handler = middy(getItem)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = { handler }