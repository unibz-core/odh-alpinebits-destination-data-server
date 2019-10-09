
const { basicRouteTests } = require('./route.test');

let opts = {
  route: 'lifts',
  resourceType: 'lifts',
  sampleAttributes: ['name','address','geometries','openingHours'],
  sampleRelationships: ['connections','multimediaDescriptions'],
}

basicRouteTests(opts);
