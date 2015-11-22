var express = require("express");
var bodyParser = require('body-parser');
var twilio = require('./js/twilio.js');
var commands = require('./js/commands.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

db = { "+12144035793":{cityName: "Plano", lat: 30.2500, lon: -97.7500} };

var defaultnumber = "+19728541618";
//commands.python(defaultnumber, "print('Hello World')");
//commands.python(defaultnumber, "def f(n):\n\treturn f(n-1)*n if n> 0 else 1\nprint(f(10))");
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
	var content = req.body.Body.substring(req.body.Body.indexOf(" ")).trim();

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
		case "set":
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
			commands.define(number, content);
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
		case "translate":
			console.log("In translate");
			console.log(content.substring(content.indexOf(" ") + 1));
			commands.translate(number, content.split(" ")[0], content.substring(content.indexOf(" ") + 1));
			break;
		case "fliptable":
			console.log("In flip table");
			commands.flipTable(number);
			break;
		case "random":
			console.log("In random");
			commands.random(number, content.split(" ")[0], content.substring(content.indexOf(" ") + 1));
			break;
		case "sos":
			console.log("In sos");
			commands.sos(number);
			break;
		case "decide":
			console.log("In decide");
			commands.decide(number, content.split("/"));
			break;
		case "compute":
			console.log("In compute");
			commands.compute(number, content);
			break;
		case "image":
			console.log("In image");
			commands.image(number, content);
			break;
		case "csimiami":
			console.log("In csimiami");
			commands.CSIMiami(number);
			break;
		case "ingredients":
			console.log("In ingredients");
			commands.ingredients(number, content);
			break;
		case "email":
			console.log("In email");
			var to = content.split(" ")[0]
			content = content.substring(content.indexOf(" ") + 1).split("/");
			commands.email(number, to, content[0], content[1]);
			break;
		case "urban":
			console.log("In urban");
			commands.urbanDefine(number, content);
			break;
		case "pick":
			console.log("In pick");
			var num = Number(content.split(" ")[0]);
			content = content.substring(content.indexOf(" ") + 1).split("/");
			commands.pick(number, num, content);
			break;
		case "movie":
			console.log("In movie");
			commands.movie(number);
			break;
		case "event":
			console.log("In events");
			if(db[number] === undefined)
				commands.invalidLocation(number);
			else
				commands.events(number, db[number]);
			break;
		case "yoda":
			console.log("In yoda");
			commands.yoda(number, content);
			break
		case "find":
			console.log("In find");
			if(db[number] === undefined)
				commands.invalidLocation(number);
			else
				commands.find(number, content, db[number]);
			break;
		case "news":
			console.log("In news");
			commands.news(number, content);
			break;
		case "python":
			console.log("In python");
			var attach = command.split("python");
			content = attach[1] + content;

			commands.python(number, content);
			break;
		case "ruby":
			console.log("In ruby");
			var attach = command.split("ruby");
			content = attach[1] + content;
			commands.ruby(number, content);
			break;
		case "javascript":
			console.log("In javascript");
			var attach = command.split("javascript");
			content = attach[1] + content;
			commands.javascript(number, content);
			break;
		case "java":
			console.log("In java");
			var attach = command.split("java");
			content = attach[1] + content;
			commands.java(number, content);
			break;
		case "cpp":
			console.log("In cpp");
			var attach = command.split("cpp");
			content = attach[1] + content;
			commands.cpp(number, content);
			break;
		case "c++":
			console.log("In c++");
			var attach = command.split("c++");
			content = attach[1] + content;
			commands.cpp(number, content);
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