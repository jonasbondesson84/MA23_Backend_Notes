// const { nanoid } = require("nanoid");
const { sendResponse } = require("../../responses");
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

let nanoid;
(async () => {
  const module = await import('nanoid');
  nanoid = module.nanoid;
})();

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

    const result = await createAccount(username, hashedPassword, userID, firstname, lastname);
    return result;

}

exports.handler = async (event, context) => {
    if (!nanoid) {
        const module = await import('nanoid');
        nanoid = module.nanoid;
    }

    
    const {username, password, firstname, lastname} = JSON.parse(event.body);


    const result = await signUp(username, password, firstname, lastname);

    if (result.success)
        return sendResponse(200, result);
    else 
        return sendResponse(400, result);

}