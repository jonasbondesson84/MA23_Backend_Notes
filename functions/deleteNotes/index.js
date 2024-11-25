const middy = require("@middy/core");
const { sendResponse } = require("../../responses")

const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const deleteNote =  async (event, context) => {
   
    
    if(event.error && event.error === '401') {
        return sendResponse(401, {success: false, message: "Invalid token"});
    }
    
    const userID = event.id;
    const {noteID} = JSON.parse(event.body);
  
    try {
        const params = {
                        TableName: 'notes-db',
                        Key: {
                            id: noteID
                        }
                      };
        await db.delete(params).promise();
        return sendResponse(200, {success: true, message: "Item deleted", result: result})
    } catch (error) {
        return sendResponse(400, {message: "Couldnt delete note.", error: error})
    }
}

const handler = middy(deleteNote)
    .use(validateToken)

module.exports = {handler}
