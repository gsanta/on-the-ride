var UserService;

UserService = function($http) {
  var factoryObj;
  factoryObj = {
    changeProfileData: function(userName, changeObj) {
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
      return $http.put("users/" + userName, changeObj).then(handleResult);
    }
  };
  return factoryObj;
};

module.exports = UserService;
