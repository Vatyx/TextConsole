var needle = require("needle");
var twilio = require("./twilio.js");

exports.daytime = function(number)
{
    var date = new Date();
    var current_hour = date.toString();
    twilio.sendMessage(number, current_hour);
}

exports.define = function(number, word){
    needle.get("https://api.pearson.com:443/v2/dictionaries/ldoce5/entries?headword=" + word, null,
              function(error,response,body){
                    var results = "";
                    for (var i = 0,j = 0; i < body.results.length; ++i){
                        if (body.results[i].headword.toLowerCase() === word.toLowerCase()){
                            results += ((++j) + ": " + body.results[i].senses[0].definition[0] + ".\n");
                        }
                    }
                    if (results === "")
                        results = "Word(s) not defined.";
                    twilio.sendMessage(number, results);
               });
    
}
