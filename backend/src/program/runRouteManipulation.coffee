mongodbHelper = require "../service/db/collectionDriverService"
routeManipulation = require "../service/map/routeManipulationService"
fs = require "fs"
mongodb = require "mongodb"
Q = require "q"
file = __dirname + "/../../finalNodes.json"


global.collectionDriver = null

mongodb.MongoClient.connect "mongodb://localhost:27017", ( err, mongoClient ) ->
	if !mongoClient
		console.error "Error! Exiting... Must start MongoDB first"
		process.exit(1);

	db = mongoClient.db "on_the_ride"
	global.collectionDriver = new mongodbHelper.CollectionDriver( db )

	fs.readFile file, 'utf8', ( err, data ) ->
		if err
	    	console.log 'Error: ' + err
	    	return
	 

		data = JSON.parse data

		rootMapPromise = routeManipulation.getRootMap()

		rootMapPromise.then ( map ) ->	
			for node in data 
				findParentMapAndAddToNode node, map

findParentMapAndAddToNode = ( node, rootMap ) ->
	routeManipulation.findLeafMap node, rootMap, ( parentMapIds ) -> 
		node.mapIds = parentMapIds	
		collectionDriver.save "eurovelo_6", node, ( error, obj ) ->
			if error
				console.log 'Error: ' + err
			else
				console.log "saved"

writeFile = ( fileName, json ) ->
	fs.writeFile fileName, json, ( err ) ->
		if err 
			console.log err
		else
			console.log "The file was saved!"