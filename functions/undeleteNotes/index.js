import middy from '@middy/core';
import { sendResponse } from '../../responses';
import AWS from 'aws-sdk';
import {eventSchema} from '../../schemas/deleteNotes/schema';
import validator from '@middy/validator';
import { validateToken } from '../middleware/auth';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
const db = new AWS.DynamoDB.DocumentClient();

const undeleteNote =  async (event, context) => {
   
    if(event.error && event.error === '401') {
        throw new createHttpError.Unauthorized('Invalid token');
        // return sendResponse(401, {success: false, message: "Invalid token"});
    }
    
    const userID = event.id;
    const {noteID} = event.body;
    const deleteAt = null;
  
    try {
        const params = {
            TableName: 'notes-db',
            Key: {
                id: noteID
            },
            UpdateExpression: 'set deleteAt = :deleteAt',  
            ExpressionAttributeValues: {
                ':deleteAt': deleteAt,
                
            },
            ReturnValues: 'UPDATED_NEW'
          };
          const result = await db.update(params).promise();
       
        
        return sendResponse(200, {success: true, message: "Item undeleted"});
    } catch (error) {
        throw new createHttpError.InternalServerError('Database error');
        // return sendResponse(500, {message: "Couldnt delete note.", error: error})
    }
}

const handler = middy(undeleteNote)
    .use(httpJsonBodyParser())
    .use(validateToken)
    .use(validator({eventSchema}))
    .use(httpErrorHandler());

module.exports = {handler}
