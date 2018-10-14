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

//update info user
function updateInfo(req, res) {
  var body = req.swagger.params.body;
  var userId = '1223456'
  var userName = 'tuan'
  var pointReward = 0
  var firstName = body.value.firstName;
  var lastName = body.value.lastName;
  var region = body.value.region;
  var school = body.value.school;
  var capacity = body.value.capacity;
  var fNameParent = body.value.firstNameParent;
  var lNameParent = body.value.lastNameParent;
  var emailParent = body.value.emailParent;
  
  
  var userInfo = {
    userId: userId,
    userName: userName, 
    firstName: firstName,
    lastName: lastName,
    region: region,
    school: school,
    capacity: capacity,
    fNameParent: fNameParent,
    lNameParent: lNameParent,
    pointReward: pointReward,
    emailParent: emailParent
  };


  
  res.status(200);
  res.json({success:'OK', profile: userInfo});
}

//get info user
function getInfo(req, res) {
  var userId = '1223456'
  var userName = 'tuanna'
  //var passWord = '123456'
  var firstName = 'tuan'
  var lastName = 'nguyen'
  var region = 'HCM'
  var school = 'HCMUS'
  var capacity = 'Kha'
  var fNameParent = 'A'
  var lNameParent = 'Nguyen'
  var pointReward = 0
  var emailParent = 'bnguyen@gmail.com'
  
  
  
  var userInfo = {
    userId: userId,
    userName: userName, 
    firstName: firstName,
    lastName: lastName,
    region: region,
    school: school,
    capacity: capacity,
    fNameParent: fNameParent,
    lNameParent: lNameParent,
    pointReward: pointReward,
    emailParent: emailParent
  };

  // var user = {
  //   username: userName, 
  //   password: passWord,
  // };
  
  res.status(200);
  res.json({profile: userInfo});
}
module.exports = {
  signin: signin,
  signup: signup,
  updateInfo: updateInfo,
  getInfo: getInfo,
};
