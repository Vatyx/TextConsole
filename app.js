var express = require("express");

var app = express();

app.get("/", function(req, res)
{
	res.send("Hello world!");
});

app.set('port', (process.env.port || 3000));

app.listen(app.get('port'), function()
{
	console.log('Server listening on port ' + app.get('port'));
});