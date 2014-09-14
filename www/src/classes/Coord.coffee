angular.module "classes"
.factory "Coord", () ->

  class Coord
    constructor: (lon, lat) ->
      @lat = lat
      @lon = lon

  return Coord
 