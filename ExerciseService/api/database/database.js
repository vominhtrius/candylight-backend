const mongodbClient = require('mongodb').MongoClient;
const config = require('../helpers/configMongoDB.js');

connect = () => {
    return new Promise((resolve, reject) => {
        mongodbClient.connect(config.database.url, config.database.option, (err, client) => {
            const db = client.db('qlpm');
            err ? reject(err) : resolve(db);
        });
    })
}


module.exports = { connect };
