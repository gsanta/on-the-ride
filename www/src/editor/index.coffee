servicesModule = angular.module "services"
controllersModule = angular.module "controllers"

servicesModule.factory('MapEditorService', require('./services/MapEditorService'));

controllersModule.controller('MapEditCtrl', require('./controllers/MapEditCtrl'));