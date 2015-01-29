var MapEditorService;

MapEditorService = function() {
  var factoryObj;
  factoryObj = {
    createAssocArrayFromChangedMarkers: function(markers) {
      var assoc, marker, _i, _len, _results;
      assoc = [];
      _results = [];
      for (_i = 0, _len = markers.length; _i < _len; _i++) {
        marker = markers[_i];
        if (marker.nodeInfo.changed) {
          _results.push(assoc[marker.nodeInfo._id] = marker);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };
  return factoryObj;
};

module.exports = MapEditorService;
