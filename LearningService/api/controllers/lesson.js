'use strict';

var util = require('util');
const config = require('./config')
const lessonRepo = require('../../repository/lessonRepo')
const topicRepo = require('../../repository/topicRepo')

var ObjectId = require('mongodb').ObjectID;

module.exports = {
  getLessons: get,
  addLesson: add,
  updateLesson: update,
  findOneLesson: getOne,
};

function get(req, res) {

  lessonRepo.getAll().then( value => {
    //console.log(util.inspect(value, {showHidden: false, depth: null}))
    if(!value)
      value = [];
    res.status(200);
    res.json({success: true, value: {lessons: value } });
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
  var categoryId = body.categoryId;
  var topicId = body.topicId;
  var title = body.title;
  var data = {
    content: content,
    categoryId: categoryId,
    topicId: topicId,
    title: title
  }
  lessonRepo.insert(data).then( value => {
    res.status(200);
    res.json({success: true, value: data});
    console.log(util.inspect(data, {showHidden: false, depth: null}))
    
    var queryTopic = {"_id": new ObjectId(topicId)};
    topicRepo.update(queryTopic, {$push: { lessons: { _id: data._id, title: data.title } } });

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
  var categoryId = body.categoryId;
  var topicId = body.topicId;
  var title = body.title;
  var data = {
    content: content,
    categoryId: categoryId,
    topicId: topicId,
    title: title
  }
  //console.log(util.inspect(data, {showHidden: false, depth: null}))
  var query = {"_id": new ObjectId(lessonId)};
  var queryTopicNew = {"_id": new ObjectId(topicId)};
  const lessonFound = lessonRepo.findOne(query);
  const topicFound = topicRepo.findOne(queryTopicNew);
  Promise.all([lessonFound, topicFound]).then(([lesson, topic]) => {
    if(!lesson) {
      res.status(200);
      res.json({success: false, message: "lesson not found" });
      return;
    }
    if(!topic) {
      res.status(200);
      res.json({success: false, message: "topic not found" });
      return;
    }
    lessonRepo.update(query, data).then( value => {
      if(lesson.topicId !== topicId) {
        var queryTopicOld = {"_id": new ObjectId(lesson.topicId)};
        console.log(lesson.topicId);
        topicRepo.update(queryTopicOld, {$pull: { lessons: { _id: lesson._id, title: lesson.title} } });
        topicRepo.update(queryTopicNew, {$push: { lessons: { _id: lesson._id, title: title} } });
      } else {
        var queryTopic = {"lessons._id": lesson._id};
        topicRepo.update(queryTopic, {$set: { "lessons.$.title": title} });
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
