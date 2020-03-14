module.exports.add = function (resource) {
  resource.opts.dataMeta = (object) => object.meta;
}
