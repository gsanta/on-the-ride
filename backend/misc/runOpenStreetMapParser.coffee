openStreetMapParser = require( './openStreetMapParser' )
Q = require "q"
fs = require 'fs'

relationUrl = 'http://api.openstreetmap.org/api/0.6/relation/2764576'
wayUrl = "http://api.openstreetmap.org/api/0.6/way/"
nodeUrl = "http://api.openstreetmap.org/api/0.6/node/"

openStreetMapParser.loadFileFromUrl relationUrl
.then openStreetMapParser.parseXmlToJs
	, ( err ) -> 
		console.log "failure"
.then ( data ) ->
		wayRefs = openStreetMapParser.extractWayRefsFromRelation data

		wayPromises = []
		#for way in wayRefs
		promise = openStreetMapParser.loadFileFromUrl wayUrl + wayRefs[0].ref
		wayPromises.push promise.then openStreetMapParser.parseXmlToJs
		Q.all wayPromises
	, ( err ) ->
		console.log "failure again"
.then ( data ) ->
		nodeRefs = []
		for way in data
			nodeRefs.push.apply nodeRefs, openStreetMapParser.extractNodeRefsFromWay way

		nodePromises = []
		for nodeRef in nodeRefs
			promise = openStreetMapParser.loadFileFromUrl nodeUrl + nodeRef
			nodePromises.push promise.then openStreetMapParser.parseXmlToJs
		Q.all nodePromises
	, ( err ) -> 
		console.log "3rd failure"
.then ( data ) ->
		coords = []
		for node in data
			coords.push openStreetMapParser.extractCoordsFromNode node
		jsonString = JSON.stringify( coords, null, 4 )
		fs.writeFile "test.json", jsonString, ( err ) ->
			if err 
				console.log err
			else
				console.log "The file was saved!"
	, ( err ) -> 
		console.log "4th failure"