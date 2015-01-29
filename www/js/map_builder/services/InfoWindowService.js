var InfoWindowService, factoryObj;

InfoWindowService = function() {
  var infoWindowContent, infowindow;
  infoWindowContent = '<div>\n  <div class="list">\n      <div class="item item-divider">\n        Basic info\n      </div>\n\n      <div class="item"> \n        User: {{actNode.user}}<br/>\n        Id: {{actNode.lat}}\n      </div>\n\n      <div class="item item-divider">\n        How accurate this point is?\n      </div>\n\n      <div class="item range range-energized"> \n        <div> \n        <input type="range" name="volume" min="0" max="2" value="1" ng-model="vote.value">\n        </div>\n        <div>\n          <i class="icon ion-happy">&nbsp;{{actNode.vote_pos}}</i>\n          <i class="icon ion-sad">&nbsp;{{actNode.vote_neg}}</i>\n        </div>\n      </div>\n  </div>\n</div>\n';
  infowindow = new google.maps.InfoWindow();
  return google.maps.event.addListener(infowindow, 'closeclick', function() {
    return 1;
  });
};

factoryObj = {
  getInfoWindow: function() {
    return infowindow;
  }
};

module.exports = InfoWindowService;
