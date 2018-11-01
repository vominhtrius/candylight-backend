"use strict";

var util = require("util");
var jwt = require('jsonwebtoken') 
const config = require('./config')
const db = require('../../fn/mongo')
const uuidv1 = require('uuid/v1');
var ObjectId = require('mongodb').ObjectID;

//db.createIndex({email:1},{unique:true});
//Singin user
function signin(req, res) {
  var body = req.swagger.params.body;
  var userName = body.value.username;
  var passWord = body.value.password;
  if(userName === "") {
    res.json({success: false, message: 'Missing username'});
    return;
  }
  if(passWord === "") {
    res.json({success: false, message: 'Missing password'});
    return;
  }
  var user = {
      username: userName, 
      password: passWord
  };
  console.log(user);
  db.findOne(user, (value) => {
    if(value == null){
      res.status(401);
      res.json({success: false, message: 'Invaild username or password'});
    } else {
      const accessToken = jwt.sign({userId: value._id}, config.secret, { expiresIn: config.tokenLife }) 
      res.status(200);
      
      res.json({ 
        success: true,
        message: "", 
        value:{ access_token: accessToken, profile: value}
      });
    }
  });
}

//Sign up user
function signup(req, res) {

  var body = req.swagger.params.body;
  var userName = body.value.username;
  var passWord = body.value.password;
  var firstName = body.value.firstName;
  var lastName = body.value.lastName;
  if(userName === "") {
    res.json({success: false, message: 'Missing username'});
    return;
  }
  if(passWord === "") {
    res.json({success: false, message: 'Missing password'});
    return;
  }
  if(firstName === "") {
    res.json({success: false, message: 'Missing firstname'});
    return;
  }
  if(lastName === "") {
    res.json({success: false, message: 'Missing lastname'});
    return;
  }
  var user = {
    username: userName, 
    password: passWord,
    firstName: firstName,
    lastName: lastName,
    region: "",
    school: "",
    capacity: "",
    fNameParent: "",
    lNameParent: "",
    emailParent: "",
    pointReward: 0,
  };
  //console.log(user);
  db.insert(user, (err, result) => {
    if(err){
      var mess = "";
      console.log(err);
      if(err.code === 11000) {
        mess = "Username already exists";
      } else {
        mess = "Error undefine, StatusCode: " + err.code;
      }
      res.status(401);
      res.json({success: false, message: mess});
      console.log("OK send");
    } else {
      const accessToken = jwt.sign({ userId: user._id}, config.secret, { expiresIn: config.tokenLife }) 
      res.status(200);
      res.json({ 
        success: true,
        message: "", 
        value:{ access_token: accessToken, profile: user}
      });
    }
  });
}

//update info user
function updateInfo(req, res) {

  var userId = req.userId;
  if(!userId) {
    res.status(403);
    res.json({success: false, message: 'access denied'});
    return;
  }

  var body = req.swagger.params.body;

  var firstName = body.value.firstName;
  var lastName = body.value.lastName;
  var region = body.value.region;
  var school = body.value.school;
  var capacity = body.value.capacity;
  var fNameParent = body.value.fNameParent;
  var lNameParent = body.value.lNameParent;
  var emailParent = body.value.emailParent;
  
  if(firstName == "") {
    res.json({success: false, message: 'Missing firstName'});
    return;
  }
  if(lastName == "") {
    res.json({success: false, message: 'Missing lastName'});
    return;
  }
  if(region == "") {
    res.json({success: false, message: 'Missing region'});
    return;
  }
  if(school == "") {
    res.json({success: false, message: 'Missing school'});
    return;
  }
  if(capacity == "") {
    res.json({success: false, message: 'Missing capacity'});
    return;
  }
  if(fNameParent == "") {
    res.json({success: false, message: 'Missing First Name Parent'});
    return;
  }
  if(lNameParent == "") {
    res.json({success: false, message: 'Missing Last Name Parent'});
    return;
  }
  if(emailParent == "") {
    res.json({success: false, message: 'Missing Email Parent'});
    return;
  }

  var userProfile = {
    firstName: firstName,
    lastName: lastName,
    region: region,
    school: school,
    capacity: capacity,
    fNameParent: fNameParent,
    lNameParent: lNameParent,
    emailParent: emailParent
  };
  console.log(userProfile);
  db.update({"_id": new ObjectId(userId)}, userProfile, (err, result) => {
    if(err){
      console.log(err);
      res.status(401);
      res.json({success: false, message: ""});
      console.log("OK send");
    } else {
      res.status(200);
      res.json({ 
        success: true,
        profile: userProfile
      });
    }
  });
  
}

//get info user
function getInfo(req, res) {
  
  var userId = req.userId;
  if(userId) {
    db.findOne({"_id": new ObjectId(userId)}, (value) => {
      if(value == null){
        res.status(401);
        res.json({success: false, message: 'User not found'});
      } else {
        res.status(200);
        res.json({ 
          success: true,
          profile: value
        });
      }
    });
  } else {
    res.status(403);
    res.json({success: false, message: 'access denied'});
  }
}
module.exports = {
  signin: signin,
  signup: signup,
  updateInfo: updateInfo,
  getInfo: getInfo,
};