const transformEvent = require('./event.transform');
const transformLift = require('./lift.transform');
const transformTrail = require('./trail.transform');
const transformSnowpark = require('./snowpark.transform');
const transformMountainArea = require('./mountainarea.transform');
const transformEventSeries = require('./event-series.transform');

function getIncludedArray(includedMap) {
  let included = []
  
  Object.values(includedMap).forEach( 
    (resourceMap) => {
      included = included.concat(Object.values(resourceMap));
    }
  );

  return included;
}

function transformArray(odhData, request, transformFn) {
  let data = [];
  let includedMap = {};
  
  for (object of odhData.Items){
    let resource = transformFn(object, includedMap, request);
    data.push(resource);
  }

  return ({
    data,
    included: getIncludedArray(includedMap)
  });
}

function transformObject(odhData, request, transformFn) {
  let includedMap = {};
  let data = transformFn(odhData, includedMap, request);

  return ({
    data,
    included: getIncludedArray(includedMap)
  });
}

module.exports = {
  transformEventArray: (odhData, request) => transformArray(odhData, request, transformEvent),
  transformEvent: (odhData, request) => transformObject(odhData, request, transformEvent),
  transformLiftArray: (odhData, request) => transformArray(odhData, request, transformLift),
  transformLift: (odhData, request) => transformObject(odhData, request, transformLift),
  transformTrailArray: (odhData, request) => transformArray(odhData, request, transformTrail),
  transformTrail: (odhData, request) => transformObject(odhData, request, transformTrail),
  transformSnowparkArray: (odhData, request) => transformArray(odhData, request, transformSnowpark),
  transformSnowpark: (odhData, request) => transformObject(odhData, request, transformSnowpark),
  transformMountainAreaArray: (odhData, request) => transformArray(odhData, request, transformMountainArea),
  transformMountainArea: (odhData, request) => transformObject(odhData, request, transformMountainArea),
  transformEventSeriesArray: (odhData, request) => transformArray(odhData, request, transformEventSeries),
  transformEventSeries: (odhData, request) => transformObject(odhData, request, transformEventSeries),
}
