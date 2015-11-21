var express = require("express");
var bodyParser = require('body-parser');
var twilio = require('./js/twilio.js');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//xtwilio.sendMessage("+12144035793", "Hey there buddy boy");

app.get("/", function(req, res)
{
	res.send("Hello world!");
});

app.post("/message", function(req, res)
{
	console.log(req.body);

	var message = req.body.body;
	var number = req.body.From;
	console.log(message + " " + number);
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});