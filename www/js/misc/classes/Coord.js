var Coord;

Coord = function() {
  Coord = (function() {
    function Coord(lon, lat) {
      this.lat = lat;
      this.lon = lon;
    }

    return Coord;

  })();
  return Coord;
};

module.exports = Coord;
