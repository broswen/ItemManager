'use strict';

import { DynamoDBClient, UpdateItemCommand, UpdateItemCommandInput, UpdateItemCommandOutput } from "@aws-sdk/client-dynamodb";

const ddbClient: DynamoDBClient = new DynamoDBClient({})


module.exports.handler = async (event: { id: string, s3Key: string }) => {
  console.log(event)

  const params: UpdateItemCommandInput = {
    TableName: process.env.REPORTSTABLE,
    Key: {
      PK: {
        S: `R#${event.id}`
      },
      SK: {
        S: `R#${event.id}`
      }
    },
    UpdateExpression: 'SET #s = :s',
    ExpressionAttributeNames: {
      '#s': 'status'
    },
    ExpressionAttributeValues: {
      ':s': {
        S: 'COMPLETED'
      }
    }
  }

  let response: UpdateItemCommandOutput
  try {
    response = await ddbClient.send(new UpdateItemCommand(params))
  } catch (error) {
    console.error(error)
    throw error
  }

  return event
}