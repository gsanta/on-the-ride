angular.module 'services'

# This is a generic retry queue for security failures.  
# Each item is expected to expose two functions: retry and cancel.
.factory 'securityRetryQueue', ( $q, $log ) ->
  retryQueue = []
  service =
    # The security service puts its own handler in here!
    onItemAddedCallbacks: [],
    
    hasMore: () ->
      return retryQueue.length > 0

    push: ( retryItem ) ->
      retryQueue.push retryItem
      
      angular.forEach service.onItemAddedCallbacks, ( cb ) ->
        try cb( retryItem )
        catch e
          $log.error 'securityRetryQueue.push(retryItem): callback threw an error' + e

    pushRetryFn: ( reason, retryFn ) ->

      if arguments.length == 1
        retryFn = reason
        reason = undefined

      deferred = $q.defer()
      retryItem =
        reason: reason,
        retry: () ->

          $q.when( retryFn() ).then( ( value ) ->
            deferred.resolve value
          , ( value ) ->
            deferred.reject value
          )

        cancel: () ->
          deferred.reject()

      service.push retryItem
      return deferred.promise

    retryReason: () ->
      return service.hasMore() && retryQueue[0].reason

    cancelAll: () ->
      while service.hasMore() 
        retryQueue.shift().cancel()

    retryAll: () ->
      while service.hasMore()
        retryQueue.shift().retry()

  return service;
