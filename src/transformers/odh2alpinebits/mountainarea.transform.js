/*
CHECK:
  *

USED:
  *

PARTIALLY USED :
  *

IGNORED:
> Potentially useful:
  *

> Out of scope or "useless" field (e.g. always null, [], false...)
  *

> Redundant
  *

*/

const utils = require('./utils');
const templates = require('./templates');

module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));
  // let target = templates.createObject('MountainArea');
  //
  // Object.assign(target, utils.transformMetadata(source));
  // Object.assign(target, utils.transformBasicProperties(source));
  //
  // target.minAltitude = source.AltitudeLowestPoint;
  // target.maxAltitude = source.AltitudeHighestPoint;
  //
  // const difficultyMapping = {
  //   '2': 'alpinebits/easy',
  //   '4': 'alpinebits/medium',
  //   '6': 'alpinebits/hard'
  // }
  // target.difficulty = difficultyMapping[source.Difficulty];
  //
  // target.length = source.DistanceLength > 0 ? source.DistanceLength : null;
  //
  // target.howToArrive = utils.transformHowToArrive(source.Detail);
  //
  // target.openingHours = utils.transformOperationSchedule(source.OperationSchedule);
  //
  // target.address = utils.transformAddress(source.ContactInfos, ['city','country','zipcode']);
  //
  // const geometry = utils.transformGeometry(source.GpsInfo, ['Startpunkt', 'Endpunkt'], source.GpsPoints, source.GpsTrack);
  // if(geometry) target.geometries.push(geometry);
  //
  // return target;
  return source;
}
