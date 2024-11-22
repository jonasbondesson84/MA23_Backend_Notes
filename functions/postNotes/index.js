const { sendResponse } = require("../../responses")

exports.handler = async (event, context) => {
    
    return sendResponse(200, {success: true});
    

}