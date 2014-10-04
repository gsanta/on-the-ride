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
  # respond.savedRespond = respond.respond
  # respond.respond = ( ) ->
  # 	console.log "a respond-bol"
  # 	console.log { valami: "valami"}
  # 	console.log respond.savedRespond( {valami: "valami"} )

  	#promise = LocalDataProviderService.addUser( )

  # $httpBackend.whenGET("templates/mapEdit.html")
  # .respond( ( method, url, data ) ->
  # 	that = arguments
  	
  # 	user = LoginService.getSignedInUser()
  # 	console.log user
  # 	if user 
  # 		$delegate(method, url, data, callback, headers, timeout, withCredentials);
  # 		#return [ method, url, data ];
  # 	else
  # 		return [401,  "", {}];
  # )

  $httpBackend.whenGET(/templates\/.*/).passThrough()