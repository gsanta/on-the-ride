angular.module 'starter'
.config ($provide) ->
  $provide.decorator( '$httpBackend', angular.mock.e2e.$httpBackendDecorator )
.run ( $httpBackend, LocalDataProviderService, $q ) ->

  $httpBackend.whenPOST( 'users/new' )
  .respond( ( method, url, data ) ->
  	promise = LocalDataProviderService.addUser data

  	return [200,  promise, {}];
  )

  $httpBackend.whenDELETE( 'users' )
  .respond( ( method, url, data ) ->
  	console.log("deleting")
  )
  # respond.savedRespond = respond.respond
  # respond.respond = ( ) ->
  # 	console.log "a respond-bol"
  # 	console.log { valami: "valami"}
  # 	console.log respond.savedRespond( {valami: "valami"} )

  	#promise = LocalDataProviderService.addUser( )

  $httpBackend.whenGET(/templates\/.*/).passThrough()