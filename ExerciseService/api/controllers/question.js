'use strict';
var util = require('util');
const questionFunction = require('../../models/question.js');
const { ObjectId } = require('mongodb');
const { OrderedMap } = require('immutable');
const helpers = require('../../helpers/helpers.js');
const  sha256 = require('js-sha256');
module.exports = {
    getListQuestionsOfTopic: getListQuestionsOfTopic,
    insertChoiceQuestionIntoTopic: insertChoiceQuestionIntoTopic,
    updateChoiceQuestionOfTopic: updateChoiceQuestionOfTopic,
    insertFillQuestionIntoTopic: insertFillQuestionIntoTopic,
    updateFillQuestionOfTopic: updateFillQuestionOfTopic,   
    verifyAnswer: verifyAnswer,
    getResultExerciseOfTopic: getResultExerciseOfTopic,
    removeAllSession: removeAllSession
};

function insertUser(users, userId, session, object){
    var mapSession = users.getUser(userId);
    if(mapSession){
        mapSession = mapSession.set(session, object);
        users.insertUser(userId, mapSession);
    }else{
        var mapSession = new OrderedMap();
        mapSession = mapSession.set(session, object);
        users.insertUser(userId, mapSession);
    }
}

function getListQuestionsOfTopic(req, res){
    const topicId = ObjectId(req.swagger.params.topicId.value);
    var numberQuestion = req.swagger.params.numberQuestion.value;
    const db = req.app.db;
    const userId = req.userId;
    //get list choice question in db
    if(numberQuestion < helpers.NUMBERQUESTION_TOPIC || numberQuestion <= 1){
        numberQuestion = helpers.NUMBERQUESTION_TOPIC;
    }

    var rand = Math.floor(Math.random() * (numberQuestion - 1)) + 1;
    var listChoiceQuestions = [];
    var listFillQuestions = [];
    
    //add user vao listUser.
    const object = {
        numberQuestion: numberQuestion,
        questionId: '',
        numberAnswer: 0,
        numberAnswerRight: 0,
        timeAnswer: 0,
        listQuestionId: []
    }
    const date = new Date();
    const time = date.getTime();
    const session = sha256(time.toString() + userId);

    insertUser(req.app.users, userId, session, object);

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

    questionFunction.findOneDB(db, helpers.NAME_DB_TOPICS, {_id: topicId}).then((result) => {
        Promise.all([
            questionFunction.aggregateDB(db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, queryChoiceQuesion).then((result) => {
                // console.log('choice question')
                // console.log(result)
                for(var i = 0; i < result.length; i++){
                    result[i].type = helpers.TYPE_CHOICE_QUESTION;
                }
                listChoiceQuestions = result;
            }).catch((err) => {
                // console.log("errr")
                // console.log(err);
                res.status(400);
                res.json({
                    message: err
                })
            }),
            questionFunction.aggregateDB(db, helpers.NAME_DB_FILLQUESTION_EXERCISE, queryFillQuesion).then((result) => {
                // console('fill question')
                // console.log(result)
                for(var i = 0; i < result.length; i++){
                    result[i].type = helpers.TYPE_FILL_QUESTION;
                }
                listFillQuestions = result;;
            }).catch((err) => {
                // console.log('error fill question')

                res.status(400);
                res.json({
                    message: err
                })
            })]
        ).then((result) => {
            var listQuestion = listChoiceQuestions.concat(listFillQuestions);
            listQuestion = listQuestion.sort(()=>{
                return Math.random() - 0.5;
            })
            res.status(200);
            res.json({
                session: session,
                listQuestion: listQuestion
            })
        })
    }).catch((err) => {
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

    questionFunction.findOneDB(db, helpers.NAME_DB_TOPICS, {_id: body.topicId}).then((result) => {
        //check content question existed in db
        questionFunction.findOneDB(db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, {content: body.content}).then((result) => {
            res.status(400);
            res.json({
                message: "The question is already existed"
            })
        }).catch((err) =>{
            //not exist
            questionFunction.insertOneDB(db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, body).then((result) => {
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

    questionFunction.findOneDB(db, helpers.NAME_DB_TOPICS, {_id: body.topicId}).then((result) => {
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

        questionFunction.findOneAndUpdateDB(db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, {_id: body.id}, update).then((result) => {
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

    questionFunction.findOneDB(db, helpers.NAME_DB_TOPICS, {_id: body.topicId}).then((result) => {
        //check content question existed in db
        questionFunction.findOneDB(db, helpers.NAME_DB_FILLQUESTION_EXERCISE, {content: body.content}).then((result) => {
            res.status(400);
            res.json({
                message: "The question is already existed"
            })
        }).catch((err) =>{
            //not exist
            questionFunction.insertOneDB(db, helpers.NAME_DB_FILLQUESTION_EXERCISE, body).then((result) => {
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

    questionFunction.findOneDB(db, helpers.NAME_DB_TOPICS, {_id: body.topicId}).then((result) => {
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

        questionFunction.findOneAndUpdateDB(db, helpers.NAME_DB_FILLQUESTION_EXERCISE, {_id: body.id}, update).then((result) => {
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
    const session = req.swagger.params.session.value;
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handleDataAnswer(bodyTmp);
    const userId = req.userId;

    var mapSession = req.app.users.getUser(userId);
    if(!mapSession){
        res.status(400);
        res.json({
            message: "Invalid the answer"
        })
        return;
    }

    var sessionObject =  mapSession.get(session);

    if(!sessionObject){
        res.status(400);
        res.json({
            message: "Invalid the answer"
        })
        return; 
    }
    const index = sessionObject.listQuestionId.indexOf(questionId);
    if(index >= 0 && index < sessionObject.listQuestionId.length - 1){
        res.status(400);
        res.json({
            message: "Invalid the answer"
        })
        return; 
    }

    if(body.typeQuestion === helpers.TYPE_CHOICE_QUESTION && body.answer.length !== 0){
        handleAnswerQuestion(res, db, helpers.NAME_DB_CHOICEQUESTION_EXERCISE, sessionObject, questionId, body.answer);
    }else if(body.typeQuestion === helpers.TYPE_FILL_QUESTION && body.answer.length !== 0){
        handleAnswerQuestion(res, db, helpers.NAME_DB_FILLQUESTION_EXERCISE, sessionObject, questionId, body.answer);
    }else{
        res.status(400);
        res.json({
            message: "Invalid the answer"
        })
        return;
    }
}

function getResultExerciseOfTopic(req, res){
    const session = req.swagger.params.session.value;
    const userId = req.userId;
    const db = req.app.db;
    var mapSession = req.app.users.getUser(userId);
    var sessionObject = mapSession.get(session);
    
    const option = {
        fields: {
            pointReward: 1
        }
    }
    questionFunction.findOneDB(db, helpers.NAME_DB_USERS, {_id: ObjectId(userId)}, option).then((result) => {
        const point = result.pointReward + sessionObject.numberAnswerRight * helpers.POINT_BASE;
        var update = {
            $set:{
                pointReward: point
            }
        }
        questionFunction.findOneAndUpdateDB(db, helpers.NAME_DB_USERS, {_id: ObjectId(userId)}, update).then((result) => {
            if(sessionObject.numberQuestion === sessionObject.numberAnswer){
                mapSession = mapSession.remove(session);
                req.app.users.insertUser(userId, mapSession);
                res.status(200);
                res.json({
                    numberQuestion: sessionObject.numberQuestion,
                    numberAnswerRight: sessionObject.numberAnswerRight,
                    point: sessionObject.numberAnswerRight * helpers.POINT_BASE
                })
            }else{
                res.status(400);
                res.json({
                    message: "Invalid the request. Number answer not equal number question"
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

function removeAllSession(req, res){
    const userId = req.userId;
    const body = req.swagger.params.body.value;
    const listSession = body.listSession;
    var mapSession = req.app.users.getUser(userId);

    listSession.forEach(element => {
        mapSession = mapSession.remove(element);
    });

    req.app.users.insertUser(userId, mapSession);

    console.log(req.app.users.getUser(userId));

    res.status(200);
    res.json({
        message: "Remove all session success"
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

function handleAnswerQuestion(res, db, nameCollection, sessionObject, questionId, answer){
    var option = {
        fields: {
            answerRight: 1,
            explainRight: 1,
            suggest: 1,
        }
    }
    questionFunction.findOneDB(db, nameCollection, {_id: ObjectId(questionId)}, option).then((result) => {
        if(result.answerRight === answer){
            if(sessionObject.questionId !== questionId && (sessionObject.numberAnswer < sessionObject.numberQuestion)){
                sessionObject.listQuestionId.push(questionId);
                sessionObject.questionId = questionId;
                sessionObject.numberAnswer = sessionObject.numberAnswer + 1;
                sessionObject.numberAnswerRight = sessionObject.numberAnswerRight + 1;
                sessionObject.timeAnswer = helpers.TIMEANSWER;
                res.status(200);
                res.json({
                    result: true,
                    record: result.explainRight
                })
            }else if(sessionObject.timeAnswer < helpers.TIMEANSWER){
                sessionObject.timeAnswer = sessionObject.timeAnswer + 1;
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
            if(sessionObject.questionId !== questionId){
                sessionObject.listQuestionId.push(questionId);
                sessionObject.questionId = questionId;
                sessionObject.numberAnswer = sessionObject.numberAnswer + 1;
                sessionObject.timeAnswer = 1;
                res.status(200);
                res.json({
                    result: false,
                    record: result.suggest
                })
            }else if(sessionObject.timeAnswer < helpers.TIMEANSWER){
                sessionObject.timeAnswer = sessionObject.timeAnswer + 1;
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
