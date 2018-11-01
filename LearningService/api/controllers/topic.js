'use strict';

var util = require('util'); 
const config = require('./config')
const topicRepo = require('../../repository/topicRepo')
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

    var body = req.swagger.params.body.value;
    var name = body.name;
    var lessons = [];
    var data = {
        name: name,
        lessons: lessons
    };

    topicRepo.insert(data).then(value => {
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
}

function update(req, res) {

    var topicId = req.swagger.params.topicId.value;
    var body = req.swagger.params.body.value;
    var name = body.name;
    var query = {"_id": new ObjectId(topicId)};
    
    topicRepo.update(query, {$set: {name: name}}).then(value => {
        var success = true;
        var mess = "";
        if(value.result.n === 0){
            success = false;
            mess = "not found topicId or nothing update";
        }
        res.status(200);
        res.json({
            success: success,
            message: mess
        });
    }).catch( err => {
        res.status(200);
        res.json({
            success: false,
            message: err.err
        });
    });
}