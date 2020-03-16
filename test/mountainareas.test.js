const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const validator = require('../src/validator');
const { basicSchemaTests } = require('./route.schema.test');

const validate = validator.validateMountainAreasArray;

let opts = {
  pageSize: 2,
  route: 'mountainAreas',
  resourceType: 'mountainAreas',
  sampleAttributes: ['name','address','geometries','totalTrailLength'],
  sampleRelationships: ['areaOwner','lifts','trails'],
  include: {
    relationship: 'areaOwner',
    resourceType: 'agents'
  },
  multiInclude: {
    relationships: ['lifts','trails','multimediaDescriptions'],
    resourceTypes: ['lifts','trails','mediaObjects']
  },
  selectInclude: {
    attribute: 'name',
    relationship: 'lifts',
    resourceType: 'lifts'
  },
  multiSelectInclude: [
    {
      attributes: ['name','geometries'],
      relationship: 'lifts',
      resourceType: 'lifts'
    },
    {
      attributes: ['name'],
      relationship: 'areaOwner',
      resourceType: 'agents'
    }
  ],
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
