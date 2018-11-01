var db = require('../fn/mongo');
var config = require('../config/db');

const collection = config.DATABASE_COLLECTION_CATEGORY;

exports.insert = data => {
    return db.insert(data, collection);
}

exports.update = (data, dataNew) => {
    return db.update(data, dataNew, collection);
}

exports.findOne = data => {
    return db.findOne(data, collection);
}

exports.getAll = () => {
    return db.get({}, collection);
}

exports.delete = query => {
    return db.delete(query, collection);
}