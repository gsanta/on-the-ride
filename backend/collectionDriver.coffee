ObjectID = require( "mongodb" ).ObjectID;

CollectionDriver = ( db ) ->
        this.db = db

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
            checkForHexRegExp = new RegExp "^[0-9a-fA-F]{24}$"
            if !( checkForHexRegExp.test id )
                callback { error: "invalid id", name: "", message: "" }
            else
                the_collection.findOne { '_id': ObjectID id  }, ( err, doc ) ->
                    if error
                        callback error
                    else
                        callback null, doc

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

exports.CollectionDriver = CollectionDriver;
