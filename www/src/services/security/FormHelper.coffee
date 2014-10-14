angular.module 'services'
.factory 'FormHelper', ( $http, $q ) ->
  
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

    getUserInfo: ( userName ) ->
      deferred = $q.defer()

      $http.get "/users/#{userName}"
      .then ( resp ) ->
        if resp.data.then? 
          resp.data.then ( resp2 ) ->
            console.log("user")
            console.log( resp2 )
            deferred.resolve( resp2 )

      deferred.promise



  factoryObj