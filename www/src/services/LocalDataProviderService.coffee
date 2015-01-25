LocalDataProviderService = ( $http, $q, MapConstants ) ->

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

      if !thisDB.objectStoreNames.contains( "users" )
        thisDB.createObjectStore "users", { autoIncrement: true }

      if !thisDB.objectStoreNames.contains( "votes" )
        thisDB.createObjectStore "votes", { autoIncrement: true }

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
          node.vote_pos = 0
          node.vote_neg = 0
          node.user = "gsanta"
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

    getUser: ( userName, password ) ->
      deferred = $q.defer()

      loadUserInfoFromIndexedDb = ( def ) ->
        transaction = db.transaction [ "users" ], "readonly"
        store = transaction.objectStore "users"
        cursor = store.openCursor()

        user = undefined

        cursor.onsuccess = ( e ) ->
          actUser = e.target.result
          if actUser?
            if actUser.value? && actUser.value.userName == userName
              user = actUser.value
              user.id = actUser.key
              user.password = ""
            else 
              actUser.continue();

        transaction.oncomplete = ( e ) ->
          if user
            def.resolve user
          else def.reject "login error"

      if db
        loadUserInfoFromIndexedDb( deferred )
      else
        console.log "openRequest"
        openRequest = openConnection()

        openRequest.onsuccess = ( e ) ->
          db = e.target.result
          loadUserInfoFromIndexedDb( deferred )

      deferred.promise

    addUser: ( User ) ->
      deferred = $q.defer()

      addUserToIndexedDb = ( def ) ->
        transaction = db.transaction [ "users" ], "readwrite"
        store = transaction.objectStore "users"
        request = store.add User

        request.onsuccess = ( e ) ->
          def.resolve User

        request.onerror = ( e ) ->
          def.reject "problem with signing up"

      if db
        addUserToIndexedDb( deferred )
      else
        console.log "openRequest"
        openRequest = openConnection()

        openRequest.onsuccess = ( e ) ->
          db = e.target.result
          addUserToIndexedDb( deferred )
      
      deferred.promise

    updateUser: ( userName, updateObj ) ->
      deferred = $q.defer()

      promise = this.getUser userName, undefined

      promise.then ( data ) ->
        for k,v of data
          if updateObj[ k ]?
            data[ k ] = updateObj[ k ]

        transaction = db.transaction [ "users" ], "readwrite"
        store = transaction.objectStore "users"
        request = store.put data, data.id

        request.onsuccess = ( e ) ->
          deferred.resolve data

      deferred.promise

    removeUser: ( User ) ->
      deferred = $q.defer()

      removedUserFromIndexedDb = ( def ) ->
        console.log "removeUser"
        transaction = db.transaction [ "users" ], "readwrite"
        store = transaction.objectStore "users"
        request = store.delete User.id

        request.onsuccess = ( e ) ->
          def.resolve User

        request.onerror = ( e ) ->
          def.reject "problem with deleting user"

      if db
        removedUserFromIndexedDb( deferred )
      else
        console.log "openRequest"
        openRequest = openConnection()

        openRequest.onsuccess = ( e ) ->
          db = e.target.result
          removedUserFromIndexedDb( deferred )
      
      deferred.promise

    getUserVoteForNode: ( userName, nodeId ) ->
      deferred = $q.defer()

      loadUserVoteForNode = ( def ) ->
        nodeId = parseInt nodeId
        transaction = db.transaction [ "votes" ], "readonly"
        store = transaction.objectStore "votes"
        cursor = store.openCursor()

        vote = undefined

        cursor.onsuccess = ( e ) ->
          actVote = e.target.result
          if actVote?
            if actVote.value.user == userName && actVote.value.node == nodeId
              vote = actVote.value
              vote.id = actVote.key
            else 
              actVote.continue();

        transaction.oncomplete = ( e ) ->
          def.resolve vote

      if db
        loadUserVoteForNode( deferred )
      else
        openRequest = openConnection()

        openRequest.onsuccess = ( e ) ->
          db = e.target.result
          loadUserVoteForNode( deferred )

      deferred.promise

    setUserVoteForNode: ( userName, nodeId, vote ) ->
      setUserVoteForNodeToIndexDb = ( def, data, isUpdate ) ->
        transaction = db.transaction [ "votes" ], "readwrite"
        store = transaction.objectStore "votes"

        if isUpdate
          request = store.put data, data.id
        else
          request = store.add data

        request.onsuccess = ( e ) ->
          def.resolve data

        request.onerror = ( e ) ->
          def.reject "problem with deleting user"

      promise = factoryObj.getUserVoteForNode userName, nodeId

      deferred = $q.defer()

      promise.then ( data ) ->

        if data?
          data.vote = vote
          setUserVoteForNodeToIndexDb deferred, data, true
        else
          data =
            user: userName
            node: nodeId
            vote: vote
          setUserVoteForNodeToIndexDb deferred, data, false

      deferred.promise

    getVotesForNode: ( nodeId ) ->
      deferred = $q.defer()

      loadUserVoteForNode = ( def ) ->
        nodeId = parseInt nodeId
        transaction = db.transaction [ "votes" ], "readonly"
        store = transaction.objectStore "votes"
        cursor = store.openCursor()

        votes =
          nodeId: nodeId
          pos: 0
          neg: 0

        cursor.onsuccess = ( e ) ->
          actVote = e.target.result
          if actVote?
            if actVote.value.node == nodeId
              if actVote.value.vote == 0
                votes.neg += 1
              else if actVote.value.vote == 2
                votes.pos += 1
            actVote.continue();

        transaction.oncomplete = ( e ) ->
          def.resolve votes

      if db
        loadUserVoteForNode( deferred )
      else
        openRequest = openConnection()

        openRequest.onsuccess = ( e ) ->
          db = e.target.result
          loadUserVoteForNode( deferred )

      deferred.promise


  factoryObj

module.exports = LocalDataProviderService