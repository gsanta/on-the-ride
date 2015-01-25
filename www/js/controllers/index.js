(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
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

}).call(this);

},{}],2:[function(require,module,exports){
(function() {
  var LoginCtrl;

  LoginCtrl = function($scope, $http, $timeout, LoginService, $location) {
    $scope.form = void 0;
    $scope.user = {};
    $scope.submitForm = function(form) {
      var promise;
      if (form.$valid) {
        promise = LoginService.login($scope.user.userName, $scope.user.password);
        return promise.then(function() {
          LoginService.closeLoginDialog();
          return LoginService.retryAuthentication();
        }, function() {
          return console.log("bejelentkezési hiba");
        });
      }
    };
    $scope.getCssClasses = function(ngModelContoller) {
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty
      };
    };
    $scope.showError = function(ngModelController, error) {
      return ngModelController.$error[error];
    };
    return $scope.cancelForm = function() {
      LoginService.closeLoginDialog();
      return $location.path('/map');
    };
  };

  module.exports = LoginCtrl;

}).call(this);

},{}],3:[function(require,module,exports){
(function() {
  var MapCtrl;

  MapCtrl = function($scope, $http, $timeout, MapService, DataProviderService, LocalDataProviderService, Coord) {
    var canLoadMapAgain, routePolyline;
    routePolyline = void 0;
    canLoadMapAgain = true;
    $scope.routeInfo = void 0;
    $scope.map = void 0;
    $scope.loadRoute = function() {
      var bounds, mapIds, mapZoom, ne, routeInfoPromise, sw;
      bounds = $scope.map.getBounds();
      ne = bounds.getNorthEast();
      sw = bounds.getSouthWest();
      mapZoom = MapService.calculateZoom(new Coord(sw.lng(), ne.lat()), new Coord(ne.lng(), sw.lat()));
      mapIds = MapService.getMapsForAreaAtZoom(new Coord(sw.lng(), ne.lat()), new Coord(ne.lng(), sw.lat()), mapZoom - 1);
      routeInfoPromise = LocalDataProviderService.loadRouteInfo();
      return routeInfoPromise.then(function(data) {
        var route;
        route = MapService.createRouteFromNodeArray(data, 1, [0]);
        routePolyline.setMap(null);
        routePolyline = MapService.createPolylineFromRoute(route);
        return routePolyline.setMap($scope.map);
      });
    };
    $scope.initMap = function() {
      var routeInfoPromise;
      routeInfoPromise = LocalDataProviderService.loadRouteInfo();
      return routeInfoPromise.then(function(data) {
        var centerCoordinates, route;
        $scope.routeInfo = data;
        centerCoordinates = MapService.createCoordinate(data[0].lat, data[0].lon);
        $scope.map = new google.maps.Map(document.querySelector('#view-map').querySelector('#googleMap'), MapService.createMapProperties(centerCoordinates, 3));
        $scope.map.getBounds();
        route = MapService.createRouteFromNodeArray(data, 1, [0]);
        routePolyline = MapService.createPolylineFromRoute(route);
        routePolyline.setMap($scope.map);
        google.maps.event.addListener($scope.map, 'zoom_changed', function() {
          return 1;
        });
        return google.maps.event.addListener($scope.map, "bounds_changed", function() {
          var callback;
          if (canLoadMapAgain) {
            $scope.loadRoute();
            callback = function() {
              return canLoadMapAgain = true;
            };
            $timeout(callback, 5000);
          }
          return canLoadMapAgain = false;
        });
      });
    };
    return $scope.infoBoxes = [];
  };

  module.exports = MapCtrl;

}).call(this);

},{}],4:[function(require,module,exports){
(function() {
  var MapEditCtrl;

  MapEditCtrl = function($scope, $http, $timeout, MapEditorService, BicycleRouteService, BicycleRouteBuilderService, DataProviderService, BicycleRouteDaoService, VoteDaoService, LocalDataProviderService, Coord, LoginService, MapConstants) {
    var canLoadMapAgain, clearArray, copyEditedMarkers, editedMarkers, markers, newNodeCounter, polylines, routePolyline;
    routePolyline = void 0;
    canLoadMapAgain = true;
    newNodeCounter = -1;
    editedMarkers = [];
    markers = [];
    polylines = [];
    clearArray = function(array) {
      var obj, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        obj = array[_i];
        _results.push(obj.setMap(null));
      }
      return _results;
    };
    copyEditedMarkers = function(fromArray, toAssocArray) {
      var obj, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = fromArray.length; _i < _len; _i++) {
        obj = fromArray[_i];
        if (obj.nodeInfo.changed) {
          _results.push(toAssocArray[obj.nodeInfo._id] = obj);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    $scope.routeInfo = void 0;
    $scope.map = void 0;
    $scope.isThereEditedNode = false;
    $scope.infoWindow = {
      isDisplayed: false
    };
    $scope.loadRoute = function() {
      var bounds, mapIds, mapZoom, ne, routeInfoPromise, sw;
      bounds = $scope.map.getBounds();
      ne = bounds.getNorthEast();
      sw = bounds.getSouthWest();
      mapZoom = MapEditorService.calculateZoom(new Coord(sw.lng(), ne.lat()), new Coord(ne.lng(), sw.lat()));
      mapIds = MapEditorService.getMapsForAreaAtZoom(new Coord(sw.lng(), ne.lat()), new Coord(ne.lng(), sw.lat()), mapZoom - 1);
      routeInfoPromise = LocalDataProviderService.loadRouteInfo();
      return routeInfoPromise.then(function(data) {
        var route;
        route = BicycleRouteService.createRouteFromNodes(data, 1, [0]);
        routePolyline.setMap(null);
        routePolyline = BicycleRouteBuilderService.createPolylineFromRoute(route);
        return routePolyline.setMap($scope.map);
      });
    };
    $scope.loadRouteInfo = function() {};
    $scope.isEdit = true;
    $scope.initMap = function() {
      var routeInfoPromise;
      window.routeInfo = $scope.routeInfo;
      routeInfoPromise = LocalDataProviderService.loadRouteInfo();
      return routeInfoPromise.then(function(data) {
        var centerCoordinates;
        $scope.routeInfo = data;
        return centerCoordinates = BicycleRouteBuilderService.createCoordinate(data[0].lat, data[0].lon);
      });
    };
    $scope.savePoints = function() {
      var addNodes, k, updateNodes, v;
      updateNodes = [];
      addNodes = [];
      copyEditedMarkers(markers, editedMarkers);
      for (k in editedMarkers) {
        v = editedMarkers[k];
        if (v.nodeInfo._id < 0) {
          addNodes.push(v.nodeInfo);
        } else {
          updateNodes.push(v.nodeInfo);
        }
      }
      BicycleRouteDaoService.savePoints(updateNodes);
      BicycleRouteDaoService.addPoints(addNodes);
      return $scope.isThereEditedNode = false;
    };
    $scope.addPoint = function() {
      var marker;
      marker = BicycleRouteBuilderService.addNewPointToCenterOfMap($scope.map, $scope);
      marker.nodeInfo._id = newNodeCounter;
      $scope.isThereEditedNode = true;
      newNodeCounter--;
      editedMarkers.push(marker);
      return markers.push(marker);
    };
    $scope.infoBoxes = [];
    $scope.vote = {
      value: 1,
      isReset: true
    };
    $scope.$watch('vote.isReset', function(newValue, oldValue) {
      return console.log("reset watch: " + newValue);
    });
    return $scope.$watch('vote.value', function(newValue, oldValue) {
      var nodeId, user;
      console.log("reset: " + $scope.vote.isReset);
      newValue = parseInt(newValue);
      oldValue = parseInt(oldValue);
      if (!$scope.vote.isReset && newValue !== oldValue) {
        console.log("send: " + oldValue + "," + newValue + ", " + $scope.vote.isReset);
        user = LoginService.getUserName();
        nodeId = $scope.actNode._id;
        VoteDaoService.sendUserVoteForNode(user, nodeId, newValue);
      }
      return $scope.vote.isReset = false;
    });
  };

  module.exports = MapEditCtrl;

}).call(this);

},{}],5:[function(require,module,exports){
(function() {
  var PlaceInfoCtrl;

  PlaceInfoCtrl = function($scope, $http, DataProviderService) {
    $scope.categories = [
      {
        name: "Accomodation"
      }, {
        name: "Shop"
      }, {
        name: "Sight"
      }
    ];
    $scope.category = "";
    $scope.description = "";
    $scope.latitude = "";
    $scope.longitude = "";
    $scope.getCssClasses = function(ngModelContoller) {
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty,
        success: ngModelContoller.$valid && ngModelContoller.$dirty
      };
    };
    $scope.showError = function(ngModelController, error) {
      return ngModelController.$error[error];
    };
    $scope.canSave = function() {
      return $scope.infoForm.$dirty && $scope.infoForm.$valid;
    };
    $scope.save = function() {
      var data;
      return data = {
        category: $scope.category.name,
        desc: $scope.description,
        lat: $scope.latitude,
        lon: $scope.longitude
      };
    };
    return DataProviderService.savePlaceInfo(data).success(function() {
      return alert("success saving info data");
    }).error(function() {
      return alert("failure saving info data");
    });
  };

  module.exports = PlaceInfoCtrl;

}).call(this);

},{}],6:[function(require,module,exports){
(function() {
  var ProfileCtrl;

  ProfileCtrl = function($scope, DataProviderService, LoginService, UserService) {
    var promise;
    promise = DataProviderService.getUserInfo(LoginService.getSignedInUser());
    promise.then(function(data) {
      console.log(data);
      $scope.user = data;
      return $scope.savedUser = angular.copy($scope.user);
    });
    window.scope = $scope;
    $scope.user = {};
    $scope.savedUser = {};
    $scope.newPassword = void 0;
    $scope.passwordChange = {};
    $scope.profileFlashMessage = $scope.passwordFlashMessage = "";
    $scope.getValue = function() {
      return console.log($scope.profileFlashMessage);
    };
    $scope.getCssClasses = function(ngModelContoller) {
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty
      };
    };
    $scope.showError = function(ngModelController, error) {
      return ngModelController.$error[error];
    };
    $scope.canSaveForm = function(form) {
      return form.$valid;
    };
    $scope.canSaveProfileForm = function(form) {
      return form.$valid && ($scope.user.email !== $scope.savedUser.email);
    };
    $scope.submitPasswordChangeForm = function(form) {
      if (form.$dirty && form.$invalid) {
        return;
      }
      promise = LoginService.changePassword($scope.user.userName, $scope.passwordChange.password, $scope.passwordChange.newPassword);
      return promise.then(function() {
        $scope.passwordChange = {};
        form.$setPristine();
        return $scope.passwordFlashMessage = "changes saved";
      });
    };
    return $scope.submitProfileForm = function(form) {
      if (form.$dirty && form.$invalid) {
        return;
      }
      console.log("1: " + $scope.profileFlashMessage);
      promise = UserService.changeProfileData($scope.user.userName, $scope.user);
      return promise.then(function(User) {
        $scope.user = User;
        $scope.savedUser = angular.copy($scope.user);
        form.$setPristine();
        $scope.profileFlashMessage = "changes saved: " + Date.now();
        return console.log("2: " + $scope.profileFlashMessage);
      });
    };
  };

  module.exports = ProfileCtrl;

}).call(this);

},{}],7:[function(require,module,exports){
(function() {
  var module;

  module = angular.module("controllers", ["services", "directives"]);

  module.controller('AppCtrl', require('./AppCtrl'));

  module.controller('LoginCtrl', require('./LoginCtrl'));

  module.controller('MapCtrl', require('./MapCtrl'));

  module.controller('MapEditCtrl', require('./MapEditCtrl'));

  module.controller('PlaceInfoCtrl', require('./PlaceInfoCtrl'));

  module.controller('ProfileCtrl', require('./ProfileCtrl'));

  module.controller('RegistrationCtrl', require('./security/RegistrationCtrl'));

}).call(this);

},{"./AppCtrl":1,"./LoginCtrl":2,"./MapCtrl":3,"./MapEditCtrl":4,"./PlaceInfoCtrl":5,"./ProfileCtrl":6,"./security/RegistrationCtrl":8}],8:[function(require,module,exports){
(function() {
  var RegistrationCtrl;

  RegistrationCtrl = function($scope, $http, $timeout, LoginService, $location) {
    $scope.form = void 0;
    $scope.user = {};
    $scope.submitForm = function(form) {
      var User, promise;
      if (form.$valid) {
        User = {
          userName: $scope.user.userName,
          password: $scope.user.password,
          email: $scope.user.email
        };
        promise = LoginService.signUp(User);
        return promise.then(function() {
          LoginService.closeRegistrationDialog();
          return LoginService.retryAuthentication();
        }, function() {
          return console.log("regisztrációs hiba");
        });
      }
    };
    $scope.getCssClasses = function(ngModelContoller) {
      return {
        error: ngModelContoller.$invalid && ngModelContoller.$dirty
      };
    };
    $scope.showError = function(ngModelController, error) {
      return ngModelController.$error[error];
    };
    return $scope.cancelForm = function() {
      LoginService.closeRegistrationDialog();
      return $location.path('/map');
    };
  };

  module.exports = RegistrationCtrl;

}).call(this);

},{}]},{},[7])