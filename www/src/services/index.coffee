module = angular.module "services"

module.factory('FormHelper', require('./security/FormHelper'));
module.factory('DataProviderService', require('./DataProviderService'));
module.factory('LocalDataProviderService', require('./LocalDataProviderService'));

