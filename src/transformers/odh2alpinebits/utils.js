const shajs = require('sha.js')
const sanitizeHtml = require('sanitize-html');
const templates = require('./templates');

const languageMapping = [
  ['it','ita'],
  ['en','eng'],
  ['de','deu']
]

const htmlSanitizeOpts = {
  allowedTags: [],
  allowedAttributes: {}
};

// isLanguageNested: true => object.property.it
// isLanguageNested: false => object.it.property
function transformMultilingualFields(source, target, fieldMapping, isLanguageNested, ignoreNullValues) {
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;

    for (languageEntry of languageMapping) {
      let [sourceLanguage, targetLanguage] = languageEntry;

      if(isLanguageNested && source[sourceField] && (!ignoreNullValues || source[sourceField][sourceLanguage])){
        const value = sanitizeHtml(source[sourceField][sourceLanguage], htmlSanitizeOpts);
        target[targetField] = safeAdd(target[targetField], targetLanguage, value)
      }
        
      else if (!isLanguageNested && source[sourceLanguage] && (!ignoreNullValues || source[sourceLanguage][sourceField])){
        const value = sanitizeHtml(source[sourceLanguage][sourceField], htmlSanitizeOpts)
        target[targetField] = safeAdd(target[targetField], targetLanguage, value)
      }
    }
  }
}

function transformFields (source, target, fieldMapping, valueMapping = {}) {
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;
    target[targetField] = valueMapping[sourceField] ? valueMapping[sourceField][source[sourceField]] : source[sourceField];
  }
}

// TODO currently unused. Check later...
function transformArrayFields (source, target, fieldMapping, valueMapping = {}) {
  for (fieldEntry of fieldMapping) {
    const [sourceField, targetField] = fieldEntry;
    target[targetField] = [];

    for (sourceItem of source[sourceField]) {
       const targetItem = valueMapping[sourceField] ? valueMapping[sourceField][sourceItem] : sourceItem;
       target[targetField].push(targetItem);
    }
  }
}
function safeGetString(path, object) {
  let value = path.reduce( (xs, x) => (xs && xs[x]) ? xs[x] : null, object );

  if(typeof value === 'string' || value instanceof String){
    value = value.trim();
    
    if(!value)
      return null;
    
    return value;
  }
  
  return null;
}

function safeGet (path, object) {
  let value = path.reduce( (xs, x) => (xs && xs[x]) ? xs[x] : null, object );

  if(typeof value === 'string' || value instanceof String)
    return value.trim();

  return value;
}

function safeGetOne(paths, object){
  for (path of paths){
    let value = safeGet(path, object);

    if(value)
      return value;
  }
}

function safePush(array, value){
  if (value===null || (typeof value==="string" && value.trim().length===0))
    return array;

  if(!array)
    array = [];

  array.push(value);

  return array;
}

function safeAdd(object, field, value){
  if(!object)
    object = {}

  object[field] = value;
  return object;
}

function addRelationshipToMany(relationships, relationshipName, resource, selfLink){
  if(!relationships[relationshipName]){
    relationships[relationshipName] = {
      data: [],
      link: {
        related: selfLink + "/" + relationshipName
      }
    }
  }
  
  const relationship = { 
    type: resource.type, 
    id: resource.id 
  };

  relationships[relationshipName].data.push(relationship);
}

function addRelationshipToOne(relationships, relationshipName, resource, selfLink){
  relationships[relationshipName] = {
    data: { 
      type: resource.type, 
      id: resource.id 
    },
    links: {
      related: selfLink + "/" + relationshipName
    }
  }
}

function transformBasicProperties(source) {
  let target = {};

  // Basic textual descriptions
  if(source.Detail) {
    fieldMapping = [['Title','name'],['BaseText','description'],['Header','shortName'],['SubHeader','abstract']];
    transformMultilingualFields(source.Detail, target, fieldMapping, false, true);
  }

  if(source.ContactInfos) {
    fieldMapping = [['Url', 'url']];
    transformMultilingualFields(source.ContactInfos, target, fieldMapping, false, true);
  }

  return target;
}

function transformMetadata(source) {
  meta = {};
  meta.lastUpdate = source.LastChange+'+02:00';
  meta.dataProvider = "http://tourism.opendatahub.bz.it/";
  return meta;
}

function transformOperationSchedule(operationSchedule) {
  let openingHours = []

  if(!operationSchedule)
    return openingHours;

  operationSchedule.forEach( entry => {
    let newEntry = templates.createObject('HoursSpecification');

    openingHours.push(newEntry);

    newEntry.validFrom = entry.Start.replace(/T.*/,'');
    newEntry.validTo = entry.Stop.replace(/T.*/,'');

    if(entry.OperationScheduleTime)
      entry.OperationScheduleTime.forEach( hours =>
        newEntry.hours.push({ opens: hours.Start, closes: hours.End})
      );
  })

  return openingHours;
}

function transformHowToArrive(detail) {
  let howToArrive = {};

  const deGetThere = safeGet(['de','GetThereText'], detail);
  const itGetThere = safeGet(['it','GetThereText'], detail);
  const enGetThere = safeGet(['en','GetThereText'], detail);

  if(deGetThere || itGetThere || enGetThere)
    howToArrive = {
      deu: sanitizeHtml(deGetThere, htmlSanitizeOpts),
      ita: sanitizeHtml(itGetThere, htmlSanitizeOpts),
      eng: sanitizeHtml(enGetThere, htmlSanitizeOpts)
    };

  return howToArrive;
}

function transformAddress(contactInfo, fields){
  let address = templates.createObject('Address');

  if(fields.includes('street'))
    address.street = {
      deu: safeGet(['de','Address'], contactInfo),
      ita: safeGet(['it','Address'], contactInfo),
      eng: safeGet(['en','Address'], contactInfo)
    };

  if(fields.includes('city'))
    address.city = {
      deu: safeGet(['de','City'], contactInfo),
      ita: safeGet(['it','City'], contactInfo),
      eng: safeGet(['en','City'], contactInfo)
    };

  if(fields.includes('country'))
    address.country = safeGetOne([['de','CountryCode'],['it','CountryCode'],['en','CountryCode']], contactInfo);

  if(fields.includes('zipcode'))
    address.zipcode = safeGetOne([['de','ZipCode'],['it','ZipCode'],['en','ZipCode']], contactInfo);

  address.region = {}

  return address;
}

function transformGeometry(gpsInfo, infoKeys, gpsPoints, gpsTrack){
  let geometry;

  if(gpsInfo && gpsInfo.length>=1) {
    if(gpsInfo.length===1) {
      geometry = templates.createObject('Point');
      geometry.coordinates = [gpsInfo[0].Longitude, gpsInfo[0].Latitude, gpsInfo[0].Altitude];
      return geometry;
    }
    else {
      geometry = templates.createObject('LineString');

      if(Array.isArray(infoKeys) && infoKeys.length===gpsInfo.length) {
        infoKeys.forEach(key => {
          let point = gpsInfo.find(p => p.Gpstype === key);
          if(point)
            geometry.coordinates.push([point.Longitude, point.Latitude, point.Altitude]);
        })
        return geometry;
      }

      else {
        gpsInfo.forEach(point =>
          geometry.coordinates.push([point.Longitude, point.Latitude, point.Altitude])
        )
        return geometry;
      }
    }
  }
  else if(gpsPoints && Object.keys(gpsPoints)) {
    // console.log('Has GpsPoints:', Object.keys(gpsPoints).length);
    return null;
  }
  else if(gpsTrack && gpsTrack.length>=1) {
    // console.log('Has GpsTrack:', gpsTrack.length);
    return null;
  }

  return geometry;
}

function transformMediaObject(source, baseLink) {
  let mediaObject = templates.createObject('MediaObject');
  let attributes = mediaObject.attributes;
  let relationships = mediaObject.relationships;

  const match = source.ImageUrl.match(/ID=(.*)/i);
  mediaObject.id = match.length>=2 ? match[1] : source.ImageUrl;

  /**
   * 
   *  ATTRIBUTES
   * 
   */

  attributes.contentType = 'image/jpeg'

  // ['Width','width'], ['Height','height']
  const imageFieldMapping = [ ['ImageUrl','url'], ['License','license'] ];

  const imageValueMapping = {
    License: {
      'CC0': 'CC0-1.0',
      'CC1': 'CC1-1.0'
    }
  }

  transformFields(source, attributes, imageFieldMapping, imageValueMapping);

  // ['ImageTitle', 'name']
  const imageMultilingualFieldMapping = [ ['ImageDesc', 'description'] ];

  transformMultilingualFields(source, attributes, imageMultilingualFieldMapping, true);

  /**
   * 
   *  RELATIONSHIPS
   * 
   */

  const copyrightOwner = templates.createObject('Agent');
  copyrightOwner.id = shajs('sha256').update(source.CopyRight).digest('hex');
  copyrightOwner.attributes.name = {
    deu: source.CopyRight,
    eng: source.CopyRight,
    ita: source.CopyRight
  };
  
  addRelationshipToOne(relationships, 'copyrightOwner', copyrightOwner, baseLink)

  return ({ 
    mediaObject,
    copyrightOwner
  });
}

function isClockwise(poly) {
    var sum = 0
    for (var i=0; i<poly.length-1; i++) {
        var cur = poly[i],
            next = poly[i+1]
        sum += (next[0] - cur[0]) * (next[1] + cur[1])
    }
    return sum > 0
}

function addIncludedResource(included, resource) {
  if(!included[resource.type])
    included[resource.type] = {};
  
  included[resource.type][resource.id] = resource;
}

function addSelfLink(resource, request){
  const link = request.baseUrl + '/' + resource.type + '/' + resource.id;
  resource.links.self = link; 
}


module.exports = {
  languageMapping,
  safeGet,
  safeGetString,
  safeGetOne,
  safeAdd,
  safePush,
  addIncludedResource,
  addRelationshipToMany,
  addRelationshipToOne,
  addSelfLink,
  isClockwise,
  transformMultilingualFields,
  transformFields,
  transformArrayFields,
  transformBasicProperties,
  transformMetadata,
  transformOperationSchedule,
  transformHowToArrive,
  transformAddress,
  transformGeometry,
  transformMediaObject
}
