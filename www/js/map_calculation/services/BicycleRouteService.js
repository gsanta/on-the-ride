var BicycleRouteService,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

BicycleRouteService = function() {
  var createRouteFromStartNode, factoryObj;
  ({
    getStartNodeOfMapId: function(nodes, mapId) {
      var node, _i, _len;
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        if (__indexOf.call(node.startNodeInMap, mapId) >= 0) {
          return node;
        }
      }
      return null;
    }
  });
  createRouteFromStartNode = function(startNode) {
    var actNode, route;
    route = [];
    actNode = startNode;
    while (actNode !== void 0) {
      route.push(actNode);
      if (actNode.weight < zoom) {
        actNode = nodeAssocMap[actNode.siblings[0]];
      } else {
        actNode = nodeAssocMap[actNode.siblings[MapConstants.max_zoom - zoom]];
      }
    }
    return route;
  };
  factoryObj = {
    createRouteFromNodes: function(routeNodes, zoom, mapIds) {
      var finalRoute, mapId, node, route, routeNodesMap, startNode, startNodes, _i, _j, _k, _len, _len1, _len2;
      if (zoom > MapConstants.max_zoom) {
        throw new Error("zoom is bigger than the maximum (use MapConstants.max_zoom)");
      }
      if (zoom < 1) {
        throw new Error("zoom is smaller than the minimum (use MapConstants.min_zoom)");
      }
      routeNodesMap = {};
      for (_i = 0, _len = routeNodes.length; _i < _len; _i++) {
        node = routeNodes[_i];
        routeNodesMap[node._id] = node;
      }
      startNodes = [];
      for (_j = 0, _len1 = mapIds.length; _j < _len1; _j++) {
        mapId = mapIds[_j];
        startNode = this.getStartNodeOfMapId(routeNodes, mapId);
        if (startNode) {
          startNodes.push(startNode);
        }
      }
      finalRoute = [];
      for (_k = 0, _len2 = startNodes.length; _k < _len2; _k++) {
        startNode = startNodes[_k];
        route = createRouteFromStartNode(startNode);
        if (route.length > finalRoute.length) {
          finalRoute = route;
        }
      }
      return finalRoute;
    }
  };
  return factoryObj;
};

module.exports = BicycleRouteService;
