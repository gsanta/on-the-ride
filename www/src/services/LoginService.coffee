angular.module 'services'
.factory 'LoginService', ( $http, $q, $location, SecurityRetryQueue, $ionicPopup, $rootScope, $timeout ) ->


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
      template: '''
          <div class="list">
            <label class="item item-input">
              <input type="text" placeholder="Username" ng-model="data.userName">
            </label>
            <label class="item item-input">
              <input type="email" placeholder="Email" ng-model="data.email">
            </label>
            <label class="item item-input">
              <input type="password" placeholder="Password" ng-model="data.password">
            </label>
            <label class="item item-input">
              <input type="password" placeholder="Repeat password" ng-model="data.passwordRepeat">
            </label>
            <a ng-click="login()">Already registered, take me to sign in</a>
          </div>
      ''',
      title: 'Please sign up',
      scope: $scope,
      buttons: [
        { 
          text: 'Cancel',
          type: 'button-stable',
          onTap: ( e ) ->
            $scope.registrationDialog = null
        },
        {
          text: '<b>Sign up</b>',
          type: 'button-balanced',
          onTap: ( e ) ->
            if $scope.data.password? && $scope.data.userName?
              User = 
                userName: $scope.data.userName,
                password: $scope.data.password,
                email: $scope.data.email
              promise = factoryObj.signUp User
              promise.then () ->
                $scope.registrationDialog.close()
                $scope.registrationDialog = undefined
                $scope.retryAuthentication()
              , () ->
                console.log "regisztrációs hiba"
            
        } 
      ]

  $scope.openLoginDialog = () ->
    $scope.data = {}

    if $scope.loginDialog
      throw new Error 'Trying to open a dialog that is already open!'
    $scope.loginDialog = $ionicPopup.show
      template: '''
        <form name="loginForm" novalidate>
          <div class="list">
            <label class="item item-input">
              <input type="text" placeholder="Username" ng-model="data.userName" required>
            </label>
            <label class="item item-input">
              <input type="password" placeholder="Password" ng-model="data.password" required>
            </label>
            <a ng-click="register()">Not registered, take me to sign up</a>
          </div>
        </form>
      ''',
      title: 'Please log in',
      scope: $scope,
      buttons: [
        { 
          text: 'Cancel',
          type: 'button-stable',
          onTap: ( e ) ->
            $scope.loginDialog = null
        },
        {
          text: '<b>Log in</b>',
          type: 'button-balanced',
          onTap: ( e ) ->

            e.preventDefault()
            form = $scope.loginForm
            if $scope.data.password? && $scope.data.userName?
              promise = factoryObj.login $scope.data.userName, $scope.data.password
              promise.then () ->
                $scope.loginDialog.close()
                $scope.loginDialog = undefined
                $scope.retryAuthentication()
              , () ->
                console.log "bejelentkezési hiba"
        } 
      ]

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