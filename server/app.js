'use strict';

const SwaggerExpress = require('swagger-express-mw');
const app = require('express')();
const database = require('./connect-service/connector-db.js');
module.exports = app; // for testing
const config = {
  appRoot: __dirname // required config
};

var redisdb;

SwaggerExpress.create(config, function (err, swaggerExpress) {
  if (err) {
    throw err;
  }

  //////////////////////// connect mongodb ///////////////////////
  database.connectMongoDB().then((mongodb) => {
    console.log("connect mongodb success");
    app.mongodb = mongodb;
  }).catch((err) => {
    throw (err);
  })

  ///////////////////////// connect redisdb ////////////////////////
  redisdb = database.connectRedisDB();

  redisdb.on('connect', function () {
    console.log('Redis client connected');
    app.redisdb = redisdb;
  });

  redisdb.on('error', function (err) {
    console.log('Something went wrong ' + err);
  });
  ////////////////////////////////////////////////////////////////

  
  // install middleware
  swaggerExpress.register(app);

  const port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});
