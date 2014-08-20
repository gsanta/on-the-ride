mongodbHelper = require "../db/collectionDriver"
mongodb = require "mongodb"
Q = require "q"


collectionDriver = null

testNode =
	"_id" : 0,
	"lat" : "47.5915877",
	"lon" : "7.5895851",
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
	collectionDriver = new mongodbHelper.CollectionDriver( db )

	rootMapPromise = getRootMap()
	rootMapPromise.then ( data ) ->	
		console.log "route" 
		console.log data
		childPromises = getMapChildren( data )
		for childPromis in childPromises
			childPromis.then ( childData ) ->
				console.log "child"
				console.log childData
				console.log containsNode testNode, data

		Q.all childPromises


	return

getRootMap = () ->
	getMap 0


getMap = ( _id ) ->
	deferred = Q.defer()
	collectionDriver.get "map", _id, ( error, obj ) ->
		if error
			return deferred.reject error
		return deferred.resolve obj
	return deferred.promise

getMapChildren = ( map ) ->
	childPromises = []
	for childAreaId in map.childAreaIds 
		console.log "childAreaId"
		console.log childAreaId
		promise = getMap childAreaId
		childPromises.push promise
	childPromises

containsNode = ( node, map ) ->
	if ( 	
		parseInt map.latS >= parseInt node.lat and 
		parseInt map.latE <= parseInt node.lat and 
		parseInt map.lonS >= parseInt node.lon and 
		parseInt map.lonE <= parseInt node.lon
	)
		return true
	return false