var TwitterStreamChannels = require('twitter-stream-channels'),
    credentials = require('./twitter.json'),
    Twit = new TwitterStreamChannels(credentials),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server);

var channels = {},
    lastUpdated = (new Date).getTime(),
    rateLimit = false,
    lang = 'en';

server.listen(5080);

io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
    socket.on('unsubscribe', function(client){
        var self = this;
        if(client === self.subscriptionId){
            console.log('clientCheck: ', client);
            stream.removeListener('channels/' + client, setListener);
            delete channels[self.subscriptionId];
        }
    });

    socket.on('subscribeClient', function(track, language, tempId){

        //console.log('subscribeClient: ', this.subscriptionId);

        var subId = this.subscriptionId.toString();

        socket.emit('subscribed' + tempId, subId);

        lang = language;

        addToTrack(subId, track);

        stream.on('channels/' + subId, function(twt){
            setListener( twt, subId, track);
        });

        stream.on('error', function(error){
            serverStream.emit('error', error);
            console.log('error: ', error);
        });

    });
});
