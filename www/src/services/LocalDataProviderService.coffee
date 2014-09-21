angular.module 'services'
.factory 'LocalDataProviderService', ( $http, $q, MapConstants ) ->
  console.log "lefut"
  idbSupported = false
  if "indexedDB" in window
    idbSupported = true 
  db = undefined

  #todo check indexeddb is supported
  openConnection = () ->
    connRequest = indexedDB.open(
      MapConstants.dbPrefix,
      MapConstants.indexedDbVersion
    )

    connRequest.onupgradeneeded = ( e ) ->
      console.log "upgradeneedeed"
      thisDB = e.target.result

      if !thisDB.objectStoreNames.contains( "eurovelo_6" )
        thisDB.createObjectStore "eurovelo_6", { autoIncrement: true }

    connRequest.onerror = ( e ) ->
      console.log "Error"
      console.dir e

    connRequest

  shouldPopulateDb = () ->
    queryDbIfThereAreAnyData = ( def ) ->
      transaction = db.transaction [ "eurovelo_6" ], "readonly"
      store = transaction.objectStore "eurovelo_6"
      cursor = store.openCursor()

      route = []

      cursor.onsuccess = ( e ) ->
        res = e.target.result
        if res
          console.log "should'nt"
          def.resolve false
        else 
          console.log "should"
          def.resolve true

    deferred = $q.defer()

    if db
      queryDbIfThereAreAnyData( deferred )
    else
      openRequest = openConnection()

      openRequest.onsuccess = ( e ) ->
        db = e.target.result
        queryDbIfThereAreAnyData( deferred )

    deferred.promise

  factoryObj =

    loadRouteInfo: ( zoom, maps ) ->
      loadRouteInfoFromIndexedDb = ( def ) ->
        transaction = db.transaction [ "eurovelo_6" ], "readonly"
        store = transaction.objectStore "eurovelo_6"
        cursor = store.openCursor()

        route = []

        cursor.onsuccess = ( e ) ->
          res = e.target.result
          if res
            node = res.value
            node._id = res.key
            route.push node
            res.continue();

        transaction.oncomplete = ( e ) ->
          def.resolve route

      deferred = $q.defer()

      # if db
      #   loadRouteInfoFromIndexedDb( deferred )

      # else
      #   openRequest = openConnection()

      #   openRequest.onsuccess = ( e ) ->
      #     console.log "Success!"
      #     db = e.target.result
      #     loadRouteInfoFromIndexedDb( deferred )
      shouldPopulatePromise = shouldPopulateDb()
      that = this
      shouldPopulatePromise.then ( should ) ->
        if should
          promise = that.clearAndPopulateDbForTesting()
          promise.then () ->
            loadRouteInfoFromIndexedDb( deferred )
        else
          loadRouteInfoFromIndexedDb( deferred )


      deferred.promise

    clearAndPopulateDbForTesting: () ->
      clearAndpopulateDbFromServer = ( def ) ->
        dbPromise = $http.get "dummyDatabase"
        dbPromise.success ( nodes ) ->
          transaction = db.transaction [ "eurovelo_6" ], "readwrite"
          store = transaction.objectStore "eurovelo_6"
          store.clear()

          for node in nodes
            store.add node
          def.resolve()

        dbPromise.error ( data ) ->
          console.log "failure"

      clearAndpopulateDbFromArray = ( def ) ->
        transaction = db.transaction [ "eurovelo_6" ], "readwrite"
        store = transaction.objectStore "eurovelo_6"
        store.clear()

        for node in smallDatabaseForTesting
          store.add node
        def.resolve()

      deferred = $q.defer()
      if db
        clearAndpopulateDbFromArray( deferred )
      else
        openRequest = openConnection()

        openRequest.onsuccess = ( e ) ->
          db = e.target.result
          clearAndpopulateDbFromArray( deferred )
      deferred.promise

    updateNode: ( id, props ) ->
      transaction = db.transaction [ "eurovelo_6" ], "readwrite"
      store = transaction.objectStore "eurovelo_6"
      request = store.put props, id

      request.onsuccess = ( e ) ->
        console.log "success saving node"

      request.onerror = ( e ) ->
        console.log "error saving node"


    addNode: ( node ) ->
      transaction = db.transaction [ "eurovelo_6" ], "readwrite"
      store = transaction.objectStore "eurovelo_6"
      request = store.add node

      request.onsuccess = ( e ) ->
        console.log "success adding node"

      request.onerror = ( e ) ->
        console.log "error adding node"


  factoryObj