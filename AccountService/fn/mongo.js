var mongodb = require("mongodb");
var config = require("../config/db");
var MongoClient = mongodb.MongoClient;

var url = config.DATABASE_URL;

exports.insert = (data, collectionMG, callback) =>
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("Unable to connect to the mongoDB server. Error:", err);
    } else {
      console.log("Connection established to", url);

      const collection = db.db('qlpm').collection(collectionMG);
      
      collection.insert(data, function(err, result) {
        db.close();
        return callback(err, result);
      });
    }
  });

exports.update = (dataOld, dataNew, collectionMG, callback) =>
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("Unable to connect to the mongoDB server. Error:", err);
    } else {
      console.log("Connection established to", url);

      const collection = db.db('qlpm').collection(collectionMG);
      
      collection.update(dataOld, dataNew, function(err, result) {

        db.close();
        return callback(err, result);
      });
    }
  });

exports.findOne = (data, collectionMG, callback) =>
  MongoClient.connect(url, (err, db) => {
    if (err) {
      console.log("Unable to connect to the mongoDB server. Error:", err);
    } else {
      console.log("Connection established to", url);

      const collection = db.db('qlpm').collection(collectionMG);
      
      collection.findOne(data, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Query OK");
        }
        db.close();
        return callback(result);
      });
    }
  });
