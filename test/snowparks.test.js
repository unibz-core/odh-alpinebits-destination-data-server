const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const { basicSchemaTests } = require('./route.schema.test');

const validator = require('../src/validator');
const validate = validator.validateSnowparkArray;

let opts = {
  route: 'snowparks',
  resourceType: 'snowparks',
  sampleAttributes: ['name','address','geometries','openingHours','difficulty'],
  sampleRelationships: ['connections','multimediaDescriptions'],
  schema: {
    validate,
    pageStart: 1,
    pageEnd: 2,
    pageSize: 20
  }
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
