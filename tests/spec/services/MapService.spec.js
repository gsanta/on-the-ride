describe("MapService", function () {

    var $scope, ctrl, $timeout, MapService, MapConstants, Coord

    beforeEach(function () {

        module("starter");

        inject(function(_Map_, _MapConstants_, _Coord_) {
            MapService = _Map_;
            MapConstants = _MapConstants_;
            Coord = _Coord_;
        });
    });

    describe("When calculating the zoom", function() {
        it("should give 1 when called for areas bigger or equal to zoom 1", function() {
            expect(MapService.calculateZoom( new Coord( 71,-10 ), new Coord( 30.1,56 ) ) ).toEqual(1);
            expect(MapService.calculateZoom( new Coord( 70,-10 ), new Coord( 30,55 ) ) ).toEqual(1);
        });

        it("should give 3 when called for an area that is equal to zoom 3", function() {
            expect(MapService.calculateZoom( new Coord( 70,-10 ), new Coord( 60,6.25 ) ) ).toEqual(3); 
        });

        it("should give 3 when called for areas between zoom 3 and 4", function() {
            expect(MapService.calculateZoom( new Coord( 70,-10 ), new Coord( 60.1,6.251 ) ) ).toEqual(3);
        });

        it("should give 9 when called for areas less than zoom 9", function() {
            expect(MapService.calculateZoom( new Coord( 70,-10 ), new Coord( 69.99999,-9.9999 ) ) ).toEqual(9);
        });
    })

    describe("When creating route from nodes at given zoom state", function() {
        var route = [
            {
                "_id" : 0,
                "siblings" : [1,2,3],
                "weight": 1,
                "startNodeInMap": [ 0 ]
            },
            {
                "_id" : 1,
                "siblings" : [2,3,4],
                "weight": 2,
                "startNodeInMap": [ ]
            },
            {
                "_id" : 2,
                "siblings" : [3,4,5],
                "weight": 3,
                "startNodeInMap": [ ]
            },
            {
                "_id" : 3,
                "siblings" : [4,5,6],
                "weight": 1,
                "startNodeInMap": [ ]
            },
            {
                "_id" : 4,
                "siblings" : [5,6],
                "weight": 2,
                "startNodeInMap": [ ]
            },
            {
                "_id" : 5,
                "siblings" : [6],
                "weight": 3,
                "startNodeInMap": [ ]
            },
            {
                "_id" : 6,
                "siblings" : [],
                "weight": 1,
                "startNodeInMap": [ ]
            }
        ]

        var originalMaxZoom;

        beforeEach(function() {
            originalMaxZoom = MapConstants.max_zoom;
            MapConstants.max_zoom = "3";
        });

        it("should give back the whole route, when zoom is max_zoom", function() {
            expect(MapService.createRouteFromNodeArray(route, MapConstants.max_zoom, [ 0 ]).length).toEqual(7);
        });

        it("should throw an exception when zoom greater than max_zoom or less than 1", function() {
            expect( 
                function() {
                    MapService.createRouteFromNodeArray(route, MapConstants.max_zoom + 1, [ 0 ] )
                }
            ).toThrow(new Error("zoom is bigger than the maximum (use MapConstants.max_zoom)"))
        
            expect( 
                function() {
                    MapService.createRouteFromNodeArray(route, 0, [ 0 ] )
                }
            ).toThrow(new Error("zoom is smaller than the minimum (use MapConstants.min_zoom)"))
        });

        it("should give back nodes with zoom 1 and 2, when zoom is 2 ", function() {
            var result = MapService.createRouteFromNodeArray(route, 2, [ 0 ] )
            expect(result.length).toEqual(5);
            for(var i = 0; i < result.length; i++) {
                expect(result[i].weight == 1 || result[i].weight == 2).toBeTruthy();
            }
        });

        it("should give back nodes with zoom 1, when zoom is 1", function() {
            var result = MapService.createRouteFromNodeArray(route, 1, [ 0 ] )
            expect(result.length).toEqual(3);
            for(var i = 0; i < result.length; i++) {
                expect(result[i].weight).toBe(1);
            }
        });

        afterEach(function() {
            MapConstants.max_zoom = originalMaxZoom;
        });
    })

    describe("When calculating mapId for node", function() {
        describe("When the zoom is 0", function() {
            it("should give 0 for every node (within the boundaries)", function() {
                expect(MapService.calculateMapIdForNodeAtZoom(new Coord( -10, 70 ), 0)).toBe(0);
                expect(MapService.calculateMapIdForNodeAtZoom(new Coord( 22.5, 70 ), 0)).toBe(0);
                expect(MapService.calculateMapIdForNodeAtZoom(new Coord( 22.5, 50 ), 0)).toBe(0);
                expect(MapService.calculateMapIdForNodeAtZoom(new Coord( 54.999, 30.001 ), 0)).toBe(0);
            });
        });

        describe("When the zoom is 1", function() {
            it("should give 4 for coord (40,38.75) at zoom 1 ", function() {
                expect(MapService.calculateMapIdForNodeAtZoom(new Coord( 38.75, 40 ), 1)).toBe(4);
            });

            it("should give 4 for coord (50,22.5) at zoom 1 ", function() {
                expect(MapService.calculateMapIdForNodeAtZoom(new Coord( 22.5, 50 ), 1)).toBe(4);
            });
        });

        describe("When the zoom is 2", function() {
            it("should give 5 for coord (70,-10)", function() {
                expect(MapService.calculateMapIdForNodeAtZoom(new Coord( -10, 70 ), 2)).toBe(5);
            });

            it("should give 10 for coord (60,6.25)", function() {
                expect(MapService.calculateMapIdForNodeAtZoom(new Coord( 6.25, 60 ), 2)).toBe(10);
            });

            it("should give 14 for coord (45,14.375)", function() {
                expect(MapService.calculateMapIdForNodeAtZoom(new Coord( 14.375, 45 ), 2)).toBe(14);
            });
        });
    })

    describe("When calculating mapIds for area", function() {
        describe("When the zoom is 0", function() {
            it("should give 0 for every area", function() {
                var mapIds = MapService.getMapsForAreaAtZoom(new Coord( -9, 71 ), new Coord( 56, 29 ), 0);
                expect(mapIds.length).toBe(1)
                expect(mapIds[0]).toBe(0);
            });
        });

        describe("When the zoom is 1", function() {
            it("should give 1 for area (-1.875, 65),(14.375, 55)", function() { 
                expect(MapService.getMapsForAreaAtZoom(new Coord( -1.875, 65 ), new Coord( 14.375, 55 ), 1)[0]).toBe(1);
            }); 

            it("should give [1,2,3,4] for area (6.25, 60),(38.75, 40)", function() { 
                var mapIds = MapService.getMapsForAreaAtZoom(new Coord( 6.25, 60 ), new Coord( 38.75, 40 ), 1);
                expect(mapIds.length).toBe(4);
                expect(mapIds[0]).toBe(1);
                expect(mapIds[1]).toBe(2);
                expect(mapIds[2]).toBe(3);
                expect(mapIds[3]).toBe(4);
            }); 

            it("should give [3,4] for area (14.375, 45),(30.625, 35)", function() { 
                var mapIds = MapService.getMapsForAreaAtZoom(new Coord( 14.375, 45 ), new Coord( 30.625, 35 ), 1);
                expect(mapIds.length).toBe(2);
                expect(mapIds[0]).toBe(3);
                expect(mapIds[1]).toBe(4);
            }); 
        });

        describe("When the zoom is 2", function() {
            it("should give [14,15,18,19] for area (14.375, 45),(30.625, 35)", function() { 
                var mapIds = MapService.getMapsForAreaAtZoom(new Coord( 14.375, 45 ), new Coord( 30.625, 35 ), 2);
                expect(mapIds.length).toBe(4);
                expect(mapIds[0]).toBe(14);
                expect(mapIds[1]).toBe(15);
                expect(mapIds[2]).toBe(18);
                expect(mapIds[3]).toBe(19);
            }); 

            it("should give [14,15,18,19] for area (6.25, 50),(22.5, 40)", function() { 
                var mapIds = MapService.getMapsForAreaAtZoom(new Coord( 6.25, 50 ), new Coord( 22.5, 40 ), 2);
                expect(mapIds.length).toBe(4);
                expect(mapIds[0]).toBe(14);
                expect(mapIds[1]).toBe(15);
                expect(mapIds[2]).toBe(18);
                expect(mapIds[3]).toBe(19);
            }); 

            it("should give [20] for area (38.75, 40),(55, 30)", function() { 
                var mapIds = MapService.getMapsForAreaAtZoom(new Coord( 38.75, 40 ), new Coord( 55, 30 ), 2);
                console.log(mapIds)
                expect(mapIds.length).toBe(1);
                expect(mapIds[0]).toBe(20); 
            }); 
        });
    })
});