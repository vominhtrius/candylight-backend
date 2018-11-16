'use strict';

var util = require('util'); 
const config = require('./config')
const topicRepo = require('../../repository/topicRepo')
const categoryRepo = require('../../repository/categoryRepo')

var ObjectId = require('mongodb').ObjectID;

module.exports = {
    getAllTopic: get,
    addTopic: add,
    getOneTopic: getOne,
    updateTopic: update
};

function get(req, res) {
    topicRepo.getAll().then(value => {
        console.log(util.inspect(value, {showHidden: false, depth: null}))
        if (!value)
            value = [];
        res.status(200);
        res.json({
            success: true,
            value: {
                topics: value
            }
        });
    }).catch( error => {
        res.status(200);
        res.json({
            success: false,
            message: err.err
        });
    });

}

function getOne(req, res) {

    var topicId = req.swagger.params.topicId.value;
    topicRepo.findOne({
        "_id": new ObjectId(topicId)
    }).then(value => {
        var mess = "";
        var success = true;
        if (!value){
            success = false;
            value = {};
            mess = "topicId not found";
        }
        res.status(200);
        res.json({
            success: success,
            value: value,
            message: mess
        });
    }).catch( err => {
        console.log(util.inspect(err, {showHidden: false, depth: null}))
        res.status(200);
        res.json({
            success: false,
            message: err.err
        });
    });
}

function add(req, res) {

    //var topicId = req.swagger.params.topicId.value;
    var body = req.swagger.params.body.value;
    var name = body.name;
    var categoryId = body.categoryId;
    
    var lessons = [];
    var data = {
        name: name,
        categoryId: new ObjectId(categoryId),
        lessons: lessons
    };

    const queryCategory = {"_id": new ObjectId(categoryId)};
    const categoryFound = categoryRepo.findOne(queryCategory);  
    categoryFound.then(category => {
        if(!category) {
            res.status(200);
            res.json({ success: false, message: "category not found" });
            return;
        }
        topicRepo.insert(data).then(value => {
            categoryRepo.update(queryCategory, {$push: { topics: data } } )
            res.status(200);
            res.json({
                success: true,
                value: data
            });
        }).catch( err => {
            res.status(200);
            res.json({
                success: false,
                message: err.err
            });
        });
    }).catch( err => {
        res.status(200);
        res.json({
            success: false,
            message: err.err
        });
    });
    
}

function update(req, res) {

    var topicId = req.swagger.params.topicId.value;
    var body = req.swagger.params.body.value;
    var name = body.name;
    var categoryIdNew = body.categoryId;
    
    var queryTopic = {"_id": new ObjectId(topicId)};
    var queryCategoryNew = {"_id": new ObjectId(categoryIdNew)};
    const topicFound = topicRepo.findOne(queryTopic);  
    const categoryFound = categoryRepo.findOne(queryCategoryNew);  
    Promise.all([topicFound, categoryFound]).then(([topic, category]) => {

        if(!topic) {
            res.status(200);
            res.json({success: false, message: "topic not found" });
            return;
        }
        if(!category) {
            res.status(200);
            res.json({success: false, message: "category not found" });
            return;
        }


        topicRepo.update(queryTopic, {$set: {name: name, categoryId: categoryIdNew}}).then(value => {
            topic.name = name;
            if(category._id !== categoryIdNew) {
                var queryCategoryOld = {"_id": new ObjectId(topic.categoryId)};
                categoryRepo.update(queryCategoryOld, {$pull: { topics: { _id: topic._id} } });
                topic.categoryId = categoryIdNew;
                categoryRepo.update(queryCategoryNew, {$push: { topics: topic } });
                res.status(200);
                res.json({success: true, value: topic});
            } else {
                categoryRepo.update({"topics._id": topic._id}, {$set: { "topics.$.name": name } });
            }
            res.status(200);
            res.json({success: true, value: topic});
        }).catch( err => {
            res.status(200);
            res.json({
                success: false,
                message: err.err
            });
        });
    }).catch( err => {
        res.status(200);
        res.json({
            success: false,
            message: err.err
        });
    });        
    
}