var mongodb = require("mongodb");
var util = require('util');
var config = require("../config/db");
var MongoClient = mongodb.MongoClient;

var url = config.DATABASE_URL;

exports.insert = (data, collectionMG) => { 
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("Unable to connect to the mongoDB server. Error:", err);
                reject(err);
            } else {
                console.log("Connection established to", url);
            
                const collection = db.db('qlpm').collection(collectionMG);
                
                collection.insert(data, function(err, result) {
                    //console.log("Result when insert: ")
                    //console.log(util.inspect(result, {showHidden: false, depth: null}))

                    db.close();
                    if(err) {
                        //console.log("err: " + err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    });
}
  
exports.update = (query, dataNew, collectionMG) => { 
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("Unable to connect to the mongoDB server. Error:", err);
                reject(err);
            } else {
                console.log("Connection established to", url);
            
                const collection = db.db('qlpm').collection(collectionMG);
                
                collection.update(query, dataNew,{ upsert: false } , function(err, result) {

                    db.close();
                    if(err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    });
}

exports.findOne = (query, collectionMG) => { 
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("Unable to connect to the mongoDB server. Error:", err);
                reject(err);
            } else {
                console.log("Connection established to", url);
            
                const collection = db.db('qlpm').collection(collectionMG);
                
                collection.findOne(query, function(err, result) {
                    db.close();
                    if(err) {
                        //console.log("error");
                        //console.log(util.inspect(err, {showHidden: false, depth: null}))
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    });
}

exports.get = (query, collectionMG) => { 
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("Unable to connect to the mongoDB server. Error:");
                reject(err);
            } else {
                console.log("Connection established to", url);
            
                const collection = db.db('qlpm').collection(collectionMG);
                
                collection.find(query).toArray(function(err, result) {
                    db.close();
                    if(err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    });
}

exports.delete = (query) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log("Unable to connect to the mongoDB server. Error:");
                reject(err);
            } else {
                console.log("Connection established to", url);
            
                const collection = db.db('qlpm').collection(collectionMG);
                
                collection.remove(query, function(err, result) {
                    db.close();
                    if(err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    }); 
}

