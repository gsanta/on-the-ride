ObjectID = require( "mongodb" ).ObjectID;

CollectionDriver = ( db ) ->
        this.db = db
        return

CollectionDriver.prototype.getCollection = ( collectionName, callback ) ->
    this.db.collection collectionName, ( error, the_collection ) ->
        if error
            callback error
        else
            callback null, the_collection

CollectionDriver.prototype.findAll = ( collectionName, callback ) ->
    this.getCollection collectionName, ( error, the_collection ) ->
        if error
            callback error
        else
            the_collection.find().toArray ( error, results ) ->
                if error
                    callback error
                else
                    callback null, results

CollectionDriver.prototype.get = ( collectionName, id, callback ) ->
    this.getCollection collectionName, ( error, the_collection ) ->
        if error
            callback error
        else
            the_collection.findOne { '_id': id  }, ( err, doc ) ->
                if error
                    console.log error
                else
                    callback null, doc

CollectionDriver.prototype.query = ( collectionName, queryObj, callback ) ->
    this.getCollection collectionName, ( error, the_collection ) ->
        if error
            callback error
        else
            the_collection.find( queryObj ).toArray ( error, results ) ->
                if error
                    callback error
                else
                    console.log "result"
                    console.log results.length
                    callback null, results

CollectionDriver.prototype.save = ( collectionName, obj, callback ) ->
    this.getCollection collectionName, ( error, the_collection ) ->
        if error
            callback error
        else
            obj.created_at = new Date();
            the_collection.insert obj, () ->
                callback null, obj 

CollectionDriver.prototype.update = ( collectionName, obj, entityId, callback ) ->
    this.getCollection collectionName, ( error, the_collection ) ->
        if error
            callback error
        else
            obj._id = entityId;
            obj.updated_at = new Date();
            the_collection.save obj, ( error, doc ) ->
                if error
                    callback error
                else
                    callback null, obj

CollectionDriver.prototype.delete = ( collectionName, entityId, callback ) ->
    this.getCollection collectionName, ( error, the_collection ) ->
        if error
            callback error
        else
            the_collection.remove { '_id': ObjectID(entityId) }, ( error, doc ) ->
                if error
                    callback error
                else
                    callback null, doc

module.exports.CollectionDriver = CollectionDriver;
