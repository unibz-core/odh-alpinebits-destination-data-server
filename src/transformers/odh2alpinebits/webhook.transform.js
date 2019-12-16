
module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));

  let target = {
    id: source.id,
    type: 'webhooks',
    resourceType: source.resourceType ? source.resourceType : null,
    conditions: source.conditions ? source.conditions : undefined,
    callback: source.callback ? source.callback : undefined,
    secret: source.secret ? source.secret : undefined,
    watching: source.watching ? source.watching : undefined,
  };

  return target;
}
