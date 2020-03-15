const utils = require('./utils');

module.exports = (originalObject, included = {}, request) => {
  const target = JSON.parse(JSON.stringify(originalObject));

  utils.addSelfLink(target, request);

  target.included.forEach(relatedResource => {
    utils.addIncludedResource(included, relatedResource);
  });

  delete target.included;

  return target;
}
