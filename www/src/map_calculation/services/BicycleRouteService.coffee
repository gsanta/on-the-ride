BicycleRouteService = ( ) ->

  getStartNodeOfMapId: ( nodes, mapId ) ->
    for node in nodes
      if mapId in node.startNodeInMap
        return  node
    
    return null

  createRouteFromStartNode = ( startNode ) ->
    route = [ ]
    actNode = startNode

    while actNode != undefined
      route.push actNode
      if actNode.weight < zoom
        actNode = nodeAssocMap[ actNode.siblings[ 0 ] ]
      else
        actNode = nodeAssocMap[ actNode.siblings[ MapConstants.max_zoom - zoom ] ]

    return route

  factoryObj =

    createRouteFromNodes: ( routeNodes, zoom, mapIds ) ->

      if zoom > MapConstants.max_zoom
        throw new Error "zoom is bigger than the maximum
                        (use MapConstants.max_zoom)"

      if zoom < 1
        throw new Error "zoom is smaller than the minimum
                        (use MapConstants.min_zoom)"

      routeNodesMap = {}
      for node in routeNodes
        routeNodesMap[ node._id ] = node

      startNodes = []
      for mapId in mapIds
        startNode = this.getStartNodeOfMapId routeNodes, mapId
        if startNode
          startNodes.push startNode

      finalRoute = []
      for startNode in startNodes
        route = createRouteFromStartNode startNode
        if route.length > finalRoute.length
          finalRoute = route

      return finalRoute;

  return factoryObj

module.exports = BicycleRouteService