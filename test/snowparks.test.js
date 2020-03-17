const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const { basicSchemaTests } = require('./route.schema.test');

const validator = require('../src/validator');
const validate = validator.validateSnowparksArray;

let opts = {
  route: 'snowparks',
  resourceType: 'snowparks',
  sampleAttributes: ['name','address','geometries','openingHours','difficulty'],
  sampleRelationships: ['connections','multimediaDescriptions'],
  schema: {
    validate,
    pageStart: 1,
    pageEnd: 10,
    pageSize: 50
  }
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
