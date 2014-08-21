xml2js = require 'xml2js'
requestPromise = require 'request-promise'
fs = require 'fs'
async = require "async"
uuid = require 'node-uuid'
Q = require "q"
file = __dirname + "/../../../test.json"

fs.readFile file, 'utf8', ( err, data ) ->
	if err
    	console.log 'Error: ' + err
    	return
 

	data = JSON.parse data
	addIndexToRouteNodes data
	addSiblingsToRouteNodes data
	addWeightsToRouteNodes data

	jsonString = JSON.stringify( data, null, 4 )
	fs.writeFile "finalNodes.json", jsonString, ( err ) ->
		if err 
			console.log err
		else
			console.log "The file was saved!" 



loadFileFromUrl = ( url ) ->
	requestPromise url

parseXmlToJs = ( xml ) ->
	deferred = Q.defer()
	parser = new xml2js.Parser()
	parser.parseString xml, ( err, stdout, stderr ) ->
		if err
			return deferred.reject err
		return deferred.resolve stdout
	return deferred.promise

getRelationFromOsm = ( osm ) ->
	osm.osm.relation

extractWayRefsFromRelation = ( relation ) ->
	relation = getRelationFromOsm relation
	result = [];

	for way, index in relation[0].member
		if way.$.type is "way"
			result.push way.$
	result

getWayFromOsm = ( osm ) ->
	osm.osm.way[0]

extractNodeRefsFromWay = ( way ) ->
	way = getWayFromOsm way
	refs = []
	for nd in way.nd
		refs.push nd.$.ref
	refs


getNodeFromOsm = ( osm ) ->
	osm.osm.node[0].$; 

extractCoordsFromNode = ( node ) ->
	node = getNodeFromOsm node
	ret =
		lat: node.lat,
		lon: node.lon

addIndexToRouteNodes = ( nodes ) ->
	for node, index in nodes
		node.index = index

addSiblingsToRouteNodes = ( nodes ) ->
	for node, index in nodes
		node.siblings = []
		for i in [ 1...10 ]
			if nodes.length > index + i
				node.siblings.push ( index + i )
			else
				break

addWeightsToRouteNodes = ( nodes ) ->
	for node, index in nodes
		node.weight = index % 14




module.exports.loadFileFromUrl = loadFileFromUrl
module.exports.parseXmlToJs = parseXmlToJs
module.exports.extractWayRefsFromRelation = extractWayRefsFromRelation
module.exports.extractNodeRefsFromWay = extractNodeRefsFromWay 
module.exports.extractCoordsFromNode = extractCoordsFromNode
module.exports.addSiblingsToRouteNodes = addSiblingsToRouteNodes
module.exports.addWeightsToRouteNodes = addWeightsToRouteNodes
module.exports.addIndexToRouteNodes = addIndexToRouteNodes