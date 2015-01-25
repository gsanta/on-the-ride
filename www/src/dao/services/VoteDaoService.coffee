VoteDaoService = ( ) ->

	factoryObj =
		getUserVoteToPoint: ( userName, nodeId ) ->
      deferred = $q.defer()

      httpPromise = $http.get "/vote/#{userName}/#{nodeId}"

      httpPromise.then ( resp ) ->
        if resp.data.then? 
          resp.data.then ( data ) ->
            if data == undefined
              data = 
                user: userName
                node: nodeId
                vote: 1
            deferred.resolve( data )

      deferred.promise

    getAllVotesToNode: ( nodeId ) ->
      deferred = $q.defer()

      httpPromise = $http.get "/vote/#{nodeId}"

      httpPromise.then ( resp ) ->
        if resp.data.then? 
          resp.data.then ( data ) ->
            if data == undefined
              data = 
                nodeId: nodeId
                pos: 0
                neg: 0
            deferred.resolve( data )

      deferred.promise

    sendUserVoteForNode: ( userName, nodeId, vote ) ->
      $http.post "/vote/new", {
        user: userName,
        nodeId: nodeId,
        vote: vote
      }

	return factoryObj

module.exports = VoteDaoService