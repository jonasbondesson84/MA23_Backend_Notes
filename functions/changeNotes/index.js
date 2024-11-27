import middy from '@middy/core';
import { sendResponse } from '../../responses';
import validator from '@middy/validator';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { validateToken } from '../middleware/auth';
import AWS from 'aws-sdk';
import {eventSchema} from '../../schemas/changeNotes/schema'
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
const db = new AWS.DynamoDB.DocumentClient();

const editNote =  async (event, context) => {
   
    
    if(event.error && event.error === '401') {
        throw new createHttpError.Unauthorized('Invalid token');
        // return sendResponse(401, {success: false, message: "Invalid token"});
    }
    
    const userID = event.id;
    const {noteTitle, noteText, noteID} = event.body;
    const updatedAt = new Date().toISOString();
    const updatedItem = {noteTitle: noteTitle,
        noteText: noteText
        };
  
    try {
        const params = {
            TableName: 'notes-db',
            Key: {
                id: noteID
            },
            UpdateExpression: 'set noteTitle = :newTitle, noteText = :newText, modifiedAt = :modifiedAt',  
            // ExpressionAttributeNames: {
            //     '#title': 'title',
            //     '#text' : 'text'

            // },
            ExpressionAttributeValues: {
                ':newTitle': noteTitle,
                ':newText': noteText,
                ':modifiedAt': updatedAt,
            },
            ReturnValues: 'UPDATED_NEW'
          };
          const result = await db.update(params).promise();
          return sendResponse(200, {success: true, message: "Item updated."})
        
    
        
    } catch (error) {
        throw new createHttpError.InternalServerError('Database error');
        // return sendResponse(500, {message: error})
    }
}

const handler = middy(editNote)
    .use(httpJsonBodyParser())
    .use(validateToken)
    .use(validator({eventSchema}))
    .use(httpErrorHandler());

module.exports = {handler}
