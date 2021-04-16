'use strict';

import { SFNClient, StartExecutionCommand, StartExecutionCommandInput, StartExecutionCommandOutput } from "@aws-sdk/client-sfn";
import { DynamoDBStreamEvent } from "aws-lambda";

const sfnClient: SFNClient = new SFNClient({})


module.exports.handler = async (event: DynamoDBStreamEvent) => {

  event.Records.forEach(record => console.log(record))
  for (let record of event.Records) {
    const id: string = record.dynamodb.Keys.PK.S.split('#')[1]
    console.log(`generating report ${id}`)
    const params: StartExecutionCommandInput = {
      stateMachineArn: process.env.GENERATEREPORTSFN,
      input: JSON.stringify({ id })
    }
    let response: StartExecutionCommandOutput = await sfnClient.send(new StartExecutionCommand(params))
    console.log(response)
  }

  return 'OK'
}