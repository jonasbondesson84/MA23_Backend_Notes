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

async function checkNoteExist(id) {
    try {
        const params = {
            TableName: 'notes-db',
            Key: {
                id: id,
            }
        }

        const result = await db.get(params).promise();
        return result.Item;

    } catch (error) {

    }
}

const editNote =  async (event, context) => {
   
    
    if(event.error && event.error === '401') 
        throw new createHttpError.Unauthorized('Invalid token');
    
    const userID = event.id;
    const {noteTitle, noteText, noteID} = event.body;
    const noteExists = await checkNoteExist(noteID);

    if(!noteExists) 
        throw new createHttpError.NotFound('Note does not exist.')
    
    const updatedAt = new Date().toISOString();
  
    try {
        const params = {
            TableName: 'notes-db',
            Key: {
                id: noteID
            },
            UpdateExpression: 'set noteTitle = :newTitle, noteText = :newText, modifiedAt = :modifiedAt',  
            ExpressionAttributeValues: {
                ':newTitle': noteTitle,
                ':newText': noteText,
                ':modifiedAt': updatedAt,
            },
            ReturnValues: 'UPDATED_NEW'
          };
          const result = await db.update(params).promise();
          return sendResponse(200, {success: true, message: "Item updated.", item: result.Attributes})
        
    
        
    } catch (error) {
        throw new createHttpError.InternalServerError('Database error');
    }
}

const handler = middy(editNote)
    .use(httpJsonBodyParser())
    .use(validateToken)
    .use(validator({eventSchema}))
    .use(httpErrorHandler());

module.exports = {handler}
