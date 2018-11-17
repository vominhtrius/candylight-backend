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

    const day = moment();
    const daytFormat = moment(day).format('MM/YYYY');

    body.title = body.title.trim();

    if(!moment(body.time, "MM/YYYY").trim().isValid()){
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
    }

    if(body.numberQuestion < helpers.NUMBERQUESTION){
        res.status(400);
        res.json({
            message: "Invalid the number question in exam"
        })
    }

    // dem so exam hien co trong db cua time 
    

    res.status(200);
    res.json({
        message: "insert success"
    })
}
