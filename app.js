var express = require("express");
var bodyParser = require('body-parser');
var twilio = require('./js/twilio.js');
var commands = require('./js/commands.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var defaultnumber = "+12144035793";

app.get("/", function(req, res)
{
	res.send("Hello world!");
});

app.post("/message", function(req, res)
{
	var number = req.body.From;
	var command = req.body.Body.substring(0, str.indexOf(“ “)).toLowerCase();
	var content = req.body.Body.substring(str.indexOf(“ “)).trim().spilt(“.”);

	switch(command)
	{
		case "time":
			commands.daytime(number);
			break;
		case "define":
			commands.define(number, content[0]);
			break;
		default:
			break;
	}
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});