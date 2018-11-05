'use strict';
var util = require('util');

module.exports = {
    getQuestionOfTopic: getQuestionOfTopic,
    insertQuestionIntoTopic: insertQuestionIntoTopic,
    deleteQuestionOfTopic: deleteQuestionOfTopic,
    updateQuestionOfTopic: updateQuestionOfTopic,
    verfifyAnswer: verfifyAnswer
};

function getQuestionOfTopic(req, res){
    const topicId = req.swagger.params.topicId.value;
    console.log(topicId);
    res.status(404);
    res.json({
        message: "ERROR Not Found"
    })
}

function insertQuestionIntoTopic(req, res){
    const topicId = req.swagger.params.topicId.value;
    console.log(topicId);
    res.status(404);
    res.json({
        message: "ERROR Not Found"
    })
}

function deleteQuestionOfTopic(req, res){
    const topicId = req.swagger.params.topicId.value;
    console.log(topicId);
    res.status(404);
    res.json({
        message: "ERROR Not Found"
    })
}

function updateQuestionOfTopic(req, res){
    const topicId = req.swagger.params.topicId.value;
    console.log(topicId);
    res.status(404);
    res.json({
        message: "ERROR Not Found"
    })
}

function verfifyAnswer(req, res){
    const questionId = req.swagger.params.topicId.value;
    console.log(questionId);
    res.status(404);
    res.json({
        message: "ERROR Not Found"
    })
}
