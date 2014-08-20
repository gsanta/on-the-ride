openStreetMapParser = require( '../service/openStreetMap/openStreetMapParserService' )
Q = require "q"
fs = require 'fs'

relationUrl = 'http://api.openstreetmap.org/api/0.6/relation/2764576'
wayUrl = "http://api.openstreetmap.org/api/0.6/way/"
nodeUrl = "http://api.openstreetmap.org/api/0.6/node/"

openStreetMapParser.loadFileFromUrl relationUrl
.then openStreetMapParser.parseXmlToJs
	, ( err ) -> 
		console.log "failure loading relation"
.then ( data ) ->
		wayRefs = openStreetMapParser.extractWayRefsFromRelation data

		wayPromises = []
		for way in wayRefs
			promise = openStreetMapParser.loadFileFromUrl wayUrl + way.ref
			wayPromises.push promise.then openStreetMapParser.parseXmlToJs
		Q.all wayPromises
	, ( err ) ->
		console.log "failure parsing relation"
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
		console.log "failure loading/parsing way"
.then ( data ) ->
		writeFile "nodes.json", jsonString
		coords = []
		for node in data
			coords.push openStreetMapParser.extractCoordsFromNode node
		jsonString = JSON.stringify( coords, null, 4 )
		writeFile "test.json", jsonString
	, ( err ) -> 
		console.log "failure loading/parsing node"


writeFile = ( fileName, json ) ->
	fs.writeFile fileName, json, ( err ) ->
		if err 
			console.log err
		else
			console.log "The file was saved!"