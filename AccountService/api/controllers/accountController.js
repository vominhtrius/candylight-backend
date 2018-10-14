"use strict";

var util = require("util");
var jwt = require('jsonwebtoken') 
const config = require('./config')

//Singin user
function signin(req, res) {
  var body = req.swagger.params.body;
  var userName = body.value.username;
  var passWord = body.value.password;

  if(passWord !== "1"){

    res.status(401);
    res.json({success: 'Fail', message: 'Invaild username or password'});
    return;
  }

  var user = {
      username: userName, 
      password: passWord
  };
  const accessToken = jwt.sign(user, config.secret, { expiresIn: config.tokenLife }) 
  const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife }) 
  res.status(200);
  res.json({access_token: accessToken, refesh_token: refreshToken});
}

//Sign up user
function signup(req, res) {
  var body = req.swagger.params.body;
  var userName = body.value.username;
  var passWord = body.value.password;
  var firstName = body.value.firstName;
  var lastName = body.value.lastName;


  var user = {
    username: userName, 
    password: passWord,
    firstName: firstName,
    lastName: lastName
  };

  
  const accessToken = jwt.sign(user, config.secret, { expiresIn: config.tokenLife }) 
  const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife }) 
  res.status(200);
  res.json({access_token: accessToken, refesh_token: refreshToken});
}



module.exports = {
  signin: signin,
  signup: signup,
};
