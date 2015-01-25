servicesModule = angular.module "services"
controllersModule = angular.module "controllers"

controllersModule.controller('MapCtrl', require('./controllers/MapCtrl'));

servicesModule.factory('BicycleRouteBuilderService', require('./services/BicycleRouteBuilderService'));
servicesModule.factory('InfoWindowService', require('./services/InfoWindowService'));
servicesModule.factory('MapBuilderService', require('./services/MapBuilderService'));
