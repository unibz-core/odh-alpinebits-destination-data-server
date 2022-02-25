const fs = require("fs");
const _ = require("lodash");
const utils = require("./model/odh2destinationdata/utils");
//const transformMethods = require("./model/odh2destinationdata/event_transform");
const mappings = require("./model/mappings");
const odhEvents = require("/home/jcg/Event.json");//"./../events-1000.json");
const datatypes = require("/home/jcg/workspace/odh-alpinebits-destination-data-server/src/model/destinationdata/datatypes");


const {Pool, Client} = require('pg');

const pool = new Pool({
host: "localhost",
database: "test_db",
user: "root",
password: "root",
port: "5433"
})

main();

async function main() {
  let insert;

  //Create SQL Batch file

  const dataSource = odhEvents.Items.slice(0, 99);
  //Creating event_series
  

  //Creating Publisher
  const publisher = {}
  publisher.id = "publisher",
  publisher.odh_id = null,
  publisher.type = "agents",
  publisher.data_provider = "http://tourism.opendatahub.bz.it/",
  publisher.last_update = formatTimestampSQL(new Date().toISOString()),
  publisher.created_at = formatTimestampSQL(new Date().toISOString()),
  publisher.simple_url = "https://lts.it",
  publisher.name = [
    {
      lang: 'de',
      content: "LTS - Landesverband der Tourismusorganisationen Südtirols",
      resourceId: "publisher"
    },
    {
      lang: 'en',
      content: "LTS - Landesverband der Tourismusorganisationen Südtirols",
      resourceId: "publisher"
    },
    {
      lang: 'it',
      content: "LTS - Landesverband der Tourismusorganisationen Südtirols",
      resourceId: "publisher"
    }];

  let publishers = [];
  publishers.push(publisher);
  console.log('--OpenDatahub migration');
  console.log('--Creating default Db Entries...')
  //Creating publisher entry on resource and name tables
  let insertPublisherAgent = getInsertAgents(publishers);
  let insertPublisherName = getInsertMultilingualTable(publisher.name, 'names');
  console.log(insertPublisherAgent);
  console.log(insertPublisherName);
  //Creating default event series for testing
  console.log('--Creating default event series');
  const defEventSeries = {}
  defEventSeries.id = "default_series",
  defEventSeries.odh_id = null,
  defEventSeries.type = "eventSeries",
  defEventSeries.data_provider = "http://tourism.opendatahub.bz.it/",
  defEventSeries.last_update = formatTimestampSQL(new Date().toISOString()),
  defEventSeries.created_at = formatTimestampSQL(new Date().toISOString()),
  defEventSeries.simple_url = null;
  let eventSeries = []
  eventSeries.push(defEventSeries);
  let insertdefEventSeries = getInsertEventSeries(eventSeries);
  console.log(insertdefEventSeries);

  console.log('--Extracting Events...');
  const resources = dataSource.map((odhEvent) => mapResource(odhEvent, "events"));
  console.log('--Events - Insert at table resource');
  insertResources = getInsertResources(resources);
  console.log(insertResources);
  //await executeSQLQuery(insertResources);
  //Inserting resource names
  console.log('--Events - Insert at table names');
  const names = mapMultilingualAttribute(dataSource, 'Title', 'Detail');
  insertNames = getInsertMultilingualTable(names, 'names');
  //await executeSQLQuery(insertNames);
  console.log(insertNames);
  console.log('--Events - Insert at table descriptions');
  const descriptions = mapMultilingualAttribute(dataSource, 'BaseText', 'Detail');
  insertDescriptions = insertNames = getInsertMultilingualTable(descriptions, 'descriptions');
  console.log(insertDescriptions);
  //await executeSQLQuery(insertDescriptions);

  //TODO - Confirm short_names and abstracts are present in odh data
  /*console.log('--Events - Insert at table short_names');
  const shortnames = mapMultilingualAttribute(dataSource, 'Header', 'Detail');
  insertShortNames = getInsertMultilingualTable(shortnames, 'short_names');
  console.log(insertShortNames);
  //await executeSQLQuery(insertDescriptions);
  console.log('--Events - Insert at table abstracts');
  const abstracts = mapMultilingualAttribute(dataSource, 'SubHeader', 'Detail');
  insertAbstracts = getInsertMultilingualTable(abstracts, 'abstracts');
  console.log(insertAbstracts);*/
  //await executeSQLQuery(insertAbstracts);
  
  console.log('--Events - Insert at table urls');
  const urls = mapMultilingualAttribute(dataSource, 'Url', 'ContactInfos');
  insertUrls = getInsertMultilingualTable(urls, 'urls');
  console.log(insertUrls);
  //await executeSQLQuery(insertUrls);
  console.log('--Events - Insert Event data at table Events');
  const events = dataSource.map((event) => mapEvent(event));
  //const events = mapEvents(dataSource);
  insertEvents = getInsertEvents(events);
  console.log(insertEvents);
  //await executeSQLQuery(insertEvents);
  console.log('--Events - Insert Event Organizers at table Agents');
  const organizers = dataSource.map((organizer) => mapAgent(organizer));
  insertOrganizers = getInsertAgents(organizers);
  console.log(insertOrganizers);
  console.log('--Events - Insert Organizer name at multilingual tables');
  const organizerNames = mapMultilingualAttributeOrganizer(dataSource,'CompanyName');
  const insertOrganizerNames = (getInsertMultilingualTable(organizerNames, 'names'));
  console.log(insertOrganizerNames);
  console.log('--Events - Insert Organizer Url at multilingual tables');
  const organizerUrls = mapMultilingualAttributeOrganizer(dataSource,'Url');
  const insertOrganizerUrls = (getInsertMultilingualTable(organizerUrls, 'urls'));
  console.log(insertOrganizerUrls);
  //await executeSQLQuery(insertOrganizers);
  console.log('--Events - Insert Event Location at table Venues');
  let venues = dataSource.map((venue) => mapVenue(venue));
  insertVenues = getInsertVenues(venues);
  console.log(insertVenues);
  console.log('--Events - Insert Venue Address at table address');
  let venueAddresses = dataSource.map((venueAddress) => mapAddress(venueAddress));
  //venueAddresses = getUniques(venueAddresses);
  insertVenueAddress = getInsertAddress(venueAddresses);
  console.log(insertVenueAddress);
  //let venueCities = dataSource.map((venueCity) => mapMultilingualAttributeAddress(dataSource,'City'));
  console.log('--Events - Insert Venue City at table city');
  let venueCities = mapMultilingualAttributeAddress(dataSource,'City');
  let insertVenueCities = (getInsertMultilingualTableAddress(venueCities, 'cities'));
  console.log(insertVenueCities);
  console.log('--Events - Insert Venue Address at table streets');
  let venueStreets = mapMultilingualAttributeAddress(dataSource,'Address');
  let insertVenueStreets = (getInsertMultilingualTableAddress(venueStreets, 'streets'));
  console.log(insertVenueStreets);
  console.log('--Events - Insert Venue Region at table regions');
  let venueRegions = mapMultilingualAttributeRegion(dataSource,'Name');
  console.log(venueRegions);
  let insertVenueRegions = (getInsertMultilingualTableAddress(venueRegions, 'regions'));
  console.log(insertVenueRegions);
  //TODO - Complements
  console.log('--Events - Insert Venue data into table places');
  let venuePlaces = dataSource.map((venuePlace) => mapPlaces(venuePlace));
  //console.log(venuePlaces);
  let insertVenuePlaces = getInsertPlace(venuePlaces);
  console.log(insertVenuePlaces);

}

function transformVenueGeometries(odhSource) {
  const { Latitude, Longitude } = odhSource;

  if (!Latitude || !Longitude) {
    return null;
  } else {
    return [datatypes.createPoint(Longitude, Latitude)];
  }
}

/*function getUniqueVenues (venuesArray, field, field2=null, field3=null) {
  venueSet = new Set();
  ret = [];

  for (elem of venuesArray) {
    if (field2 == null) {
      if (!venueSet.has(elem[field])) {
        venueSet.add(elem[field]);
        ret.push(elem);
      }
    }
    else {
-      //if (!venueSet1.has(elem[field]) && !venueSet2.has(elem[field2])) {
        let temp = `${elem[field]}:${elem[field2]}:${elem[field3]}`;
        if (!venueSet.has(temp)) {
        venueSet.add(temp);
        ret.push(elem);
      }
    } 
  }
  return ret;
}*/

//A simplified Hashset-like method using JSON.stringify
function getUniques(jsonArray) {
  const uniqueString = new Set(jsonArray.map(JSON.stringify));
  const uniqueArray = Array.from(uniqueString);
  const uniqueObjects = uniqueArray.map(JSON.parse);
  return uniqueObjects;
}

async function executeSQLQuery(query) {
  try {
    return await pool.query(query);
  }
  catch (error) {
    console.log(error.message);
  }
}

function formatTimestampSQL(timestamp) {
  if(timestamp == null)
    timestamp = new Date().toISOString();

  timestamp = timestamp.replace(/Z/g, "");
  timestamp = timestamp.replace(/T/g, " ");
  if ((timestamp[0] != "'") && (timestamp[timestamp.length-1] != "'")) {
    timestamp = "'"+timestamp+"'";
  }
    
  return timestamp;
}

function checkQuotesSQL(input) {
  if (input != null) {
    input = input.replace( /[\r\n]+/gm, "" );;
    input = input.replace( /'/g, "''");
    input = input.replace( /’/g, "’’");
    return input;
  }
  else
    return null;
}

function mapMultilingualAttribute(odhResource, field, extra) {
  const attributes = []

  for (const ev of odhResource) {
    const keys = Object.keys(ev.Detail);

    for (const key of keys) {
      let attribute = {};
      attribute.lang = key;
      attribute.content = checkQuotesSQL(ev[extra][key][field]); 
      attribute.resourceId = ev.Id;
      //Filter inexistent fields
      if ((attribute.content != null) && (attribute.content !=undefined)) {
        attributes.push(attribute);
      }
    }
  }
  
  return attributes;
}

function mapMultilingualAttributeOrganizer(odhData, field) {
  const attributes = []

  for (const ev of odhData) {
    const keys = Object.keys(ev.OrganizerInfos);

    for (const key of keys) {
      let attribute = {};
      attribute.lang = key;
      attribute.content = checkQuotesSQL(ev.OrganizerInfos[key][field]); 
      attribute.resourceId = ev.Id+"_organizer";
      //Filter inexistent fields
      if ((attribute.content != null) && (attribute.content !=undefined)) {
        attributes.push(attribute);
      }
    }
  }
  
  return attributes;
}

function mapPlaces(odhData) {
  //gps_data, how to arrive, opening_hours
  const place = {};
  place.id = odhData.Id+"_place";
  place.addressId = odhData.Id+"_address";
  //place.geometries = transformMethods.transformVenueGeometries(odhData);
  place.geometries = transformVenueGeometries(odhData);
  place.length = null;
  place.maxAltitude = null;
  place.minAltitude = null;
  place.openingHours = null;

  return place;
}

function getInsertPlace(places) {
  places = getUniques(places);
  let insert = "INSERT INTO places (id, address_id, geometries, length, max_altitude,"+
                                    "min_altitude, opening_hours)\nVALUES\n";
  const length = places?.length;
  places?.forEach((place, index) => {
    const id = `'${place.id}'`;
    const address_id = `'${place.addressId}'`;
    const geometries = `'${place.geometries}'`;
    const place_length = `'${place.length}'`;
    const max_altitude = `'${place.maxAltitude}'`;
    const min_altitude = `'${place.minAltitude}'`;
    const opening_hours = `'${place.openingHours}'`;
     
    if ((id != null) && (address_id != null)) {
      insert += `(${id}, ${address_id}, ${geometries}, ${place_length},
                ${max_altitude}, ${min_altitude}, ${opening_hours}\n)`;
      /*insert += `(${id}, ${lang}, ${content})${
        length - 1 > index ? "," : ";"
      }\n`;*/
    }
  });
  //TODO - Less hacky and more elegant solution than the code below
  let ret = '';
  if (insert.endsWith(",\n")) {
     ret = insert.slice(0, -2) + ';\n';
  }
  else {
    ret = insert;
  }
  return ret;
}

function mapAddress(odhData) {
  //address, zipcode, codice postale
  const address = {};
  address.id = odhData.Id+"_address";
  //WARN - 
  let keys = Object.keys(odhData.OrganizerInfos);
  //Set default country and zipcode entry
  address.country = odhData.OrganizerInfos[keys[0]].CountryCode ? 
                    `'${odhData.OrganizerInfos[keys[0]].CountryCode}'` : `'it'`;
  address.zipcode = odhData.OrganizerInfos[keys[0]].ZipCode;
  address.type = null;
  return address;

}

function getInsertAddress(addresses) {
  addresses = getUniques(addresses);
  let insert = "INSERT INTO addresses (id, country, zipcode, type)\nVALUES\n";
  const length = addresses?.length;
  addresses?.forEach((address, index) => {
    const id = `'${address.id}'`;
    const country = address.country ? address.country : null;
    const zipcode = address.zipcode ? `'${address.zipcode}'` : null;
    const type = address.type ? `'${address.type}'` : null;
    
    if (zipcode != null) {
      insert += `(${id}, ${country}, ${zipcode}, ${type}),\n`;
      /*insert += `(${id}, ${lang}, ${content})${
        length - 1 > index ? "," : ";"
      }\n`;*/
    }
  });
  //TODO - Less hacky and more elegant solution than the code below
  let ret = '';
  if (insert.endsWith(",\n")) {
     ret = insert.slice(0, -2) + ';\n';
  }
  else {
    ret = insert;
  }
  return ret;
}  

function mapMultilingualAttributeRegion(odhData, field, event_id) {
  const attributes = []

  for (const ev of odhData) {
    const keys = Object.keys(ev.LocationInfo.RegionInfo[field]);
    for (const key of keys) {
      let attribute = {};
      attribute.lang = key;
      attribute.content = checkQuotesSQL(ev.LocationInfo.RegionInfo[field][key]); 
      //attribute.resourceId = ev.LocationInfo.TvInfo.Id;
      attribute.addressId = ev.Id+"_address";
      //attribute.resourceId = ev.Id;
      //Filter inexistent fields
      if ((attribute.content != null) && (attribute.content !=undefined)){
        attributes.push(attribute);
      }
    }
  }
  
  return attributes;
}

function getInsertMultilingualTable(names, table) {
  names = getUniques(names);
  let insert = "INSERT INTO "+table+" (resource_id, lang, content)\nVALUES\n";
  const length = names?.length;
  names?.forEach((name, index) => {
    const id = name.resourceId ? `'${name.resourceId}'` : null;
    const lang = name.lang ? `'${mappings.iso6391to6393[name.lang]}'` : null;
    const content = name.content ? `'${name.content}'` : null;
    
    if (content != null) {
      insert += `(${id}, ${lang}, ${content}),\n`;
      /*insert += `(${id}, ${lang}, ${content})${
        length - 1 > index ? "," : ";"
      }\n`;*/
    }
  });
  //TODO - Less hacky and more elegant solution than the code below
  let ret = '';
  if (insert.endsWith(",\n")) {
     ret = insert.slice(0, -2) + ';\n';
  }
  else {
    ret = insert;
  }
  return ret;
}

function mapMultilingualAttributeAddress(odhData, field) {
  const attributes = []

  for (const ev of odhData) {
    const keys = Object.keys(ev.ContactInfos);
    for (const key of keys) {
      let attribute = {};
      attribute.lang = key;
      attribute.content = checkQuotesSQL(ev.ContactInfos[key][field]); 
      attribute.addressId = ev.Id+"_address";
      console.log(attribute);
      //Filter inexistent fields
      if ((attribute.content != null) && (attribute.content !=undefined)){
        attributes.push(attribute);
      }
    }
  }
  
  return attributes;
}

function getInsertMultilingualTableAddress(attributes, table) {
  attributes = getUniques(attributes);
  let insert = "INSERT INTO "+table+" (address_id, lang, content)\nVALUES\n";
  const length = attributes?.length;
  console.log(attributes[0]);
  attributes?.forEach((attribute, index) => {
    const id = attribute.addressId;
    const lang = attribute.lang ? `'${mappings.iso6391to6393[attribute.lang]}'` : null;
    const content = attribute.content ? `'${attribute.content}'` : null;
    
    if (content != null) {
      insert += `(${id}, ${lang}, ${content}),\n`;
      /*insert += `(${id}, ${lang}, ${content})${
        length - 1 > index ? "," : ";"
      }\n`;*/
    }
  });
  //TODO - Less hacky and more elegant solution than the code below
  let ret = '';
  if (insert.endsWith(",\n")) {
     ret = insert.slice(0, -2) + ';\n';
  }
  else {
    ret = insert;
  }
  return ret;
}

function mapResource(odhResource, type) {
  const resource = {};

  resource.id = odhResource.Id;
  resource.odh_id = odhResource.Id;
  resource.type = type;
  resource.data_provider = "http://tourism.opendatahub.bz.it/";
  //resource.last_update = _.isString(odhResource.LastChange)
  resource.last_update = odhResource.LastChange
  //  ? odhResource.LastChange.replace(/Z/g, "") + "+01:00"
  ? formatTimestampSQL(odhResource.LastChange)
    : formatTimestampSQL(new Date().toISOString());
  resource.created_at = formatTimestampSQL(new Date().toISOString());
  resource.simple_url = hasSimpleUrl(odhResource) ? getSimpleUrl(odhResource) : null;

  return resource;
}

function getInsertResources(resources) {
  resources = getUniques(resources);
  let insert = "INSERT INTO resources (id,odh_id,type,data_provider,last_update,created_at,simple_url)\nVALUES\n";
  const length = resources?.length;

  resources?.forEach((resource, index) => {
    const id = `'${resource.id}'`;
    const odh_id = `'${resource.odh_id}'`;
    const type = `'${resource.type}'`;
    const data_provider = `'${resource.data_provider}'`;
    const last_update = resource.last_update;
    const created_at = resource.created_at;
    const simple_url = `'${resource.simple_url}'`;

    insert += `(${id},${odh_id},${type},${data_provider},${last_update},${created_at},${simple_url})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  return insert;
}

function mapEvent(odhData) {
  const event = {};
  event.id = odhData.Id;
  event.capacity = null;
  event.endDate = formatTimestampSQL(odhData['DateBegin']);
  event.startDate = formatTimestampSQL(odhData['DateEnd']);
  //Default event series for testing
  event.parentId = null;
  event.publisherId = "publisher";
  event.seriesId = "default_series";
  //Active boolean field in Opendatahub for events
  event.status = odhData.Active ? "published" : "disabled";

  return event;
}

function getInsertEventSeries(eventSeries) {
  eventSeries = getUniques(eventSeries);
  let insertEventSeries = 
  "INSERT INTO event_series (id, frequency)\nVALUES\n";
  const length = eventSeries?.length;

  eventSeries?.forEach((eventSerie, index) => {
    const id = eventSerie.id ? `'${eventSerie.id}'` : null;
    const frequency = eventSerie.frequency ? `'${eventSerie.frequency}'` : null;
    
    insertEventSeries += `(${id}, ${frequency})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  let insertResources = getInsertResources(eventSeries);
  let insert = insertResources + "\n" + insertEventSeries;
  
  return insert;
}

function getInsertEvents(events) {
  events = getUniques(events);

  let insert = "INSERT INTO events (id, capacity, end_date, start_date, parent_id, publisher_id, series_id, status)\nVALUES\n";
  const length = events?.length;

  events?.forEach((event, index) => {
    const id = `'${event.id}'`;
    const capacity = event.capacity ? `'${event.capacity}'` : null;
    //const end_date = event.endDate.replace(/Z/g, "") + "+01:00"
    const end_date = event.endDate;
    //const start_date = event.startDate.replace(/Z/g, "") + "+01:00";
    const start_date = event.startDate;
    const parent_id = event.parentId ? `'${event.parentId}'` : null;
    const publisher_id = `'${event.publisherId}'`;
    const series_id = `'${event.seriesId}'`;
    const status = `'${event.status}'`;
    
    insert += `(${id}, ${capacity}, ${end_date}, ${start_date}, ${parent_id}, 
                ${publisher_id}, ${series_id}, ${status})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  return insert;
}

function mapVenue (odhData) {
  const venue = {};

  //venue.eventId = odhData.Id;
  venue.id = odhData.Id+"_venue";
  venue.odh_id = odhData.LocationInfo.TvInfo.Id;
  venue.type = 'venues';
  venue.data_provider = "http://tourism.opendatahub.bz.it/";
  venue.last_update = formatTimestampSQL(new Date().toISOString());
  venue.created_at = formatTimestampSQL(new Date().toISOString());
  venue.simple_url = venue.simple_url ? `'${venue.simple_url}'` : null;
  venue.eventId = odhData.Id;    
  return venue;
}

//Create insert string for venues table
function getInsertVenues(venues) {
  venues = getUniques(venues);
  let insertVenues = 
  "INSERT INTO venues (id)\nVALUES\n";
  const length = venues?.length;

  venues?.forEach((venue, index) => {
    const id = venue.id ? `'${venue.id}'` : null;
    
    insertVenues += `(${id})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  //Create insert string for resources table
  let insertResources = getInsertResources(venues);
    
  let insertEventVenues =
  "INSERT INTO event_venues (venue_id, event_id)\nVALUES\n";
  
  venues?.forEach((venue, index) => {
    const venue_id = `'${venue.id}'`;
    const event_id = `'${venue.eventId}'`;
    
    insertEventVenues += `(${venue_id},${event_id})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  let insert = insertResources + "\n" + insertVenues + "\n" + insertEventVenues;
  
  return insert;
}

function mapAgent(odhData, agentType) {
  
  const agent = {};

  agent.id = odhData.Id+"_organizer",
  agent.odh_id = null,
  agent.type = "agents",
  agent.data_provider = "http://tourism.opendatahub.bz.it/",
  agent.last_update = formatTimestampSQL(new Date().toISOString()),
  agent.created_at = formatTimestampSQL(new Date().toISOString()),
  agent.simple_url = null;

  return agent;
}

function getInsertAgents(agents) {
  agents = getUniques(agents);
  let insertAgents = 
  "INSERT INTO agents (id)\nVALUES\n";
  const length = agents?.length;

  agents?.forEach((agent, index) => {
    const id = agent.id ? `'${agent.id}'` : null;
    
    insertAgents += `(${id})${
      length - 1 > index ? "," : ";"
    }\n`;
  });

  let insertResources = getInsertResources(agents);

  let insert = insertResources + "\n" + insertAgents;
  
  return insert;
}  

function hasSimpleUrl(odhResource) {
  // TODO: Implement
  return false;
}
function getSimpleUrl(odhResource) {
  // TODO: Implement
  return null;
}
