'use strict';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import validator from '@middy/validator';
import createError from 'http-errors';
import KSUID from 'ksuid';
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
    }
  }
}

const createItem = async (event) => {

  const ksuid = await KSUID.random();
  const id: string = ksuid.string
  const now: Date = new Date()

  const item: Item = {
    id,
    name: event.body.name,
    description: event.body.description,
    tags: event.body.tags,
    status: event.body.status,
    modified: now,
    created: now
  }

  let newItem: Item
  try {
    newItem = await itemService.createItem(item)
  } catch (error) {
    console.error(error)
    throw new createError(500)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(newItem),
  }
}

const handler = middy(createItem)
  .use(jsonBodyParser())
  .use(validator({ inputSchema }))
  .use(httpErrorHandler())

module.exports = { handler }