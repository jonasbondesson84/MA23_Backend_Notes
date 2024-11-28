import middy from '@middy/core';
import { sendResponse } from '../../responses';
import { validateToken } from '../middleware/auth';
import AWS from 'aws-sdk';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';

const db = new AWS.DynamoDB.DocumentClient();

const getNotes =  async (event, context) => {
   
    
    if(event.error && event.error === '401') 
        throw new createHttpError.Unauthorized('Invalid token');
    
    const userID = event.id;

    try {
        const params = {
                    TableName: 'notes-db',
                    FilterExpression: 'userID = :value',  
                    ExpressionAttributeValues: {
                        ':value': userID
                    }
                    };
        const data = await db.scan(params).promise();
        if (data && data.Items.length > 0) {
            return sendResponse(200, {success: true, items: data.Items})
        } else {
            throw new createHttpError.NotFound('No notes found');
            // return sendResponse(400, {success: false, message: "No notes for user."})
        }
                      
    
        
    } catch (error) {
        throw new createHttpError.InternalServerError('Database error');
        // return sendResponse(500, {message: error})
    }
}

const handler = middy(getNotes)
    .use(validateToken)
    .use(httpErrorHandler())

module.exports = {handler}
