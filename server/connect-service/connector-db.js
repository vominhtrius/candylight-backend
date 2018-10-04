const mongodbClient = require('mongodb').MongoClient;
const config = require('../config/config-mongodb.js');
const redis = require('redis');

connectMongoDB = () => {
    return new Promise((resolve, reject) => {
        mongodbClient.connect(config.database.url, config.database.option, (err, client) => {
            const db = client.db('dbluyenthilop6');
            err ? reject(err) : resolve(db);
        });
    })
}

connectRedisDB = () => {
    return redisClient = redis.createClient();
}

const database = {connectMongoDB, connectRedisDB}

module.exports = database;
