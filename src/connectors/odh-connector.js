const axios = require('axios');
const iso6393map = require('./iso639-3-to-1.json')
const odh2ab = require ('../transformers/odh2alpinebits');
const errors = require ('../errors');
require('custom-env').env();

const EVENT_PATH = 'Event';
const ACTIVITY_PATH = 'Activity';
const ACTIVITY_REDUCED_PATH = 'ActivityReduced';
const SKIAREA_PATH = 'Skiarea';
const SKIAREGION_PATH = 'Skiregion';
const ODH_TAG_MAP = {
  trails: 'ski alpin,ski alpin (rundkurs),rodelbahnen,loipen',
  lifts: 'aufstiegsanlagen',
  snowparks: 'snowpark'
}

const EVENT_SERIES_PATH = '../../data/event-series.data';

const axiosOpts = {
  baseURL: process.env.ODH_BASE_URL,
  timeout: process.env.ODH_TIMEOUT,
  headers: { 'Accept': 'application/json' }
}

function fetchEvents (request) {
  let path = EVENT_PATH;
  let paginationArray = getPaginationQuery(request);
  let filtersArray = getEventFilterArray(request);
  let queryArray = [ ...paginationArray, ...filtersArray];

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

function fetchTrails (request) {
  let queryArray = getPaginationQuery(request);
  queryArray.push('odhtagfilter=ski alpin,ski alpin (rundkurs),rodelbahnen,loipen')

  let path = ACTIVITY_PATH+"?"+queryArray.join("&");

  return fetch(path, request, odh2ab.transformTrailArray)
}

function fetchSnowparks (request) {
  let queryArray = getPaginationQuery(request);
  queryArray.push('odhtagfilter=snowpark')

  let path = ACTIVITY_PATH+'?'+queryArray.join('&');

  return fetch(path, request, odh2ab.transformSnowparkArray)
}

function fechMockData (request, filePath, transformFn) {
  res = loadMockDataFromFile(request, filePath);

  if(!res.data || res.status!==200){
    console.log('ERROR: Resource not found!');
    throw errors.notFound;
  }

  try {
    console.log('> Transforming data to the AlpineBits format...');
    const data = transformFn(res.data, request);
    console.log('OK: Sucessfully transformed data.\n');

    return data;
  }
  catch(error) {
    handleTransformationError(error);
  }
}

function loadMockDataFromFile(request, filePath) {
  let mockData;
  
  try {
    console.log(`\n> Loading mock data from '${filePath}'...`);
    mockData = require(filePath);
    console.log('OK: Data loaded.\n');
  }
  catch {
    console.log(`ERROR: Could not read file '${filePath}'!`);
    res.status = 404;
    return res;
  }

  let res = {};
  
  if(request.params.id) {
    data = mockData.find(resource => resource.id === request.params.id);
    if(data) {
      res.data = data;
      res.status = 200;
    }
    else {
      res.status = 404;
    }

    return res;
  }
  else {
    const { page } = request.query;
    let pageSize = page && page.size ? page.size : 10;
    let pageNumber = page && page.number ? page.number : 1;

    if(pageNumber > Math.ceil(mockData.length/pageSize)) {
      res.status = 404;
      return res;
    }

    res.data = {
      TotalResults:  mockData.length,
      TotalPages: Math.ceil(mockData.length/pageSize),
      CurrentPage: pageNumber,
      Seed: "null",
      Items: mockData.slice((pageNumber-1)*pageSize,pageNumber*pageSize)
    };
    res.status = 200;

    return res;
  }
}

function fetchResourceById(resource, transform) {
  return (
    function(request) {
      let path = resource+'/'+request.params.id;
      return fetch(path, request, transform);
    }
  );
}

/*
transform(openDataHubObject): a function to transform an OpenDataHub response into the AlpineBits format
  input: an object retrieved from the OpenDataHub API
  output: an obejct following the AlpineBits format
*/

async function fetch(path, request, transformFn) {
  const instance = axios.create(axiosOpts);
  let res;

  try {
    console.log(`\n> Fetching data from ${process.env.ODH_BASE_URL+path}`);
    res = await instance.get(path);

    if(typeof res.data === 'string')
      res.data = JSON.parse(res.data);
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
    const data = transformFn(res.data, request);
    console.log('OK: Sucessfully transformed data.\n');

    return data;
  }
  catch(error) {
    handleTransformationError(error);
  }
}

async function fetchMountainArea(request, field) {
  const instance = axios.create(axiosOpts);
  let areaId = request.params.id;
  let areaRes, regionRes;

  try {
    console.log(`\n> Fetching mountain area(s) from ${process.env.ODH_BASE_URL}...`);
    let areaPath = areaId ? SKIAREA_PATH+'/'+areaId : SKIAREA_PATH;
    let regionPath = areaId ? SKIAREGION_PATH+'/'+areaId : SKIAREGION_PATH;
    [ areaRes, regionRes] = await Promise.all([instance.get(areaPath), instance.get(regionPath)]);

    if(typeof areaRes.data === 'string')
      areaRes.data = JSON.parse(areaRes.data);

    if(typeof regionRes.data === 'string')
      regionRes.data = JSON.parse(regionRes.data);
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
    let opts = [];
    let odhTagMap = {
      lifts: 'aufstiegsanlagen',
      snowparks: 'snowpark',
      trails: 'ski alpin,ski alpin (rundkurs),rodelbahnen,loipen'
    }

    if(field && odhTagMap[field])
      opts = [ [field, odhTagMap[field]] ];
    else
      opts = Object.keys(odhTagMap).map(key => [key, odhTagMap[key]]);

    if(opts.length>0){
      items.forEach( area => subRequests=subRequests.concat(fetchMountainSubResources(request, area, opts)) );
      await Promise.all(subRequests);
    }
  }
  catch(error){
    handleConnectionError(error);
  }

  try {
    console.log('> Transforming data to the AlpineBits format...');
    const data = areaId ? odh2ab.transformMountainArea(res, request) : odh2ab.transformMountainAreaArray(res, request);
    console.log('OK: Sucessfully transformed data.\n');

    return data;
  }
  catch(error) {
    handleTransformationError(error);
  }
}

function fetchMountainSubResources(request, area, opts) {
  return opts.map( entry => {
    let [ relationship, odhTag ] = entry;

    const instance = axios.create(axiosOpts);
    const id = 'SkiRegionId' in area ? 'ska'+area.Id : 'skr'+area.Id;
    let path;

    if(opts.length===1 || relationship in request.query.include)
      path = `${ACTIVITY_PATH}?odhtagfilter=${odhTag}&areafilter=${id}&pagesize=1000`
    else
      path = `${ACTIVITY_REDUCED_PATH}?odhtagfilter=${odhTag}&areafilter=${id}`

    console.log(`> Fetching ${relationship} from ${process.env.ODH_BASE_URL+path}...`);
    return instance.get(path)
      .then( res => {
        if(typeof res.data === 'string')
          res.data = JSON.parse(res.data);

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

function fetchMountainAreaDependentRelationship(request, transformFn) {
  const id = request.params.id;
  let basePath = id.includes('SKI') ? SKIAREA_PATH : SKIAREGION_PATH;
  let path = `${basePath}/${id}`;

  return fetch(path, request, transformFn);
}

function fetchMountainAreaIndependentRelationship(request, relationship, transformFn) {
  const odhTag = ODH_TAG_MAP[relationship]
  const areaId = request.params.id;
  const id = areaId.includes('SKI') ? 'ska'+areaId : 'skr'+areaId;
  let path = `${ACTIVITY_PATH}?odhtagfilter=${odhTag}&areafilter=${id}&pagesize=1000`
  
  return fetch(path, request, transformFn);
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

function getEventFilterArray(request) {
  console.log("Running getEventFiltersArray", request.query ? request.query.filter : null);

  const { filter } = request.query;
  let filtersArray = [];

  if(filter) {
    for(let filterName of Object.getOwnPropertyNames(filter)) {
      switch(filterName) {
        case 'lang': 
          // langfilter
          filtersArray.push('langfilter='+getLangInIso6391(filter.lang))
          break;
        case 'nearPoint': {
          // locfilter
          const lat = filter.nearPoint[0];
          const lng = filter.nearPoint[1];
          const rad = filter.nearPoint[2];
          if(lat && lng && rad) {
            filtersArray.push('latitude='+lat);
            filtersArray.push('longitude='+lng);
            filtersArray.push('radius='+rad);
          }
          break;
        }
        case 'categories':
          // topicfilter
          filtersArray.push('topicfilter='+getCategoriesAsBitmask(filter.categories));
          break;
        case 'beginsBefore': {
          // enddate
          filtersArray.push('enddate='+parseDateString(filter.beginsBefore));
          break;
        }
        case 'endsAfter': {
          // begindate
          filtersArray.push('begindate='+parseDateString(filter.endsAfter));
          break;
        }
        case 'updatedAfter': {
          // updatefrom
          filtersArray.push('updatefrom='+parseDateString(filter.updatedAfter));
        }
      }
    }
  }

  console.log("Returning from getEventFiltersArray", filtersArray);
  return filtersArray;
}

function parseDateString(malformedDateString) {
  const date = new Date(malformedDateString);

  if(isNaN(date.getDate())) {
    return '';
  }

  const day = date.getUTCDate() > 9 ? date.getUTCDate() : `0${date.getUTCDate()}`;
  const month = date.getUTCMonth() + 1 > 9 ? date.getUTCMonth() + 1 : `0${date.getUTCMonth()+1}`;
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

function getLangInIso6391(lang) {
  if(Array.isArray(lang)) {
    return lang.map(_3letterCode => iso6393map[_3letterCode]).join(',');
  } else if(typeof lang === 'string') {
    return iso6393map[lang];
  } else {
    return '';
  }
}

const eventCategoryMask = {
  'schema/BusinessEvent': 1,  // 'Tagungen Vorträge'
  'schema/SportsEvent': 2,  // 'Sport'
  'schema/FoodEvent': 4,  // 'Gastronomie/Typische Produkte'
  'schema/TheaterEvent': 32,  // 'Theater/Vorführungen'
  'schema/EducationEvent': 64,  // 'Kurse/Bildung'
  'schema/MusicEvent': 128, // 'Musik/Tanz'
  'schema/Festival': 256, // 'Volksfeste/Festivals'
  'schema/VisualArts': 2048,  // 'Ausstellungen/Kunst'
  'schema/ChildrensEvent': 4096,  // 'Familie'
  'odh/tagungen-vortrage': 1, // 'schema/BusinessEvent',
  'odh/sport': 2, // 'schema/SportsEvent',
  'odh/gastronomie-typische-produkte': 4, // 'schema/FoodEvent',
  'odh/handwerk-brauchtum': 8,
  'odh/messen-markte': 16,
  'odh/theater-vorführungen': 32, // 'schema/TheatherEvent',
  'odh/kurse-bildung': 64, // 'schema/EducationEvent',
  'odh/musik-tanz': 128, // 'schema/MusicEvent',
  'odh/volksfeste-festivals': 256, // 'schema/Festival',
  'odh/wanderungen-ausflüge': 512,
  'odh/führungen-besichtigungen': 1024,
  'odh/ausstellungen-kunst': 2048, // 'schema/VisualArts',
  'odh/familie': 4096, // 'schema/ChildrensEvent',
}

function getCategoriesAsBitmask(categories) {
  if(Array.isArray(categories)) {
    let categoriesMasks = categories.map(category => eventCategoryMask[category]);
    return categoriesMasks.reduce((totalMask,currentMask) => !totalMask ? currentMask : totalMask | currentMask);
  }
}

module.exports = {
  fetchEvents, // TODO: support events filters
  fetchEventById: fetchResourceById(EVENT_PATH, odh2ab.transformEvent),
  fetchEventPublisher: fetchResourceById(EVENT_PATH, odh2ab.transformPublisherRelationship),
  fetchEventMediaObjects: fetchResourceById(EVENT_PATH, odh2ab.transformMultimediaDescriptionsRelationship),
  fetchEventOrganizers: fetchResourceById(EVENT_PATH, odh2ab.transformOrganizersRelationship),
  fetchEventVenues: fetchResourceById(EVENT_PATH, odh2ab.transformVenuesRelationship),
  fetchLifts, // TODO: support lifts filters
  fetchLiftById: fetchResourceById(ACTIVITY_PATH, odh2ab.transformLift),
  fetchLiftMediaObjects: fetchResourceById(ACTIVITY_PATH, odh2ab.transformMultimediaDescriptionsRelationship),
  fetchTrails, // TODO: support trails filters
  fetchTrailById: fetchResourceById(ACTIVITY_PATH, odh2ab.transformTrail),
  fetchTrailMediaObjects: fetchResourceById(ACTIVITY_PATH, odh2ab.transformMultimediaDescriptionsRelationship),
  fetchSnowparks, // TODO: support snowparks filters
  fetchSnowparkById: fetchResourceById(ACTIVITY_PATH, odh2ab.transformSnowpark),
  fetchSnowparkMediaObjects: fetchResourceById(ACTIVITY_PATH, odh2ab.transformMultimediaDescriptionsRelationship),
  fetchMountainAreas: request => fetchMountainArea(request, null), // TODO: support mountain areas filters
  fetchMountainAreaById: request => fetchMountainArea(request, null),
  fetchMountainAreaMedia: request => fetchMountainAreaDependentRelationship(request, odh2ab.transformAreaMultimedDescriptionsRelationship),
  fetchMountainAreaOwner: request => fetchMountainAreaDependentRelationship(request, odh2ab.transformAreaOwnerRelationship),
  fetchMountainAreaLifts: request => fetchMountainAreaIndependentRelationship(request, 'lifts', odh2ab.transformLiftArray),
  fetchMountainAreaTrails: request => fetchMountainAreaIndependentRelationship(request, 'trails', odh2ab.transformTrailArray),
  fetchMountainAreaSnowparks: request => fetchMountainAreaIndependentRelationship(request, 'snowparks', odh2ab.transformSnowparkArray),
  fetchEventSeries: request => fechMockData(request, EVENT_SERIES_PATH, odh2ab.transformEventSeriesArray),
  fetchEventSeriesById: request => fechMockData(request, EVENT_SERIES_PATH, odh2ab.transformEventSeries),
  fetchEventSeriesMedia: request => fechMockData(request, EVENT_SERIES_PATH, odh2ab.transformMockMultimediaDescriptionsRelationship),
}
