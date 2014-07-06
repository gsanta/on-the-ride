/// <reference path="d_ts/node/node.d.ts"/>
/// <reference path="d_ts/mongodb/mongodb.d.ts"/>
/// <reference path="d_ts/express/express.d.ts"/>

import http = require( "http" );
import express = require( "express" );
import path = require( "path" );
import mongodb = require( "mongodb" );
import mongodbHelper = require( "./collectionDriver" );

var MongoClient = mongodb.MongoClient;
var Server = mongodb.Server;
var CollectionDriver = mongodbHelper.CollectionDriver;
 
var app = express();
app.set( 'port', process.env.PORT || 3000 );

var mongoHost = 'localHost';
var mongoPort = 27017; 
var collectionDriver;
 
mongodb.MongoClient.connect( "mongodb://localhost:27017", function( err: Error, mongoClient: mongodb.Db ) { 
  if ( !mongoClient ) {
      console.error( "Error! Exiting... Must start MongoDB first" );
      process.exit( 1 ); 
  }
  var db = mongoClient.db( "on_the_ride" );  
  collectionDriver = new CollectionDriver( db ); 
});

app.set( "views", path.join( __dirname, "views" ) );
app.set( "view engine", "jade" );

app.use( express.bodyParser() );

app.use( express.static( path.join( __dirname, "public" ) ) );

app.post( "/:collection", ( req: express.Request, res: express.Response ) => { 
    var object = req.body;
    var collection = req.params.collection;
    collectionDriver.save( collection, object, ( err: Error, docs: any ) => {
          if ( err ) { 
            res.send( 400, err ); 
          } else { 
            res.send( 201, docs ); 
          } 
     });
});

app.get( "/:collection", ( req: express.Request, res: express.Response ) => { 
   var params = req.params; 
   collectionDriver.findAll( req.params.collection, ( error: Error, objs: any ) => { 
    	  if ( error ) { 
          res.send( 400, error ); 
        } else { 
	          if ( req.accepts( "html") ) {
    	          res.render( "data", { objects: objs, collection: req.params.collection } ); 
              } else {
                res.set( "Content-Type", "application/json" );
                res.send( 200, objs );
              }
         }
   	});
});
 
app.get( "/:collection/:entity", ( req: express.Request, res: express.Response ) => { 
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if ( entity ) {
       collectionDriver.get( collection, entity, ( error: Error, objs: any ) => {
          if ( error ) { 
            res.send( 400, error ); 
          } else { 
            res.send( 200, objs ); 
          }
       });
   } else {
      res.send( 400, { error: 'bad url', url: req.url } );
   }
});

app.put( "/:collection/:entity", ( req: express.Request, res: express.Response ) => {
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if ( entity ) {
       collectionDriver.update( collection, req.body, entity, ( error: Error, objs: any ) => {
          if ( error ) { 
            res.send( 400, error ); 
          } else { 
            res.send( 200, objs ); 
          }
       });
   } else {
       var error = { "message" : "Cannot PUT a whole collection" };
       res.send( 400, error );
   }
});

app.del( "/:collection/:entity", ( req: express.Request, res: express.Response ) => {
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if ( entity ) {
       collectionDriver.delete( collection, entity, ( error: Error, objs: any ) => { //B
          if ( error ) { 
            res.send( 400, error ); 
          } else { 
            res.send( 200, objs ); 
          }
       });
   } else {
       var error = { "message" : "Cannot DELETE a whole collection" };
       res.send( 400, error );
   }
});

http.createServer( app ).listen( app.get( 'port' ), () => {
  console.log( 'Express server listening on port ' + app.get( 'port' ) );
});