/*
USED:

PARTIALLY USED :

IGNORED:

> Potentially Useful:
  * AltitudeDifference

> Empty fields:

> Out of scope:
  * Active

> Redundant
  * AdditionalPoiInfos: we this data from 'PoiType' and 'SubType'

*/

var sanitizeHtml = require('sanitize-html');
const utils = require('./utils');
const templates = require('./templates');

const htmlSanitizeOpts = {
  allowedTags: [],
  allowedAttributes: {}
};

module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));
  let target = templates.createObject('Lift');

  Object.assign(target, utils.transformMetadata(source));
  Object.assign(target, utils.transformBasicProperties(source));

  const categoryMapping = {
    'Sessellift': 'alpinebits/chairlift',
    'Seilbahn': 'alpinebits/funicular',
    'Skibus': 'alpinebits/skibus',
    'Förderband': 'alpinebits/conveyor-belt',
    'Telemix': 'alpinebits/telemix',
    'Standseilbahn/Zahnradbahn': 'alpinebits/cable-railway ',
    'no Subtype': null,
    'Zug': 'alpinebits/train',
    'Kabinenbahn': 'alpinebits/gondola',
    'Schrägaufzug': 'alpinebits/inclined-lift',
    'Umlaufbahn': 'alpinebits/detachable-gondola',
    'Unterirdische Bahn': 'alpinebits/underground-ropeway',
    'Skilift': 'alpinebits/skilift',
  }

  target.category = categoryMapping[source.SubType];

  if(source.GpsInfo && source.GpsInfo.length>=1) {
    if(source.GpsInfo.length===1) {
      let geometry = templates.createObject('Point');
      target.geometries.push(geometry);
      let point = source.GpsInfo[0];
      geometry.coordinates.push(point.Longitude);
      geometry.coordinates.push(point.Latitude);
      geometry.coordinates.push(point.Altitude);
    }
    else {
      let geometry = templates.createObject('LineString');
      target.geometries.push(geometry);

      source.GpsInfo.forEach(point => {
        let newPoint = [];
        newPoint.push(point.Longitude);
        newPoint.push(point.Latitude);
        newPoint.push(point.Altitude);
        geometry.coordinates.push(newPoint);
      })
    }
  }

  target.length = source.DistanceLength>0 ? source.DistanceLength : null;

  const deGetThere = utils.safeGet(['de','GetThereText'], source.Detail);
  const itGetThere = utils.safeGet(['it','GetThereText'], source.Detail);
  const enGetThere = utils.safeGet(['en','GetThereText'], source.Detail);

  if(deGetThere || itGetThere || enGetThere)
    target.howToArrive = {
      deu: sanitizeHtml(deGetThere, htmlSanitizeOpts),
      ita: sanitizeHtml(itGetThere, htmlSanitizeOpts),
      eng: sanitizeHtml(enGetThere, htmlSanitizeOpts)
    };

  target.personsPerChair = parseInt(source.PoiType, 10);

  source.OperationSchedule.forEach( entry => {
    let newEntry = templates.createObject('HoursSpecification');
    target.openingHours.push(newEntry);

    newEntry.validFrom = entry.Start.replace(/T.*/,'');
    newEntry.validTo = entry.Stop.replace(/T.*/,'');

    entry.OperationScheduleTime.forEach( hours =>
      newEntry.hours.push({ opens: hours.Start, closes: hours.End})
    );
  })

  let address = templates.createObject('Address');
  target.address = address;

  let contactInfo = source.ContactInfos;

  target.address.city = {
    deu: utils.safeGet(['de','City'], contactInfo),
    ita: utils.safeGet(['it','City'], contactInfo),
    eng: utils.safeGet(['en','City'], contactInfo)
  };

  address.country = utils.safeGet(['de','CountryCode'], contactInfo) ||
    utils.safeGet(['it','CountryCode'], contactInfo) || utils.safeGet(['en','CountryCode'], contactInfo);

  address.zipcode = utils.safeGet(['de','ZipCode'], contactInfo) ||
    utils.safeGet(['it','ZipCode'], contactInfo) || utils.safeGet(['en','ZipCode'], contactInfo);

  address.region = {}

  return target;
}
