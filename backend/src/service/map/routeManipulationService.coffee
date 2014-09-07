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

findLeafMapRecursively = ( node, map, callback ) ->
	if map.childAreaIds.length == 0
		callback map

	childPromises = getMapChildren( map )
	for childPromis in childPromises
		childPromis.then ( data ) ->
			if containsNode node, data
				findLeafMapRecursively node, data, callback

	Q.all childPromises

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


module.exports.getRootMap = getRootMap 
module.exports.getMap = getMap
module.exports.getMapChildren = getMapChildren 
module.exports.containsNode = containsNode 
module.exports.findLeafMapRecursively = findLeafMapRecursively 
module.exports.addSiblingsToRouteNodes = addSiblingsToRouteNodes
module.exports.addWeightsToRouteNodes = addWeightsToRouteNodes
module.exports.addIndexToRouteNodes = addIndexToRouteNodes
