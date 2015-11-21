var needle = require("needle");
var twilio = require("./twilio.js");

exports.daytime = function(number)
{
    console.log("Got into the daytime function");
    var date = new Date();
    var current_hour = date.toString();
    twilio.sendMessage(number, current_hour);
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
