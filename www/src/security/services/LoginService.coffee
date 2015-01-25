LoginService = ( $http, $q, $location, SecurityRetryQueue, $ionicPopup, $rootScope, $timeout, $window ) ->

  $scope = $rootScope.$new() 

  #Todo implement observer instead of this
  SecurityRetryQueue.onItemAddedCallbacks.push ( retryItem ) ->
    if SecurityRetryQueue.hasMore()
      console.log "retry lefut"
      factoryObj.showLoginDialog()


  $scope.loginDialog = undefined
  $scope.registrationDialog = undefined

  $scope.register = () ->
    console.log "register"
    if $scope.loginDialog != undefined
      $scope.loginDialog.close()
      $scope.loginDialog = undefined
      #Todo potential bug, use returned promise to open registration dialog
      $timeout $scope.openRegistrationDialog, 1
  
  $scope.login = () ->
    if $scope.registrationDialog != undefined
      $scope.registrationDialog.close()
      $scope.registrationDialog = undefined
      #Todo potential bug, use returned promise to open registration dialog
      $timeout $scope.openLoginDialog, 1

  $scope.openRegistrationDialog = () ->
    $scope.data = {}

    if $scope.registrationDialog
      throw new Error 'Trying to open a dialog that is already open!'
    $scope.registrationDialog = $ionicPopup.show
      templateUrl: "/templates/registration.html",
      title: 'Please sign up',
      scope: $scope

  $scope.openLoginDialog = () ->
    $scope.data = {}

    if $scope.loginDialog
      throw new Error 'Trying to open a dialog that is already open!'
    $scope.loginDialog = $ionicPopup.show
      templateUrl: "/templates/login.html"
      title: 'Please log in',
      scope: $scope 

    $scope.retryAuthentication = () ->
      SecurityRetryQueue.retryAll()

    $scope.cancelAuthentication = () ->
      SecurityRetryQueue.cancelAll()
      redirect()

  redirect = (url) ->
    url = url || '/';
    $location.path url

  factoryObj = 
    openRegistrationDialog: () ->
      $scope.openRegistrationDialog()

    openLoginDialog: () ->
      $scope.openLoginDialog()

    closeLoginDialog: () ->
      $scope.loginDialog.close()
      $scope.loginDialog = undefined

    closeRegistrationDialog: () ->
      $scope.registrationDialog.close()
      $scope.registrationDialog = undefined

    retryAuthentication: () ->
      SecurityRetryQueue.retryAll()

    login: ( userName, password ) ->
      handleResult = ( result ) ->
        if typeof result.data.then == "function"  
          result.data.then  ( data ) ->
            sessionStorage.setItem "userName", data.userName
            return data
        else 
          return data
      return $http.post( 'login', { userName: userName, password: password } )
        .then ( handleResult )
      deferred = $q.defer()

    signUp: ( User ) ->
      handleResult = ( result ) ->
        if typeof result.data.then == "function"  
          result.data.then  ( data ) ->
            sessionStorage.setItem "userName", data.userName
            return data
        else 
          return data
      return $http.post( 'signUp', User )
        .then ( handleResult )
      deferred = $q.defer()

    logout: () ->
      sessionStorage.removeItem( "userName" )
      $window.location.href = "/map"

    showLoginDialog: () ->
      $scope.openLoginDialog()

    addUser: ( User ) ->
      handleResult = ( result ) ->
        if typeof result.data.then == "function"  
          result.data.then  ( data ) ->
            return data
        else 
          return data
      return $http.post('users/new', User)
        .then ( handleResult )

    removeUser: ( User ) ->
      handleResult = ( result ) ->
        if typeof result.data.then == "function"  
          result.data.then  ( data ) ->
            return data
        else 
          return data
      return $http.delete("users", {id: User.id})
        .then ( handleResult )

    getSignedInUser: ->
      userName = sessionStorage.getItem "userName"

      defer = $q.defer();

      if userName 
        return userName
      else 
        promise = SecurityRetryQueue.pushRetryFn 'unauthorized-server', factoryObj.getSignedInUser
        return promise

    getUserName: ->
      sessionStorage.getItem "userName"

    isLoggedIn: ->
      sessionStorage.getItem( "userName" )?

    changePassword: ( userName, oldPassword, newPassword ) ->
      handleResult = ( result ) ->
        if typeof result.data.then == "function"  
          result.data.then  ( data ) ->
            return data
        else 
          return data

      requestData =
        userName: userName,
        oldPassword: oldPassword,
        newPassword: newPassword
      return $http.put( "changePassword", requestData )
        .then ( handleResult )
 
  factoryObj

module.exports = LoginService