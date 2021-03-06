'use strict';

const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');
const jwt = require('jsonwebtoken')
const configJWT = require('./api/helpers/configJWT.json');
const database = require('./database/database.js');
const users = require('./model/users.js');
require('dotenv').config();


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
module.exports = app; // for testing

var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    auth0: function (req, authOrSecDef, scopesOrApiKey, next) {
      console.log("path:" + req.path.indexOf('/api/examination/list_point_exam'))
      if(process.env.REQ_AUTH === "false" || req.path.indexOf('/api/examination/list_point_exam') != -1 || 
      req.path.indexOf('/api/examination/result_point_exam/*') != -1) {
        console.log("pass:" + req.path.toString())
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
  app.users = new users(app);
  app.users.getAllUsers(app.db);
}).catch((err) => {
  console.log("connect database err: " + err);
  throw(err);
})


////////////////////////////////////////////////////////////////////

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 8005;
  app.listen(port);

});
