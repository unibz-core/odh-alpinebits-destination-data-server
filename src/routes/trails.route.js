const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

function handleNotImplemented(req, res){
  handleError(errors.notImplemented, req, res);
}

function handleError(err, req, res ){
  console.log(err);
  res.status(err.status || 500);
  res.json(errors.createResponse(err));
}

module.exports = function(app) {
  app.get('/api/v1/trails', function(req, res) {
    connector.getTrails(parseCollectionRequest(req))
      .then(data => res.json(data))
      .catch(error => handleError(error, req, res));
  });

  app.get('/api/v1/trails/:id', function(req, res) {
    connector.getTrailById(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => handleError(error, req, res));
  });

  app.get('/api/v1/trails/:id/multimediaDescriptions', function(req, res) {
    handleNotImplemented(req,res);
  });

  app.get('/api/v1/trails/:id/relationships/multimediaDescriptions', function(req, res) {
    handleNotImplemented(req,res);
  });

}
