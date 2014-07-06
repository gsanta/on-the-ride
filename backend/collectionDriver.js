/// <reference path="d_ts/node/node.d.ts"/>
/// <reference path="d_ts/mongodb/mongodb.d.ts"/>
var ObjectID = require("mongodb").ObjectID;

var CollectionDriver = (function () {
    function CollectionDriver(db) {
        this.db = db;
    }
    CollectionDriver.prototype.getCollection = function (collectionName, callback) {
        this.db.collection(collectionName, function (error, the_collection) {
            if (error) {
                callback(error);
            } else {
                callback(null, the_collection);
            }
        });
    };

    CollectionDriver.prototype.findAll = function (collectionName, callback) {
        this.getCollection(collectionName, function (error, the_collection) {
            if (error) {
                callback(error);
            } else {
                the_collection.find().toArray(function (error, results) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
    };

    CollectionDriver.prototype.get = function (collectionName, id, callback) {
        this.getCollection(collectionName, function (error, the_collection) {
            if (error) {
                callback(error);
            } else {
                var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
                if (!checkForHexRegExp.test(id)) {
                    callback({ error: "invalid id", name: "", message: "" });
                } else {
                    the_collection.findOne({ '_id': ObjectID(id) }, function (err, doc) {
                        if (error) {
                            callback(error);
                        } else {
                            callback(null, doc);
                        }
                    });
                }
            }
        });
    };

    CollectionDriver.prototype.save = function (collectionName, obj, callback) {
        this.getCollection(collectionName, function (error, the_collection) {
            if (error) {
                callback(error);
            } else {
                obj.created_at = new Date();
                the_collection.insert(obj, function () {
                    callback(null, obj);
                });
            }
        });
    };

    CollectionDriver.prototype.update = function (collectionName, obj, entityId, callback) {
        this.getCollection(collectionName, function (error, the_collection) {
            if (error) {
                callback(error);
            } else {
                obj._id = entityId;
                obj.updated_at = new Date();
                the_collection.save(obj, function (error, doc) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, obj);
                    }
                });
            }
        });
    };

    CollectionDriver.prototype.delete = function (collectionName, entityId, callback) {
        this.getCollection(collectionName, function (error, the_collection) {
            if (error) {
                callback(error);
            } else {
                the_collection.remove({ '_id': ObjectID(entityId) }, function (error, doc) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, doc);
                    }
                });
            }
        });
    };
    return CollectionDriver;
})();
exports.CollectionDriver = CollectionDriver;
// app.put('/:collection/:entity', function(req, res) { //A
//     var params = req.params;
//     var entity = params.entity;
//     var collection = params.collection;
//     if (entity) {
//        collectionDriver.update(collection, req.body, entity, function(error, objs) { //B
//           if (error) { res.send(400, error); }
//           else { res.send(200, objs); } //C
//        });
//    } else {
//        var error = { "message" : "Cannot PUT a whole collection" };
//        res.send(400, error);
//    }
// });
// app.delete('/:collection/:entity', function(req, res) { //A
//     var params = req.params;
//     var entity = params.entity;
//     var collection = params.collection;
//     if (entity) {
//        collectionDriver.delete(collection, entity, function(error, objs) { //B
//           if (error) { res.send(400, error); }
//           else { res.send(200, objs); } //C 200 b/c includes the original doc
//        });
//    } else {
//        var error = { "message" : "Cannot DELETE a whole collection" };
//        res.send(400, error);
//    }
// });
// exports.CollectionDriver = CollectionDriver;
