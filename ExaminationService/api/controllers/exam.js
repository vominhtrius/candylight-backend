'use strict';
var util = require('util');
const examFunction = require('../../model/exam.js');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const helpers = require('../../helpers/helpers.js');

module.exports = {
    insertExam: insertExam,
};

function insertExam(req, res) {
    const body = req.swagger.params.body.value;
    const db = req.app.db;
    // const day = moment();
    // const daytFormat = moment(day).format('MM/YYYY');

    body.title = body.title.trim();

    if(!moment(body.time.trim(), "MM/YYYY", true).isValid()){
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
    examFunction.countDocument(db, helpers.NAME_DB_EXAM, {time: body.time}).then((result) => {
        if(result < 3){
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
