const transformEvent = require('./event.transform');
const transformLift = require('./lift.transform');
const transformSnowpark = require('./snowpark.transform');
const transformMountainArea = require('./mountainarea.transform');


function transformArray(data, transformFn) {
  let result = [];

  for (object of data.Items)
    result.push(transformFn(object));

  return result;
}

module.exports = {
  transformEventArray: data => transformArray(data, transformEvent),
  transformEvent: data => transformEvent(data),
  transformLiftArray: data => transformArray(data, transformLift),
  transformLift: data => transformLift(data),
  transformSnowparkArray: data => transformArray(data, transformSnowpark),
  transformSnowpark: data => transformSnowpark(data),
  transformMountainAreaArray: data => transformArray(data, transformMountainArea),
  transformMountainArea: data => transformMountainArea(data)
}
