const middy = require("@middy/core");
const { sendResponse } = require("../../responses")

const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const editNote =  async (event, context) => {
   
    
    if(event.error && event.error === '401') {
        return sendResponse(401, {success: false, message: "Invalid token"});
    }
    
    const userID = event.id;
    const {title, text, noteID} = JSON.parse(event.body);
    const updatedAt = new Date().toISOString();
    const updatedItem = {title: title,
        text: text
        };
  
    try {
        const params = {
            TableName: 'notes-db',
            Key: {
                id: noteID
            },
            UpdateExpression: 'set #title = :newTitle, #text = :newText, modifiedAt = :modifiedAt',  
            ExpressionAttributeNames: {
                '#title': 'title',
                '#text' : 'text'

            },
            ExpressionAttributeValues: {
                ':newTitle': title,
                ':newText': text,
                ':modifiedAt': updatedAt,
            },
            ReturnValues: 'UPDATED_NEW'
          };
          const result = await db.update(params).promise();
          return sendResponse(200, {success: true, message: "Item updated."})
        // const data = await db.scan(params).promise();
        // if (data && data.Items.length > 0) {
        //     return sendResponse(200, {success: true, items: data.Items})
        // } else {
        //     return sendResponse(400, {success: false, message: "No notes for user."})
        // }
                      
    
        
    } catch (error) {
        return sendResponse(400, {message: error})
    }
}

const handler = middy(editNote)
    .use(validateToken)

module.exports = {handler}
