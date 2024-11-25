const middy = require("@middy/core");
const { sendResponse } = require("../../responses")

const { validateToken } = require("../middleware/auth");
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

const getNotes =  async (event, context) => {
   
    
    if(event.error && event.error === '401') {
        return sendResponse(401, {success: false, message: "Invalid token"});
    }
    
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
            return sendResponse(400, {success: false, message: "No notes for user."})
        }
                      
    
        
    } catch (error) {
        return sendResponse(400, {message: error})
    }
}

const handler = middy(getNotes)
    .use(validateToken)

module.exports = {handler}
