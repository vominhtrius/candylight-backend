const hostService = require('../../config/config-router.js');

module.exports = function(app, apiProxy){
    app.all("/api/account*", (req, res) => {
        console.log("method: " + req.method+ " " + req.url);
        apiProxy.web(req, res, {target: hostService.hostAccountService});
    })  
}
