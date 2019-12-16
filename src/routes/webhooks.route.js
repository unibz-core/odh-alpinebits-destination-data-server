const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

module.exports = function(app) {
  app.get('/api/1.0/webhooks', function(req, res) {
    connector.getWebhooks(parseCollectionRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });
  
  app.get('/api/1.0/webhooks/:id', function(req, res) {
    connector.getWebhookById(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.post('/api/1.0/webhooks', function(req, res) {
    // console.log(req);
    
    connector.createWebhook(req)
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.post('/api/1.0/webhooks/:id/watching', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
  
  app.patch('/api/1.0/webhooks/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.patch('/api/1.0/webhooks/:id/watching', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
  
  app.delete('/api/1.0/webhooks/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.delete('/api/1.0/webhooks/:id/watching', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

}
