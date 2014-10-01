angular.module 'services'
.factory 'LoginService', ( $http, $q ) ->

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

  factoryObj = 
    login: ( userName, password ) ->
      deferred = $q.defer()

      loadUserInfoFromIndexedDb = ( def, userName ) ->
        transaction = db.transaction [ "eurovelo_6" ], "readonly"
        store = transaction.objectStore "users"
        cursor = store.openCursor()

        user = {}

        cursor.onsuccess = ( e ) ->
          actUser = e.target.result
          if actUser.value.userName == userName
            user.id = actUser.key
            user.userName = actUser.value.userName
          else 
            actUser.continue();

        transaction.oncomplete = ( e ) ->
          def.resolve route

      loadRouteInfoFromIndexedDb( deferred, userName )

      deferred.promise

    addUser: ( User ) ->
      deferred = $q.defer()

      addUserToIndexedDb = ( def ) ->
        transaction = db.transaction [ "eurovelo_6" ], "readwrite"
        store = transaction.objectStore "users"
        request = store.add User

        request.onsuccess = ( e ) ->
          def.resolve User

        request.onerror = ( e ) ->
          def.reject "problem with signing up"

      addUserToIndexedDb( deferred )
      deferred.promise


  factoryObj