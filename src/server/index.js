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
    lang = 'en',
    tweetStream;

server.listen(5080);

io.on('connection', (socket) => {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', (data) => {
        console.log(data);
    });
    socket.on('unsubscribe', (client) => {
        var self = this;
        if(client === self.subscriptionId){
            console.log('clientCheck: ', client);
            tweetStream.removeListener('channels/' + client, setListener);
            delete channels[self.subscriptionId];
        }
    });

    socket.on('subscribeClient', (track, language, tempId) => {

        console.log('subscribeClient: ', this.subscriptionId);

        var subId = this.subscriptionId.toString();

        socket.emit('subscribed' + tempId, subId);

        lang = language;

        addToTrack(subId, track);

        tweetStream.on('channels/' + subId, (twt) => {
            setListener( twt, subId, track);
        });

        tweetStream.on('error', (error) => {
            serverStream.emit('error', error);
            console.log('error: ', error);
        });

    });
});

function setListener(twt, client, track){
    if(twt.retweeted_status){
      serverStream.emit(client, track, twt.id_str, twt.retweeted_status.id_str, twt.text, twt.retweeted_status.retweet_count);
    }
}

function addToTrack(subscriber, track) {
    channels[subscriber] = Array(track);
    console.log('channels: ', channels);
    updateTwit();
}

function updateTwit(){
    var now = (new Date).getTime(),
        updated = false;
        console.log('now: ', now, ' lastUpdated: ', lastUpdated);

    if (now - lastUpdated > 5000 && rateLimit === false) {
        tweetStream = Twit.streamChannels( {track: channels, language: lang} );
        console.log('updated, no rateLimit: ', now - lastUpdated);
        lastUpdated = now;
        updated = true;
    } else if (rateLimit === true || now - lastUpdated > 60000) {

        tweetStream = Twit.streamChannels( {track: channels, language: lang} );
        console.log('updated, after rateLimit', now - lastUpdated);
        lastUpdated = now;
        rateLimit = false;
        updated = true;
    }

    if (!updated){
        setTimeout(updateTwit, 1000);
    } else{
        return true;
    }

}
