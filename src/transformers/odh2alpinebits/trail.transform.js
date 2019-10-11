/*
USED:
  * Id
  * SmgTags
  * Difficulty
  * OperationSchedule
  * GpsInfo
  * GpsPoints
  * GpsTrack
  * DistanceLength
  * LastChange

PARTIALLY USED:
  * Detail: Title, BaseText, GetThereText
  * ContactInfos: City, Country, ZipCode, Street

IGNORED:
  * Type
  * SubType
  * PoiType
  * Active
  * AdditionalPoiInfos
  * AltitudeDifference
  * AltitudeSumDown
  * AltitudeSumUp
  * AreaId
  * BikeTransport
  * ChildPoiIds
  * CopyrightChecked
  * DistanceDuration
  * Exposition
  * FeetClimb
  * FirstImport
  * HasFreeEntrance
  * HasLanguage
  * HasRentals
  * Highlight
  * Id
  * ImageGallery
  * IsOpen
  * IsPrepared
  * IsWithLigth
  * LiftAvailable
  * LocationInfo
  * LTSTags
  * MasterPoiIds
  * OutdooractiveID
  * OwnerRid
  * RunToValley
  * SmgActive
  * SmgId
  * TourismorganizationId

OUT OF SCOPE:
  * Active : 'true' valued boolean for every object

*/

const shajs = require('sha.js')
const utils = require('./utils');
const templates = require('./templates');

module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));
  let target = templates.createObject('Trail');

  Object.assign(target, utils.transformMetadata(source));
  Object.assign(target, utils.transformBasicProperties(source));

  const categoryMapping = {
    'ski alpin': 'alpinebits/ski-slope',
    'ski alpin (rundkurs)': 'alpinebits/ski-slope',
    'rodelbahnen': 'alpinebits/sledge-slope',
    'loipen': 'alpinebits/cross-country',
  };

  source.SmgTags.find(tag => {
    if(categoryMapping[tag]) {
      target.category = categoryMapping[tag];
      return true;
    }
    return false;
  })

  target.length = source.DistanceLength > 0 ? source.DistanceLength : null;

  target.minAltitude = source.AltitudeLowestPoint;
  target.maxAltitude = source.AltitudeHighestPoint;

  const difficultyMapping = {
    '2': 'alpinebits/easy',
    '4': 'alpinebits/medium',
    '6': 'alpinebits/hard'
  }
  target.difficulty = difficultyMapping[source.Difficulty];

  const geometry = utils.transformGeometry(source.GpsInfo, ['Startpunkt', 'Endpunkt'], source.GpsPoints, source.GpsTrack);
  if(geometry) target.geometries.push(geometry);

  target.openingHours = utils.transformOperationSchedule(source.OperationSchedule);

  target.address = utils.transformAddress(source.ContactInfos, ['city','country','zipcode','street']);

  target.howToArrive = utils.transformHowToArrive(source.Detail);

  return target;
}
