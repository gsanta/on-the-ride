MapEditorService = (  ) ->

  factoryObj =
    createAssocArrayFromChangedMarkers: ( markers ) ->
      assoc = []
      for marker in markers
        if marker.nodeInfo.changed
          assoc[ marker.nodeInfo._id ] = marker

  factoryObj

module.exports = MapEditorService