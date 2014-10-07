angular.module 'services'
.factory 'UserService', ( $http ) ->

  factoryObj = 

    changeProfileData: ( userName, changeObj ) ->
      handleResult = ( result ) ->
        if typeof result.data.then == "function"  
          result.data.then  ( data ) ->
            return data
        else 
          return data

      return $http.put( "users/#{userName}", changeObj )
        .then ( handleResult )

  factoryObj