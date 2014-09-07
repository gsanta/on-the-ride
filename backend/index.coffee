
http = require "http"
express = require "express"
path = require "path"
mongodb = require "mongodb"
mongodbHelper = require "./js/service/db/collectionDriverService"
util = require('util');

MongoClient = mongodb.MongoClient;
Server = mongodb.Server;
CollectionDriver = mongodbHelper.CollectionDriver;

app = express();
app.set('port', process.env.PORT || 3000);

mongoHost = 'localHost'
mongoPort = 27017
collectionDriver = null

mongodb.MongoClient.connect "mongodb://localhost:27017", ( err, mongoClient ) ->
    if !mongoClient
        console.error "Error! Exiting... Must start MongoDB first"
        process.exit(1);

    db = mongoClient.db "on_the_ride"
    collectionDriver = new mongodbHelper.CollectionDriver( db )
    return

app.set 'view engine', 'ejs'
app.engine 'html', require( 'ejs' ).renderFile
app.use express.bodyParser()
app.use( express.static( path.join(__dirname, "../www" ) ) )

app.post "/:collection", ( req, res ) ->
    object = req.body;
    collection = req.params.collection;
    collectionDriver.save collection, object, ( err, docs ) ->
        if err
            res.send 400, err
        else
            res.send 201, docs

app.get "/", ( req, res ) ->
    params = req.params;

    res.sendfile '../www/index.html'

app.get "/:collection", ( req, res ) ->
    params = req.params

    collectionDriver.findAll req.params.collection, ( error, objs ) ->
        if error
            res.send 400, error
        else
            res.set "Content-Type", "application/json"
            res.send 200, objs

app.get "/route/:routeName/:zoom", ( req, res ) ->
    console.log "ez fut le"
    params = req.params
    routeName = params.routeName
    zoom = parseInt params.zoom
    console.log "collection"
    console.log routeName
    console.log "zoom"
    console.log zoom
    query = {
        weight: { $lte: zoom }
    }


    if routeName? and zoom?
        collectionDriver.query routeName, query, ( error, objs ) ->
            if error
                res.send 400, error
            else
                res.send 200, objs
    else
        res.send 400, { error: 'bad url', url: req.url }

app.get "/:collection/:entity", ( req, res ) ->
    params = req.params
    entity = params.entity
    collection = params.collection

    if entity
        collectionDriver.get collection, entity, ( error, objs ) ->
            if error
                res.send 400, error
            else
                res.send 200, objs
    else
        res.send 400, { error: 'bad url', url: req.url }


app.put "/:collection/:entity", ( req, res ) ->
    params = req.params
    entity = params.entity
    collection = params.collection
    if entity
        collectionDriver.update collection, req.body, entity, ( error, objs ) ->
            if error
                res.send 400, error
            else
                res.send 200, objs
    else
        error = { "message": "Cannot PUT a whole collection" };
        res.send 400, error

app.del "/:collection/:entity", ( req, res ) ->
    params = req.params
    entity = params.entity
    collection = params.collection
    if entity
        collectionDriver.delete collection, entity, ( error, objs ) ->
            if error
                res.send 400, error
            else
                res.send 200, objs
    else
        error = { "message": "Cannot DELETE a whole collection" };
        res.send 400, error

http.createServer( app ).listen  app.get( 'port' ), () ->
    console.log 'Express server listening on port ' + app.get 'port'