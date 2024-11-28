import middy from '@middy/core';
import { sendResponse } from '../../responses';
import {eventSchema} from '../../schemas/login/schema';
import validator from '@middy/validator';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import AWS from 'aws-sdk';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const db = new AWS.DynamoDB.DocumentClient();



async function getUser(username) {

    try {
        const user = await db.get({
            TableName: 'accounts',
            Key: {
                username: username
            }
        }).promise();

        if(user?.Item)
            return user.Item;
        else 
            return false;
    
    } catch (error) {
        console.log(error);
        return false;
    }
    
}

async function login(username, password) {

    const user = await getUser(username);

    if(!user) return {success: false, message: "Incorrect username or password."}

    const correctPassword = await bcrypt.compare(password, user.password);

    if(!correctPassword) return {success: false, message: "Incorrect username or password."}

    const token = jwt.sign({id: user.userID, username: user.username}, process.env.JWT_SECRET, {expiresIn: 3600});

    return {success: true, token: token}
}

const loginFunction = async (event, context) => {
    
    const {username, password} = event.body;

    const result = await login(username, password);

    if(result.success) 
        return sendResponse(200, result);
    else 
        throw new createHttpError.InternalServerError(result);

}

const handler = middy(loginFunction)
    .use(httpJsonBodyParser())
    .use(validator({eventSchema}))
    .use(httpErrorHandler());

module.exports = {handler}