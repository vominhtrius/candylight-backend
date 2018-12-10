'use strict';

const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');
const jwt = require('jsonwebtoken')
const configJWT = require('./api/helpers/configJWT.json');
const database = require('./database/database.js');
const WebSocketServer = require('ws');
const http = require('http');
const connection= require('./models/connection.js');
// const users = require('./model/users.js');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    auth0: function (req, authOrSecDef, scopesOrApiKey, next) {
      if(scopesOrApiKey) {
        var token = "" + scopesOrApiKey;
        jwt.verify(token, configJWT.secret , function(err, decode) {
          if (err) {
            next(new Error('access denied!'));
          } else {
            req.userId = decode.userId;
          }
          next();
        });
      } else {
        next(new Error('access denied!'));
      }
    }
  }
};

// ///////////////////////Start websocket/////////////// ///////////////
app.server = http.createServer(app);
app.wss = new WebSocketServer.Server({
  server: app.server,
})

//////////////////////connect database//////////////////////////////
database.connect().then((db)=>{
  console.log("connect database success");
  app.db = db;
}).catch((err) => {
  console.log("connect database err: " + err);
  throw(err);
})

//////////////////////////Create model socketServer////////////////////////
var conn = new connection(app);

////////////////////////////////////////////////////////////////////

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 8002;
  app.server.listen(port);

});

module.exports = app; // for testing
