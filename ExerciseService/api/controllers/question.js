'use strict';
var util = require('util');
const questionFunction = require('../../models/question.js');
const { ObjectId } = require('mongodb');

module.exports = {
    getListQuestionsOfTopic: getListQuestionsOfTopic,
    insertChoiceQuestionIntoTopic: insertChoiceQuestionIntoTopic,
    updateChoiceQuestionOfTopic: updateChoiceQuestionOfTopic,
    insertFillQuestionIntoTopic: insertFillQuestionIntoTopic,
    updateFillQuestionOfTopic: updateFillQuestionOfTopic,   
    verifyAnswer: verifyAnswer
};

function getListQuestionsOfTopic(req, res){
    const topicId = req.swagger.params.topicId.value;
    const numberQuestion = req.swagger.params.numberquestion.value;
    

}

function insertChoiceQuestionIntoTopic(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataChoiceQuestion(bodyTmp);


    if(body.content.length === 0 || body.answer === '' || !checkAnswerOfChoiceQuestionRequest(body.answers) 
    || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }

    questionFunction.findOneDB(db, "Topics", {_id: body.topicId}).then((result) => {
        //check content question existed in db
        questionFunction.findOneDB(db, "ChoiceQuestions", {content: body.content}).then((result) => {
            res.status(400);
            res.json({
                message: "The question is already existed"
            })
        }).catch((err) =>{
            //not exist
            questionFunction.insertOneDB(db, "ChoiceQuestions", body).then((result) => {
                console.log(result.ops);
                res.status(200);
                res.json({
                    message: "insert choice question into database successed"
                })
            }).catch((err) => {
                res.status(400);
                res.json({
                    message: "insert choice question into database failed"
                })
            })
        }) 
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The topic is not existed"
        })
    })
}

function updateChoiceQuestionOfTopic(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataChoiceQuestion(bodyTmp);
    body.id = ObjectId(bodyTmp.id.trim());

    if(body.content.length === 0 || body.answer === '' || !checkAnswerOfChoiceQuestionRequest(body.answers) 
    || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }

    questionFunction.findOneDB(db, "Topics", {_id: body.topicId}).then((result) => {
        //update
        var update = {
            $set: {
                topicId: body.topicId,
                content: body.content,
                answers: body.answers,
                answerRight: body.answerRight,
                explainRight: body.explainRight,
                suggest: body.suggest
            }
        }

        questionFunction.findOneAndUpdateDB(db, "ChoiceQuestions", {_id: body.id}, update).then((result) => {
            res.status(200);
            res.json({
                message: "Update choice quesion successed"
            })
        }).catch((err) => {
            res.status(400);
            res.json({
                message: "Update choice question failed"
            })
        })
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The topic is not existed"
        })
    })
}

function insertFillQuestionIntoTopic(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataFillQuestion(bodyTmp);

    if(body.content.length === 0 || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }

    questionFunction.findOneDB(db, "Topics", {_id: body.topicId}).then((result) => {
        //check content question existed in db
        questionFunction.findOneDB(db, "FillQuestions", {content: body.content}).then((result) => {
            res.status(400);
            res.json({
                message: "The question is already existed"
            })
        }).catch((err) =>{
            //not exist
            questionFunction.insertOneDB(db, "FillQuestions", body).then((result) => {
                console.log(result.ops);
                res.status(200);
                res.json({
                    message: "insert fill question into database successed"
                })
            }).catch((err) => {
                res.status(400);
                res.json({
                    message: "insert fill question into database failed"
                })
            })
        }) 
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The topic is not existed"
        })
    })

}

function updateFillQuestionOfTopic(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataFillQuestion(bodyTmp);
    body.id = ObjectId(bodyTmp.id.trim());

    if(body.content.length === 0 || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }

    questionFunction.findOneDB(db, "Topics", {_id: body.topicId}).then((result) => {
        //update
        var update = {
            $set: {
                topicId: body.topicId,
                content: body.content,
                answerRight: body.answerRight,
                explainRight: body.explainRight,
                suggest: body.suggest
            }
        }

        questionFunction.findOneAndUpdateDB(db, "FillQuestions", {_id: body.id}, update).then((result) => {
            res.status(200);
            res.json({
                message: "Update fill quesion successed"
            })
        }).catch((err) => {
            res.status(400);
            res.json({
                message: "Update fill question failed"
            })
        })
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The topic is not existed"
        })
    })
}

function verifyAnswer(req, res){
    const questionId = req.swagger.params.questionId.value;
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;

    const body = handleDataAnswer(bodyTmp);
    
    if((body.typeQuestion !== 'choice' && body.typeQuestion !== 'fill') || body.answer.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the answer"
        })
        return;
    }

    if(body.typeQuestion === 'choice'){
        questionFunction.findOneDB(db, 'ChoiceQuestions', {_id: ObjectId(questionId)}).then((result) => {
            if(result.answerRight === body.answer){
                res.status(200);
                res.json({
                    result: true
                })
            }else{
                res.status(200);
                res.json({
                    result: false
                })
            }
        }).catch((err) => {
            res.status(400);
            res.json({
                message: "Not found answer"
            })
        })
    }

    if(body.typeQuestion === 'fill'){
        questionFunction.findOneDB(db, 'FillQuestions', {_id: ObjectId(questionId)}).then((result) => {
            if(result.answerRight === body.answer){
                res.status(200);
                res.json({
                    result: true
                })
            }else{
                res.status(200);
                res.json({
                    result: false
                })
            }
        }).catch((err) => {
            res.status(400);
            res.json({
                message: "Not found answer"
            })
        })
    }
}

function checkAnswerOfChoiceQuestionRequest(answers){
    if(answers.ansA.length === 0 || answers.ansB.length === 0 || answers.ansC.length === 0 || answers.ansD.length === 0){
        return false;
    }
    return true;
}

function handlerDataChoiceQuestion(data){
    var body = {};
    body.answers = {};

    body.topicId = ObjectId(data.topicId.trim());
    body.content = data.content.trim();
    body.answers.ansA = data.answers.ansA.trim();
    body.answers.ansB = data.answers.ansB.trim();
    body.answers.ansC = data.answers.ansC.trim();
    body.answers.ansD = data.answers.ansD.trim();
    body.answerRight = data.answerRight.trim();
    body.explainRight = data.explainRight.trim();
    body.suggest = data.suggest.trim();
    return body;
}

function handlerDataFillQuestion(data){
    var body = {};
    
    body.topicId = ObjectId(data.topicId.trim());
    body.content = data.content.trim()
    body.answerRight = data.answerRight.trim();
    body.explainRight = data.explainRight.trim();
    body.suggest = data.suggest.trim();
    return body;
}

function handleDataAnswer(data){
    var body = {};

    body.typeQuestion = data.typeQuestion.trim();
    body.answer = data.answer.trim();
    return body;
}
