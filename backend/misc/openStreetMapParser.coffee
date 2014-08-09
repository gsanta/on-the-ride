xml2js = require( 'xml2js' ).parseString;
request = require 'request'
fs = require 'fs'
async = require "async"

isWriteToFileAsJson = false;

uuid = require 'node-uuid'

#ways = require './test.json'

# finalNodes = []

# for way in ways
# 	for node, index in way.nodes

# 		finalNodes.push {
# 			uid: uuid.v1(),
# 			lat: node.lat,
# 			lon: node.lon,
# 			prevNodeUid: if index > 0 then finalNodes[ index - 1 ].uid else null
# 		}



module.exports.loadResourceXmlAndParseToJs = (url, isWriteToFileAsJson, callback) ->
	request url, (error, response, body) ->
		if (!error && response.statusCode == 200)
			xml2js body, (err, result) ->

				if isWriteToFileAsJson
					writeToFileAsJson result

				if callback?
					callback result, isWriteToFileAsJson
		else
			console.log "error loading resource"

module.exports.extractRelationFromOsm = ( obj, isWriteToFileAsJson ) ->
	relation = obj.osm.relation;

	if isWriteToFileAsJson
		writeToFileAsJson(relation);

	relation

module.exports.extractWaysFromRelation = ( relations, isWriteToFileAsJson ) ->

	if isWriteToFileAsJson 
		writeToFileAsJson relations[0].member
	

	result = [];

	for relation, index in relations[0].member
		result[ index ] = relation.$
		result[ index ].indexInRelation = index

	result

module.exports.extractNdsFromWay = ( way, isWriteToFileAsJson ) ->

	nds = way.osm.way[0].nd

	if isWriteToFileAsJson
		writeToFileAsJson way

	result =
		id: way.osm.way[0].$.id,
		nodes: []

	for nd, index in nds 
		result.nodes[ index ] = nd.$
		result.nodes[ index ].wayId = way.osm.way[0].$.id

	result

module.exports.extractNodeFromOsm = ( obj, isWriteToFileAsJson ) ->
	
	if isWriteToFileAsJson
		writeToFileAsJson obj.osm.node[0].$

	return obj.osm.node[0].$; 

module.exports.writeToFileAsJson = ( obj ) ->
	jsonString = JSON.stringify( obj, null, 4 )

	fs.writeFile "test.json", jsonString, ( err ) ->
		if err 
			console.log err
		else
			console.log "The file was saved!"
	
	
