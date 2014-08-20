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

module.exports.getRootMap = getRootMap 
module.exports.getMap = getMap
module.exports.getMapChildren = getMapChildren 
module.exports.containsNode = containsNode 
module.exports.findLeafMapRecursively = findLeafMapRecursively 
