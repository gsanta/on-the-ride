mongodbHelper = require "../service/db/collectionDriverService"
routeManipulation = require "../service/map/routeManipulationService"
fs = require "fs"
mongodb = require "mongodb"
Q = require "q"
file = __dirname + "/../../finalNodes.json"

 

fs.readFile file, 'utf8', ( err, data ) ->
	if err
    	console.log 'Error: ' + err
    	return
 

	data = JSON.parse data

	usedMapIds = {

	}

	for node in data
		node.mapIds = []
		node.startNodeInMap = []
		for index in [0..8]
			mapId = routeManipulation.calculateMapIdForNodeAtZoom { lon: node.lon, lat: node.lat }, index
			node.mapIds.push mapId
			if usedMapIds[mapId] == undefined and node.weight <= index + 1
				node.startNodeInMap.push mapId
				usedMapIds[mapId] = true

	jsonString = JSON.stringify( data, null, 4 )
	writeFile "reallyFinal.json", jsonString

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