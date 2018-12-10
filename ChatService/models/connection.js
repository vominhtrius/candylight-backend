const { OrderedMap } = require('immutable');
const { ObjectId} = require('mongodb');

class Connection {
    constructor(app) {
        this.app = app;
        this.listUser = new OrderedMap();
        this.run();
    }

    run(){
        this.app.wss.on('connection', (ws) => {
            const socketId = new ObjectId().toString()
            console.log("client connect: " + socketId);
            
            ws.on('message', (msg) => {
                console.log(msg)
            })
        })
    }
}
module.exports = Connection;
