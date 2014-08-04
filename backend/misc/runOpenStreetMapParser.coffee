utility = require( './utility' )

isWriteToFileAsJson = false
relationUrl = 'http://api.openstreetmap.org/api/0.6/relation/2764576'

utility.loadResourceXmlAndParseToJs relationUrl, false, (result, isWriteToFileAsJson) ->
	relation = utility.extractRelationFromOsm result, false
	ways = utility.extractWaysFromRelation relation, false	

	nodes = []
	finalWays = [];

	for way, index in ways
		utility.loadResourceXmlAndParseToJs "http://api.openstreetmap.org/api/0.6/way/" + way.ref, false,  ( result, isWriteToFileAsJson ) ->
			nds = utility.extractNdsFromWay result, false
			finalWays.push nds

			for node in nds.nodes
				utility.loadResourceXmlAndParseToJs "http://api.openstreetmap.org/api/0.6/node/" + node.ref, false, ( result, isWriteToFileAsJson ) ->
					extractedNode = utility.extractNodeFromOsm result, false
					
					for nodeAgain in nds.nodes
						if nodeAgain.ref == extractedNode.id
							nodeAgain.lat = extractedNode.lat
							nodeAgain.lon = extractedNode.lon


	callback = -> utility.writeToFileAsJson finalWays
	setTimeout callback , ( 6000 )