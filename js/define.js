var needle = require("needle");

function define(word,callback){
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
                    callback(results);
               });
    
}
