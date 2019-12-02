const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

module.exports = function(app) {
  app.get('/api/1.0/events', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.post('/api/1.0/events', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/1.0/events/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.delete('/api/1.0/events/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

}
