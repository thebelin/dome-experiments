// modules
const express = require('express')
  , http = require('http')
  , path = require('path')
  , morgan = require('morgan')
  , configServer = require(__dirname + '/package.json');

// app parameters
var app = express();
app.set('port', configServer.httpPort);
app.use(express.static(configServer.staticFolder));
app.use(morgan('dev'));

// serve index
app.get('*', (req, res) => {
	console.log("get index");
	res.sendFile(__dirname + '/index.html');
});

// HTTP server
var server = http.createServer(app);
server.listen(app.get('port'), () => {
  console.log('HTTP server listening on port ' + app.get('port'));
});

// WebSocket server
var io = require('socket.io')(server);
io.on('connection', require(__dirname + '/socket.js'));

module.exports.app = app;