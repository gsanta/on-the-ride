SecurityInterceptor = ( $injector, SecurityRetryQueue ) ->
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

module.exports = SecurityInterceptor
