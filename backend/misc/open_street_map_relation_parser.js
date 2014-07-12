var xml2js = require('xml2js').parseString;
var request = require('request');
var fs = require('fs');

var isWriteToFileAsJson = false;

var relationUrl = 'http://api.openstreetmap.org/api/0.6/relation/2764576';

loadResourceXmlAndParseToJs(relationUrl, false, function(result, isWriteToFileAsJson) {
	var relation = extractRelationFromOsm(result, false);
	var ways = extractWaysFromRelation(relation, false);	
	console.log(ways[0].ref)
	loadResourceXmlAndParseToJs("http://api.openstreetmap.org/api/0.6/way/" + ways[0].ref, false, function(result, isWriteToFileAsJson) {
		var nds = extractNdsFromWay(result, false);
		console.log(nds[0]);
		loadResourceXmlAndParseToJs("http://api.openstreetmap.org/api/0.6/node/" + nds[0].ref, false, function(result, isWriteToFileAsJson) {
			extractNodeFromOsm(result, true);
		});
	});
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
	 }

	 return result;
}

function extractNdsFromWay(way, isWriteToFileAsJson) {
	var nds = way.osm.way[0].nd;

	if(isWriteToFileAsJson) {
		writeToFileAsJson(nds);
	}

	var result = [];
	for(var i = 0; i < nds.length; i++) {
		result[i] = nds[i].$;
	}

	return result;
}

function extractNodeFromOsm(obj, isWriteToFileAsJson) {
	
	if(isWriteToFileAsJson) {
		writeToFileAsJson(obj.osm.node[0].$);
	} 

	return obj.osm.node[0].$; 
}

function writeToFileAsJson(xml) {
	var jsonString = JSON.stringify( xml, null, 4 );

    fs.writeFile("test.json", jsonString, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	}); 
}


