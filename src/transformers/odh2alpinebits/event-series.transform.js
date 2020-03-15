const utils = require('./utils');

module.exports = (originalObject, included = {}, request) => {
  const target = JSON.parse(JSON.stringify(originalObject));

  let links = target.links;
  Object.assign(links, utils.createSelfLink(target, request));

  target.included.forEach(relatedResource => {
    utils.addIncludedResource(included, relatedResource);
  });

  delete target.included;

  return target;
}
