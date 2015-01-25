var request = require('request');
var fs = require('fs');

request('http://mobile.theride.org/new/models/mdlGetRouteNames.aspx', function(error, response, body) {
  if(!error && response.statusCode === 200) {
    var routeList = JSON.parse(body);
    console.log(body);

    var idToAbbr = {};
    for (var i = 0; i < routeList.length; i += 1) {
      idToAbbr[routeList[i].routeAbbr] = routeList[i].routeOffsetID;  
    }
    
    fs.writeFile('./public/data/idToAbbr.json', JSON.stringify(idToAbbr), function(err) {
      console.log(err); 
    });
  }
});
