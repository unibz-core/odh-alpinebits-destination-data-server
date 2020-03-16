const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const { basicSchemaTests } = require('./route.schema.test');

const validator = require('../src/validator');
const validate = validator.validateLiftArray;

let opts = {
  route: 'lifts',
  resourceType: 'lifts',
  sampleAttributes: ['name','address','geometries','openingHours'],
  sampleRelationships: ['connections','multimediaDescriptions'],
  schema: {
    validate,
    pageStart: 1,
    pageEnd: 10,
    pageSize: 50
  }
}

// basicRouteTests(opts);
// basicResourceRouteTests(opts);
basicSchemaTests(opts);