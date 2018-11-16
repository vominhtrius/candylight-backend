const { OrderedMap } = require('immutable');
class Users{
    constructor(app){
        this.app = app;
        this.listUsers = new OrderedMap();
    }

    insertUser (userId, object){
        this.listUsers = this.listUsers.set(userId, object);
    }

    getUser(userId){
        return this.listUsers.get(userId);
    }
}

module.exports = Users;
