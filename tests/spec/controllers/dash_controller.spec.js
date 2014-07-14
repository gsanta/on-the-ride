describe('Unit: DashController', function() {
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
})