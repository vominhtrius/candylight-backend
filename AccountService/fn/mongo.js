var mongodb = require("mongodb");
var config = require("../config/db");
var MongoClient = mongodb.MongoClient;

var url = config.DATABASE_URL;
var mongo = MongoClient.connect(url);
exports.insert = (data, callback) =>
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("Unable to connect to the mongoDB server. Error:", err);
    } else {
      console.log("Connection established to", url);

      //var collection = db.collection(config.DATABASE_COLLECTION);
      const collection = db.db('qlpm').collection(config.DATABASE_COLLECTION);
      
      collection.insert(data, function(err, result) {
        // if (err) {
        //   console.log(err);
        // } else {
        //   // console.log(
        //   //   'Inserted %d documents into the "users" collection. The documents inserted with "_id" are:',
        //   //   result.length,
        //   //   result
        //   // );
        // }

        db.close();
        return callback(err, result);
      });
    }
  });

exports.update = (dataOld, dataNew, callback) =>
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log("Unable to connect to the mongoDB server. Error:", err);
    } else {
      console.log("Connection established to", url);

      const collection = db.db('qlpm').collection(config.DATABASE_COLLECTION);
      
      collection.update(dataOld, dataNew, function(err, result) {
        // if (err) {
        //   console.log(err);
        // } else {
        //   console.log(
        //     'Inserted %d documents into the "users" collection. The documents inserted with "_id" are:',
        //     result.length,
        //     result
        //   );
        // }
        

        db.close();
        return callback(err, result);
      });
    }
  });

exports.findOne = (data, callback) =>
  MongoClient.connect(url, (err, db) => {
    if (err) {
      console.log("Unable to connect to the mongoDB server. Error:", err);
    } else {
      console.log("Connection established to", url);

      const collection = db.db('qlpm').collection(config.DATABASE_COLLECTION);
      
      collection.findOne(data, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Query OK");
          // console.log(
          //   'Inserted %d documents into the "users" collection. The documents inserted with "_id" are:',
          //   result.length,
          //   result
          // );
        }
        db.close();
        return callback(result);
      });
    }
  });
