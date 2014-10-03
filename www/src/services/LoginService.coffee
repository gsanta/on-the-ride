angular.module 'services'
.factory 'LoginService', ( $http, $q, $location ) ->

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

  redirect = (url) ->
    url = url || '/';
    $location.path url

  # // Login form dialog stuff
  # var loginDialog = null;
  # function openLoginDialog() {
  #   if ( loginDialog ) {
  #     throw new Error('Trying to open a dialog that is already open!');
  #   }
  #   loginDialog = $dialog.dialog();
  #   loginDialog.open('security/login/form.tpl.html', 'LoginFormController').then(onLoginDialogClose);
  # }
  # function closeLoginDialog(success) {
  #   if (loginDialog) {
  #     loginDialog.close(success);
  #   }
  # }
  # function onLoginDialogClose(success) {
  #   loginDialog = null;
  #   if ( success ) {
  #     queue.retryAll();
  #   } else {
  #     queue.cancelAll();
  #     redirect();
  #   }
  # }

  # // Register a handler for when an item is added to the retry queue
  # queue.onItemAddedCallbacks.push(function(retryItem) {
  #   if ( queue.hasMore() ) {
  #     service.showLogin();
  #   }
  # });

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

    getLoggedInUser: ->
      return undefined

  factoryObj