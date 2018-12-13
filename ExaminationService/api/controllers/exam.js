'use strict';
var util = require('util');
const examFunction = require('../../model/exam.js');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const helpers = require('../../helpers/helpers.js');
const lodash = require('lodash');

module.exports = {
    insertExam: insertExam,
    getListQuestionExamInMonth: getListQuestionExamInMonth,
    getListExamInMonth: getListExamInMonth,
    getInfoUserExam: getInfoUserExam,
    updateExam: updateExam,
    insertChoiceQuestionIntoExam:insertChoiceQuestionIntoExam,
    updateChoiceQuestionIntoExam: updateChoiceQuestionIntoExam,
    insertFillQuestionIntoExam: insertFillQuestionIntoExam,
    updateFillQuestionIntoExam: updateFillQuestionIntoExam,
    verifyAnwser: verifyAnwser,
    getListPointExam: getListPointExam
};

function insertExam(req, res) {
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

    if(!moment(body.time.trim(), helpers.FORMAT_DATE, true).isValid()){
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
        body.title = helpers.NAME_EXAM + result.toString();
        body.listAnswerRight = [];
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
    //chua lam tinh gio, va xu li user k thi
    const examId = ObjectId(req.swagger.params.examId.value);
    const db = req.app.db;
    const userId = ObjectId(req.userId);
    const time = moment().format(helpers.FORMAT_DATE); 
    const users = req.app.users;
    var numberQuestionTmp = 0;
    var infoExamUser = users.getUser(userId.toString());

    if(!moment(time.trim(), helpers.FORMAT_DATE, true).isValid()){
        res.status(400);
        res.json({
            message: "Invalid the format time"
        })
        return;
    }

    if(!infoExamUser || users.listUsers.size === 0 || infoExamUser.examDoingId.length !== 0){
        res.status(400);
            res.json({
                message: "Invalid request"
            }) 
        return;
    }

    if(infoExamUser.time === time){
        if(infoExamUser.listDidMathExam.indexOf(examId.toString()) !== -1){
            res.status(400);
            res.json({
                message: "Exam is did"
            })
            return;
        }else if(infoExamUser.listDidVietnameseExam.indexOf(examId.toString()) !== -1){
            res.status(400);
            res.json({
                message: "Exam is did"
            }) 
            return;
        }else if(infoExamUser.examDoingId === examId.toString()){
            res.status(400);
            res.json({
                message: "Exam is doing"
            }) 
            return;
        }
    }

    infoExamUser.examDoingId = examId.toString();
    users.insertUser(userId.toString(), infoExamUser);
    var update = {
        $set:{
            examDoingId: examId.toString(),
        }
    }

    examFunction.findOneAndUpdateDB(db, helpers.NAME_DB_INFOEXAMUSER, {userId: userId, time :time}, update).then((result) => {
    }).catch((err) => {
        console.log(err);
    })

    examFunction.findOneDB(db, helpers.NAME_DB_EXAM, {_id: examId}).then((resultExam) => {
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
                            for(var i = 0; i < result.length; i++){
                                result[i].type = helpers.TYPE_CHOICE_QUESTION;
                            }
                            resultExam.listChoiceQuestion = result;
                        }).catch((err) =>{
                            res.status(400);
                            res.json({
                                message: err
                            })
                        }),
                        examFunction.aggregateDB(db, helpers.NAME_DB_FILLQUESTION_EXAM, query).then((result) => {
                            for(var i = 0; i < result.length; i++){
                                result[i].type = helpers.TYPE_FILL_QUESTION;
                            }
                            resultExam.listFillQuestion = result;
                        }).catch((err) => {
                            res.status(400);
                            res.json({
                                message: err
                            })
                        })
                    ]).then((result) => {
                        resultExam.listQuestion = resultExam.listChoiceQuestion.concat(resultExam.listFillQuestion);
                        resultExam.listQuestion = lodash.sortBy(resultExam.listQuestion, (item) => item._id);
                        res.status(200);
                        res.json({
                            listQuestion: resultExam.listQuestion
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

function getInfoUserExam(req, res){ 
    const time = req.swagger.params.time.value.trim();
    const db = req.app.db;
    const userId = ObjectId(req.userId);
    const users = req.app.users;
    var infoExamUser = users.getUser(userId.toString());

    if(!moment(time.trim(), helpers.FORMAT_DATE, true).isValid()){
        res.status(400);
        res.json({
            message: "Invalid the request"
        })
        return;
    }

    var option = {
        fields:{
            listMathPointExam: 0,
            listVietnamesePointExam: 0
        }
    }

    examFunction.findOneDB(db, helpers.NAME_DB_INFOEXAMUSER, {time: time, userId: userId}, option).then((result) => {
        if(!infoExamUser || users.listUsers.size === 0 || infoExamUser.time !== time ){
            users.insertUser(userId.toString(), result);
        }
        res.status(200);
        res.json({
            numberMathExam: result.numberMathExam,
            numberVietnameseExam: result.numberVietnameseExam,
            listDidMathExam: result.listDidMathExam,
            listDidVietnameseExam: result.listDidVietnameseExam
        })
    }).catch((err) => {
        insertNewInfoExamUser(db, userId, time);
        const object = {
            userId: ObjectId(userId),
            time: time,
            examDoingId: '',
            listDidMathExam: [],
            listDidVietnameseExam: []
        }
        users.insertUser(userId.toString(), object);

        res.status(200);
        res.json({
            numberMathExam: 0, 
            numberVietnameseExam: 0,
            listDidMathExam: [],
            listDidVietnameseExam: []
        })
    })
}

function insertNewInfoExamUser(db, userId, time){
    var object = {
        userId: ObjectId(userId),
        time: time,
        numberMathExam: 0,
        numberVietnameseExam: 0,
        examDoingId: '',
        sumPoint: 0,
        listMathPointExam: [],
        listVietnamesePointExam: [],
        listDidMathExam: [],
        listDidVietnameseExam: []
    }

    const option = {
        fields:{
            firstName: 1,
            lastName: 1,
        }
    }
    examFunction.findOneDB(db, helpers.NAME_DB_USERS,{_id : userId}, option).then((result) => {
        console.log(result);
        object.fullName = result.lastName + " " + result.firstName;
        examFunction.insertOneDB(db, helpers.NAME_DB_INFOEXAMUSER, object);
    }).catch((err) => {
        console.log(err)
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

    if(!moment(body.time.trim(), helpers.FORMAT_DATE, true).isValid()){
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
    const type = req.swagger.params.type.value.trim();
    const time = req.swagger.params.time.value.trim();
    const db = req.app.db;

    const option = {
        fields:{
            listAnswerRight: 0
        }
    }
    if(!moment(time.trim(), helpers.FORMAT_DATE, true).isValid()){
        res.status(400);
        res.json({
            message: "Invalid the format time"
        })
        return;
    }
    examFunction.findMany(db, helpers.NAME_DB_EXAM, {type: type, time: time}, option).then((result) => {
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
        var listAnswerRightTmp = result.listAnswerRight;
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
                            //them dap an vao exam
                            listAnswerRightTmp.push(result.ops[0].answerRight);
                            const update = {
                                $set:{
                                    listAnswerRight : listAnswerRightTmp
                                }
                            }
                            examFunction.findOneAndUpdateDB(db, helpers.NAME_DB_EXAM, {_id : body.examId}, update).then((result)=>{
                            }).catch((err) => { 
                                console.log(err);   
                            })
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
        var listAnswerRightTmp = result.listAnswerRight;
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
                            listAnswerRightTmp.push(result.ops[0].answerRight);
                            const update = {
                                $set:{
                                    listAnswerRight : listAnswerRightTmp
                                }
                            }
                            examFunction.findOneAndUpdateDB(db, helpers.NAME_DB_EXAM, {_id : body.examId}, update).then((result)=>{
                            }).catch((err) => { 
                                console.log(err);   
                            })
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

function verifyAnwser(req, res){
    const examId = ObjectId(req.swagger.params.examId.value);
    const listAnswer = req.swagger.params.body.value.listAnswer;
    const userId = ObjectId(req.userId) ;
    const type = req.swagger.params.type.value.trim();
    const time = moment().format(helpers.FORMAT_DATE); 
    // const title = req.swagger.params.title.value.trim();
    const db = req.app.db;
    const users = req.app.users;
    var title = '';

    var listCheckedAnswer = [];
    var numberQuestion = 0;
    var numberAnswerRight = 0;
    var numberExam = 0;
    var listDidExam = [];
    var listPointExam = [];
    var infoExamUser = users.getUser(userId.toString());
    var sumPoint = 0;
    const option = {
        fields:{
            numberQuestion: 1,
            listAnswerRight: 1,
            time: 1,
            title: 1
        }
    }

    if(!infoExamUser || infoExamUser.examDoingId === ''){
        res.status(400);
        res.json({
            message: "Invalid request"
        })
        return;
    }

    examFunction.findOneDB(db, helpers.NAME_DB_EXAM, {_id : examId}, option).then((result) => {
        numberQuestion = result.numberQuestion;
        title = result.title;
        result.listAnswerRight.forEach((element, index) => {
            if(listAnswer[index] === element){
                numberAnswerRight++;
                listCheckedAnswer.push(helpers.CHECK_TRUE);
            }else{
                listCheckedAnswer.push(helpers.CHECK_FALSE);
            }
        })
        if(result.time !== time){
            res.status(200);
            res.json({
                listCheckedAnswer: listCheckedAnswer,
                numberAnswerRight: numberAnswerRight,
                numberQuestion: numberQuestion,
                point: numberAnswerRight * helpers.POINT_BASE
            })
            infoExamUser.examDoingId = '';
            return;
        }
        examFunction.findOneDB(db, helpers.NAME_DB_INFOEXAMUSER, {userId: userId, time: result.time}).then((result) => {
            sumPoint = result.sumPoint + numberAnswerRight * helpers.POINT_BASE;
            if(type === helpers.NAME_MATH_EXAM){
                numberExam = result.numberMathExam;
                listDidExam = result.listDidMathExam;
                listPointExam = result.listMathPointExam;
                infoExamUser.listDidMathExam.push(examId.toString());
            }else {
                numberExam = result.numberVietnameseExam;
                listDidExam = result.listDidVietnameseExam;
                listPointExam = result.listVietnamesePointExam;
                infoExamUser.listDidVietnameseExam.push(examId.toString());
            }

            listDidExam.push(examId.toString());
            var item = {
                title: title,
                point: numberAnswerRight * helpers.POINT_BASE
            }

            listPointExam.push(item);

            updateInfoExamUser(db, result._id, type, numberExam + 1, listDidExam, listPointExam, sumPoint);
            infoExamUser.examDoingId = '';

            res.status(200);
            res.json({
                listCheckedAnswer: listCheckedAnswer,
                numberAnswerRight: numberAnswerRight,
                numberQuestion: numberQuestion,
                point: numberAnswerRight * helpers.POINT_BASE
            })
        }).catch((err) => {
            console.log(err);
            res.status(400);
            res.json({
                message: err
            })
        })
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "Not found exam"
        })
    })
}

function getListPointExam(req, res){
    const time = req.swagger.params.time.value;
    const db = req.app.db;
    const numberTopStudent = req.swagger.params.numberTopStudent.value;
    
    if(!moment(time.trim(), helpers.FORMAT_DATE, true).isValid()){
        res.status(400);
        res.json({
            message: "Invalid the format time"
        })
        return;
    }

    if(numberTopStudent < 5){
        numberTopStudent = helpers.NUMBER_TOP_STUDENT;
    }
    
    const query = [
        {
            $match:{
                time: time
            }
        },
        {
            $project:{
                userId: true,
                fullName: true,
                time: true,
                listMathPointExam: true,
                listVietnamesePointExam: true,
                sumPoint: true,
            },
        },
        {
            $sort:{
                sumPoint: -1
            }
        },
        {
            $limit:numberTopStudent
        }
    ]

    examFunction.aggregateDB(db, helpers.NAME_DB_INFOEXAMUSER, query).then((result)=>{
        res.status(200);
            res.json({
                listPointExam: result   
        })
    }).catch((err) => {
        console.log(err);
        res.status(400);
        res.json({
            message: "Do not get list point exam"
        })
    })
}

function updateInfoExamUser(db, examUserId, type, numberExam, listDidExam, listPointExam, sumPoint){
    var update = {};

    if(type === helpers.NAME_MATH_EXAM) {
        update = {
            $set:{
                numberMathExam: numberExam,
                listDidMathExam: listDidExam,
                listMathPointExam: listPointExam,
                examDoingId: '',
                sumPoint: sumPoint
            }
        }
    }else {
        update = {
            $set:{
                numberVietnameseExam: numberExam,
                listDidVietnameseExam: listDidExam,
                listVietnamesePointExam: listPointExam,
                examDoingId: '',
                sumPoint: sumPoint
            }
        }
    }
    examFunction.findOneAndUpdateDB(db, helpers.NAME_DB_INFOEXAMUSER, {_id: examUserId}, update).then((result) => {
    }).catch((err) => {
        console.log(err);
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
