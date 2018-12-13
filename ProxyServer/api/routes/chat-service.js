const hostService = require('../../config/config-router.js');

module.exports = function(app, apiProxy){
    app.all("/api/chat*", function(req, res) {
        console.log('redirecting to Server1');
        apiProxy.web(req, res, {target: hostService.hostChatService});
    }); 
}
