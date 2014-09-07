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


console.log "arg: " + process.argv[2]
maxIter = parseInt process.argv[2]
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
		newArea = ( createMapHieararchy iter, dividedMap[i].lat, dividedMap[i].lat - latDiff,
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
			_id: indexer

		arrayTree.push area
		indexer += 1;

		for child in actNode.children
			queue.push child

	return arrayTree;

countChildIndexesForNodesInBsfArray = ( bsfArray ) ->
	for element, index in bsfArray
		element.childAreaIds = []
		for i in [ 1..4 ]
			if index * 4 + 1 < bsfArray.length
				element.childAreaIds.push ( index * 4 + i ) 


module.exports.divideMap = divideMap 
module.exports.createMapHieararchy = createMapHieararchy 
module.exports.createArrayWithBsf = createArrayWithBsf 
module.exports.countChildIndexesForNodesInBsfArray = countChildIndexesForNodesInBsfArray 


