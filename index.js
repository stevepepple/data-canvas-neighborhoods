var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 9000));
app.use(express.static(__dirname + '/public'));

// Libraries for ReadMe
var fs = require('fs');
var marked = require('marked');

app.get('/', function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.sendFile(__dirname + '/index.html');
});


app.get('/about', function(req, res){

  function readModuleFile(path, callback) {
	    try {
	        var filename = require.resolve(path);
	        fs.readFile(filename, 'utf8', callback);
	    } catch (e) {
	        callback(e);
	    }
	}

  readModuleFile('./README.md', function (err, string) {
	    console.log( "Converting Read Me" );
		var header = 	'<meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>Urban Heartbeat</title><meta name="description" content=""><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">' +
						'<link rel="stylesheet" href="../styles/main.css" type="text/css" media="screen"/>';

		var html = "<html><head>" + header + "</head><body><header><img src='logo.svg'/></header><article class='markdown-body'>" + marked(string) + "</article></body>";
    res.send( html );

	});

});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
