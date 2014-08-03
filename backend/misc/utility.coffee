xml2js = require( 'xml2js' ).parseString;
request = require 'request'
fs = require 'fs'
async = require "async"

isWriteToFileAsJson = false;

uuid = require 'node-uuid'

ways = require './test.json'

finalNodes = []

for way in ways
	for node, index in way.nodes

		finalNodes.push {
			uid: uuid.v1(),
			lat: node.lat,
			lon: node.lon,
			prevNodeUid: if index > 0 then finalNodes[ index - 1 ].uid else null
		}



loadResourceXmlAndParseToJs (url, isWriteToFileAsJson, callback) ->
	request url, (error, response, body) ->
	  if (!error && response.statusCode == 200)
		    xml2js body, (err, result) ->

			    if isWriteToFileAsJson
			    	writeToFileAsJson result

				if callback?
					callback result, isWriteToFileAsJson
	  else
	  	console.log "error loading resource"



writeToFileAsJson obj ->
	jsonString = JSON.stringify( obj, null, 4 )

    fs.writeFile( "test.json", jsonString, ( err ) ->
	    if err 
	        console.log err
	    else
	        console.log "The file was saved!"
	)
	
