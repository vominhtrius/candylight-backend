const hostService = require('../../config/config-router.js');


module.exports = function(app, apiProxy){
    app.all("/account", function(req, res) {
        console.log('redirecting to Server1');
        apiProxy.web(req, res, {target: hostService.hostAccountService});
    });    
}
