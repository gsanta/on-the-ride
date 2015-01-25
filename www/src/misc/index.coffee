controllersModule = angular.module "services"
servicesModule = angular.module "controllers"
directivesModule = angular.module "directives"
classesModule = angular.module "classes"

controllersModule.controller('AppCtrl', require('./controllers/AppCtrl'));

servicesModule.constant('MapConstants', require('./services/MapConstants'));

classesModule.factory( 'Coord', require( './classes/Coord' ) )

directivesModule.directive( 'flash', require( './directives/flash' ) )
directivesModule.directive( 'match', require( './directives/match' ) )