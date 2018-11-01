"use strict";

var util = require("util");
var jwt = require('jsonwebtoken')
const config = require('./config')
const accountRepo = require('../../repository/accountRepo')
const md5 = require('md5')
var ObjectId = require('mongodb').ObjectID;
const request = require('request');

//db.createIndex({email:1},{unique:true});
//Singin user
function signin(req, res) {
  var body = req.swagger.params.body;
  var userName = body.value.userName;
  var passWord = body.value.passWord;
  if (userName === "") {
    res.json({
      success: false,
      message: 'Missing username'
    });
    return;
  }
  if (passWord === "") {
    res.json({
      success: false,
      message: 'Missing passWord'
    });
    return;
  }
  var user = {
    userName: userName,
    passWord: md5(passWord)
  };
  //console.log(user);
  accountRepo.findOne(user, (value) => {
    if (value == null) {
      res.status(401);
      res.json({
        success: false,
        message: 'Invaild username or passWord'
      });
    } else {
      const accessToken = jwt.sign({
        userId: value._id
      }, config.secret, {
        expiresIn: config.tokenLife
      })
      value.passWord = null;
      res.status(200);
      res.json({
        success: true,
        message: "",
        value: {
          access_token: accessToken,
          profile: value
        }
      });
    }
  });
}

function signinFB(req, res) {
  var body = req.swagger.params.body;
  var access_token = body.value.access_token;
  const options = {
    url: 'https://graph.facebook.com/v3.2/me',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
    },
    qs: {
      access_token: access_token,
      fields: 'email,first_name,last_name'
    }
  };
  request(options, function (err, resRQ, body) { 
    let json = JSON.parse(body);
    var userId = json.id;
    var email = json.email;
    var fName = json.first_name;
    var lName = json.last_name;
    
    if(!userId) {
      res.status(401);
      res.json({
        success: false,
        message: json.error.message + " ( " + json.error.code + " )",
      });
      return;
    }
    accountRepo.findOne({
      "userName": userId
    }, (value) => { //not exist userId in db -> create account
      if (value == null) { 
        console.log("Create user");
        var user = {
          userName: userId,
          passWord: null,
          email: email,
          firstName: fName,
          lastName: lName,
          region: "",
          school: "",
          capacity: "",
          firstNameParent: "",
          lastNameParent: "",
          emailParent: "",
          phoneParent: "",
          regionParent: "",
          pointReward: 0,
        };
        //console.log("new user: " + user);
        accountRepo.insert(user, (err, result) => {
          if (err) {
            var mess = "";
            if (err.code === 11000) {
              mess = "Username already exists";
            } else {
              mess = "Error undefine, StatusCode: " + err.code;
            }
            res.status(401);
            res.json({
              success: false,
              message: mess
            });
            console.log("OK send");
          } else {
            const accessToken = jwt.sign({
              userId: user._id
            }, config.secret, {
              expiresIn: config.tokenLife
            })
            user.passWord = null;
            res.status(200);
            res.json({
              success: true,
              message: "",
              value: {
                access_token: accessToken,
                profile: user
              }
            });
          }
        });
      } else { //exist userId in db -> get accessToken
        const accessToken = jwt.sign({userId: value._id }, config.secret, { expiresIn: config.tokenLife })
        value.passWord = null;
        res.status(200);
        res.json({
          success: true,
          message: "",
          value: {
            access_token: accessToken,
            profile: value
          }
        });
      }
    });
  });
  
}

function signinGoogle(req, res) {
  var body = req.swagger.params.body;
  var access_token = body.value.access_token;
  const options = {
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8',
    },
    qs: {
      access_token: access_token,
    }
  };
  request(options, function (err, resRQ, body) { 
    let json = JSON.parse(body);
    var userId = json.id;
    var email = json.email;
    var fName = json.given_name;
    var lName = json.family_name;
    
    if(!userId) {
      res.status(401);
      res.json({
        success: false,
        message: json.error.message + " ( " + json.error.code + " )",
      });
      return;
    }
    accountRepo.findOne({
      "userName": userId
    }, (value) => {
      if (value == null) {
        console.log("Create user");
        var user = {
          userName: userId,
          passWord: null,
          email: email,
          firstName: fName,
          lastName: lName,
          region: "",
          school: "",
          capacity: "",
          firstNameParent: "",
          lastNameParent: "",
          emailParent: "",
          phoneParent: "",
          regionParent: "",
          pointReward: 0,
        };
        //console.log("new user: " + user);
        accountRepo.insert(user, (err, result) => {
          if (err) {
            var mess = "";
            if (err.code === 11000) {
              mess = "Username already exists";
            } else {
              mess = "Error undefine, StatusCode: " + err.code;
            }
            res.status(401);
            res.json({
              success: false,
              message: mess
            });
            console.log("OK send");
          } else {
            const accessToken = jwt.sign({
              userId: user._id
            }, config.secret, {
              expiresIn: config.tokenLife
            })
            user.passWord = null;
            res.status(200);
            res.json({
              success: true,
              message: "",
              value: {
                access_token: accessToken,
                profile: user
              }
            });
          }
        });
      } else { //exist userId in db -> get accessToken
        const accessToken = jwt.sign({userId: value._id }, config.secret, { expiresIn: config.tokenLife })
        value.passWord = null;
        res.status(200);
        res.json({
          success: true,
          message: "",
          value: {
            access_token: accessToken,
            profile: value
          }
        });
      }
    });
  });
}
//Sign up user
function signup(req, res) {

  var body = req.swagger.params.body;
  var userName = body.value.userName;
  var passWord = body.value.passWord;
  var rePassWord = body.value.rePassWord;
  var email = body.value.email;
  if (userName === "") {
    res.json({
      success: false,
      message: 'Missing username'
    });
    return;
  }
  if (passWord === "") {
    res.json({
      success: false,
      message: 'Missing passWord'
    });
    return;
  }
  if (passWord !== rePassWord) {
    res.json({
      success: false,
      message: 'passWord and Re-enter passWord not match'
    });
    return;
  }
  if (email === "") {
    res.json({
      success: false,
      message: 'Missing email'
    });
    return;
  }
  var user = {
    userName: userName,
    passWord: md5(passWord),
    email: email,
    firstName: "",
    lastName: "",
    region: "",
    school: "",
    capacity: "",
    firstNameParent: "",
    lastNameParent: "",
    emailParent: "",
    phoneParent: "",
    regionParent: "",
    pointReward: 0,
  };
  accountRepo.insert(user, (err, result) => {
    if (err) {
      var mess = "";
      if (err.code === 11000) {
        mess = "Username already exists";
      } else {
        mess = "Error undefine, StatusCode: " + err.code;
      }
      res.status(401);
      res.json({
        success: false,
        message: mess
      });
      console.log("OK send");
    } else {
      const accessToken = jwt.sign({
        userId: user._id
      }, config.secret, {
        expiresIn: config.tokenLife
      })

      user.passWord = null;
      res.status(200);
      res.json({
        success: true,
        message: "",
        value: {
          access_token: accessToken,
          profile: user
        }
      });
    }
  });
}

//update info user
function updateInfo(req, res) {

  var userId = req.userId;
  if (!userId) {
    res.status(403);
    res.json({
      success: false,
      message: 'access denied'
    });
    return;
  }

  var body = req.swagger.params.body;

  var firstName = body.value.firstName;
  var lastName = body.value.lastName;
  var region = body.value.region;
  var school = body.value.school;
  var capacity = body.value.capacity; //hoc luc
  var fNameParent = body.value.firstNameParent;
  var lNameParent = body.value.lastNameParent;
  var emailParent = body.value.emailParent;
  var phoneParent = body.value.phoneParent;
  var regionParent = body.value.regionParent;


  if (firstName == "") {
    res.json({
      success: false,
      message: 'Missing firstName'
    });
    return;
  }
  if (lastName == "") {
    res.json({
      success: false,
      message: 'Missing lastName'
    });
    return;
  }
  if (region == "") {
    res.json({
      success: false,
      message: 'Missing region'
    });
    return;
  }
  if (school == "") {
    res.json({
      success: false,
      message: 'Missing school'
    });
    return;
  }
  if (capacity == "") {
    res.json({
      success: false,
      message: 'Missing capacity'
    });
    return;
  }
  if (fNameParent == "") {
    res.json({
      success: false,
      message: 'Missing First Name Parent'
    });
    return;
  }
  if (lNameParent == "") {
    res.json({
      success: false,
      message: 'Missing Last Name Parent'
    });
    return;
  }
  if (emailParent == "") {
    res.json({
      success: false,
      message: 'Missing Email Parent'
    });
    return;
  }
  if (phoneParent == "") {
    res.json({
      success: false,
      message: 'Missing Phone Parent'
    });
    return;
  }
  if (regionParent == "") {
    res.json({
      success: false,
      message: 'Missing Region Parent'
    });
    return;
  }
  if(phoneParent == "") {
    res.json({success: false, message: 'Missing Phone Parent'});
    return;
  }
  if(regionParent == "") {
    res.json({success: false, message: 'Missing Region Parent'});
    return;
  }

  var userProfile = {
    firstName: firstName,
    lastName: lastName,
    region: region,
    school: school,
    capacity: capacity,
    firstNameParent: fNameParent,
    lastNameParent: lNameParent,
    emailParent: emailParent,
    phoneParent: phoneParent,
    regionParent: regionParent
  };
  accountRepo.findOne({
    "_id": new ObjectId(userId)
  }, (value) => {
    if (value == null) {
      res.status(401);
      res.json({
        success: false,
        message: 'User not found'
      });

    } else {
      value.firstName = firstName;
      value.lastName = lastName,
      value.region = region,
      value.school = school,
      value.capacity = capacity,
      value.firstNameParent = fNameParent,
      value.lastNameParent = lNameParent,
      value.emailParent = emailParent,
      value.phoneParent = phoneParent,
      value.regionParent = regionParent
      accountRepo.update({
        "_id": new ObjectId(userId)
      }, value, (err, result) => {
        if (err) {
          console.log(err);
          res.status(401);
          res.json({
            success: false,
            message: ""
          });
          console.log("OK send");
        } else {
          value.passWord = null;
          res.status(200);
          res.json({
            success: true,
            profile: value
          });
        }
      });
    }
  });

}

//get info user
function getInfo(req, res) {

  var userId = req.userId;
  if (userId) {
    accountRepo.findOne({
      "_id": new ObjectId(userId)
    }, (value) => {
      if (value == null) {
        res.status(401);
        res.json({
          success: false,
          message: 'User not found'
        });
      } else {
        value.passWord = null;
        res.status(200);
        res.json({
          success: true,
          profile: value
        });
      }
    });
  } else {
    res.status(403);
    res.json({
      success: false,
      message: 'access denied'
    });
  }
}

module.exports = {
  signin: signin,
  signup: signup,
  updateInfo: updateInfo,
  getInfo: getInfo,
  signinFB: signinFB,
  signinGoogle: signinGoogle,
};