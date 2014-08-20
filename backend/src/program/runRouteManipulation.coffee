mongodbHelper = require "../service/db/collectionDriverService"
routeManipulation = require "../service/map/routeManipulationService"
mongodb = require "mongodb"
Q = require "q"


global.collectionDriver = null

testNode =
	"_id" : 0,
	"lat" : "47.4925",
	"lon" : "19.0514",
	"siblings" : [
		1,
		2,
		3,
		4,
		5,
		6,
		7,
		8,
		9
	]

mongodb.MongoClient.connect "mongodb://localhost:27017", ( err, mongoClient ) ->
	if !mongoClient
		console.error "Error! Exiting... Must start MongoDB first"
		process.exit(1);

	db = mongoClient.db "on_the_ride"
	global.collectionDriver = new mongodbHelper.CollectionDriver( db )

	rootMapPromise = routeManipulation.getRootMap()
	rootMapPromise.then ( data ) ->	
		result = routeManipulation.findLeafMapRecursively testNode, data, ( finalMap ) ->
			testNode.mapId = finalMap._id
			console.log testNode
	return