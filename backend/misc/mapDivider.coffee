
openStreetMapParser = require( './openStreetMapParser' )
fs = require 'fs'

latStart = 70; lonStart = -10
latEnd = 30; lonEnd = 55

divideMap = ( latS, latE, lonS, lonE ) ->
	latDiff = Math.abs latS - latE
	lonDiff = Math.abs lonS - lonE
	latIncr = latDiff / 2
	lonIncr = lonDiff / 2

	results = []
	for i in [ 0...2 ]
		for j in [ 0...2 ]
			results.push {
				lat: latS - i * latIncr,
				lon: lonS + j * lonIncr,
			}
	results



maxIter = 3
indexer = 0

createMapHieararchy = ( iter, latS, latE, lonS, lonE ) ->
	indexer++;
	if iter == maxIter
		area = 
			latS: latS,
			lonS: lonS,
			latE: latE,
			lonE: lonE,
			index: indexer
			children: []
		return area
	area = 
		latS: latS,
		lonS: lonS,
		latE: latE,
		lonE: lonE,
		index: indexer
		children: []
	dividedMap = divideMap latS, latE, lonS, lonE
	iter++

	latDiff = ( Math.abs latS - latE ) / 2
	lonDiff = ( Math.abs lonS - lonE ) / 2

	for i in [0...dividedMap.length]
		newArea = ( createMapHieararchy iter, dividedMap[i].lat, dividedMap[i].lat + latDiff,
			 dividedMap[i].lon, dividedMap[i].lon + lonDiff )
		area.children.push newArea
	return area

createArrayWithBsf = ( node ) ->
	queue = [node]
	arrayTree = []
	indexer = 0

	while queue.length > 0
		actNode = queue.shift()

		area = 
			latS: actNode.latS,
			lonS: actNode.lonS,
			latE: actNode.latE,
			lonE: actNode.lonE,
			areaId: indexer

		arrayTree.push area
		indexer += 1;

		for child in actNode.children
			queue.push child

	return arrayTree;

countChildIndexesForNodesInBsfArray = ( bsfArray ) ->
	for element, index in bsfArray
		element.childAreaIds = []
		element.childAreaIds.push ( index * 4 + 1 ) 
		element.childAreaIds.push ( index * 4 + 2 )
		element.childAreaIds.push ( index * 4 + 3 )
		element.childAreaIds.push ( index * 4 + 4 )

area = createMapHieararchy 1, latStart, latEnd, lonStart, lonEnd

jsonString = JSON.stringify( area, null, 4 )
fs.writeFile "map.json", jsonString, ( err ) ->
	if err 
		console.log err
	else
		console.log "The file was saved!"

resultTree = createArrayWithBsf area
countChildIndexesForNodesInBsfArray resultTree
console.log "length: #{resultTree.length}"

jsonString = JSON.stringify( resultTree, null, 4 )
fs.writeFile "arrayTree.json", jsonString, ( err ) ->
	if err 
		console.log err
	else
		console.log "The file was saved!"


