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
    verifyAnswer: verifyAnswer,
    getResultExerciseOfTopic: getResultExerciseOfTopic
};

function getListQuestionsOfTopic(req, res){
    const topicId = ObjectId(req.swagger.params.topicId.value);
    var numberQuestion = req.swagger.params.numberQuestion.value;
    const db = req.app.db;
    const userId = req.userId;
    //get list choice question in db

    if(numberQuestion < 10){
        numberQuestion = 10;
    }

    var rand = Math.floor(Math.random() * (numberQuestion - 1)) + 1;
    var listChoiceQuestions = [];
    var listFillQuestions = [];
    
    //add user vao listUser.
    const object = {
        topicId: topicId,
        numberQuestion: numberQuestion,
        questionId: 0,
        numberAnswer: 0,
        numberAnswerRight: 0,
        timeAnswer: 0
    }

    req.app.users.insertUser(userId, object);

    const queryChoiceQuesion = [
        {
            $match:{
                topicId: topicId
            }
        },
        {
            $sample: {
                size: rand
            }
        },
        {
            $project:{
                _id: true,
                content: true,
                answers: true
            },
        }
    ]

    const queryFillQuesion = [
        {
            $match:{
                topicId: topicId
            }
        },
        {
            $sample: {
                size: numberQuestion - rand
            }
        },
        {
            $project:{
                _id: true,
                content: true,
                answers: true
            },
        }
    ]

    questionFunction.findOneDB(db, "Topics", {_id: topicId}).then((result) => {
        Promise.all([
            questionFunction.aggregateDB(db, "ChoiceQuestionExercise", queryChoiceQuesion).then((result) => {
                listChoiceQuestions = result;
            }).catch((err) => {
                console.log(err);
            }),
            questionFunction.aggregateDB(db, "FillQuestionExercise", queryFillQuesion).then((result) => {
                listFillQuestions = result;;
            }).catch((err) => {
                console.log(err);
            })]
        ).then((result) => {
            res.status(200);
            res.json({
                listChoiceQuestions: listChoiceQuestions,
                listFillQuestions: listFillQuestions
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
        questionFunction.findOneDB(db, "ChoiceQuestionExercise", {content: body.content}).then((result) => {
            res.status(400);
            res.json({
                message: "The question is already existed"
            })
        }).catch((err) =>{
            //not exist
            questionFunction.insertOneDB(db, "ChoiceQuestionExercise", body).then((result) => {
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

        questionFunction.findOneAndUpdateDB(db, "ChoiceQuestionExercise", {_id: body.id}, update).then((result) => {
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
        questionFunction.findOneDB(db, "FillQuestionExercise", {content: body.content}).then((result) => {
            res.status(400);
            res.json({
                message: "The question is already existed"
            })
        }).catch((err) =>{
            //not exist
            questionFunction.insertOneDB(db, "FillQuestionExercise", body).then((result) => {
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

        questionFunction.findOneAndUpdateDB(db, "FillQuestionExercise", {_id: body.id}, update).then((result) => {
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
    const userId = req.userId;

    var user = req.app.users.getUser(userId);

    if((body.typeQuestion !== 'choice' && body.typeQuestion !== 'fill') || body.answer.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the answer"
        })
        return;
    }

    handleAnswerChoiceQuestion(res, db, user, body, questionId);
    handleAnswerFillQuestion(res, db, user, body, questionId);
}

function getResultExerciseOfTopic(req, res){
    const topicId = req.swagger.params.topicId.value;
    const userId = req.userId;
    const db = req.app.db;
    const user = req.app.users.getUser(userId);
    const option = {
        fields: {
            pointReward: 1
        }
    }
    questionFunction.findOneDB(db, "Users", {_id: ObjectId(userId)}, option).then((result) => {
        const point = result.pointReward + user.numberAnswerRight;
        var update = {
            $set:{
                pointReward: point
            }
        }

        questionFunction.findOneAndUpdateDB(db, "Users", {_id: ObjectId(userId)}, update).then((result) => {
            if((topicId === user.topicId.toString()) && (user.numberQuestion === user.numberAnswer)){
                res.status(200);
                res.json({
                    numberQuestion: user.numberQuestion,
                    numberAnswerRight: user.numberAnswerRight,
                    point: user.numberAnswerRight
                })
            }else{
                res.status(400);
                res.json({
                    message: "Invalid the request"
                })
            }
        }).catch((err) => {
            res.status(400);
            res.json({
                message: err
            })
        })
    }).catch((err) => {
        res.status(400);
        res.json({
            message: err
        })
    })
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

function handleAnswerChoiceQuestion(res, db, user, body, questionId){
    var option = {
        fields: {
            answerRight: 1,
            explainRight: 1,
            suggest: 1,
        }
    }

    if(body.typeQuestion === 'choice'){
        questionFunction.findOneDB(db, 'ChoiceQuestionExercise', {_id: ObjectId(questionId)}, option).then((result) => {
            if(result.answerRight === body.answer){
                if(user.questionId !== questionId && (user.numberAnswer < user.numberQuestion)){
                    user.questionId = questionId;
                    user.numberAnswer = user.numberAnswer + 1;
                    user.numberAnswerRight = user.numberAnswerRight + 1;
                    user.timeAnswer = 2;
                    res.status(200);
                    res.json({
                        result: true,
                        record: result.explainRight
                    })
                }else if(user.timeAnswer < 2){
                    user.timeAnswer = user.timeAnswer + 1;
                    res.status(200);
                    res.json({
                        result: true,
                        record: result.explainRight
                    })
                }else{
                    res.status(400);
                    res.json({
                        message: "Invalid the request. Too many answers"
                    })
                }
            }else{
                if(user.questionId !== questionId){
                    user.questionId = questionId;
                    user.numberAnswer = user.numberAnswer + 1;
                    user.timeAnswer = 1;
                    res.status(200);
                    res.json({
                        result: false,
                        record: result.suggest
                    })
                }else if(user.timeAnswer < 2){
                    user.timeAnswer = user.timeAnswer + 1;
                    res.status(200);
                    res.json({
                        result: false,
                        record: result.answerRight
                    })
                }else{
                    res.status(400);
                    res.json({
                        message: "Invalid the request. Too many answers"
                    })
                }
            } 
        }).catch((err) => {
            res.status(400);
            res.json({
                message: "Not found answer"
            })
        })
    }
}

function handleAnswerFillQuestion(res, db, user, body, questionId){
    var option = {
        fields: {
            answerRight: 1,
            explainRight: 1,
            suggest: 1,
        }
    }

    if(body.typeQuestion === 'fill'){
        questionFunction.findOneDB(db, 'FillQuestionExercise', {_id: ObjectId(questionId)}, option).then((result) => {
            if(result.answerRight === body.answer){
                if(user.questionId !== questionId && (user.numberAnswer < user.numberQuestion)){
                    user.questionId = questionId;
                    user.numberAnswer = user.numberAnswer + 1;
                    user.numberAnswerRight = user.numberAnswerRight + 1;
                    user.timeAnswer = 2;
                    res.status(200);
                    res.json({
                        result: true,
                        record: result.explainRight
                    })
                }else if(user.timeAnswer < 2){
                    user.timeAnswer = user.timeAnswer + 1;
                    res.status(200);
                    res.json({
                        result: true,
                        record: result.explainRight
                    })
                }else{
                    res.status(400);
                    res.json({
                        message: "Invalid the request. Too many answers"
                    })
                }
            }else{
                if(user.questionId !== questionId){
                    user.questionId = questionId;
                    user.numberAnswer = user.numberAnswer + 1;
                    user.timeAnswer = 1;
                    res.status(200);
                    res.json({
                        result: false,
                        record: result.suggest
                    })
                }else if(user.timeAnswer < 2){
                    user.timeAnswer = user.timeAnswer + 1;
                    res.status(200);
                    res.json({
                        result: false,
                        record: result.answerRight
                    })
                }else{
                    res.status(400);
                    res.json({
                        message: "Invalid the request. Too many answers"
                    })
                }            
            }
        }).catch((err) => {
            res.status(400);
            res.json({
                message: "Not found answer"
            })
        })
    }
}
