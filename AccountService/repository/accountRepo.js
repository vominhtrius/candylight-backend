var db = require('../fn/mongo');
var config = require('../config/db');

const collection = config.DATABASE_COLLECTION_USER;

exports.insert = (data, callback) => {
    return db.insert(data, collection, callback);
}

exports.update = (data, dataNew, callback) => {
    return db.update(data, dataNew, collection, callback);
}

exports.findOne = (data, callback) => {
    return db.findOne(data, collection, callback);
}

exports.findAll = ( callback) => {
    return db.findAll({}, collection, callback);
}