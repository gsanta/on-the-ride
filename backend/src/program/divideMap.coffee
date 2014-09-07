mapDividerService = require "../service/map/mapDividerService"
fs = require 'fs'

if not process.argv[2]?
	console.log "command line argument for map depth is missing"
	process.exit 1

latStart = 70; lonStart = -10
latEnd = 30; lonEnd = 55

area = mapDividerService.createMapHieararchy 1, latStart, latEnd, lonStart, lonEnd

jsonString = JSON.stringify( area, null, 4 )
fs.writeFile "map.json", jsonString, ( err ) ->
	if err 
		console.log err
	else
		console.log "The file was saved!"

resultTree = mapDividerService.createArrayWithBsf area
mapDividerService.countChildIndexesForNodesInBsfArray resultTree
console.log "length: #{resultTree.length}"

jsonString = JSON.stringify( resultTree, null, 4 )
fs.writeFile "arrayTree.json", jsonString, ( err ) ->
	if err 
		console.log err
	else
		console.log "The file was saved!"