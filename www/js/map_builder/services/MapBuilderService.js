var MapBuilderService;

MapBuilderService = function() {
  var factoryObj;
  factoryObj = {
    createMapProperties: function(centerPosition, zoom, mapTypeId) {
      var mapProp;
      mapProp = {
        center: centerPosition,
        zoom: zoom,
        mapTypeId: google.maps.MapTypeId.TERRAIN
      };
      if (mapTypeId != null) {
        mapProp.mapTypeId = mapTypeId;
      }
      return mapProp;
    }
  };
  return factoryObj;
};

module.exports = MapBuilderService;
