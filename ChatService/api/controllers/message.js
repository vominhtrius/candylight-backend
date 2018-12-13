'use strict';
const connectionQuery = require('../../models/connectionQuery.js');
const helpers = require('../../helpers/helpers.js');

module.exports = {
  getAllMessageInChannel: getAllMessageInChannel,
  getAllInfoChannel: getAllInfoChannel
};

function getAllMessageInChannel(req, res) {
  const idChannel = req.swagger.params.idChannel.value;
  const db = req.app.db;
  
  connectionQuery.findMany(db, helpers.NAME_DB_MESSAGE,{idChannel : idChannel}).then((result) => {
    res.status(200);
    res.json({
      listMessages: result
    })
  }).catch((err) => {
    res.status(200);
    res.json({
      listMessages: []
    })
  })
}

function getAllInfoChannel(req, res) {

}
