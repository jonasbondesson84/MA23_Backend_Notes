const middy = require("@middy/core");
const { sendResponse } = require("../../responses")

const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

let nanoid;
(async () => {
  const module = await import('nanoid');
  nanoid = module.nanoid;
})();

const postNote =  async (event, context) => {
    if (!nanoid) {
        const module = await import('nanoid');
        nanoid = module.nanoid;
    }
    
    if(event.error && event.error === '401') {
        return sendResponse(401, {success: false, message: "Invalid token"});
    }
    
    const userID = event.id;
    const username = event.username;
    const {title, text } = JSON.parse(event.body);
    const id = nanoid();
    const createdAt = new Date().toISOString();
    

    const newNote = {
        id: id,
        userID: userID,
        title: title,
        text: text,
        createdAt: createdAt,
        modifiedAt: createdAt,
        deleteAt: null,
    }

    try {
        const result = await db.put({
            TableName: 'notes-db',
            Item: newNote
        }).promise();
    
        return sendResponse(200, {newNote});
    } catch (error) {
        return sendResponse(400, {message: error})
    }
}

const handler = middy(postNote)
    .use(validateToken)

module.exports = {handler}