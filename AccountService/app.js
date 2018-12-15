'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');
var jwt = require('jsonwebtoken') 
var configJWT = require('./api/controllers/config');
const accountRepo = require('../AccountService/repository/accountRepo');
const mailer = require('./mailer');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
module.exports = app; // for testing

var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    auth0: function (req, authOrSecDef, scopesOrApiKey, next) {
      if(scopesOrApiKey) {
        var token = "" + scopesOrApiKey;
        jwt.verify(token, configJWT.secret , function(err, decode) {
          if (err) {
            req.userId = undefined;
          } else {
            req.userId = decode.userId;
          }
          next();
        });
      } else {
        //next();
        next(new Error('access denied!'));
      }
    }
  }
};


setInterval(function(){
  accountRepo.findAll(value => {
    value.forEach(account => {
      if(account.emailParent) {
        mailer.sendEmail(account._id, account.firstName + ' ' + account.lastName, account.emailParent , "12_2018");
      }
    })
  })
}, 1296000000);



SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 8001;
  app.listen(port);

 
});
