describe('Unit: DashController', function() {

	describe("Testing the test framework", function() {
		beforeEach(module('starter.controllers'));

		var ctrl, scope;

		beforeEach(inject(function($controller, $rootScope) {
	    	scope = $rootScope.$new();

	    	ctrl = $controller('DashCtrl', {
	      		$scope: scope
	    	}); 
	  	}));

	  	it('should create $scope.jasminTestGreeting when calling jasminTestFunc', function() {
		    expect(scope.jasminTestGreeting).toBeUndefined();
		    scope.jasminTestFunc();
		    expect(scope.jasminTestGreeting).toEqual("Hello Test");
		});
	});

	describe("Fetching info from server", function() {
		var $http, $httpBackend, $scope, ctrl;
		
		beforeEach(module('starter.controllers'));

		beforeEach(inject(function (_$http_, _$httpBackend_) {
			$http = _$http_;
			$httpBackend = _$httpBackend_;
		}));

		beforeEach(inject(function (_$rootScope_, _$controller_) {
			$scope = _$rootScope_.$new();
			ctrl = _$controller_('DashCtrl', {
				$scope : $scope
			});
		}));

		it('Should fetch all the info from the server', function() {
			$httpBackend
			.whenGET('/info')
			.respond([
				{
					category: "Accomodation",
					desc: "Desc 0",
					lat: 41.2314781,
					lon: 7.1234569
				},
				{
					category: "Sight",
					desc: "Desc 1",
					lat: 41.8931231,
					lon: 8.1234569
				},
			]);

			$scope.fetchInfo();

			$httpBackend.flush();

			expect($scope.infoBoxes.length).toEqual(2);
			expect($scope.infoBoxes[0].desc).toEqual("Desc 0");
			expect($scope.infoBoxes[1].lat).toEqual(41.8931231);

		});
	});
});