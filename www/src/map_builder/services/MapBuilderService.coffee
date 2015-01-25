MapBuilderService = ( ) ->

  factoryObj =
    createMapProperties: ( centerPosition, zoom, mapTypeId ) ->
      mapProp =
        center: centerPosition,
        zoom: zoom,
        mapTypeId: google.maps.MapTypeId.TERRAIN

      mapProp.mapTypeId = mapTypeId if mapTypeId?
      return mapProp

  return factoryObj

module.exports = MapBuilderService