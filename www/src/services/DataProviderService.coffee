angular.module 'services'
.factory 'DataProvider', ( $http ) ->
  
  factoryObj =
  
    loadPlaceInfo: ->
      $http.get '/info'

    loadRouteInfo: ( zoom, maps ) ->
      mapsStr = maps.join()
      ret = $http.get "route/eurovelo_6/#{zoom}/#{mapsStr}"

    loadMapArea: ( id ) ->
      $http.get '/map/0'

    savePlaceInfo: ( data ) ->
      $http.post '/info', data

  factoryObj