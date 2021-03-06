var needle = require("needle");
var twilio = require("./twilio.js");
var imgur = require("imgur");
var exec = require('child_process').exec;
var fs = require('fs');
var setLocation = require("./../app.js");

var helpDict = 
{
    "man": "man (command) - Get more information about a command",
    "location": "location (location) - Set your location",
    "set": "set (location) - Set your location",
    "time": "time - Get current time at set location",
    "define": "define (phrase) - Get definition of phrase",
    "weather": "weather - Get weather forecast at set location",
    "flip": "flip - Flip a coin",
    "compute": "compute (expression) - Compute some mathematical function. For instance \"2 + 3 * 5\", \"solve 10 = x - 4\", \"derivative of x^2\"",
    "giphy": "giphy (query) - Get random gif based on query",
    "image": "image (query) - Get random image based on query",
    "fliptable": "fliptable - ???",
    "CSIMiami": "CSIMiami - ???",
    "random": "random (lower) (upper) - Random number between lower and upper",
    "translate": "translate (language code) (phrase) - Translate English phrase to another language. Language Code can be es (Spanish), fr (French), zh-cn (Chinese), de (German), ja (Japanese) etc.",
    "urban": "urban (phrase) - Get UrbanDictionary definition of phrase",
    "news": "news (section) - Get 3 news headlines from a specific section. Section can be home, world, national, politics, business, opinion, technology, science, health, sports, arts, fashion, dining, travel, magazine, realestate",
    "sos": "sos - Get Emergency contact information",
    "decide": "decide (item one) / (item two) / ... / (last item) - Choose one item.",
    "ingredients": "Get list of ingredients for specific reciepe",
    "email": "email (address) (subject) / (body) - Send email to address with subject and body. Example: friend@example.com Our Meeting / Ready for our meeting? Looking forward to seeing you there.",
    "pick": "pick (number) (item one) / (item two) / ... / (last item) - Choose a number of items",
    "movie": "movie - Get random movie which is currently showing",
    "event": "event - Get random event that is around set location",
    "yoda": "yoda (text) - Translate text to how yoda would speak",
    "find": "find (type) - Find a type of place around the location set. Type can be movie (movie theater), restaurant, hotel, travel, barclub, spabeauty, shopping.",
    "python": "python (code) - Execute Python code",
    "ruby": "ruby (code) - Execute Ruby code",
    "c++": "c++ (code) - Execute C++ code",
    "java": "java (code) - Execute Java code",
    "javascript": "javascript (code) - Execute Javascript code",
    "fact": "fact - Get random fact",
    "joke": "joke - Get random joke",
    "pug": "pug - Get pug"

};

exports.help = function(number, command)
{
    console.log("This is the command " + command)
    if(command == undefined || command == "")
    {
        var help = "~~Welcome to Pocket Terminal!~~\n\nAvailable Commands:\n" + Object.keys(helpDict).join(", ");
        console.log(help);
        twilio.sendMessage(number, help);
        return;
    }
    else
    {
        var newHelp = helpDict[command];

        if(newHelp == undefined)
        {
            twilio.sendMessage(number, "Command does not exist.");
            return;
        }
        twilio.sendMessage(number, newHelp);
    }
}

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
                    if (body.results[i].headword.toLowerCase() === word.toLowerCase() && body.results[i].senses[0].definition){
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
                  results = results.replace(/Sunny/g,"Sunny \u2600");
                  results = results.replace(/Clear/g,"Clear \u2600");
                  results = results.replace(/Fair/g,"Fair \u2600");
                  results = results.replace(/Cloudy/g,"Cloudy \u2601");
                  results = results.replace(/Partly Cloudy \u2601/g,"Partly Cloudy \u26C5");
                  results = results.replace(/Snow/g,"Snow \u2744");
                  results = results.replace(/Showers/g,"Showers \u2614");
                  results = results.replace(/Thunderstorms/g,"Thunderstorms \u26A1");
                  results = results.replace(/Wind/g,"Wind \u1F4A8");
                  }
                  console.log(results);
                  twilio.sendMessage(number, results);
                  });

}

exports.flipCoin = function(number){
        var result = Math.round(Math.random()) === 0 ? "Tails" : "Heads";
        twilio.sendMessage(number, result);
}
//wolframalpha ID: PXHV89-GUAVQU3V65
var wolfram = require('wolfram-alpha').createClient("PXHV89-GUAVQU3V65", null);
exports.compute = function(number, expression){
        wolfram.query(expression,
            function (error, body) {
                var url = "";
                var result = "";
                try{
                    url = body[0].subpods[0].image;
                    if (error || body[0].title === "Input")
                         url = "";
                    result = body[1].subpods[0].text;
                }catch(e){
                    url = "";
                    result = "result undefined.\n";
                }

                if(url !== "")
                    twilio.sendMessagePicture(number, null, url);
                if(result !== "")
                    twilio.sendMessage(number, result);
            });
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

exports.giphy = function(number, query)
{
    var q = query.split(" ").join("+");
    needle.get("http://api.giphy.com/v1/gifs/search?q=" + q + "&api_key=dc6zaTOxFJmzC", null, 
        function(error, response, body)
        {
            console.log(body.data[0].images.original.url);
            twilio.sendMessagePicture(number, null, body.data[0].images.original.url);

        });
}

exports.image = function(number, image)
{
    needle.get("https://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=" + image, null,
        function(error, response, body)
        {
            var url = body.responseData.results[Math.floor(Math.random() * body.responseData.results.length)].url;
            console.log(url);
            twilio.sendMessagePicture(number, null, url);
        });
}

exports.invalidLocation = function(number)
{
    twilio.sendMessage(number, "A location is not set for this number.");
}

exports.invalidCommand = function(number, command)
{
    twilio.sendMessage(number, command + " is not a valid command.");
}

exports.flipTable = function(number)
{
    twilio.sendMessage(number, "(╯°□°）╯︵ ┻━┻");
}

exports.CSIMiami = function(number)
{
    twilio.sendMessage(number, "•_•)\n( •_•)>⌐■-■\n(⌐■_■)\n");
}

exports.random = function(number, lower, upper){
    twilio.sendMessage(number, Math.floor(rand = Math.floor(Math.random()*(upper-lower+1) + lower))); 
}

exports.translate = function(number,to,words){
    needle.get("http://api.mymemory.translated.net/get?q=" + words + "&langpair=en|" + to,null,
        function(error,response,body){
            var result = body.responseData.translatedText;
            twilio.sendMessage(number,result);
        });
}
exports.urbanDefine = function(number,word){
    needle.get("http://api.urbandictionary.com/v0/define?term="+word,null,
               function(error,response,body){
                   function getRandomInt (min, max) {
                        return Math.floor(Math.random() * (max - min)) + min;
                   }
                   var result = "";
                   if (body.list.length === 0)
                   result = "Word(s) not defined.\n";
                   else {
                   var i = getRandomInt(0,body.list.length);
                   var result = body.list[i].definition + '\ne.g. ' + body.list[i].example;
                   }
                   twilio.sendMessage(number,result);
               });

}

exports.news = function(number,section){
    section = section.toLowerCase();
    var predefinedSections = ["home","world","national","politics","nyregion","business","opinion",
                              "technology","science","health","sports","arts","fashion","dining",
                              "travel","magazine","realestate"];
    if (predefinedSections.indexOf(section) !== -1){
        needle.get("http://api.nytimes.com/svc/topstories/v1/"+section+".json?api-key=0521700721a48d7be7cf4637cb8102ee:15:73556446",null,
                   function(error,response,body){
                   var results = "";
                   body = JSON.parse(body);
                   for(var i = 0;i < body.results.length/10; ++i){
                   results += (i+1) +": "+ body.results[i].title;
                   results += "\n" + body.results[i].abstract +"\n\n";
                   }
                   twilio.sendMessage(number,results);
                   });
        
    }else{
        twilio.sendMessage(number,"Please use a section in " + predefinedSections);
    }

}

exports.sos = function(number){
    var phoneList = "211 – Local community information or social services (in some cities)\n" +
                    "311 – City government or non-emergency police matters\n" +
                    "411 – Local telephone directory service (Some telephone companies provide national directory assistance)\n" +
                    "511 – Traffic, road, and tourist information\n" +
                    "611 – Telephone line repair service, mobile telephone company customer service\n" +
                    "711 – Relay service for customers with hearing or speech disabilities\n" +
                    "811 – Dig safe pipe/cable location in the United States, non-urgent telehealth/teletriage services in Canada\n" +
                    "911 – Emergency telephone number – fire brigade, ambulance, police ";
    twilio.sendMessage(number, phoneList);
}

exports.decide = function(number, listInput){
    twilio.sendMessage(number, listInput[Math.floor(Math.random()*(listInput.length))]);
}

exports.ingredients = function(number, reciepe)
{
    needle.get("http://www.recipepuppy.com/api/?q=" + reciepe + "&format=json", null,
        function(error, response, body)
        {
            var sending = "";
            var max = 0;
            for (food in body.results)
            {
                var num = body.results[food].ingredients.replace(/[^,]/g, "").length
                if(num > max)
                {
                    max = num;
                    sending = body.results[food].ingredients;
                }
            }
            twilio.sendMessage(number, sending);
        });
}

exports.bio = function(number, name)
{
    needle.get("https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=George%20Bush&format=json", null, 
        function(error, response, body)
        {
            console.log(JSON.stringify(body));
        });
}

exports.email = function(number, address, subject, body)
{
    var mandrill = require('node-mandrill')('pXSSWo-l9HWZoj1uCkKsZA');

    mandrill('/messages/send', {
        message: {
            to: [{email: address, name: 'You!'}],
            from_email: 'textconsole@coderedliftoff.com',
            subject: subject,
            text: body
        }
    }, function(error, response)
    {
        //uh oh, there was an error
        if (error) console.log( JSON.stringify(error) );

        //everything's good, lets see what mandrill said
        else 
        {
            console.log(response);
            twilio.sendMessage(number, "Your email was sent successfully.");
        }
    });
}

exports.pick = function(number, numPick, listInput){
    if(numPick > listInput.length || numPick < 0)
    {
        twilio,sendMessage(number, "Invalid input");
        return;
    }

    var arrList = listInput;
    var result = "";
    while(numPick > 0){
        var randomSpot = Math.floor(Math.random()*(arrList.length));
        result += arrList[randomSpot] + ", ";
        arrList.splice(randomSpot,1);
        numPick -= 1;
    }
    
    twilio.sendMessage(number, result.substring(0,result.lastIndexOf(",")));
}

exports.movie = function(number){
        needle.get("http://api.myapifilms.com/imdb/inTheaters?token=0ec223a4-34ab-46f9-850e-c2ddb3586e32", null, 
        function(error, response, body)
        {
            var titleList = [];
            for(var size = 0; size < body.data.inTheaters.length; size++){ //go through dates
                titleList = titleList.concat(body.data.inTheaters[size].movies);    
            }

            var movie = titleList[Math.floor(Math.random()*titleList.length)]
            var title = movie.title;
            var plot = movie.simplePlot;
            var metascore = movie.rating === "" ? "N/A" : movie.rating + "/10";
            twilio.sendMessage(number, title + "  |  Score - " + metascore + "\n" + plot);
        });
}
exports.events = function(num, location)
{
    needle.get("https://api.getevents.co/event?lat=" + location.lat + "&lng=" + location.lon + "&limit=15", null,
        function(error, response, body)
        {
            var number = Math.floor(Math.random()*body.events.length);
            var name = body.events[number].name
            var desc = body.events[number].description === "" ? "No Description" : body.events[number].description;
            var time = body.events[number].start_date;
            var address = body.events[number].venue.address.street + " " + body.events[number].venue.address.city + " " + body.events[number].venue.address.zip;
            //console.log(number, name + " - " + desc + "\n" + time + "\n" + address);
            console.log(name + " - " + desc + "\n" + time + "\n" + address);
            twilio.sendMessage(num, name + " - " + desc + "\n" + time + "\n" + address)
        });
}

exports.yoda = function(number, text)
{
    needle.get("http://funtranslations.com/yoda?text=" + text, null,
        function(error, response, body)
        {
            var without = body.replace(/<(?:.|\n)*?>/gm, '');
            var a = "In Yodish...";
            var text = without.substring(without.indexOf("In Yodish...") + a.length, without.indexOf("Type your text below to convert to Yoda"));
            twilio.sendMessage(number, text.trim());
        });
}

exports.find = function(number, place, location)
{
    place = place.toLowerCase();
    needle.get("http://api.citygridmedia.com/content/places/v2/search/latlon?type=" + place + "&lat=" + location.lat + "&lon=" + location.lon + "&radius=10&publisher=test&format=json", null,
        function(error, response, body)
        {
            var loc = body.results.locations;
            var i = 0;
            var total = [];

            while (i < loc.length && i < 3)
            {
                var rand = Math.floor(Math.random() * loc.length);

                var name = loc[rand].name;
                var address = loc[rand].address.street + "\n" + loc[rand].address.city + ", " + loc[rand].address.state + " " + loc[rand].address.postal_code;
                total.push(i+1 + ". " + name + "\n" + address + "\n");
                loc.splice(rand, 1);
                i += 1;
            }

            var ret = total.join("\n");
            twilio.sendMessage(number, ret);
        });
}

exports.python = function(number, code){
    fs.writeFile("prog.py", code,
        function(err) {
            if(err) {
                twilio.sendMessage(number,err);
            }
            var cmd = "python prog.py";
            exec(cmd,function(error,stdout,stderr){
                if (error)
                {
                    console.log(error);
                    twilio.sendMessage(number,error);
                }
                else
                {    
                    console.log(stdout);
                    twilio.sendMessage(number,stdout);
                }
            });
        });
}

exports.ruby = function(number, code){
    fs.writeFile("prog.rb", code,
       function(err) {
           if(err) {
               twilio.sendMessage(number,err);
           }
           var cmd = "ruby prog.rb";
           exec(cmd,function(error,stdout,stderr){
              if (error)
                  twilio.sendMessage(number,error);
              else
                  twilio.sendMessage(number,stdout);
          });

       });
    
}
exports.cpp = function(number, code){
    fs.writeFile("prog.cpp", code,
       function(err) {
           if(err) {
               twilio.sendMessage(number,err);
           }
           var cmd = "g++ -std=c++11 prog.cpp";
           exec(cmd,function(error,stdout,stderr){
              if (error)
                  twilio.sendMessage(number,error);
              else{
                  exec("./a.out",function(error,stdout,stderr){
                     if (error)
                         twilio.sendMessage(number,error);
                     else
                         twilio.sendMessage(number,stdout);
                 });
              }
          });

       });
    
}

exports.java = function(number, code){
    fs.writeFile("Prog.java", code,
       function(err) {
           if(err) {
               twilio.sendMessage(number,err);
           }
           var cmd = "javac Prog.java";
           exec(cmd,function(error,stdout,stderr){
              if (error)
                  twilio.sendMessage(number,error);
              else{
                  exec("java Prog",function(error,stdout,stderr){
                     if (error)
                         twilio.sendMessage(number,error);
                     else
                         twilio.sendMessage(number,stdout);
                 });
              }
          });

       });
}


exports.javascript = function(number, code){
    fs.writeFile("prog.js", code,
       function(err) {
           if(err) {
               twilio.sendMessage(number,err);
           }
           var cmd = "node prog.js";
           exec(cmd,function(error,stdout,stderr){
              if (error)
                  twilio.sendMessage(number,error);
              else
                  twilio.sendMessage(number,stdout);
          });

       });
}


exports.fact = function (number){
    needle.get("http://numbersapi.com/random", null, 
    function(error, response, body)
    {
         twilio.sendMessage(number,body);
    });
}

exports.joke = function (number){
    needle.get("http://tambal.azurewebsites.net/joke/random", null, 
    function(error, response, body)
    {
        console.log(body.joke);
        twilio.sendMessage(number, body.joke);

    });
}