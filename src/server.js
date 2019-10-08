const express = require('express');
const cors = require('cors');
const errors = require('./messages/errors');
require('custom-env').env();

var app = express();

const corsOptions = {
  origin: process.env.REF_SERVER_CORS_ORIGIN,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json());

app.use( (req, res, next) => {
  //TODO: Add security layer
  //TODO: Add header validation layer
  console.log('> Request received: '+req.protocol+'://'+req.get('host')+req.originalUrl);
  next();
});

app.use( (req, res, next) => {
  res.setHeader('Content-Type', 'application/vnd.api+json');
  res.json = (body) => res.send(JSON.stringify(body, null, 2));
  next();
});

require('./routes/home.route.js')(app);
require('./routes/events.route.js')(app);
require('./routes/lifts.route.js')(app);
require('./routes/snowparks.route.js')(app);

require('./routes/places.route.js')(app);
require('./routes/agents.route.js')(app);
require('./routes/media-objects.route.js')(app);
require('./routes/event-series.route.js')(app);

app.get('*', (req, res) => {
  console.log('ERROR: Resource not found ('+req.originalUrl+')');
  res.status(errors.notFound.status);
  res.json(errors.createResponse(errors.notFound));
});

app.listen(process.env.REF_SERVER_PORT, function () {
  console.log('App listening at http://localhost:%s', this.address().port);
})
