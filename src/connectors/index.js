const val = require('../validator');
const odhCon = require('./odh-connector');
const errors = require('../errors');

/*
fetch(): an asynchronous function to retrieve data from a source data return

validate(alpineBitsObject): a function to validate an AlpineBits object
  input: an obejct following the AlpineBits format
  output: an object with validation results {valid: [], invalid: []}

serialize(alpineBitsObject): a function to serialize an AlpineBits object following the JSON:API standard
  input: an obejct following the AlpineBits format
  output: an JSON:API compliant object
*/

async function handleRequest(req, fetchFn, validateFn) {
  let response;

  try {
    console.log('> Dispatching request to the OpenDataHub connector...');
    data = await fetchFn(req);
    console.log('OK: Request completed.\n');
  }
  catch (error) {
    throw error;
  }

  try {
    console.log('> Validating generated message...');
    validateFn(data);
    return data;
  }
  catch (error) {
    console.log('ERROR: Failed to validate data!');
    console.log(error);
    throw errors.cantValidate;
  }
}

module.exports = {
  getEvents: req => handleRequest(req, odhCon.fetchEvents, val.validateEventArray),
  getEventById: req => handleRequest(req, odhCon.fetchEventById, val.validateEvent),
  getEventMedia: req => handleRequest(req, odhCon.fetchEventMediaObjects, val.validateMediaObjectArray),
  getEventPublisher: req => handleRequest(req, odhCon.fetchEventPublisher, val.validateAgent),
  getEventOrganizers: req => handleRequest(req, odhCon.fetchEventOrganizers, val.validateAgentArray),
  getEventVenues: req => handleRequest(req, odhCon.fetchEventVenues, val.validateVenueArray),
  getLifts: req => handleRequest(req, odhCon.fetchLifts, val.validateLiftArray),
  getLiftById: req => handleRequest(req, odhCon.fetchLiftById, val.validateLift),
  getTrails: req => handleRequest(req, odhCon.fetchTrails, val.validateTrailArray),
  getTrailById: req => handleRequest(req, odhCon.fetchTrailById, val.validateTrail),
  getTrailMedia: req => handleRequest(req, odhCon.fetchTrailMediaObjects, val.validateMediaObjectArray),
  getSnowparks: req => handleRequest(req, odhCon.fetchSnowparks, val.validateSnowparkArray),
  getSnowparkById: req => handleRequest(req, odhCon.fetchSnowparkById, val.validateSnowpark),
  getMountainAreas: req => handleRequest(req, odhCon.fetchMountainAreas, val.validateMountainAreaArray),
  getMountainAreaById: req => handleRequest(req, odhCon.fetchMountainAreaById, val.validateMountainArea),
  getMountainAreaMedia: req => handleRequest(req, odhCon.fetchMountainAreaMedia, val.validateMediaObjectArray),
  getMountainAreaOwner: req => handleRequest(req, odhCon.fetchMountainAreaOwner, val.validateAgent),
  getMountainAreaLifts: req => handleRequest(req, odhCon.fetchMountainAreaLifts, val.validateLiftArray),
  getMountainAreaTrails: req => handleRequest(req, odhCon.fetchMountainAreaTrails, val.validateTrailArray),
  getMountainAreaSnowparks: req => handleRequest(req, odhCon.fetchMountainAreaSnowparks, val.validateSnowparkArray),
  getEventSeries: (req) => handleRequest(req, odhCon.fetchEventSeries, val.validateEventSeriesArray),
  getEventSeriesById: (req) => handleRequest(req, odhCon.fetchEventSeriesById, val.validateEventSeries),
}
