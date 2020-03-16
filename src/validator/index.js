const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const eventsArraySchema = require('./schemas/events.array.schema.json');
const venueSchema = require('./schemas/venue.schema');
const agentSchema = require('./schemas/agent.schema');
const mediaObjectSchema = require('./schemas/mediaobject.schema');
const liftSchema = require('./schemas/lift.schema');
const trailSchema = require('./schemas/trail.schema');
const snowparkSchema = require('./schemas/snowpark.schema');
const mountainAreaSchema = require('./schemas/mountainarea.schema');
const eventSeriesSchema = require('./schemas/eventseries.schema');
const snowReportSchema = require('./schemas/snowreport.schema');

let ajv = new Ajv({ verbose: false });

let eventsArrayValidation = ajv.compile(eventsArraySchema);

let venueValidation = ajv.compile(venueSchema);
let mediaObjectValidation = ajv.compile(mediaObjectSchema);
let agentValidation = ajv.compile(agentSchema);
let liftValidation = ajv.compile(liftSchema);
let trailValidation = ajv.compile(trailSchema);
let snowparkValidation = ajv.compile(snowparkSchema);
let mountainAreaValidation = ajv.compile(mountainAreaSchema);
let eventSeriesValidation = ajv.compile(eventSeriesSchema);
let snowReportValidation = ajv.compile(snowReportSchema);

module.exports = {
  validateEvent: (message) => validateObject(eventValidation, message),
  validateEventArray: (message) => validate(eventsArrayValidation, message),
  validateVenueArray: (message) => validateObject(venueValidation, message),
  validateMediaObjectArray: (message) => validateObject(mediaObjectValidation, message),
  validateAgent: (message) => validateObject(agentValidation, message),
  validateAgentArray: (message) => validateObject(agentValidation, message),
  validateLift: (message) => validateObject(liftValidation, message),
  validateLiftArray: (message) => validateObject(liftValidation, message),
  validateTrail: (message) => validateObject(trailValidation, message),
  validateTrailArray: (message) => validateObject(trailValidation, message),
  validateSnowpark: (message) => validateObject(snowparkValidation, message),
  validateSnowparkArray: (message) => validateObject(snowparkValidation, message),
  validateMountainArea: (message) => validateObject(mountainAreaValidation, message),
  validateMountainAreaArray: (message) => validateObject(mountainAreaValidation, message),
  validateEventSeries: (message) => validateObject(eventSeriesValidation, message),
  validateEventSeriesArray: (message) => validateObject(eventSeriesValidation, message),
  validateSnowReport: (message) => validateObject(snowReportValidation, message),
  validateSnowReportArray: (message) => validateObject(snowReportValidation, message),
}

// function validateObject(validation, message){
//   let result = {  }
//   validate(validation, message, result);
//   return result;
// }

// function validateObject(validation, message){
//   let result = { valid: [], invalid: [] }
//   for (message of message)
//     validate(validation, message, result);
//   return result;
// }

function validate(validation, message) {
  let isValid = validation(message);

  if(isValid){
    console.log('OK: Generated message is VALID.');
  }
  else {
    console.log('ERROR: Generated message is INVALID!');
    // console.log('ERROR: '+message+' is INVALID! ' + JSON.stringify(validation.errors,null,1));
    // console.log(validation.errors);
  }

  return validation;
}
