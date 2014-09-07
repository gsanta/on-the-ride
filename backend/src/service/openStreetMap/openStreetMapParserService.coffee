xml2js = require 'xml2js'
requestPromise = require 'request-promise'
fs = require 'fs'
async = require "async"
uuid = require 'node-uuid'
Q = require "q"
file = __dirname + "/../../../test.json"


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




module.exports.loadFileFromUrl = loadFileFromUrl
module.exports.parseXmlToJs = parseXmlToJs
module.exports.extractWayRefsFromRelation = extractWayRefsFromRelation
module.exports.extractNodeRefsFromWay = extractNodeRefsFromWay 
module.exports.extractCoordsFromNode = extractCoordsFromNode