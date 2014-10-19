angular.module 'starter'
.config ($provide) ->
  $provide.decorator( '$httpBackend', angular.mock.e2e.$httpBackendDecorator )
.run ( $httpBackend, LocalDataProviderService, LoginService, $q ) ->

  $httpBackend.whenPOST( 'users/new' )
  .respond( ( method, url, data ) ->
    promise = LocalDataProviderService.addUser data

    return [401,  promise, {}];
  )

  $httpBackend.whenDELETE( 'users' )
  .respond( ( method, url, data ) ->
    console.log("deleting")
  )

  $httpBackend.whenPOST( 'login' )
  .respond( ( method, url, data ) ->
    obj = angular.fromJson data
    promise = LocalDataProviderService.getUser obj.userName, obj.password

    return [200,  promise, {}];
  )

  $httpBackend.whenPOST( 'signUp' )
  .respond( ( method, url, data ) ->
    obj = angular.fromJson data
    promise = LocalDataProviderService.addUser obj

    return [200,  promise, {}];
  )

  $httpBackend.whenGET( /users\/.*/ )
  .respond( ( method, url, data ) ->
    
    userNameIndex = url.lastIndexOf "/"
    userName = url.substring userNameIndex + 1

    promise = LocalDataProviderService.getUser userName 
    return [200,  promise, {}];
  )

  $httpBackend.whenPUT( /users\/.*/ )
  .respond( ( method, url, data ) ->

    userNameIndex = url.lastIndexOf "/"
    userName = url.substring userNameIndex + 1    
    
    obj = angular.fromJson data

    promise = LocalDataProviderService.updateUser userName, obj

    return [200,  promise, {}];
  )

  $httpBackend.whenPUT( 'changePassword' )
  .respond( ( method, url, data ) ->
    
    obj = angular.fromJson data
    newObj =
      password: obj.newPassword
    promise = LocalDataProviderService.updateUser obj.userName, newObj

    return [200,  promise, {}];
  )

  $httpBackend.whenGET( /vote\/.*/ )
  .respond( ( method, url, data ) ->
    
    userNameIndex = url.indexOf "/", 1
    mapIdIndex = url.lastIndexOf "/"
    
    userName = url.substring userNameIndex + 1, mapIdIndex
    mapId = url.substring mapIdIndex + 1

    return [200,  1, {}];
  )

  $httpBackend.whenGET( /templates\/.*/ ).passThrough()