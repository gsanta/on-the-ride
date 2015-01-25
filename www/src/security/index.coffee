servicesModule = angular.module "services"
controllersModule = angular.module "controllers"

controllersModule.controller('RegistrationCtrl', require('./controllers/RegistrationCtrl'));
controllersModule.controller('LoginCtrl', require('./controllers/LoginCtrl'));

servicesModule.factory('LoginService', require('./services/LoginService'));
servicesModule.factory('SecurityRetryQueue', require('./services/SecurityRetryQueue'));
servicesModule.factory('SecurityInterceptor', require('./services/SecurityInterceptor'));