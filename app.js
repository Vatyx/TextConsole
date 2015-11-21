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
	console.log("In message");
	var number = req.body.From;
	var command = req.body.Body.substring(0, req.body.Body.indexOf(" ")).toLowerCase();
	var content = req.body.Body.substring(req.body.Body.indexOf(" ")).trim().split(".");

	console.log("From: " + number);
	console.log("Command: " + command);
	console.log("Content: " + content);

	switch(command)
	{
		case "time":
			console.log("In time");
			commands.daytime(number);
			break;
		case "define":
			console.log("In define");
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