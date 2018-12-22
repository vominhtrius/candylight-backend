'use strict';

const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');
const jwt = require('jsonwebtoken')
const configJWT = require('./api/helpers/configJWT.json');
const database = require('./database/database.js');
const users = require('./models/users');
require('dotenv').config();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
module.exports = app; // for testing

var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    auth0: function (req, authOrSecDef, scopesOrApiKey, next) {
      if(process.env.REQ_AUTH === "false" || req.path.indexOf('/api/exercise/game') != -1){
        console.log("pass:" + req.path)
        next();
      } else if(scopesOrApiKey) {
        var token = "" + scopesOrApiKey;
        jwt.verify(token, configJWT.secret , function(err, decode) {
          if (err) {
            next(new Error('access denied!'));
          } else {
            req.userId = decode.userId;
            next();
          }

        });
      } else {
        next(new Error('access denied!'));
      }
    }
  }
};


//////////////////////connect database//////////////////////////////
database.connect().then((db)=>{
  console.log("connect database success");
  app.db = db;
}).catch((err) => {
  console.log("connect database err: " + err);
  throw(err);
})

app.users = new users(app);

////////////////////////////////////////////////////////////////////

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 8004;
  app.listen(port);

});
