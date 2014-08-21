mongodbHelper = require "../service/db/collectionDriverService"
routeManipulation = require "../service/map/routeManipulationService"
fs = require "fs"
mongodb = require "mongodb"
Q = require "q"
file = __dirname + "/../../test.json"


global.collectionDriver = null

mongodb.MongoClient.connect "mongodb://localhost:27017", ( err, mongoClient ) ->
	if !mongoClient
		console.error "Error! Exiting... Must start MongoDB first"
		process.exit(1);

	db = mongoClient.db "on_the_ride"
	global.collectionDriver = new mongodbHelper.CollectionDriver( db )

	routeManipulation.iterateRoute "eurovelo_6_new"
