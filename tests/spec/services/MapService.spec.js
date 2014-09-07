describe("MapService", function () {

    var $scope, ctrl, $timeout, MapService, MapConstants

    beforeEach(function () {

        module("starter");

        inject(function(_Map_, _MapConstants_) {
            MapService = _Map_;
            MapConstants = _MapConstants_;
        });
    });

    describe("When calculating the zoom", function() {
        it("should give 0 when called for areas bigger or equal to zoom 0", function() {
            expect(MapService.calculateZoom(71,-10,30.1,56)).toEqual(0);
            expect(MapService.calculateZoom(70,-10,30,55)).toEqual(0);
        });

        it("should give 2 when called for an area that is equal to zoom 2", function() {
            expect(MapService.calculateZoom(70,-10,60,6.25)).toEqual(2); 
        });

        it("should give 2 when called for areas between zoom 2 and 3", function() {
            expect(MapService.calculateZoom(70,-10,60.1,6.251)).toEqual(2);
        });

        it("should give 8 when called for areas less than zoom 8", function() {
            expect(MapService.calculateZoom(70,-10,69.99999,-9.9999)).toEqual(8);
        });
    })

    describe("When creating route from nodes at given zoom state", function() {
        var route = [
            {
                "_id" : 0,
                "siblings" : [1,2,3],
                "weight": 1
            },
            {
                "_id" : 1,
                "siblings" : [2,3,4],
                "weight": 2
            },
            {
                "_id" : 2,
                "siblings" : [3,4,5],
                "weight": 3
            },
            {
                "_id" : 3,
                "siblings" : [4,5,6],
                "weight": 1
            },
            {
                "_id" : 4,
                "siblings" : [5,6],
                "weight": 2
            },
            {
                "_id" : 5,
                "siblings" : [6],
                "weight": 3
            },
            {
                "_id" : 6,
                "siblings" : [],
                "weight": 1
            }
        ]

        var originalMaxZoom;

        beforeEach(function() {
            originalMaxZoom = MapConstants.max_zoom;
            MapConstants.max_zoom = "3";
        });

        it("should give back the whole route, when zoom is max_zoom", function() {
            expect(MapService.createRouteFromNodeArray(route, MapConstants.max_zoom).length).toEqual(7);
        });

        it("should throw an exception when zoom greater than max_zoom or less than 1", function() {
            expect( 
                function() {
                    MapService.createRouteFromNodeArray(route, MapConstants.max_zoom + 1)
                }
            ).toThrow(new Error("zoom is bigger than the maximum (use MapConstants.max_zoom)"))
        
            expect( 
                function() {
                    MapService.createRouteFromNodeArray(route, 0)
                }
            ).toThrow(new Error("zoom is smaller than the minimum (use MapConstants.min_zoom)"))
        });

        it("should give back nodes with zoom 1 and 2, when zoom is 2 ", function() {
            var result = MapService.createRouteFromNodeArray(route, 2)
            expect(result.length).toEqual(5);
            for(var i = 0; i < result.length; i++) {
                expect(result[i].weight == 1 || result[i].weight == 2).toBeTruthy();
            }
        });

        it("should give back nodes with zoom 1, when zoom is 1", function() {
            var result = MapService.createRouteFromNodeArray(route, 1)
            expect(result.length).toEqual(3);
            for(var i = 0; i < result.length; i++) {
                expect(result[i].weight).toBe(1);
            }
        });

        afterEach(function() {
            MapConstants.max_zoom = originalMaxZoom;
        });
    })
});