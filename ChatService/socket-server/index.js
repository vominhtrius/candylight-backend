const {OrdereMap} = require('immutable');

class SocketServer {
    constructor(app) {
        this.app = app;
        this.listUser = new OrdereMap();
        this.run();
    }

    run(){
        this.app.wss.on('connection')
    }
}
module.exports = SocketServer;
