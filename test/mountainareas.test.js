const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');

let opts = {
  route: 'mountainAreas',
  resourceType: 'mountainAreas',
  sampleAttributes: ['name','address','geometries','totalTrailLength'],
  sampleRelationships: ['areaOwner','lifts','trails'],
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
