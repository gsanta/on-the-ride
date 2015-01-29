var LoginService;

LoginService = function($http, $q, $location, SecurityRetryQueue, $ionicPopup, $rootScope, $timeout, $window) {
  var $scope, factoryObj, redirect;
  $scope = $rootScope.$new();
  SecurityRetryQueue.onItemAddedCallbacks.push(function(retryItem) {
    if (SecurityRetryQueue.hasMore()) {
      console.log("retry lefut");
      return factoryObj.showLoginDialog();
    }
  });
  $scope.loginDialog = void 0;
  $scope.registrationDialog = void 0;
  $scope.register = function() {
    console.log("register");
    if ($scope.loginDialog !== void 0) {
      $scope.loginDialog.close();
      $scope.loginDialog = void 0;
      return $timeout($scope.openRegistrationDialog, 1);
    }
  };
  $scope.login = function() {
    if ($scope.registrationDialog !== void 0) {
      $scope.registrationDialog.close();
      $scope.registrationDialog = void 0;
      return $timeout($scope.openLoginDialog, 1);
    }
  };
  $scope.openRegistrationDialog = function() {
    $scope.data = {};
    if ($scope.registrationDialog) {
      throw new Error('Trying to open a dialog that is already open!');
    }
    return $scope.registrationDialog = $ionicPopup.show({
      templateUrl: "/templates/registration.html",
      title: 'Please sign up',
      scope: $scope
    });
  };
  $scope.openLoginDialog = function() {
    $scope.data = {};
    if ($scope.loginDialog) {
      throw new Error('Trying to open a dialog that is already open!');
    }
    $scope.loginDialog = $ionicPopup.show({
      templateUrl: "/templates/login.html",
      title: 'Please log in',
      scope: $scope
    });
    $scope.retryAuthentication = function() {
      return SecurityRetryQueue.retryAll();
    };
    return $scope.cancelAuthentication = function() {
      SecurityRetryQueue.cancelAll();
      return redirect();
    };
  };
  redirect = function(url) {
    url = url || '/';
    return $location.path(url);
  };
  factoryObj = {
    openRegistrationDialog: function() {
      return $scope.openRegistrationDialog();
    },
    openLoginDialog: function() {
      return $scope.openLoginDialog();
    },
    closeLoginDialog: function() {
      $scope.loginDialog.close();
      return $scope.loginDialog = void 0;
    },
    closeRegistrationDialog: function() {
      $scope.registrationDialog.close();
      return $scope.registrationDialog = void 0;
    },
    retryAuthentication: function() {
      return SecurityRetryQueue.retryAll();
    },
    login: function(userName, password) {
      var deferred, handleResult;
      handleResult = function(result) {
        if (typeof result.data.then === "function") {
          return result.data.then(function(data) {
            sessionStorage.setItem("userName", data.userName);
            return data;
          });
        } else {
          return data;
        }
      };
      return $http.post('login', {
        userName: userName,
        password: password
      }).then(handleResult);
      return deferred = $q.defer();
    },
    signUp: function(User) {
      var deferred, handleResult;
      handleResult = function(result) {
        if (typeof result.data.then === "function") {
          return result.data.then(function(data) {
            sessionStorage.setItem("userName", data.userName);
            return data;
          });
        } else {
          return data;
        }
      };
      return $http.post('signUp', User).then(handleResult);
      return deferred = $q.defer();
    },
    logout: function() {
      sessionStorage.removeItem("userName");
      return $window.location.href = "/map";
    },
    showLoginDialog: function() {
      return $scope.openLoginDialog();
    },
    addUser: function(User) {
      var handleResult;
      handleResult = function(result) {
        if (typeof result.data.then === "function") {
          return result.data.then(function(data) {
            return data;
          });
        } else {
          return data;
        }
      };
      return $http.post('users/new', User).then(handleResult);
    },
    removeUser: function(User) {
      var handleResult;
      handleResult = function(result) {
        if (typeof result.data.then === "function") {
          return result.data.then(function(data) {
            return data;
          });
        } else {
          return data;
        }
      };
      return $http["delete"]("users", {
        id: User.id
      }).then(handleResult);
    },
    getSignedInUser: function() {
      var defer, promise, userName;
      userName = sessionStorage.getItem("userName");
      defer = $q.defer();
      if (userName) {
        return userName;
      } else {
        promise = SecurityRetryQueue.pushRetryFn('unauthorized-server', factoryObj.getSignedInUser);
        return promise;
      }
    },
    getUserName: function() {
      return sessionStorage.getItem("userName");
    },
    isLoggedIn: function() {
      return sessionStorage.getItem("userName") != null;
    },
    changePassword: function(userName, oldPassword, newPassword) {
      var handleResult, requestData;
      handleResult = function(result) {
        if (typeof result.data.then === "function") {
          return result.data.then(function(data) {
            return data;
          });
        } else {
          return data;
        }
      };
      requestData = {
        userName: userName,
        oldPassword: oldPassword,
        newPassword: newPassword
      };
      return $http.put("changePassword", requestData).then(handleResult);
    }
  };
  return factoryObj;
};

module.exports = LoginService;
