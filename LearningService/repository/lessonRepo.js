var db = require('../fn/mongo');
var config = require('../config/db');

const collection = config.DATABASE_COLLECTION_LESSON;

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
    var obj = {};
    return db.get(obj, collection);
}

exports.delete = query => {
    return db.delete(query, collection);
}