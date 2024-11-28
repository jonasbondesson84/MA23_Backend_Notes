import middy from '@middy/core';
import { sendResponse } from '../../responses';
import validator from '@middy/validator';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { validateToken } from '../middleware/auth';
import AWS from 'aws-sdk';
import {eventSchema} from '../../schemas/postNotes/schema';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import { nanoid } from 'nanoid';
const db = new AWS.DynamoDB.DocumentClient();


const postNote =  async (event, context) => {
   
    if(event.error && event.error === '401') 
        throw new createHttpError.Unauthorized('Invalid token');
            
    const userID = event.id;

    const {noteTitle, noteText} = event.body;
    const id = nanoid();
    const createdAt = new Date().toISOString();

    const newNote = {
        id: id,
        userID: userID,
        noteTitle: noteTitle,
        noteText: noteText,
        createdAt: createdAt,
        modifiedAt: createdAt,
            
    }
    try {
        const result = await db.put({
            TableName: 'notes-db',
            Item: newNote
        }).promise();
        
        return sendResponse(200, {newNote});
    } catch (error) {
        throw new createHttpError.InternalServerError('Database error');
        // return sendResponse(500, {message: error})
    }
}

 const handler = middy(postNote)
    .use(httpJsonBodyParser())
    .use(validateToken)
    .use(validator({eventSchema}))
    .use(httpErrorHandler());

module.exports = {handler}