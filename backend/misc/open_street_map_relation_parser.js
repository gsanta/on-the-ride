var xml2js = require('xml2js').parseString;
var request = require('request');
var fs = require('fs');
var async = require("async")

var isWriteToFileAsJson = false;

var relationUrl = 'http://api.openstreetmap.org/api/0.6/relation/2764576';

loadResourceXmlAndParseToJs(relationUrl, false, function(result, isWriteToFileAsJson) {
	var relation = extractRelationFromOsm(result, false);
	var ways = extractWaysFromRelation(relation, false);	

	var nodes = []
	var finalWays = [];


	//console.log(ways[0])
	for(var i = 0; i < ways.length; i++) {
		loadResourceXmlAndParseToJs("http://api.openstreetmap.org/api/0.6/way/" + ways[i].ref, false, function(result, isWriteToFileAsJson) {
			var nds = extractNdsFromWay(result, false);
			finalWays.push(nds);
			// finalWays[i] = {}
			// finalWays[i].coords = [];

			for(var j = 0; j < nds.nodes.length; j++) {
				loadResourceXmlAndParseToJs("http://api.openstreetmap.org/api/0.6/node/" + nds.nodes[j].ref, false, function(result, isWriteToFileAsJson) {
					var node = extractNodeFromOsm(result, false);
					
					for(var i = 0; i < nds.nodes.length; i++) {
						if(nds.nodes[i].ref == node.id) {

							nds.nodes[i].lat = node.lat;
							nds.nodes[i].lon = node.lon;
						}
					}
				});
			}
		});
	}

	setTimeout(function() {
		writeToFileAsJson(finalWays);
	}, 60000 * 12)
	
	
});

function loadResourceXmlAndParseToJs(url, isWriteToFileAsJson, callback) {
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		    xml2js(body, function (err, result) {

			    if(isWriteToFileAsJson) {
			    	writeToFileAsJson(result)
				}

				if(callback != null) {
					callback(result/*.osm.relation*/, isWriteToFileAsJson)
				}
			});
	  } else {
	  	console.log("error loading resource")
	  }
	})
}

function extractRelationFromOsm(obj, isWriteToFileAsJson) {
	var relation = obj.osm.relation;

	if(isWriteToFileAsJson) {
		writeToFileAsJson(relation);
	}

	return relation;
}

function extractWaysFromRelation(relation, isWriteToFileAsJson) {

	if(isWriteToFileAsJson) {
		writeToFileAsJson(relation[0].member);
	}

	 var result = [];
	 for(var i = 0, len = relation[0].member.length; i < len; i++) {
	 	result[i] = relation[0].member[i].$;
	 	result[i].indexInRelation = i;
	 }

	 return result;
}

function extractNdsFromWay(way, isWriteToFileAsJson) {

	var nds = way.osm.way[0].nd;

	if(isWriteToFileAsJson) {
		writeToFileAsJson(way);
	}

	var result = {
		id: way.osm.way[0].$.id,
		nodes: []
	};

	for(var i = 0; i < nds.length; i++) {
		result.nodes[i] = nds[i].$;
		result.nodes[i].wayId = way.osm.way[0].$.id
	}

	return result;
}

function extractNodeFromOsm(obj, isWriteToFileAsJson) {
	
	if(isWriteToFileAsJson) {
		writeToFileAsJson(obj.osm.node[0].$);
	} 

	return obj.osm.node[0].$; 
}

function writeToFileAsJson(obj) {
	var jsonString = JSON.stringify( obj, null, 4 );

    fs.writeFile("test.json", jsonString, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	}); 
}


