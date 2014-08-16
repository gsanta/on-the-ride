angular.module 'services'
.factory 'DataProvider', ( $http ) ->
	
	factoryObj = 
	
		loadPlaceInfo: ->
			$http.get('/info');


		loadRouteInfo: ->
			$http.get('/eurovelo_6_new');

		savePlaceInfo: ( data ) ->
			$http.post('/info', data);

	factoryObj