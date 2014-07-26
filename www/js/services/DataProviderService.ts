/// <reference path="../../../typings/angularjs/angular.d.ts" />

var factory = function($http) {

	var factoryObj = {

		loadPlaceInfo: () => {
			return $http.get('/info');
		},

		loadRouteInfo: () => {
			return $http.get('/eurovelo_6');
		},

		savePlaceInfo: ( data ) => {
			return $http.post('/info', data);
		},
	};

	return factoryObj;
};


factory.$inject = ['$http'];

export = factory;

