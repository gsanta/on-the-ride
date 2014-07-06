angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {
	$scope.loadMap = function() {
		navigator.geolocation.getCurrentPosition( $scope.initialize );
		//google.maps.event.addDomListener(window, 'load', $scope.initialize);
	}

	$scope.initialize = function( location ) {
		console.log( location )

		var mapProp = {
			center:new google.maps.LatLng( location.coords.latitude, location.coords.longitude ),
			zoom: 16,
			mapTypeId:google.maps.MapTypeId.ROADMAP
		};

		var map = new google.maps.Map( document.getElementById( "googleMap" ), mapProp );
	}

})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
});
