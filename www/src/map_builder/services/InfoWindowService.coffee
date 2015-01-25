InfoWindowService = ( ) ->

  infoWindowContent = '''
    <div>
      <div class="list">
          <div class="item item-divider">
            Basic info
          </div>

          <div class="item"> 
            User: {{actNode.user}}<br/>
            Id: {{actNode.lat}}
          </div>

          <div class="item item-divider">
            How accurate this point is?
          </div>

          <div class="item range range-energized"> 
            <div> 
            <input type="range" name="volume" min="0" max="2" value="1" ng-model="vote.value">
            </div>
            <div>
              <i class="icon ion-happy">&nbsp;{{actNode.vote_pos}}</i>
              <i class="icon ion-sad">&nbsp;{{actNode.vote_neg}}</i>
            </div>
          </div>
      </div>
    </div>

    '''

  infowindow = new google.maps.InfoWindow()

  google.maps.event.addListener infowindow, 'closeclick', () ->
    1
    # scope.vote.isReset = true
    # scope.vote.value = 1
    # scope.$apply()

	factoryObj =
	 
    getInfoWindow: () ->
      return infowindow

  # factoryObj

module.exports = InfoWindowService