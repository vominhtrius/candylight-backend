const { OrderedMap } = require('immutable');
const { ObjectId} = require('mongodb');
const token = require('./token.js');
const helpers = require('../helpers/helpers.js');
const connectionQuery = require('./connectionQuery.js');

class Connection {
    constructor(app) {
        this.app = app;
        this.listUsers = new OrderedMap();
        this.listUsersOnline = new Set();
        this.idGVTV = '';
        this.getUserIdGVTV();
        this.run();
    }

    decodeMessage(message){
        let msg;
        msg = JSON.parse(message);
        return msg;
    }

    remove(array, element) {
        if(array.length > 0){
            const index = array.indexOf(element, 0);
    
            if (index !== -1) {
                array.splice(index, 1);
            }
        }
    }
    
    handleCreateMessage(userId, message){
        const type = message.type;
        var clientSendConnection = this.listUsers.get(userId);
        const db = this.app.db;
        const idChannel = (message.idReceiver > userId) ? message.idReceiver + userId : userId + message.idReceiver;
        const data = {
            idChannel: idChannel,
            idSender: ObjectId(userId),
            data: message.data,
            create: new Date()
        }

        connectionQuery.insertOneDB(db, helpers.NAME_DB_MESSAGE, data).then((result)=>{
            const clientReceiverConnection = this.listUsers.get(message.idReceiver);
            const ops = result.ops[0];
            var messageTmp = {
                _id: ops._id,
                type: type,
                idChannel: idChannel,
                idSender: ObjectId(userId),
                data: ops.data,
                create: ops.create,
            }
            if(clientReceiverConnection && clientReceiverConnection.isOnline === true){   
                clientReceiverConnection.ws.send(JSON.stringify(messageTmp));
            }
            if(clientSendConnection.ws){
                clientSendConnection.ws.send(JSON.stringify(messageTmp));
            }
        }).catch((err) => {
            console.log("err insert message in db: " + err);
        })
    }

    handleMessage(userId, message){
        const type = message.type;
        var clientSendConnection = this.listUsers.get(userId);
        switch (type){
            case helpers.TYPE_MESSAGE_CREATE:
                this.handleCreateMessage(userId, message);
                break;

            case helpers.TYPE_MESSAGE_AUTH:
                clientSendConnection.auth = true;    
                this.listUsers = this.listUsers.set(userId, clientSendConnection);
                if(userId !== this.idGVTV.toString()){
                    this.handleSendIdGVTV(clientSendConnection.ws);
                    this.listUsersOnline.add(userId);
                }else{
                    var message = {
                        type: helpers.TYPE_LIST_USER_ONLINE,
                        listUsersOnline: Array.from(this.listUsersOnline)
                    }
                    // console.log("send list user online: ");
                    // console.log(this.listUsersOnline);
                    if(clientSendConnection.ws){
                        clientSendConnection.ws.send(JSON.stringify(message));
                    }
                }
                break;
            case helpers.TYPE_MESSAGE_CREATE_USER:
                this.handleSendCreateUser(message.data);
                break;
            default:
        }
    }

    getUserIdGVTV(){
        connectionQuery.findOneDB(this.app.db, helpers.NAME_DB_USERS, {"userName" : "gvtuvan"}).then((result) => {
            this.idGVTV = result._id;
        }).catch((err) => {
            console.log("err get id gvtv: " + err)
        })
    }

    handleSendIdGVTV(ws){
        let message = {
            type: helpers.TYPE_MESSAGE_ID_GV,
            idGVTV: this.idGVTV
        }
        if(ws){
            ws.send(JSON.stringify(message));
        }
    }

    handleSendUserIdOnline(userId){
        const clientReceiverConnection = this.listUsers.get(this.idGVTV.toString());
        if(clientReceiverConnection && clientReceiverConnection.isOnline === true){  
            // console.log("send id user online: " + userId);
                var message = {
                type: helpers.TYPE_USERID_ONLINE,
                idUserOnline: userId
            }         
            if(clientReceiverConnection.ws){
                clientReceiverConnection.ws.send(JSON.stringify(message));
            }
        }
    }

    handleSendUserIdOffline(userId){
        const clientReceiverConnection = this.listUsers.get(this.idGVTV.toString());
        if(clientReceiverConnection && clientReceiverConnection.isOnline === true){  
            // console.log("send id user offline: " + userId);
                var message = {
                type: helpers.TYPE_USERID_OFFLINE,
                idUserOffline: userId
            }         
            if(clientReceiverConnection.ws){
                clientReceiverConnection.ws.send(JSON.stringify(message));
            }
        }
    }

    handleSendCreateUser(data){
        const clientReceiverConnection = this.listUsers.get(this.idGVTV.toString());
        if(clientReceiverConnection && clientReceiverConnection.isOnline === true){  
            // console.log("send id user offline")
                var message = {
                type: helpers.TYPE_MESSAGE_CREATE_USER,
                data: data
            }         
            if(clientReceiverConnection.ws){
                clientReceiverConnection.ws.send(JSON.stringify(message));
            }
        }
    }

    run(){
        this.app.wss.on('connection', (ws) => {
            // console.log("client connect");
            var userId = '';
            ws.on('message', (msg) => {
                const message = this.decodeMessage(msg);        
                if(message.token === null){
                    this.handleMessage(message.userId, message);
                }else{
                    token.verifyToken(message.token).then((result) =>{
                        userId = result.userId;
                        if(!this.listUsers.get(userId)){
                            const clientConnection = {
                                ws: ws,
                                isOnline: true
                            }
                            this.listUsers = this.listUsers.set(userId, clientConnection);
                            if(userId !== this.idGVTV.toString()){
                                this.handleSendUserIdOnline(userId);
                            }
                        }else{
                            var clientConnectionTmp = this.listUsers.get(userId);
                            if(clientConnection){
                                if(clientConnectionTmp.isOnline === false){
                                    // console.log("user: " + userId + " reconnect")
                                    clientConnectionTmp.ws = ws;
                                    clientConnectionTmp.isOnline = true; 
                                    if(userId !== this.idGVTV.toString()){
                                        this.handleSendUserIdOnline(userId);
                                    }
                                }
                            }
                        }

                        this.handleMessage(userId, message);
                    }).catch((err) => {
                        console.log("err: " + err);
                    })
                }  
            })

            ws.on('close', (msg) => {
                // console.log("user: " + userId + " close connect");
                var clientConnection = this.listUsers.get(userId);
                if(clientConnection){
                    clientConnection.isOnline = false;
                    // this.remove(this.listUsersOnline, userId);
                    this.listUsersOnline.delete(userId);
                    this.handleSendUserIdOffline(userId);
                }
            })
        })
    }
}

module.exports = Connection;
