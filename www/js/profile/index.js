var controllersModule, servicesModule;

controllersModule = angular.module("controllers");

servicesModule = angular.module("services");

controllersModule.controller('ProfileCtrl', require('./controllers/ProfileCtrl'));

servicesModule.factory('UserService', require('./services/UserService'));
