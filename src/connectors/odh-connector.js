const axios = require('axios');
const odh2ab = require ('../transformers/odh2alpinebits');
const errors = require ('../errors');
require('custom-env').env();

const EVENT_PATH = 'Event';
const ACTIVITY_PATH = 'Activity';
const ACTIVITY_REDUCED_PATH = 'ActivityReduced';
const SKIAREA_PATH = 'Skiarea';
const SKIAREGION_PATH = 'Skiregion';

const axiosOpts = {
  baseURL: process.env.ODH_BASE_URL,
  timeout: process.env.ODH_TIMEOUT,
}

function fetchEvents (request) {
  let path = EVENT_PATH;
  let queryArray = getPaginationQuery(request);

  if(queryArray.length)
    path+='?'+queryArray.join('&');

  return fetch(path, request, odh2ab.transformEventArray)
}

function fetchLifts (request) {
  let queryArray = getPaginationQuery(request);
  queryArray.push('odhtagfilter=aufstiegsanlagen')

  let path = ACTIVITY_PATH+'?'+queryArray.join('&');

  return fetch(path, request, odh2ab.transformLiftArray)
}

function fetchSnowparks (request) {
  let queryArray = getPaginationQuery(request);
  queryArray.push('odhtagfilter=snowpark')

  let path = ACTIVITY_PATH+'?'+queryArray.join('&');

  return fetch(path, request, odh2ab.transformSnowparkArray)
}

function fetchResourceById(resource, transform) {
  return (
    function(request) {
      let path = resource+'/'+request.params.id;
      return fetch(path, request, transform);
    }
  );
}

function fetchSubResource(resource, transform, field) {
  return (
    function(request) {
      let path = resource+'/'+request.params.id;
      return fetch(path, request, transform, field);
    }
  );
}

/*
transform(openDataHubObject): a function to transform an OpenDataHub response into the AlpineBits format
  input: an object retrieved from the OpenDataHub API
  output: an obejct following the AlpineBits format
*/

async function fetch(path, request, transform, field) {
  const instance = axios.create(axiosOpts);
  let res;

  try {
    console.log(`\n> Fetching data from ${process.env.ODH_BASE_URL+path}...`);
    res = await instance.get(path);
  }
  catch(error){
    handleConnectionError(error);
  }

  if(!res.data || res.status!==200){
    console.log('ERROR: Resource not found!');
    throw errors.notFound;
  }

  console.log('OK: Data received from the OpenDataHub API.\n');

  try {
    console.log('> Transforming data to the AlpineBits format...');
    const data = transform(res.data);
    console.log('OK: Sucessfully transformed data.\n');
    const meta = getResponseMeta(res.data);

    if(field)
      return { data: data[field], meta };

    return { data, meta };
  }
  catch(error) {
    handleTransformationError(error);
  }
}

async function fetchMountainArea(request) {
  const instance = axios.create(axiosOpts);
  let areaId = request.params.id;
  let areaRes, regionRes;

  try {
    console.log(`\n> Fetching mountain area(s) from ${process.env.ODH_BASE_URL}...`);
    let areaPath = areaId ? SKIAREA_PATH+'/'+areaId : SKIAREA_PATH;
    let regionPath = areaId ? SKIAREGION_PATH+'/'+areaId : SKIAREGION_PATH;
    [ areaRes, regionRes] = await Promise.all([instance.get(areaPath), instance.get(regionPath)]);
  }
  catch(error) {
    handleConnectionError(error);
  }

  if((!areaRes.data && !regionRes.data) || (areaRes.status!==200 && regionRes.status!==200)) {
    console.log('ERROR: Resource not found!');
    throw errors.notFound;
  }

  console.log('OK: Data received from the OpenDataHub API.\n');
  let items, res;

  if(areaId) {
    res = areaRes.data || regionRes.data;
    items = [ res ];
  }
  else {
    let areas = areaRes.data.concat(regionRes.data);
    let pageSize = request.query.page.size;
    let pageNumber = request.query.page.number;

    items = areas.slice((pageNumber-1)*pageSize, pageSize*pageNumber);
    res = {
      TotalResults: areas.length,
      TotalPages: Math.ceil(areas.length/pageSize),
      CurrentPage: pageNumber,
      Items: items
    }
  }

  try {
    let subRequests = [];
    items.forEach( area => subRequests=subRequests.concat(fetchMountainSubResources(request, area)) );
    await Promise.all(subRequests);
  }
  catch(error){
    handleConnectionError(error);
  }

  try {
    console.log('> Transforming data to the AlpineBits format...');
    const data = areaId ? odh2ab.transformMountainArea(res) : odh2ab.transformMountainAreaArray(res);
    console.log('OK: Sucessfully transformed data.\n');
    const meta =  areaId ? {} : getResponseMeta(res);
    return { data, meta };
  }
  catch(error) {
    handleTransformationError(error);
  }
}

function fetchMountainSubResources(request, area) {
  let opts = [['lifts','aufstiegsanlagen'],['snowparks','snowpark'],['trails','ski alpin,ski alpin (rundkurs),rodelbahnen,loipen']]

  return opts.map( entry => {
    let [ relationship, odhTag ] = entry;
    console.log(`> Fetching ${relationship} from ${process.env.ODH_BASE_URL}...`);

    const instance = axios.create(axiosOpts);
    const id = 'SkiRegionId' in area ? 'ska'+area.Id : 'skr'+area.Id;
    let path;

    if(relationship in request.query.include)
      path = `${ACTIVITY_PATH}?odhtagfilter=${odhTag}&areafilter=${id}&pagesize=1000`
    else
      path = `${ACTIVITY_REDUCED_PATH}?odhtagfilter=${odhTag}&areafilter=${id}`

    return instance.get(path)
      .then( res => {
        if(res.status!==200 || !res.data)
          area[relationship] = [];
        else if('Items' in res.data)
          area[relationship] = res.data.Items;
        else
          area[relationship] = res.data;

        console.log(`OK: Received the ${relationship} of area ${area.Id}.`);
      })
      .catch( error => {
        console.log(`ERROR: Failed to fetch ${relationship} for area ${area.Id}`);
        area[relationship] = [];
      });
  })
}

function handleConnectionError(error) {
  console.log(error);

  if(error.code==='ENOTFOUND'){
    console.log('ERROR: OpenDataHub API unavailable!');
    throw errors.gatewayUnavailable;
  }

  if(error.code==='ECONNABORTED'){
    console.log('ERROR: Connection to the OpenDataHub API aborted!');
    throw errors.gatewayTimeout;
  }

  console.log('ERROR: Could not connect to the OpenDataHub API!');
  throw errors.serverFailed;
}

function handleTransformationError(error) {
  console.log(error);
  console.log('ERROR: Failed to transform the input data!');
  throw errors.cantTransform;
}

function getPaginationQuery(request) {
  const { page } = request.query;
  let pageArray = []

  if (page) {
    if (page.size)
      pageArray.push('pagesize='+page.size);
    if (page.number)
      pageArray.push('pagenumber='+page.number);
  }
  return pageArray;
}

function getResponseMeta(dataOdh){
  let count = dataOdh.TotalResults;
  let current = dataOdh.CurrentPage;
  let last = pages = dataOdh.TotalPages;
  let next = (current < last) ? current+1 : last;
  let first = 1;
  let prev = 1;

  if(current > 1) {
    if(current <= last)
      prev = current-1;
    else
      prev = last;
  }

  return ({ page: { current, first, last, prev, next, pages, count } });
}

module.exports = {
  fetchEvents,
  fetchEventById: fetchResourceById(EVENT_PATH, odh2ab.transformEvent),
  fetchEventPublisher: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'publisher'),
  fetchEventMediaObjects: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'multimediaDescriptions'),
  fetchEventOrganizers: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'organizers'),
  fetchEventVenues: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'venues'),
  fetchLifts,
  fetchLiftById: fetchResourceById(ACTIVITY_PATH, odh2ab.transformLift),
  fetchSnowparks,
  fetchSnowparkById: fetchResourceById(ACTIVITY_PATH, odh2ab.transformSnowpark),
  fetchMountainAreas: fetchMountainArea,
  fetchMountainAreaById: fetchMountainArea,
}
