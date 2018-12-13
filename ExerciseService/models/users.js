const { OrderedMap } = require('immutable');
class Users{
    constructor(app){
        this.app = app;
        this.listUsers = new OrderedMap();
        this.listUsersPlayGame = new OrderedMap();
    }

    insertUser (userId, object){
        this.listUsers = this.listUsers.set(userId, object);
    }

    getUser(userId){
        return this.listUsers.get(userId);
    }

    insertUserPlayGame (userId, object){
        this.listUsersPlayGame = this.listUsersPlayGame.set(userId, object);
    }
    getUserPlayGame(userId){
        return this.listUsersPlayGame.get(userId);
    }
}

module.exports = Users;
