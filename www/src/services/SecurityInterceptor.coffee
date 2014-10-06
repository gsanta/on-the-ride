angular.module 'services'

# This http interceptor listens for authentication failures
.factory 'securityInterceptor', ( $injector, SecurityRetryQueue ) ->
  return ( promise ) ->
    return promise.then (originalResponse) ->
    	return originalResponse
    , ( originalResponse ) ->
      console.log "login error"
      console.log originalResponse.status
      if originalResponse.status == 401

        promise = SecurityRetryQueue.pushRetryFn 'unauthorized-server', () ->
          return $injector.get('$http') originalResponse.config

      return promise

# We have to add the interceptor to the queue as a string because the interceptor depends upon service instances that are not available in the config block.
.config ( $httpProvider ) ->
  $httpProvider.responseInterceptors.push 'securityInterceptor'