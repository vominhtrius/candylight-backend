
const insertOneDB = (db, collectionName, data) => {
    return new Promise((resolve, reject) => {
        db.collection(collectionName).insertOne(data, (err, result) => {
            return err ? reject(err) : resolve(result);
        })
    })
}

const findOneDB = (db, collectionName, query) => {
    return new Promise((resolve, reject) => {
        db.collection(collectionName).findOne(query, (err, result) => {
            return err || !result ? reject(err) : resolve(result)
        })
    })
}

const findOneAndUpdateDB = (db, collectionName, filter, update) => {
    return new Promise((resolve, reject) => {
        db.collection(collectionName).findOneAndUpdate(filter, update, (err, result) => {
            return err || !result ? reject(err) : resolve(result)
        })
    })
}

module.exports = {
    insertOneDB,
    findOneDB,
    findOneAndUpdateDB
}
