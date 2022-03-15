const fs = require("fs");
const _ = require("lodash");
const utils = require("./model/odh2destinationdata/utils");
//const transformMethods = require("./model/odh2destinationdata/event_transform");
const mappings = require("./model/mappings");
const categoriesData = require("/home/jcg/workspace/odh-alpinebits-destination-data-server/data/categories.data.js");
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
    
  console.log('--Extracting category data from ./data/category.js');
  console.log('--Extracting categories classes alpinebits: and schema:');  
  const categoriesSubset = filterCategories(categoriesData.categories);
  console.log('--Mapping categories');    
  const categories = categoriesSubset.map((category) => mapCategory(category));
  const insertCategoriesResources = getInsertResources(categories);
  const insertCategories = getInsertCategories(categories);

  console.log('--Inserting categories in table resources');
  console.log(insertCategoriesResources);
  console.log('--Inserting categories in table categories');  
  console.log(insertCategories);
  console.log('--Inserting category names in table names');
  //TODO - Multilingualattribute methods for categories

}


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

function filterCategories (categories) {
  let temp = categories;
  let ret = [];

  for (const cat of temp) {
    //Filter condition: ids starting with 'alpinebits:' or 'schema:'
    if ( (cat.id.search('alpinebits:') == 0) || (cat.id.search('schema:') == 0) ){
      ret.push(cat);
    }
  }

  return ret;
}

function mapCategory (cat) {
  const category = {};

  category.resourceId = cat.id;
  category.id = cat.id;
  category.odh_id = cat.id;
  category.type = 'categories';
  category.data_provider = cat.meta.dataProvider;
  //resource.last_update = _.isString(odhResource.LastChange)
  category.last_update = cat.meta.LastUpdate
  //  ? odhResource.LastChange.replace(/Z/g, "") + "+01:00"
  ? formatTimestampSQL(cat.meta.LastUpdate)
    : formatTimestampSQL(new Date().toISOString());
  category.created_at = formatTimestampSQL(new Date().toISOString());
  category.simple_url = hasSimpleUrl(category) ? getSimpleUrl(category) : null;
  category.namespace = cat.attributes.namespace;
  category.names = cat.attributes.name;
  category.urls = cat.attributes.url;
  category.description = cat.attributes.description;

  return category;
}

function getInsertCategories (categories) {
  categories = getUniques(categories);
  let insert = "INSERT INTO categories (id, namespace)\nVALUES\n";
  const length = categories?.length;
  categories?.forEach((category, index) => {
    const id = `'${category.id}'`;
    const namespace = `'${category.namespace}'`;

      
    if ((id != null) && (namespace != null)) {
      insert += `(${id}, ${namespace}),\n`;
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
