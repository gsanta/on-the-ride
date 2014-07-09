/// <reference path="d_ts/node/node.d.ts"/>
/// <reference path="d_ts/mongodb/mongodb.d.ts"/>
/// <reference path="d_ts/express/express.d.ts"/>
var http = require("http");
var express = require("express");
var path = require("path");
var mongodb = require("mongodb");
var mongodbHelper = require("./collectionDriver");

var MongoClient = mongodb.MongoClient;
var Server = mongodb.Server;
var CollectionDriver = mongodbHelper.CollectionDriver;

var app = express();
app.set('port', process.env.PORT || 3000);

var mongoHost = 'localHost';
var mongoPort = 27017;
var collectionDriver;

mongodb.MongoClient.connect("mongodb://localhost:27017", function (err, mongoClient) {
    if (!mongoClient) {
        console.error("Error! Exiting... Must start MongoDB first");
        process.exit(1);
    }
    var db = mongoClient.db("on_the_ride");
    collectionDriver = new CollectionDriver(db);
});

//app.set( "views", path.join( __dirname, "../www" ) );
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// app.set( "view engine", "jade" );
app.use(express.bodyParser());

app.use(express.static(path.join(__dirname, "../www")));

app.post("/:collection", function (req, res) {
    var object = req.body;
    var collection = req.params.collection;
    collectionDriver.save(collection, object, function (err, docs) {
        if (err) {
            res.send(400, err);
        } else {
            res.send(201, docs);
        }
    });
});

app.get("/", function (req, res) {
    var params = req.params;

    //res.render( "../www/index.html");
    res.sendfile('../www/index.html');
});

app.get("/:collection", function (req, res) {
    console.log("ez lefut");
    var params = req.params;
    collectionDriver.findAll(req.params.collection, function (error, objs) {
        if (error) {
            res.send(400, error);
        } else {
            res.set("Content-Type", "application/json");
            res.send(200, objs);
        }
    });
});

app.get("/:collection/:entity", function (req, res) {
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
        collectionDriver.get(collection, entity, function (error, objs) {
            if (error) {
                res.send(400, error);
            } else {
                res.send(200, objs);
            }
        });
    } else {
        res.send(400, { error: 'bad url', url: req.url });
    }
});

app.put("/:collection/:entity", function (req, res) {
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
        collectionDriver.update(collection, req.body, entity, function (error, objs) {
            if (error) {
                res.send(400, error);
            } else {
                res.send(200, objs);
            }
        });
    } else {
        var error = { "message": "Cannot PUT a whole collection" };
        res.send(400, error);
    }
});

app.del("/:collection/:entity", function (req, res) {
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
        collectionDriver.delete(collection, entity, function (error, objs) {
            if (error) {
                res.send(400, error);
            } else {
                res.send(200, objs);
            }
        });
    } else {
        var error = { "message": "Cannot DELETE a whole collection" };
        res.send(400, error);
    }
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
