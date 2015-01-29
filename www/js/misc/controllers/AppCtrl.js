var AppCtrl;

AppCtrl = function($scope, $http, $timeout, LoginService) {
  return $scope.security = {
    isLoggedIn: function() {
      return LoginService.isLoggedIn();
    },
    signUp: function() {
      return LoginService.openRegistrationDialog();
    },
    login: function() {
      return LoginService.openLoginDialog();
    },
    logout: function() {
      return LoginService.logout();
    }
  };
};

module.exports = AppCtrl;
