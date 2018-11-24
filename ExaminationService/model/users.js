const {OrderedMap} = require('immutable');
const moment = require('moment');
const examFunction = require('../model/exam.js');
const helpers = require('../helpers/helpers.js');

class Users {
    constructor(app) {
        this.app = app;
        this.listUsers = new OrderedMap();
    }

    insertUser(userId, object) {
        this.listUsers = this.listUsers.set(userId, object);
    }

    getUser(userId) {
        return this.listUsers.get(userId);
    }

    getAllUsers(db) {
        const time = moment().format("MM_YYYY");
        var option ={
            fields:{
                listMathPointExam:0,
                listVietnamesePointExam: 0
            }
        }

        examFunction.findMany(db, helpers.NAME_DB_INFOEXAMUSER, {time: time}, option).then((result) => {
            result.forEach((element) => {
                this.listUsers = this.listUsers.set(element.userId.toString(), element);
            });
        }).catch((err) => {
            console.log(err);
        })
    }
}

module.exports = Users;