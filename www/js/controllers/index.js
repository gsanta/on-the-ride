define(function (require) {

    'use strict';

    var angular = require('angular'),
        services = require('services/index'),
        controllers = angular.module('controllers', ['services']);

    controllers.controller('MapCtrl', require('controllers/map_ctrl'));
    controllers.controller('PlaceInfoCtrl', require('controllers/place_info_ctrl'));
    
    return controllers;

});