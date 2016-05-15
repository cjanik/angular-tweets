var TwitterStreamChannels = require('twitter-stream-channels'),
    credentials = require('./twitter.json');
    client = new TwitterStreamChannels(credentials),
    path = require('path'),
    compression = require('compression'),
    express = require('express');
    // WebSocketServer = require('websocket').server;

var app = express(),
    static_path = path.join(__dirname, '../public'),
    // ws = new WebSocketServer(),
    expressWs = require('express-ws')(app),
    channels = {},
    lastUpdated = Date.now(),
    rateLimit = false,
    lang = 'en';

app.enable('trust proxy');

app.use(compression());

app.use(function (req, res, next) {
    console.log('middleware');
    req.testing = 'testing';
    return next();
});

app.route('/').get(function(req, res) {
    res.header('Cache-Control', "max-age=60, must-revalidate, private");
    res.sendFile('index.html', {
        root: static_path
    });
});

function nocache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}

app.use('/', express.static(static_path, {
    maxage: 31557600
}));

app.ws('/', function(ws, req) {
    ws.on('subscribeClient', function(track, language, tempId){

  console.log('subscribeClient: ', this.subscriptionId);

  var subId = this.subscriptionId.toString();

  serverStream.emit('subscribed' + tempId, subId);

  lang = language;

  addToTrack(subId, track);

  stream.on('channels/' + subId, function(twt){
    setListener( twt, subId, track);
    }
  );

  stream.on('error', function(error){
    serverStream.emit('error', error);
    console.log('error: ', error);
  });

});
    ws.on('message', function(msg) {
        console.log(msg);
    });
    console.log('socket', req.testing);
});

var server = app.listen(process.env.PORT || 5060, function(){
    console.log('server listening on ' + this.address().address);
});

