const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const { basicSchemaTests } = require('./route.schema.test');

const validator = require('../src/validator');
const validate = validator.validateEventSeriesArray;

let opts = {
  route: 'eventSeries',
  resourceType: 'eventSeries',
  sampleAttributes: ['name','frequency'],
  sampleRelationships: ['multimediaDescriptions'],
  schema: {
    validate,
    pageStart: 1,
    pageEnd: 1,
    pageSize: 50
  }
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
