Q = require "q"

getRootMap = () ->
	getMap 0


getMap = ( _id ) ->
	deferred = Q.defer()
	collectionDriver.get "map", _id, ( error, obj ) ->
		if error
			return deferred.reject error
		return deferred.resolve obj
	return deferred.promise

getMapChildren = ( map ) ->
	childPromises = []
	for childAreaId in map.childAreaIds 
		promise = getMap childAreaId
		childPromises.push promise
	childPromises

containsNode = ( node, map ) ->
	if ( 	
		( parseFloat( map.latS ) >= parseFloat( node.lat ) ) and 
		( parseFloat( map.latE ) <= parseFloat( node.lat ) ) and 
		( parseFloat( map.lonS ) <= parseFloat( node.lon ) ) and 
		( parseFloat( map.lonE ) >= parseFloat( node.lon ) )
	)
		return true
	return false

findLeafMap = ( node, map, callback ) -> 

	findLeafMapRecursively( node, map, parentMapIds, callback ) ->
		if map.childAreaIds.length == 0
			callback parentMapIds

		childPromises = getMapChildren( map )
		for childPromis in childPromises
			childPromis.then ( data ) ->
				if containsNode node, data
					parentMapIds.push data._id
					findLeafMapRecursively node, data, parentMapIds, callback

		Q.all childPromises

	findLeafMapRecursively( node, map, [ map._id ], callback)

addIndexToRouteNodes = ( nodes ) ->
	for node, index in nodes
		node._id = index

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
		node.weight = index % 9 + 1

calculateMapIdForNodeAtZoom = ( coord, zoom ) ->

	if coord.lon >= 55
		coord.lon = 5 - 0.00001
	if coord.lat <= 30
		coord.lat = 30 + 0.00001


	rowsColumnsAtZoom = Math.pow 2, zoom

	latFullLen = Math.abs( 70 - 30 )
	lonFullLen = Math.abs( -10 - 55 )

	distFromLatStart = Math.abs 70 - coord.lat
	distFromLonStart = Math.abs -10 - coord.lon

	latLenAtZoom = latFullLen / rowsColumnsAtZoom
	lonLenAtZoom = lonFullLen / rowsColumnsAtZoom

	row = Math.floor( distFromLatStart / latLenAtZoom ) + 1
	column = Math.floor( distFromLonStart / lonLenAtZoom ) + 1

	mapIdOffset = 0
	for index in [ 0...zoom ]
		mapIdOffset += Math.pow 4, index
	mapIdOffset + ( row - 1 ) * rowsColumnsAtZoom + column - 1

module.exports.getRootMap = getRootMap 
module.exports.getMap = getMap
module.exports.getMapChildren = getMapChildren 
module.exports.containsNode = containsNode 
module.exports.findLeafMap = findLeafMap 
module.exports.addSiblingsToRouteNodes = addSiblingsToRouteNodes
module.exports.addWeightsToRouteNodes = addWeightsToRouteNodes
module.exports.addIndexToRouteNodes = addIndexToRouteNodes 
module.exports.calculateMapIdForNodeAtZoom = calculateMapIdForNodeAtZoom
