angular.module "services"
.factory "Marker", ->

  factoryObj =

    createMarker: ( position, title, map ) ->

      marker = new google.maps.Marker {
        position: position,
        map: map,
        title: title
      }

      marker

    createInfoWindow: ( text, map, marker ) ->
      infowindow = new google.maps.InfoWindow {
        content: text
      }
      
      if map? and marker?
        google.maps.event.addListener marker, 'click', ->
          infowindow.open($scope.map,marker);

  factoryObj