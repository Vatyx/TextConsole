var needle = require("needle");
var twilio = require("./twilio.js");
var setLocation = require("./../app.js");

exports.daytime = function(number, location)
{
    console.log("Got into the daytime function");
    var date = new Date();
    var utc = date.getTime();
    // var current_hour = date.toString();
    // twilio.sendMessage(number, current_hour);

    needle.get("https://maps.googleapis.com/maps/api/timezone/json?location=" + location.lat + "%2C" + location.lon + "&timestamp=1331161200&sensor=false", null,
        function(error,response,body){
            switch(body.timeZoneName[0])
            {
                case 'P':
                    utc -= 8 * 3600000;
                    break;
                case 'M':
                    utc -= 7 * 3600000;
                    break;
                case 'C':
                    utc -= 6 * 3600000;
                    break;
                case 'E':
                    utc -= 5 * 3600000;
                    break;
                default:
            }
            var date = new Date(utc)
            twilio.sendMessage(number, (date.toString()).replace("GMT+0000 (UTC)", ""));
        });
}

exports.define = function(number, word){
    needle.get("https://api.pearson.com:443/v2/dictionaries/ldoce5/entries?headword=" + word, null,
              function(error,response,body){
                    var results = "";
                    var definitions = [];
                    for (var i = 0; i < body.results.length; ++i){
                    if (body.results[i].headword.toLowerCase() === word.toLowerCase()){
                        definitions.push(body.results[i].senses[0].definition[0]);
                        }
                    }
                    if (definitions.length === 0){
                        results = "Word(s) not defined.";
                    }else if(definitions.length === 1) {
                        results = definitions[0] + ".\n";
                    }else{
                        for (var i = 0; i < definitions.length; ++i){
                            results += (i+1) + ": " + definitions[i] + ".\n";
                        }
                    }
                    twilio.sendMessage(number, results);
               });
    
}
exports.weather = function(number,location){
        var now = new Date();
        var weatherUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22" + location +"%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys" ;
        needle.get(weatherUrl,null,
                  function(error,response,body){
                  //body.query
                  var results = "";
                  if (body.query.count == 0){
                  results = "Invalid location.\n";
                  }else{
                  var detailLocation = body.query.results.channel.location;
                  var condition = body.query.results.channel.item.condition.text.toLowerCase();
                  results = body.query.results.channel.item.description.replace(/<(?:.|\n)*?>/gm, '');
                  results = results.replace("Current Conditions:\n","Current Conditions for " + detailLocation.city + "," + detailLocation.region + "," + detailLocation.country + "\n");
                  results = results.replace("Full Forecast at Yahoo! Weather\n","");
                  results = results.replace("(provided by The Weather Channel)\n","");
                  //adding emoji to the text
                  results = results.replace(/Sunny/g,"Sunny\u2600");
                  results = results.replace(/Clear/g,"Clear\u2600");
                  results = results.replace(/Fair/g,"Fair\u2600");
                  results = results.replace(/Cloudy/g,"Cloudy\u2601");
                  results = results.replace(/Partly Cloudy\u2601/g,"Partly Cloudy\u26C5");
                  results = results.replace(/Snow/g,"Snow\u2744");
                  results = results.replace(/Showers/g,"Showers\u2614");
                  results = results.replace(/Thunderstorms/g,"Thunderstorms\u26A1");
                  results = results.replace(/Wind/g,"Wind\u1F4A8");
                  }
                  twilio.sendMessage(number, results);
                  });

}

exports.flipCoin = function(number){
        var result = Math.round(Math.random()) === 0 ? "Tails" : "Heads";
        twilio.sendMessage(number, result);
}

exports.location = function(number, name)
{
    needle.get("http://nominatim.openstreetmap.org/search?q=" + name + "&format=json", null,
              function(error,response,body){
                    var payload = { cityName: body[0].display_name, lat: body[0].lat, lon:body[0].lon}
                    console.log(payload);
                    setLocation.setLocation(number, payload);
                    twilio.sendMessage(number, "Setting your location to " + body[0].display_name);
               });
}

exports.imgur = function()
{

}

exports.invalidLocation = function(number)
{
    twilio.sendMessage(number, "A location is not set for this number.");
}

exports.invalidCommand = function(number, command)
{
    twilio.sendMessage(number, command + " is not a valid command.");
}