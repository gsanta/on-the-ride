MapPartitionService = ( ) ->

  mapZoomDiameterSquares = [
    5825,
    1456.25,
    364.0625,
    91.016,
    22.754,
    5.691,
    1.422,
    0.3557,
    0.0892
  ]

  calculateMapIdForNodeAtZoom: ( coord, zoom ) ->

    adjustedCoord = adjustCoordIfOutOfBounds( coord )


    rowsColumnsAtZoom = Math.pow 2, zoom

    latFullLen = Math.abs( MapConstants.latStart - MapConstants.latEnd )
    lonFullLen = Math.abs( MapConstants.lonStart - MapConstants.lonEnd )

    distFromLatStart = Math.abs MapConstants.latStart - adjustedCoord.lat
    distFromLonStart = Math.abs MapConstants.lonStart - adjustedCoord.lon

    latLenAtZoom = latFullLen / rowsColumnsAtZoom
    lonLenAtZoom = lonFullLen / rowsColumnsAtZoom

    row = Math.floor( distFromLatStart / latLenAtZoom ) + 1
    column = Math.floor( distFromLonStart / lonLenAtZoom ) + 1

    mapIdOffset = 0
    for index in [ 0...zoom ]
      mapIdOffset += Math.pow 4, index
    mapIdOffset + ( row - 1 ) * rowsColumnsAtZoom + column - 1

  adjustCoordIfOutOfBounds: ( coord ) ->
    adjustedCoord =
      lat: coord.lat
      lon: coord.lon

    if coord.lon >= MapConstants.lonEnd
      coord.lon = MapConstants.lonEnd - 0.00001
    else if coord.lon < MapConstants.lonStart
      coord.lon = MapConstants.lonStart
    if coord.lat <= MapConstants.latEnd
      coord.lat = MapConstants.latEnd + 0.00001
    else if coord.lat > MapConstants.latStart
      coord.lat = MapConstants.latStart

    adjustedCoord

  factoryObj =

    getMapsForAreaAtZoom: ( topLeftCoord, bottomRightCoord, zoom ) ->
      bottomLeftCoord = new Coord topLeftCoord.lon, bottomRightCoord.lat
      topRightCoord = new Coord bottomRightCoord.lon, topLeftCoord.lat

      tlId = this.calculateMapIdForNodeAtZoom topLeftCoord, zoom
      trId = this.calculateMapIdForNodeAtZoom topRightCoord, zoom
      blId = this.calculateMapIdForNodeAtZoom bottomLeftCoord, zoom
      brId = this.calculateMapIdForNodeAtZoom bottomRightCoord, zoom
      
      set = {}
      set[tlId] = 1; set[trId] = 1; set[blId] = 1; set[brId] = 1

      ids = []

      for k,v of set
        ids.push parseInt k, 10
      ids

    calculateZoomForArea: ( topLeftCoord, bottomRightCoord ) ->
      lon1 = parseFloat topLeftCoord.lon
      lon2 = parseFloat bottomRightCoord.lon
      lat1 = parseFloat topLeftCoord.lat
      lat2 = parseFloat bottomRightCoord.lat

      actDistanceSquare = Math.pow( lon1 - lon2, 2 ) +
                          Math.pow( lat1 - lat2, 2 )

      for dist, index in mapZoomDiameterSquares
        if dist < actDistanceSquare
          if index == 0
            return 0
          else
            return index
      return mapZoomDiameterSquares.length - 1


  return factoryObj

module.exports = MapPartitionService