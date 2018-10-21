'use strict';

var util = require('util');

function hello(req, res) {
  console.log(req.swagger.param)
  var name = req.swagger.params.name.value || 'stranger';
  var hello = util.format('This is AccountService, %s!', name);

  res.json(hello);
}
module.exports = {
  hello: hello
};
