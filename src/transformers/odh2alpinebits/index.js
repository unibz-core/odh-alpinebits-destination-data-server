const transformEvent = require('./event.transform');
const transformLift = require('./lift.transform');
const transformTrail = require('./trail.transform');
const transformSnowpark = require('./snowpark.transform');
const transformMountainArea = require('./mountainarea.transform');
const transformEventSeries = require('./event-series.transform');

function transformArray(odhData, request, transformFn) {
  let data = [];
  let includedMap = {};
  
  for (object of odhData.Items){
    let resource = transformFn(object, includedMap, request);
    data.push(resource);
  }

  filterSelectedFields(data, request);

  const included = getIncludedArray(includedMap);
  const { meta, links } = createPaginationObjects(odhData, request);

  return ({
    meta,
    links,
    data,
    included
  });
}


function transformObject(odhData, request, transformFn) {
  let includedMap = {};
  let data = transformFn(odhData, includedMap, request);
  const included = getIncludedArray(includedMap);
  filterSelectedFields(data, request);

  return ({
    data,
    included
  });
}

function getIncludedArray(includedMap) {
  let included = []
  
  Object.values(includedMap).forEach( 
    (resourceMap) => {
      included = included.concat(Object.values(resourceMap));
    }
  );

  return included;
}

function createPaginationObjects (odhData, request) {
  const { selfUrl } = request;

  let count = odhData.TotalResults;
  let current = odhData.CurrentPage;
  let last = pages = odhData.TotalPages;
  let next = (current < last) ? current+1 : last;
  let first = 1;
  let prev = 1;

  if(current > 1) {
    if(current <= last)
      prev = current-1;
    else
      prev = last;
  }

  let meta = {
    count,
    pages
  };

  let links;
  let regex = /page\[number\]=[0-9]+/
  let pageQueryStr = 'page[number]='

  if(!selfUrl.match(regex)){
    regexParams = /page|include|fields/
    hasParams = !!selfUrl.match(regexParams);

    links = {
      first: selfUrl + (hasParams ? '&' : '?') + pageQueryStr + first,
      last: selfUrl + (hasParams ? '&' : '?') + pageQueryStr + last,
      next: selfUrl + (hasParams ? '&' : '?') + pageQueryStr + next,
      prev: selfUrl + (hasParams ? '&' : '?') + pageQueryStr + prev,
      self: selfUrl + (hasParams ? '&' : '?') + pageQueryStr + current,
    }
  }
  else
    links = {
      first: selfUrl.replace(regex, pageQueryStr + first),
      last: selfUrl.replace(regex, pageQueryStr + last),
      next: selfUrl.replace(regex, pageQueryStr + next),
      prev: selfUrl.replace(regex, pageQueryStr + prev),
      self: selfUrl.replace(regex, pageQueryStr + current),
    }

  return { meta, links} ;
}

function filterSelectedFields(data, request){
  const fields = request.query.fields;

  if(!Object.keys(fields).length===0)
    return;

  if(Array.isArray(data))
    data.forEach(resource => filterSelectedFieldsFromResource(resource, fields))
  else
    filterSelectedFieldsFromResource(data, fields)
}

function filterSelectedFieldsFromResource(resource, fields){
  let selectedFields = fields[resource.type]
  if(!selectedFields)
    return;

  let attributes = resource.attributes;
  Object.keys(attributes).forEach(attrName => {
    if(!selectedFields.includes(attrName))
      delete attributes[attrName];   
  })

  if(Object.keys(attributes).length===0)
    resource.attributes = null;

  let relationships = resource.relationships;
  Object.keys(relationships).forEach(attrName => {
    if(!selectedFields.includes(attrName))
      delete relationships[attrName];   
  })

  if(Object.keys(relationships).length===0)
    resource.relationships = null

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
