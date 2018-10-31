'use strict';

var util = require('util');
const config = require('./config')
const lessonRepo = require('../../repository/lessonRepo')
const topicRepo = require('../../repository/topicRepo')
const categoryRepo = require('../../repository/categoryRepo')


var ObjectId = require('mongodb').ObjectID;

module.exports = {
  getHead: get,
  addHead: add,
  updateHead: update,
  findOneHead: getOne,
};

function get(req, res) {

  headRepo.getAll().then( value => {
    //console.log(util.inspect(value, {showHidden: false, depth: null}))
    if(!value)
      value = [];
    res.status(200);
    res.json({success: true, value: {heads: value } });
  }).catch( error => {
    res.status(200);
    res.json({success: false, message: err.err });
  });
}

function getOne(req, res) {
  
  var lessonId = req.swagger.params.lessonId.value.trim();
  //middleware
  // if(lessonId.length !== 24) {
  //   res.status(200);
  //   res.json({success: false, message: "lessonId not found"});
  // }
  lessonRepo.findOne({"_id": new ObjectId(lessonId)}).then( value => {
    var success = true;
    var mess = "";
    if(!value){
      success = false;
      value = {};
      mess = "lessonId not found";
    }
    //console.log(util.inspect(value, {showHidden: false, depth: null}))

    res.status(200);
    res.json({success: true, message: mess, value: value});
  }).catch( err => {
    //console.log(util.inspect(err, {showHidden: false, depth: null}))
    res.status(200);
    res.json({success: false, message: err.err });
  });
}

function add(req, res) {

  var body = req.swagger.params.body.value;
  var content = body.content;
  var headId = body.headId;
  var majorId = body.majorId;
  var title = body.title;
  var data = {
    content: content,
    headId: headId,
    majorId: majorId,
    title: title
  }
  lessonRepo.insert(data).then( value => {
    res.status(200);
    res.json({success: true, value: data});
    console.log(util.inspect(data, {showHidden: false, depth: null}))
    
    var queryMajor = {"_id": new ObjectId(majorId)};
    majorRepo.update(queryMajor, {$push: { lessons: { _id: data._id, title: data.title } } });

  }).catch( err => {
    res.status(200);
    res.json({success: false, message: err.err });
  });
}

function update(req, res) {
  
//db.getCollection('Majors').find({"_id": ObjectId("5bd827d5fad8ea1600fcb18b")}).delete({$pop: {"lessons": {"_id": ObjectId("5bd916624a6df2038b277217")}}})
  var lessonId = req.swagger.params.lessonId.value;
  var body = req.swagger.params.body.value;
  var content = body.content;
  var headId = body.headId;
  var majorId = body.majorId;
  var title = body.title;
  var data = {
    content: content,
    headId: headId,
    majorId: majorId,
    title: title
  }
  //console.log(util.inspect(data, {showHidden: false, depth: null}))
  var query = {"_id": new ObjectId(lessonId)};
  var queryMajorNew = {"_id": new ObjectId(majorId)};
  const lessonFound = lessonRepo.findOne(query);
  const majorFound = majorRepo.findOne(queryMajorNew);
  Promise.all([lessonFound, majorFound]).then(([lesson, major]) => {
    if(!lesson) {
      res.status(200);
      res.json({success: false, message: "lesson not found" });
      return;
    }
    if(!major) {
      res.status(200);
      res.json({success: false, message: "major not found" });
      return;
    }
    lessonRepo.update(query, data).then( value => {
      if(lesson.majorId !== majorId) {
        var queryMajorOld = {"_id": new ObjectId(lesson.majorId)};
        console.log(lesson.majorId);
        majorRepo.update(queryMajorOld, {$pull: { lessons: { _id: lesson._id, title: lesson.title} } });
        majorRepo.update(queryMajorNew, {$push: { lessons: { _id: lesson._id, title: title} } });
      }
      res.status(200);
      res.json({success: true, value: data});
      return;
    }).catch( err => {
      res.status(200);
      res.json({success: false, message: err.err });
    });
  }).catch( err => {
    res.status(200);
    res.json({success: false, message: err.err });
  });
}
