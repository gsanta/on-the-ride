BicycleRouteDaoService = ( ) ->

	factoryObj =
		#todo put marker._id into marker.nodeInfo._id
    savePoints: ( nodes ) ->

      for node in nodes
        LocalDataProviderService.updateNode node._id, {
          lat: node.lat,
          lon: node.lon
        }

    addPoints: ( nodes ) ->
      for node in nodes
        LocalDataProviderService.addNode {
          user: node.user,
          lat: node.lat,
          lon: node.lon
        }

	return factoryObj

module.exports = BicycleRouteDaoService