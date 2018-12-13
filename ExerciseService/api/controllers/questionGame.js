'use strict';
var util = require('util');
const questionFunction = require('../../models/question.js');
const helpers = require('../../helpers/helpers.js');
const { ObjectId} = require('mongodb');

module.exports = {
    insertQuestionForGameQuiz:insertQuestionForGameQuiz,
    getListQuestionsOfGameQuiz: getListQuestionsOfGameQuiz,
    verifyGameExam: verifyGameExam,
    remove: remove,
    receivePointGameExam: receivePointGameExam,
    insertQuestionForGameArcher: insertQuestionForGameArcher,
    getListQuestionsOfGameArcher: getListQuestionsOfGameArcher,
    insertQuestionForGameFindTreasure: insertQuestionForGameFindTreasure,
    getListQuestionsOfGameFindTreasure: getListQuestionsOfGameFindTreasure
}

function insertQuestionForGameQuiz(req, res){
    const idGame = req.swagger.params.id_game.value;
    var body = req.swagger.params.body.value;
    const db = req.app.db;  
    if(body.question.trim() === '' || body.listAnswers.length === 0){
        res.status(400);
        res.json({
            message: "Invalid question"
        })
        return;
    }
    
    body.idGame = idGame;
    
    questionFunction.insertOneDB(db, helpers.NAME_DB_QUESTION_GAME_QUIZ, body).then((result) => {
        res.status(200);
        res.json({
            message: "Insert question to DB success"
        })
    }).catch((err) => {
        res.status(400);
        res.json({
            message: "Insert question to DB failed"
        })
    })
}

function insertQuestionForGameArcher(req, res){
    const idGame = req.swagger.params.id_game.value;
    var body = req.swagger.params.body.value;
    const db = req.app.db;  
    if(body.question.trim() === ''){
        res.status(400);
        res.json({
            message: "Invalid question"
        })
        return;
    }
    
    if(!body.id){
        body.id = 0;
    }
    body.idGame = idGame;
    
    questionFunction.insertOneDB(db, helpers.NAME_DB_QUESTION_GAME_ARCHER, body).then((result) => {
        res.status(200);
        res.json({
            message: "Insert question to DB success"
        })
    }).catch((err) => {
        res.status(400);
        res.json({
            message: "Insert question to DB failed"
        })
    })
}

function insertQuestionForGameFindTreasure(req, res){
    const idGame = req.swagger.params.id_game.value;
    var body = req.swagger.params.body.value;
    const db = req.app.db;  
    if(body.question.trim() === ''){
        res.status(400);
        res.json({
            message: "Invalid question"
        })
        return;
    }
    
    if(!body.id){
        body.id = 0;
    }
    body.idGame = idGame;
    
    questionFunction.insertOneDB(db, helpers.NAME_DB_QUESTION_GAME_FINDTREASURE, body).then((result) => {
        res.status(200);
        res.json({
            message: "Insert question to DB success"
        })
    }).catch((err) => {
        res.status(400);
        res.json({
            message: "Insert question to DB failed"
        })
    })
}

function getListQuestionsOfGameQuiz (req, res){
    const idGame = req.swagger.params.id_game.value;
    const numberQuestion = req.swagger.params.numberQuestion.value;
    const db = req.app.db;
    const userId = req.userId;
    const users = req.app.users;
    var user = users.getUserPlayGame(userId);

    if(!user){
        var listGamePlaying = [];
        listGamePlaying.push(idGame);
        var object = {
            listGamePlaying: listGamePlaying,
        }
        users.insertUserPlayGame(userId, object);    
        user = users.getUserPlayGame(userId);
    }else{
        if(user.listGamePlaying.indexOf(idGame) !== -1){
            res.status(400);
            res.json({
                message: "Game is playing"
            })
            return;
        }else{
            user.listGamePlaying.push(idGame);
            users.insertUserPlayGame(userId, user);
        }
    }

    const query = [
        {
            $match:{
                idGame: idGame
            }
        },
        {
            $limit:numberQuestion
        }
    ]

    questionFunction.aggregateDB(db, helpers.NAME_DB_QUESTION_GAME_QUIZ, query).then((result)=>{
        res.status(200);
            res.json({
                listQuestions: result   
        })
    }).catch((err) => {
        console.log(err);
        var object = remove(user.listGamePlaying, idGame);
        user.listGamePlaying = object;
        users.insertUserPlayGame(userId, user);
        res.status(400);
        res.json({
            message: "Do not get list question"
        })
    })
}

function getListQuestionsOfGameArcher (req, res){
    const idGame = req.swagger.params.id_game.value;
    const numberQuestion = req.swagger.params.numberQuestion.value;
    const db = req.app.db;
    const userId = req.userId;
    const users = req.app.users;
    var user = users.getUserPlayGame(userId);
    if(!user){
        var listGamePlaying = [];
        listGamePlaying.push(idGame);
        var object = {
            listGamePlaying: listGamePlaying,
        }
        users.insertUserPlayGame(userId, object);    
        user = users.getUserPlayGame(userId);
    }else{
        if(user.listGamePlaying.indexOf(idGame) !== -1){
            res.status(400);
            res.json({
                message: "Game is playing"
            })
            return;
        }else{
            user.listGamePlaying.push(idGame);
            users.insertUserPlayGame(userId, user);
        }
    }

    const query = [
        {
            $match:{
                idGame: idGame
            }
        },
        {
            $limit:numberQuestion
        }
    ]

    questionFunction.aggregateDB(db, helpers.NAME_DB_QUESTION_GAME_ARCHER, query).then((result)=>{
        res.status(200);
            res.json({
                listQuestions: result   
        })
    }).catch((err) => {
        console.log(err);
        var object = remove(user.listGamePlaying, idGame);
        user.listGamePlaying = object;
        users.insertUserPlayGame(userId, user);
        res.status(400);
        res.json({
            message: "Do not get list question"
        })
    })
}

function getListQuestionsOfGameFindTreasure(req, res){
    const idGame = req.swagger.params.id_game.value;
    const numberQuestion = req.swagger.params.numberQuestion.value;
    const db = req.app.db;
    const userId = req.userId;
    const users = req.app.users;
    var user = users.getUserPlayGame(userId);
    if(!user){
        var listGamePlaying = [];
        listGamePlaying.push(idGame);
        var object = {
            listGamePlaying: listGamePlaying,
        }
        users.insertUserPlayGame(userId, object);    
        user = users.getUserPlayGame(userId);
    }else{
        if(user.listGamePlaying.indexOf(idGame) !== -1){
            res.status(400);
            res.json({
                message: "Game is playing"
            })
            return;
        }else{
            user.listGamePlaying.push(idGame);
            users.insertUserPlayGame(userId, user);
        }
    }

    const query = [
        {
            $match:{
                idGame: idGame
            }
        },
        {
            $limit:numberQuestion
        }
    ]

    questionFunction.aggregateDB(db, helpers.NAME_DB_QUESTION_GAME_FINDTREASURE, query).then((result)=>{
        res.status(200);
            res.json({
                listQuestions: result   
        })
    }).catch((err) => {
        console.log(err);
        var object = remove(user.listGamePlaying, idGame);
        user.listGamePlaying = object;
        users.insertUserPlayGame(userId, user);
        res.status(400);
        res.json({
            message: "Do not get list question"
        })
    })
}

function verifyGameExam (req, res){
    const idGame = req.swagger.params.id_game.value;
    const body = req.swagger.params.body.value;
    const numberQuestion = body.listAnswer.length;
    const db = req.app.db;
    var users = req.app.users;
    const userId = req.userId;

    var user = users.getUserPlayGame(userId);
    if(!user){
        res.status(400);
        res.json({
            message: "Invalid request"
        })
        return;
    }else{
        if(user.listGamePlaying.indexOf(idGame) === -1){
            res.status(400);
            res.json({
                message: "User does not play game " + idGame
            })
            return;
        }else{
            const query = [
                {
                    $match:{
                        idGame: idGame
                    }
                },
                {
                    $limit:numberQuestion
                }
            ]
            questionFunction.aggregateDB(db, helpers.NAME_DB_QUESTION_GAME_QUIZ, query).then((result)=>{
                var numberAnswerRight = 0;
                result.forEach((element, index) => {
                    if(element.correctAnswer === body[index]){
                        numberAnswerRight++;
                    }
                });
                res.status(200);
                res.json({
                    numberAnswerRight: numberAnswerRight,
                    point: numberAnswerRight * helpers.POINT_BASE
                })
            }).catch((err) => {
                console.log(err);
                res.status(400);
                res.json({
                    message: "Do not get list question"
                })
            })
            var object = remove(user.listGamePlaying, idGame);
            user.listGamePlaying = object;
            users.insertUserPlayGame(userId, user);
        }
    }
}

function receivePointGameExam (req, res){
    const idGame = req.swagger.params.id_game.value;
    const point = req.swagger.params.body.value.point;
    const db = req.app.db;
    var users = req.app.users;
    const userId = req.userId;

    var user = users.getUserPlayGame(userId);
    if(!user){
        res.status(400);
        res.json({
            message: "User does not play game"
        })
        return;
    }else{
        console.log(user.listGamePlaying);

        if(user.listGamePlaying.indexOf(idGame) === -1){
            res.status(400);
            res.json({
                message: "User does not play game " + idGame
            })
            return;
        }else{
            const option = {
                fields: {
                    pointReward: 1
                }
            }
            questionFunction.findOneDB(db, helpers.NAME_DB_USERS, {_id: ObjectId(userId)}, option).then((result) => {
                const pointTmp = result.pointReward + point * helpers.POINT_BASE;
                var update = {
                    $set:{
                        pointReward: pointTmp
                    }
                }
                questionFunction.findOneAndUpdateDB(db, helpers.NAME_DB_USERS, {_id: ObjectId(userId)}, update).then((result) => {
                    res.status(200);
                    res.json({
                        message: "Update point success"
                    })
                }).catch((err) => {
                    res.status(400);
                    res.json({
                        message: "update point failed"
                    })
                })
            }).catch((err) => {
                res.status(400);
                res.json({
                    message: err
                })
            })
            var object = remove(user.listGamePlaying, idGame);
            user.listGamePlaying = object;
            users.insertUserPlayGame(userId, user);
        }
    }
}

function remove(array, element) {
    if(array.length > 0){
        const index = array.indexOf(element, 0);

        if (index !== -1) {
            array.splice(index, 1);
        }
    }

    if(!array){
        return [];
    }
    return array;
}
