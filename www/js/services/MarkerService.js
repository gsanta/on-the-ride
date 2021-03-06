// Generated by CoffeeScript 1.7.1
(function() {
  angular.module("services").factory("Marker", function() {
    var factoryObj;
    factoryObj = {
      createMarker: function(position, title, map) {
        var marker;
        marker = new google.maps.Marker({
          position: position,
          map: map,
          title: title
        });
        return marker;
      },
      createInfoWindow: function(text, map, marker) {
        var infowindow;
        infowindow = new google.maps.InfoWindow({
          content: text
        });
        if ((map != null) && (marker != null)) {
          return google.maps.event.addListener(marker, 'click', function() {
            return infowindow.open($scope.map, marker);
          });
        }
      }
    };
    return factoryObj;
  });

}).call(this);
