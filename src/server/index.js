var TwitterStreamChannels = require('twitter-stream-channels'),
    credentials = require('./twitter.json'),
    Twit = new TwitterStreamChannels(credentials),
    path = require('path'),
    compression = require('compression'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

var static_path = path.join(__dirname, '../public'),
    channels = {},
    lastUpdated = Date.now(),
    rateLimit = false,
    lang = 'en';

server.listen(5080);

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

// app.enable('trust proxy');

// app.use(compression());

// app.route('/').get(function(req, res) {
//     res.header('Cache-Control', "max-age=60, must-revalidate, private");
//     res.sendFile('index.html', {
//         root: static_path
//     });
// });

// function nocache(req, res, next) {
//     res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     res.header('Expires', '-1');
//     res.header('Pragma', 'no-cache');
//     next();
// }

// app.use('/', express.static(static_path, {
//     maxage: 31557600
// }));

app.listen(process.env.PORT || 5060, function(){
    console.log('server listening on ' + this.address().address);
});

