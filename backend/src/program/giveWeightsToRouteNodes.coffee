mongodbHelper = require "../service/db/collectionDriverService"
routeManipulation = require "../service/map/routeManipulationService"
fs = require "fs"
mongodb = require "mongodb"
Q = require "q"
file = __dirname + "/../../test.json"

fs.readFile file, 'utf8', ( err, data ) ->
	if err
    	console.log 'Error: ' + err
    	return
 

	data = JSON.parse data
	routeManipulation.addIndexToRouteNodes data
	routeManipulation.addSiblingsToRouteNodes data
	routeManipulation.addWeightsToRouteNodes data

	jsonString = JSON.stringify( data, null, 4 )
	fs.writeFile "finalNodes.json", jsonString, ( err ) ->
		if err 
			console.log err
		else
			console.log "The file was saved!"  
