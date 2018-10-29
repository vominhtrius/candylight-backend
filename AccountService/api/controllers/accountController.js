"use strict";

var util = require("util");
var jwt = require('jsonwebtoken')
const config = require('./config')
const db = require('../../fn/mongo')
const md5 = require('md5')
var ObjectId = require('mongodb').ObjectID;
const request = require('request');


//Singin user
function signin(req, res) {
  var body = req.swagger.params.body;
  var userName = body.value.username;
  var passWord = body.value.password;
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
      message: 'Missing password'
    });
    return;
  }
  var user = {
    username: userName,
    password: md5(passWord)
  };
  console.log(user);
  db.findOne(user, (value) => {
    if (value == null) {
      res.status(401);
      res.json({
        success: false,
        message: 'Invaild username or password'
      });
    } else {
      const accessToken = jwt.sign({
        userId: value._id
      }, config.secret, {
        expiresIn: config.tokenLife
      })
      value.password = null;
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
    // eyJhbGciOiJSUzI1NiIsImtpZCI6IjgyODlkNTQyODBiNzY3MTJkZTQxY2QyZWY5NTk3MmIxMjNiZTlhYzAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MDc0MDg3MTgxOTIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDMxMTY1MTYwMDM4NzkwNzAwNDUiLCJhdF9oYXNoIjoiU1VCdm9XM3JCazd0NmhqMnA4Rkh5dyIsIm5hbWUiOiJraW5nIGN1YSBubyIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLXJaWnV3cE1qc01zL0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FCdE5sYkNKOF9wRXdKaE5USjBKanFIWHoyV1c0LXo5ZkEvczk2LWMvcGhvdG8uanBnIiwiZ2l2ZW5fbmFtZSI6ImtpbmciLCJmYW1pbHlfbmFtZSI6ImN1YSBubyIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNTQwODA3MjQ4LCJleHAiOjE1NDA4MTA4NDh9.UUU24CO4wPRdKVkEcWvZs35Hkp02YrUaHZ1So695VGqJC2SN3gYcJnt9TTiNfAtrArSwSuctvCEa6YPPEq3jnEPBeY_K1Hz3eZALdDMIjjY_wqmJYsvBJySxjPtancBdFtTsBj4adDcuPCWyBNMqXxxWjrKnSKzze3fLw1gWqbp1QsEnUoO__Lka8GTjKZLXzUL8l6cPatcUYZU_CRuSjiVhleAYxjYslGybNDd4L8mf7LmbGihOM1qQ3TykppZcXfT9yd9L2IrgDGFqHoGdjwZAQDFvkfEVGnOal_2CBHyizhLEn-mjPWvc8Kb8e8Muglv-vLXyL3Nka9rl4McBmg
    db.findOne({
      "username": userId
    }, (value) => {
      if (value == null) {
        console.log("Create user");
        var user = {
          username: userId,
          password: null,
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
        console.log("new user: " + user);
        db.insert(user, (err, result) => {
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
            user.password = null;
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
        value.password = null;
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
    db.findOne({
      "username": userId
    }, (value) => {
      if (value == null) {
        console.log("Create user");
        var user = {
          username: userId,
          password: null,
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
        console.log("new user: " + user);
        db.insert(user, (err, result) => {
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
            user.password = null;
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
        value.password = null;
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
  var userName = body.value.username;
  var password = body.value.password;
  var rePassword = body.value.rePassword;
  var email = body.value.email;

  if (userName === "") {
    res.json({
      success: false,
      message: 'Missing username'
    });
    return;
  }
  if (password === "") {
    res.json({
      success: false,
      message: 'Missing password'
    });
    return;
  }
  if (password !== rePassword) {
    res.json({
      success: false,
      message: 'Password and Re-enter password not match'
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
    username: userName,
    password: md5(password),
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
  db.insert(user, (err, result) => {
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

      user.password = null;
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
  db.findOne({
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
      db.update({
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
          value.password = null;
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
    db.findOne({
      "_id": new ObjectId(userId)
    }, (value) => {
      if (value == null) {
        res.status(401);
        res.json({
          success: false,
          message: 'User not found'
        });
      } else {
        value.password = null;
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