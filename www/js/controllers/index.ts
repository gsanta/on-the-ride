/// <reference path="../../../typings/angularjs/angular.d.ts" />

import MapCtrl = require("./MapCtrl");
import PlaceInfoCtrl = require("./PlaceInfoCtrl");
import services = require("../services/index");

var controllers = angular.module('controllers', ['services']);

controllers.controller('MapCtrl', MapCtrl);
controllers.controller('PlaceInfoCtrl', PlaceInfoCtrl);

return controllers;