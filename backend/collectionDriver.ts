/// <reference path="d_ts/node/node.d.ts"/>
/// <reference path="d_ts/mongodb/mongodb.d.ts"/>

import mongodb = require( "mongodb" );
var ObjectID = require( "mongodb" ).ObjectID;

export class CollectionDriver {
	constructor( private db: mongodb.Db ) {

	}

	getCollection( collectionName: string, callback: ( err: Error, collection?: mongodb.Collection ) => void ) {
		this.db.collection( collectionName, ( error: Error, the_collection: mongodb.Collection ) => {
		    if ( error ) {
		    	callback( error );
		    } else {
		    	callback( null, the_collection );
		    }
		});
	}

	findAll( collectionName: string, callback: ( err: Error, results?: any[] ) => void ) {
	    this.getCollection( collectionName, ( error: Error, the_collection: mongodb.Collection ) => {
	      if ( error ) {
	      	callback( error );
	      } else {
	        the_collection.find().toArray( ( error: Error, results: any[]) => {
	          if ( error ) {
	          	callback( error );
	          } else {
	          	callback( null, results );
	          } 
	        });
	      }
	    });
	}

	get( collectionName: string, id: any, callback: ( err: Error, result?: any ) => void) {
	    this.getCollection( collectionName, ( error: Error, the_collection: mongodb.Collection ) => {
	        if ( error ) {
	        	callback( error );
	        } else {
	            var checkForHexRegExp: RegExp = new RegExp( "^[0-9a-fA-F]{24}$" ); 
	            if ( !checkForHexRegExp.test( id ) ) {
	            	callback( {error: "invalid id", name: "", message: ""} );
	            } else {
	            	the_collection.findOne( {'_id':ObjectID(id)} , ( err: Error, doc: any ) => { 
	                	if ( error ) {
	                		callback( error );
	                	}
	                	else {
	                		callback( null, doc );
	                	}
	            	});
	            }
	        }
	    });
	}

	save( collectionName: string, obj: any, callback: ( err: Error, result?: any ) => void) {
	    this.getCollection( collectionName, ( error: Error, the_collection: mongodb.Collection ) => {
	      if ( error ) {
	      	callback(error);
	      } else {
	        obj.created_at = new Date();
	        the_collection.insert( obj, () => {
	          callback( null, obj );
	        });
	      }
	    });
	}

	update( collectionName: string, obj: any, entityId: mongodb.ObjectID, callback: ( err: Error, result?: any ) => void ) {
	    this.getCollection(collectionName, ( error: Error, the_collection: mongodb.Collection ) => {
	        if ( error ) {
	        	callback( error );
	        } else {
	            obj._id = entityId; 
	            obj.updated_at = new Date(); 
	            the_collection.save( obj, ( error, doc ) => { 
	                if ( error ) {
	                	callback( error );
	                }
	                else {
	                	callback( null, obj );
	                }
	            });
	        }
	    });
	}

	delete( collectionName: string, entityId: mongodb.ObjectID, callback: ( err: Error, result?: any ) => void ) {
	    this.getCollection(collectionName, ( error: Error, the_collection: mongodb.Collection ) => { 
	        if ( error ) {
	        	callback( error );
	        } else {
	            the_collection.remove( {'_id':ObjectID( entityId )} , ( error: Error, doc: any ) => { 
	                if ( error ) {
	                	callback( error );
	                } else {
	                	callback( null, doc );
	                }
	            });
	        }
	    });
	}

}

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