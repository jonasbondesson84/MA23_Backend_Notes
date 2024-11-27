import {transpileSchema} from '@middy/validator/transpile';

const eventSchema = 
    transpileSchema({
    type: 'object',
    required: ['body'],
    properties: {
      body: {
        type: 'object',
        required: ['noteTitle', 'noteText', 'noteID'],
        properties: {
          noteTitle: { type: 'string' },
          noteText: { type: 'string' },
          noteID : {type: 'string'}
          // schema options https://ajv.js.org/json-schema.html#json-data-type
        }
      }
    }
  })

  module.exports = {eventSchema}