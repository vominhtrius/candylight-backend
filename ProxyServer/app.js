const express = require('express');
const path = require('path');
const favicon = require('static-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const httpProxy = require('http-proxy');
const accountServiceRoute = require('./api/routes/account-service.js');
const chatServiceRoute = require('./api/routes/chat-service.js');
const learningServiceRoute = require('./api/routes/learning-service.js');
const exerciseServiceRoute = require('./api/routes/exercise-service.js');
const examinationServiceRoute = require('./api/routes/examination-service.js');
// const host = '127.0.0.1';
require('dotenv').config();
///////////////////////////////////////////
var app = express();
app.server = http.createServer(app);

/////////////////////////////////////////

const apiProxy = httpProxy.createProxyServer({});

////////////////////////////////////////////
//////////////////////////////////////////
app.use(favicon());
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
/////////////////////////////////////////

///////////////////////////////////////

accountServiceRoute(app, apiProxy);
chatServiceRoute(app, apiProxy);
learningServiceRoute(app, apiProxy);
exerciseServiceRoute(app, apiProxy);
examinationServiceRoute(app, apiProxy); 

///////////////////////////////////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

///////////////////////////////////////////
console.log(process.env.host)
app.server.listen(process.env.PORT || 8000, process.env.host, () => {
    console.log(`App running on port: ${app.server.address().port}`);
    console.log(`App running on host: ${app.server.address().address}`);
});

module.exports = app;
