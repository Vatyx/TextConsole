var express = require("express");
var app = express();

app.get("/", function(req, res)
{
	res.send("Hello world!");
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});