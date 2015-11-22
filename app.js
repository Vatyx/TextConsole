var express = require("express");
var bodyParser = require('body-parser');
var twilio = require('./js/twilio.js');
var commands = require('./js/commands.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

db = { "+12144035793":{cityName: "Plano", lat: 33.4500, lon: -112.0667} };

var defaultnumber = "+17186139960";
//commands.compute(defaultnumber, "derivative x^2");
//twilio.sendMessagePicture(defaultnumber, "Hi there", "http://media2.giphy.com/media/FiGiRei2ICzzG/giphy.gif");

app.get("/", function(req, res)
{
	res.send("Hello world!");
});

app.post("/message", function(req, res)
{
	console.log("In message");
	var number = req.body.From;
	//var command = req.body.Body.substring(0, req.body.Body.indexOf(" ")).toLowerCase();
	var command = ((req.body.Body.split(" "))[0]).toLowerCase();
	var content = req.body.Body.substring(req.body.Body.indexOf(" ")).trim().split(".");

	console.log(req.body.Body);
	console.log("From: " + number);
	console.log("Command: " + command);
	console.log("Content: " + content);

	handleCommand(number, command, content);
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function handleCommand(number, command, content)
{
	switch(command)
	{	
		case "location":
			console.log("In location");
			commands.location(number, content)
			break;
		case "time":
			console.log("In time");
			if(db[number] === undefined)
				commands.invalidLocation(number);
			else
				commands.daytime(number, db[number]);
			break;
		case "define":
			console.log("In define");
			commands.define(number, content[0]);
			break;
		case "weather":
			console.log("In weather");
			if(db[number] === undefined)
				commands.invalidLocation(number);
			else
				commands.weather(number, db[number].cityName);
			break;
		case "flip":
			console.log("In flip");
			commands.flipCoin(number);
			break;
		case "giphy":
			console.log("In giphy");
			commands.giphy(number, content);
			break;
		case "fliptable":
			console.log("In flip table");
			commands.flipTable(number);
			break;
		case "random":
			console.log("In random");
			commands.random(number, content[0], content[1]);
			break;
		case "sos":
			console.log("In sos");
			commands.sos(number);
			break;
		case "decide":
			console.log("In decide");
			commands.decide(number, content);
			break;
		case "compute":
			console.log("In compute");
			commands.compute(number, content);
			break;
		default:
			console.log("In default")
			commands.invalidCommand(number, command);
			break;
	}
}

exports.setLocation = function(number, geo)
{
	db[number] = geo;
}