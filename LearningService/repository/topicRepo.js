var db = require('../fn/mongo');
var config = require('../config/db');
var util = require('util');

const collection = config.DATABASE_COLLECTION_TOPIC;

exports.insert = data => {
    return db.insert(data, collection);
}

exports.update = (query, dataNew) => {
    return db.update(query, dataNew, collection);
}

exports.findOne = query => {
    return db.findOne(query, collection);
}

exports.getAll = () => {
    return db.get({}, collection);
}

exports.delete = query => {
    return db.delete(query, collection);
}