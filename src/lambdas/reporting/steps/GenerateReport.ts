'use strict';

module.exports.handler = async (event: { id: string }) => {
  console.log(event)

  //TODO 
  // get list of itemIds from report item
  // get every item in itemIds
  // generate csv with items
  // upload to s3 with report id as key .csv
  // return s3Key

  return event
}