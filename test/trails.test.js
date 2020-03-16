const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const { basicSchemaTests } = require('./route.schema.test');

const validator = require('../src/validator');
const validate = validator.validateTrailArray;

let opts = {
  route: 'trails',
  resourceType: 'trails',
  sampleAttributes: ['name','address','geometries','openingHours','difficulty'],
  sampleRelationships: ['connections','multimediaDescriptions'],
  schema: {
    validate,
    pageStart: 1,
    pageEnd: 7,
    pageSize: 20
  }
}

// basicRouteTests(opts);
// basicResourceRouteTests(opts);
basicSchemaTests(opts);
