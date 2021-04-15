'use strict';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import createError from 'http-errors';
import { Item } from '../models/Item';
import { ItemService } from '../services/ItemService';
import { ItemServiceImpl } from '../services/ItemServiceImpl';

const itemService: ItemService = new ItemServiceImpl(new DynamoDBClient({}))

const inputSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 30 },
        description: { type: 'string', minLength: 1, maxLength: 300 },
        tags: { type: 'array', items: { type: 'string', minLength: 1, maxLength: 15 } },
        status: { type: 'string', minLength: 1, maxLength: 15 },
      },
      required: ['name', 'description', 'tags', 'status']
    },
    pathParameters: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 1 }
      },
      required: ['id']
    }
  }
}

const updateItem = async (event) => {

  const item: Item = {
    id: event.pathParameters.id,
    name: event.body.name,
    description: event.body.description,
    tags: event.body.tags,
    status: event.body.status,
    modified: new Date(),
    created: new Date() //this is ignored in updateItem
  }

  let newItem: Item
  try {
    newItem = await itemService.updateItem(item)
  } catch (error) {
    console.error(error)
    throw new createError(500)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(newItem),
  }
}

const handler = middy(updateItem)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = { handler }