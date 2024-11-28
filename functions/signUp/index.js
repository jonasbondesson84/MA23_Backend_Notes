import middy from '@middy/core';
import { sendResponse } from '../../responses';
import {eventSchema} from '../../schemas/signUp/schema';
import validator from '@middy/validator';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import createHttpError from 'http-errors';
import AWS from 'aws-sdk';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const db = new AWS.DynamoDB.DocumentClient();

async function checkUsername(username) {
    try {
        const params = {
            TableName: 'accounts',
            Key: {
                username: username,
            }
        }

        const result = await db.get(params).promise();
        return result.Item;

    } catch (error) {

    }
}


async function createAccount(username, hashedPassword, userID, firstname, lastname) {

    try {
        await db.put({
            TableName: 'accounts',
            Item: {
                username: username,
                userID: userID,
                password: hashedPassword,
                firstname: firstname,
                lastname: lastname
            }
        }).promise();
        
        return {success: true, userID: userID};
    } catch (error){
        console.log(error);
        return {success: false, message: "Could not create account"};
    }
}

async function signUp(username, password, firstname, lastname) {

    //check if username exists.
    

    const hashedPassword = await bcrypt.hash(password, 10);
    const userID = nanoid();
    const userExist = await checkUsername(username);

    if (userExist) 
        throw new createHttpError.BadRequest('Username is already in use');
    

    const result = await createAccount(username, hashedPassword, userID, firstname, lastname);
    return result;

}

const signUpFunction = async (event, context) => {

    const {username, password, firstname, lastname} = event.body;
    const result = await signUp(username, password, firstname, lastname);

    if (result.success)
        return sendResponse(200, result);
    else 
        throw new createHttpError.InternalServerError(result);

}

const handler = middy(signUpFunction)
    .use(httpJsonBodyParser())
    .use(validator({eventSchema}))
    .use(httpErrorHandler());

module.exports = {handler}


