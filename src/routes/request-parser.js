const iso6393to6391 = require("iso-639-3/to-1.json");
const errors = require("../errors");
const { templates } = require("../transformers/odh2alpinebits/templates");

// Simple generic filters
// exists: ,
// eq: ,
// neq: ,
// in: ,
// notIn: ,
// gt: ,
// gte: ,
// lt: ,
// lte: ,
// containsAny: ,
// containsAll: ,
// startsWith: ,
// endWith: ,
// regex: ,
// nearPoint: ,
// intersectsArea: ,
// withinArea: ,

const langValidation = (languageCodes) => {
  if (Array.isArray(languageCodes)) {
    return languageCodes.some(
      (code) => !Array.isArray(code) || !!iso6393to6391[code]
    );
  } else {
    return !!iso6393to6391[languageCodes];
  }
};

const categoriesValidation = (categories) => {
  const regex = /^([a-z]|[A-Z]|[0-9])+\/([a-z]|[A-Z]|[0-9])+$/;
  if (Array.isArray(categories)) {
    return categories.some(
      (category) => !Array.isArray(category) || regex.test(categories)
    );
  } else {
    return regex.test(categories);
  }
};

const dateValidation = (date) =>
  !Array.isArray(date) && !isNaN(new Date(date).getTime());

const nearToValidation = (pointsInfo) => {
  if(!Array.isArray(pointsInfo) && typeof pointsInfo !== 'string') {
    return false;
  }

  pointsInfo = normalize(pointsInfo)
  
  if (!Array.isArray(pointsInfo) || pointsInfo.length !== 3) {
    return false;
  }
  
  const lng = Number(pointsInfo[0]);
  const lat = Number(pointsInfo[1]);
  const dist = Number(pointsInfo[2]);
  
  return !isNaN(lng) && !isNaN(lat) && Number.isInteger(dist) && dist > 0;
};

const organizationValidation = (organizationId) => {
  return typeof organizationId === "string" && organizationId.indexOf(",") < 0;
};

const queryValidation = {
  agents: {},
  events: {
    lang: langValidation,
    categories: categoriesValidation,
    happeningBefore: dateValidation,
    happeningAfter: dateValidation,
    happeningBetween: dateValidation,
    updatedAfter: dateValidation,
    nearTo: nearToValidation,
    organization: organizationValidation,
  },
  eventSeries: {},
  lifts: {
    lang: langValidation,
    categories: categoriesValidation,
    updatedAfter: dateValidation,
    nearTo: nearToValidation,
  },
  mediaObjects: {},
  mountainAreas: {},
  snowparks: {
    lang: langValidation,
    updatedAfter: dateValidation,
    nearTo: nearToValidation,
  },
  trails: {
    lang: langValidation,
    updatedAfter: dateValidation,
    nearTo: nearToValidation,
  },
  venues: {},
};

function isRepeated(queryValues) {
  return Array.isArray(queryValues);
}

function containsRepeatedValues(queryValues) {
  queryValues = normalize(queryValues);
  for (const value of queryValues) {
    if (queryValues.indexOf(value) !== queryValues.lastIndexOf(value)) {
      return true;
    }
  }
  return false;
}

function normalize(queryValues) {
  queryValues = Array.isArray(queryValues)
    ? queryValues.flatMap((value) => value.split(","))
    : queryValues.split(",");
  return queryValues;
}

function validateResourceRequestQueries(request) {
  if (!request.query) {
    return;
  }

  const { query } = request;
  const specificQueryNames = Object.keys(query);

  for (const queryName of specificQueryNames) {
    switch (queryName) {
      case "include":
        validateIncludeQuery(request);
        break;
      case "fields":
        validateFieldsQuery(request);
        break;
      default:
        throw errors.unknownQuery;
    }
  }
}

function validateCollectionRequestQueries(request) {
  if (!request.query) {
    return;
  }

  const { query } = request;
  const specificQueryNames = Object.keys(query);

  for (const queryName of specificQueryNames) {
    switch (queryName) {
      case "page":
        validatePageQuery(request);
        break;
      case "include":
        validateIncludeQuery(request);
        break;
      case "sort":
        validateSortQuery(request);
        break;
      case "random":
        validateRandomQuery(request);
        break;
      case "search":
        validateSearchQuery(request);
        break;
      case "filter":
        validateFilterQuery(request);
        break;
      case "fields":
        validateFieldsQuery(request);
        break;
      default:
        throw errors.unknownQuery;
    }
  }
}

function validatePageQuery(request) {
  const pageQuery = request.query.page;

  if (typeof pageQuery !== "object") {
    throw errors.badQuery;
  }

  const pageKeys = Object.keys(pageQuery);
  const isValid = (numberInput) =>
    Number.isInteger(Number(numberInput)) && Number(numberInput) > 0;

  for (const key of pageKeys) {
    console.log(key, pageQuery, isValid(pageQuery[key]));
    if ((key !== "size" && key !== "number") || !isValid(pageQuery[key])) {
      throw errors.badQuery;
    }
  }
}

function validateIncludeQuery(request) {
  let resourceType = request.path.replace("/1.0/", "");

  if (resourceType.indexOf("/") >= 0) {
    resourceType = resourceType.substring(0, resourceType.indexOf("/"));
  }

  const relationships = templates[resourceType].relationships;

  let includeQuery = request.query.include;

  if (isRepeated(includeQuery)) {
    throw errors.badQuery;
  }

  includeQuery = normalize(includeQuery);

  if (containsRepeatedValues(includeQuery)) {
    throw errors.badQuery;
  }

  if (includeQuery.some((include) => relationships[include] !== null)) {
    throw errors.unknownQuery;
  }
}

function validateSortQuery(request) {
  const resourceType = request.path.replace("/1.0/", "");
  const supportedFields = {
    events: {
      startDate: true,
    },
  };

  let sortQuery = request.query.sort;

  if (isRepeated(sortQuery)) {
    throw errors.badQuery;
  }

  sortQuery = normalize(sortQuery).map((value) => value.replace("-", ""));

  if (containsRepeatedValues(sortQuery)) {
    throw errors.badQuery;
  }

  if (
    sortQuery.some(
      (fieldToSort) =>
        !supportedFields[resourceType] ||
        !supportedFields[resourceType][fieldToSort]
    )
  ) {
    throw errors.unknownQuery;
  }
}

function validateRandomQuery(request) {
  if (request.query.sort) {
    throw errors.queryConflict;
  }

  const resourceType = request.path.replace("/1.0/", "");
  const supportedResourceTypes = ["events", "lifts", "snowparks", "trails"];

  if (!supportedResourceTypes.includes(resourceType)) {
    errors.unknownQuery;
  }

  let randomQuery = request.query.random;

  if (isRepeated(randomQuery)) {
    throw errors.badQuery;
  }

  randomQuery = Number(randomQuery);

  if (!Number.isInteger(randomQuery) || randomQuery < 1 || randomQuery > 50) {
    throw errors.badQuery;
  }
}

function validateSearchQuery(request) {
  const resourceType = request.path.replace("/1.0/", "");
  const supportedFields = {
    events: {
      name: true,
    },
    lifts: {
      name: true,
    },
    snowparks: {
      name: true,
    },
    trails: {
      name: true,
    },
  };

  if (!supportedFields[resourceType]) {
    throw errors.unknownQuery;
  }

  const searchQuery = request.query.search;

  if (
    typeof searchQuery !== "object" ||
    Object.values(searchQuery).some((searchString) =>
      isRepeated(searchString)
    ) ||
    Object.keys(searchQuery).some(
      (fieldToSearch) => !supportedFields[resourceType][fieldToSearch]
    )
  ) {
    throw errors.badQuery;
  }
}

function validateFilterQuery(request) {
  const filterQuery = request.query.filter;
  let resourceType = request.path.replace("/1.0/", "");
  
  if (resourceType.indexOf("/") >= 0) {
    resourceType = resourceType.substring(0, resourceType.indexOf("/"));
  }
  
  if(!queryValidation[resourceType] || typeof filterQuery !== 'object') {
    errors.badQuery;
  }
  
  for (const filterName in filterQuery) {
    const filterValidation = queryValidation[resourceType][filterName];

    if(!filterValidation || !filterValidation(filterQuery[filterName])) {
      throw errors.badQuery;
    }
  }
}

function validateFieldsQuery(request) {
  const fieldsQuery = request.query.fields;

  if (typeof fieldsQuery !== "object" || Array.isArray(fieldsQuery)) {
    throw errors.badQuery;
  }

  for (const resourceType in fieldsQuery) {
    let fieldNames = normalize(fieldsQuery[resourceType]);

    if (
      !templates[resourceType] ||
      !Array.isArray(fieldNames) ||
      containsRepeatedValues(fieldNames)
    ) {
      throw errors.badQuery;
    }
    
    const attributes = templates[resourceType].attributes;
    const relationships = templates[resourceType].relationships;
    
    for (const fieldName of fieldNames) {
      if (
        !(relationships[fieldName] === null || attributes[fieldName] === null)
      ) {
        throw errors.badQuery;
      }
    }
  }
}

function getBaseUrl(req) {
  return process.env.REF_SERVER_URL + "/1.0";
}

function getSelfUrl(req) {
  return process.env.REF_SERVER_URL + req.originalUrl;
}

function createRequest(req) {
  return {
    baseUrl: getBaseUrl(req),
    selfUrl: getSelfUrl(req),
    params: req.params,
    query: {
      include: {},
      fields: {},
    },
  };
}

//TODO: VALIDATE QUERY PARAMETERS (only existing parameters, parameter values)
function parsePage(req) {
  const { page } = req.query;

  let result = {
    size: 10,
    number: 1,
  };

  if (!page) return result;

  if (page.size > 0) result.size = page.size;

  if (page.number > 0) result.number = page.number;

  return result;
}

// "include=organizers,venues,venues.geometries => ['organizers','venues','venues.geometries']"
function parseInclude(req) {
  const { include } = req.query;

  let result = {};

  if (!include) return result;

  let entries = include.split(",");
  for (i = 0; i < entries.length; i++) {
    const fields = entries[i].split(".");
    let container = result;

    for (j = 0; j < fields.length; j++) {
      const field = fields[j];

      if (!container[field]) container[field] = {};

      container = container[field];
    }
  }

  return result;
}

function parseFields(req) {
  let { fields } = req.query;

  if (!fields) return {};

  let result = {};
  Object.keys(fields).forEach((fieldName) => {
    result[fieldName] = normalize(fields[fieldName]);
  });

  return result;
}

function parseFilter(req) {
  let { filter } = req.query;

  if (!filter) {
    return {};
  }

  let result = {};
  Object.keys(filter).forEach((filterName) => {
    if (Array.isArray(filter[filterName])) {
      let filterValues = [];
      filter[filterName].forEach(
        (value) => (filterValues = [...filterValues, ...value.split(",")])
      );
      result[filterName] = filterValues;
    } else {
      result[filterName] = filter[filterName].split(",");
    }
  });

  return result;
}

function parseSearch(req) {
  let { search } = req.query;

  if (search && (typeof search === "string" || typeof search === "object")) {
    return search;
  }
}

function parseResourceRequest(req) {
  validateResourceRequestQueries(req);

  let parsedRequest = createRequest(req);

  parsedRequest.query.fields = parseFields(req);
  parsedRequest.query.include = parseInclude(req);

  return parsedRequest;
}

function parseCollectionRequest(req) {
  validateCollectionRequestQueries(req);

  let parsedRequest = createRequest(req);

  parsedRequest.query.page = parsePage(req);
  parsedRequest.query.fields = parseFields(req);
  parsedRequest.query.include = parseInclude(req);
  parsedRequest.query.filter = parseFilter(req);
  parsedRequest.query.sort = req.query.sort;
  parsedRequest.query.random = req.query.random;
  parsedRequest.query.search = parseSearch(req);

  return parsedRequest;
}

module.exports.parseResourceRequest = parseResourceRequest;
module.exports.parseCollectionRequest = parseCollectionRequest;
module.exports.getBaseUrl = getBaseUrl;
module.exports.getSelfUrl = getSelfUrl;
