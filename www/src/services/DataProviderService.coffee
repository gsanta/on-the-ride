angular.module 'services'
.factory 'DataProvider', ( $http ) ->
	
	factoryObj = 
	
		loadPlaceInfo: ->
			$http.get '/info'

		loadRouteInfo: ( zoom ) ->
			$http.get "route/eurovelo_6_new/#{zoom}"

		loadMapArea: ( id ) ->
			$http.get '/map/0'

		savePlaceInfo: ( data ) -> 
			$http.post '/info', data

	factoryObj