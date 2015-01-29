var BicycleRouteDaoService;

BicycleRouteDaoService = function() {
  var factoryObj;
  factoryObj = {
    savePoints: function(nodes) {
      var node, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        _results.push(LocalDataProviderService.updateNode(node._id, {
          lat: node.lat,
          lon: node.lon
        }));
      }
      return _results;
    },
    addPoints: function(nodes) {
      var node, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        _results.push(LocalDataProviderService.addNode({
          user: node.user,
          lat: node.lat,
          lon: node.lon
        }));
      }
      return _results;
    }
  };
  return factoryObj;
};

module.exports = BicycleRouteDaoService;
