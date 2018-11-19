'use strict';
var util = require('util');
const examFunction = require('../../model/exam.js');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const helpers = require('../../helpers/helpers.js');

module.exports = {
    insertExam: insertExam,
    getListQuestionExamInMonth: getListQuestionExamInMonth,
    getListExamInMonth: getListExamInMonth,
    updateExam: updateExam,
    insertChoiceQuestionIntoExam:insertChoiceQuestionIntoExam,
    updateChoiceQuestionIntoExam: updateChoiceQuestionIntoExam,
    insertFillQuestionIntoExam: insertFillQuestionIntoExam,
    updateFillQuestionIntoExam: updateFillQuestionIntoExam
};

function insertExam(req, res) {
    const body = req.swagger.params.body.value;
    const db = req.app.db;
    // const day = moment();
    // const daytFormat = moment(day).format('MM/YYYY');

    body.type = body.type.trim();

    if(body.type !== helpers.NAME_MATH_EXAM && body.type !== helpers.NAME_VN_EXAM){
        res.status(400);
        res.json({
            message: "Invalid the title"
        })
        return;
    }   

    if(!moment(body.time.trim(), "MM_YYYY", true).isValid()){
        res.status(400);
        res.json({
            message: "Invalid the format time"
        })
        return;
    }
    
    if(body.timeDo < helpers.TIMEDO){
        res.status(400);
        res.json({
            message: "Invalid the time do exam"
        })
        return;
    }

    if(body.numberQuestion < helpers.NUMBERQUESTION){
        res.status(400);
        res.json({
            message: "Invalid the number question in exam"
        })
        return;
    }

    // dem so exam hien co trong db cua time 
    examFunction.countDocument(db, helpers.NAME_DB_EXAM, {time: body.time, type: body.type}).then((result) => {
        console.log(result);
        body.title = 'Exam' + result.toString();
        if(result < helpers.NUMBER_EXAM){
            examFunction.insertOneDB(db, helpers.NAME_DB_EXAM, body).then((result) => {
                res.status(200);
                res.json({
                    message: "Insert exam into database success"
                })
            }).catch((err) => {
                res.json(400);
                res.json({
                    message: "Insert exam into database failed"
                })
            })
        }else{
            res.status(400);
            res.json({
                message: "Number Exam is enought"
            })
        }
    }).catch((err) =>{
        console.log(err);
        res.status(400);
        res.json({
            message: err
        })
    })
}

function getListQuestionExamInMonth(req, res){
    const typeExam = req.swagger.params.type.value.trim();
    const time = req.swagger.params.time.value.trim();
    const title = req.swagger.params.title.value.trim();
    const db = req.app.db;
    var numberQuestionTmp = 0;

    if(typeExam !== helpers.NAME_MATH_EXAM && typeExam !== helpers.NAME_VN_EXAM){
        res.status(400);
        res.json({
            message: "Invalid the title"
        })
        return;
    }   

    if(!moment(time.trim(), "MM_YYYY", true).isValid()){
        res.status(400);
        res.json({
            message: "Invalid the format time"
        })
        return;
    }

    examFunction.findOneDB(db, helpers.NAME_DB_EXAM, {type: typeExam, time: time, title: title}).then((resultExam) => {
        const query = [
            {
                $match:{
                    examId: resultExam._id
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
        
        examFunction.countDocument(db, helpers.NAME_DB_CHOICEQUESTION_EXAM, {examId: resultExam._id}).then((result) => {
            numberQuestionTmp = numberQuestionTmp + result;
            examFunction.countDocument(db, helpers.NAME_DB_FILLQUESTION_EXAM, {examId: resultExam._id}).then ((result) => {
                numberQuestionTmp = numberQuestionTmp + result;
                if(numberQuestionTmp < resultExam.numberQuestion){
                    res.status(400);
                    res.json({
                        message: "Exam is not enought question"
                    })
                    return;
                }else{                
                    Promise.all([
                        examFunction.aggregateDB(db, helpers.NAME_DB_CHOICEQUESTION_EXAM, query).then((result) => {
                            resultExam.listChoiceQuestion = result;
                        }).catch((err) =>{
                            res.status(400);
                            res.json({
                                message: err
                            })
                        }),
                        examFunction.aggregateDB(db, helpers.NAME_DB_FILLQUESTION_EXAM, query).then((result) => {
                            resultExam.listFillQuestion = result;                
                        }).catch((err) => {
                            res.status(400);
                            res.json({
                                message: err
                            })
                        })
                    ]).then((result) => {
                        res.status(200);
                        res.json({
                            _id: resultExam._id,
                            title: resultExam.title,
                            time: resultExam.time,
                            timeDo: resultExam.timeDo,
                            numberQuestion: resultExam.numberQuestion,
                            listChoiceQuestion: resultExam.listChoiceQuestion,
                            listFillQuestion: resultExam.listFillQuestion
                        })
                    })
                }
            }).catch((err) => {
                res.status(400);
                res.json({
                    message: err
                })
            })
        }).catch((err)=>{
            res.status(400);
            res.json({
                message: err
            })
        })
    }).catch((err) => {
        res.status(400);
        res.json({
            message: "Not found Exam"
        })
    })
}

function updateExam(req, res){
    const examId = ObjectId(req.swagger.params.examId.value);
    const body = req.swagger.params.body.value;
    const db = req.app.db;

    body.type = body.type.trim();

    if(body.type !== helpers.NAME_MATH_EXAM && body.type !== helpers.NAME_VN_EXAM){
        res.status(400);
        res.json({
            message: "Invalid the title"
        })
        return;
    }   

    if(!moment(body.time.trim(), "MM_YYYY", true).isValid()){
        res.status(400);
        res.json({
            message: "Invalid the format time"
        })
        return;
    }
    
    if(body.timeDo < helpers.TIMEDO){
        res.status(400);
        res.json({
            message: "Invalid the time do exam"
        })
        return;
    }

    if(body.numberQuestion < helpers.NUMBERQUESTION){
        res.status(400);
        res.json({
            message: "Invalid the number question in exam"
        })
        return;
    }

    var update = {
        $set:{
            type: body.type,
            time: body.time,
            timeDo: body.timeDo,
            numberQuestion: body.numberQuestion
        }
    }
    examFunction.findOneAndUpdateDB(db, helpers.NAME_DB_EXAM, {_id: examId}, update).then((result) => {
        res.status(200);
        res.json({
            message: "Update exam into database successed"
        })
    }).catch((err) => {
        res.status(400);
        res.json({
            message: "Update exam into database failed"
        })
    })
}

function getListExamInMonth(req, res){
    const type = req.swagger.params.type.value;
    const time = req.swagger.params.time.value;
    const db = req.app.db;

    examFunction.findMany(db, helpers.NAME_DB_EXAM, {type: type, time: time}).then((result) => {
        res.status(200);
        res.json({
            listExam: result
        })
    }).catch((err) => {
        res.status(400);
        res.json({
            message: "No found exam"
        })
    })
}

function insertChoiceQuestionIntoExam(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataChoiceQuestion(bodyTmp);
    var numberQuestionTmp = 0;

    if(body.content.length === 0 || body.answer === '' || !checkAnswerOfChoiceQuestionRequest(body.answers) 
    || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }

    examFunction.findOneDB(db, helpers.NAME_DB_EXAM, {_id: body.examId}).then((result) => {
        const numberQuestion = result.numberQuestion;
        //check content question existed in db
        examFunction.findOneDB(db, helpers.NAME_DB_CHOICEQUESTION_EXAM, {content: body.content}).then((result) => {
            res.status(400);
            res.json({
                message: "The question is already existed"
            })
        }).catch((err) =>{
            //check number question of exam
            examFunction.countDocument(db, helpers.NAME_DB_CHOICEQUESTION_EXAM, {examId: body.examId}).then((result) => {
                numberQuestionTmp = numberQuestionTmp + result;
                examFunction.countDocument(db, helpers.NAME_DB_FILLQUESTION_EXAM, {examId: body.examId}).then ((result) => {
                    numberQuestionTmp = numberQuestionTmp + result;
                    if(numberQuestionTmp < numberQuestion){
                        //not exist
                        examFunction.insertOneDB(db, helpers.NAME_DB_CHOICEQUESTION_EXAM, body).then((result) => {
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
                    }else{
                        res.status(400);
                        res.json({
                            message: "number of question of this exam is enought"
                        })
                    }
                }).catch((err) => {
                    res.status(400);
                    res.json({
                        message: err
                    })
                })
            }).catch((err)=>{
                res.status(400);
                res.json({
                    message: err
                })
            })
        }) 
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The exam is not existed"
        })
    })
}

function updateChoiceQuestionIntoExam(req, res){
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

    examFunction.findOneDB(db, helpers.NAME_DB_EXAM, {_id: body.examId}).then((result) => {
        //check content question existed in db
        var update = {
            $set: {
                examId: body.examId,
                content: body.content,
                answers: body.answers,
                answerRight: body.answerRight,  
            }
        }

        examFunction.findOneAndUpdateDB(db, helpers.NAME_DB_CHOICEQUESTION_EXAM, {_id: ObjectId(body.id)}, update).then((result) => {
            res.status(200);
            res.json({
                message: "Update choice quesion of exam successed"
            })
        }).catch((err) => {
            res.status(400);
            res.json({
                message: "Update choice question of exam failed"
            })
        })
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The exam is not existed"
        })
    })
}

function insertFillQuestionIntoExam(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataFillQuestion(bodyTmp);
    var numberQuestionTmp = 0;

    if(body.content.length === 0 || body.answer === '' || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }

    examFunction.findOneDB(db, helpers.NAME_DB_EXAM, {_id: body.examId}).then((result) => {
        const numberQuestion = result.numberQuestion;
        //check content question existed in db
        examFunction.findOneDB(db, helpers.NAME_DB_FILLQUESTION_EXAM, {content: body.content}).then((result) => {
            res.status(400);
            res.json({
                message: "The question is already existed"
            })
        }).catch((err) =>{
            //check number question of exam
            examFunction.countDocument(db, helpers.NAME_DB_CHOICEQUESTION_EXAM, {examId: body.examId}).then((result) => {
                numberQuestionTmp = numberQuestionTmp + result;
                examFunction.countDocument(db, helpers.NAME_DB_FILLQUESTION_EXAM, {examId: body.examId}).then ((result) => {
                    numberQuestionTmp = numberQuestionTmp + result;
                    if(numberQuestionTmp < numberQuestion){
                        //not exist
                        examFunction.insertOneDB(db, helpers.NAME_DB_FILLQUESTION_EXAM, body).then((result) => {
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
                    }else{
                        res.status(400);
                        res.json({
                            message: "number of question of this exam is enought"
                        })
                    }
                }).catch((err) => {
                    res.status(400);
                    res.json({
                        message: err
                    })
                })
            }).catch((err)=>{
                res.status(400);
                res.json({
                    message: err
                })
            })
        }) 
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The exam is not existed"
        })
    })
}

function updateFillQuestionIntoExam(req, res){
    const bodyTmp = req.swagger.params.body.value;
    const db = req.app.db;
    const body = handlerDataFillQuestion(bodyTmp);
    body.id = ObjectId(bodyTmp.id.trim());

    if(body.content.length === 0 || body.answer === '' || body.answerRight.length === 0){
        res.status(400);
        res.json({
            message: "Invalid the question"
        })
        return;
    }

    examFunction.findOneDB(db, helpers.NAME_DB_EXAM, {_id: body.examId}).then((result) => {
        //check content question existed in db
        var update = {
            $set: {
                examId: body.examId,
                content: body.content,
                answers: body.answers,
                answerRight: body.answerRight,  
            }
        }

        examFunction.findOneAndUpdateDB(db, helpers.NAME_DB_FILLQUESTION_EXAM, {_id: ObjectId(body.id)}, update).then((result) => {
            res.status(200);
            res.json({
                message: "Update fill quesion of exam successed"
            })
        }).catch((err) => {
            res.status(400);
            res.json({
                message: "Update fill question of exam failed"
            })
        })
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "The exam is not existed"
        })
    })
}


function handlerDataChoiceQuestion(data){
    var body = {};
    body.answers = {};

    body.examId = ObjectId(data.examId.trim());
    body.content = data.content.trim();
    body.answers.ansA = data.answers.ansA.trim();
    body.answers.ansB = data.answers.ansB.trim();
    body.answers.ansC = data.answers.ansC.trim();
    body.answers.ansD = data.answers.ansD.trim();
    body.answerRight = data.answerRight.trim();
    return body;
}

function handlerDataFillQuestion(data){
    var body = {};

    body.examId = ObjectId(data.examId.trim());
    body.content = data.content.trim()
    body.answerRight = data.answerRight.trim();
    return body;
}

function checkAnswerOfChoiceQuestionRequest(answers){
    if(answers.ansA.length === 0 || answers.ansB.length === 0 || answers.ansC.length === 0 || answers.ansD.length === 0){
        return false;
    }
    return true;
}
