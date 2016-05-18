'use strict'

var TwitterStreamChannels = require('twitter-stream-channels'),
  credentials = require('./twitter.json'),
  Twit = new TwitterStreamChannels(credentials),
  express = require('express'),
  app = express(),
  server = require('http').Server(app),
  io = require('socket.io')(server),
  channels = {},
  clients = {},
  lastUpdated = (new Date).getTime(),
  rateLimit = false,
  lang = 'en',
  tweetStream;

server.listen(5080);

io.on('connection', handleClient);

function handleClient(socket) {
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

  socket.on('subscribeClient', subscribeHandler);

  socket.on('error', (err) => {
    console.log('uh oh: ', err);
  });
}

function subscribeHandler(data) {

  console.log('input: ', data.input, ' clientId: ', data.clientId);
  let socket = this;
  socket.emit('subscribed' + data.clientId, { data: 'success' });

  setTimeout(() => {
    console.log('emitting test on: ', data.input);
    socket.emit(data.input, {data: 'oh shit'});
  }, 5000);

  addToTrack(data.clientId, data.input);

  tweetStream.on('channels/' + data.clientId, (twt) => {
    setListener(socket, twt, data.input);
  });

  tweetStream.on('error', (error) => {

    socket.emit('error', error);
    console.log('error: ', error);
  });

}

function setListener(socket, twt, query) {
  if(twt.retweeted_status){
    console.log(twt.text);
    socket.emit(query,
      { tweetId: twt.id_str,
        retweetId: twt.retweeted_status.id_str,
        text: twt.text,
        retweetCount: twt.retweeted_status.retweet_count
      }
    );
  }
}

function addToTrack(subscriber, track) {
  channels[subscriber] = Array(track);
  console.log('channels: ', channels);
  updateTwit();
}

function updateTwit() {
  var now = (new Date).getTime(),
    updated = false;
    console.log('now: ', now, ' lastUpdated: ', lastUpdated);

  if (now - lastUpdated > 5000 && rateLimit === false) {
    tweetStream = Twit.streamChannels( {track: channels, language: 'en'} );
    console.log(tweetStream);
    console.log('updated, no rateLimit: ', now - lastUpdated);
    lastUpdated = now;
    updated = true;
  } else if (rateLimit === true && now - lastUpdated > 60000) {

    tweetStream = Twit.streamChannels( {track: channels, language: 'en'} );
    console.log('updated, after rateLimit', now - lastUpdated);
    lastUpdated = now;
    rateLimit = false;
    updated = true;
  }

  if (!updated){
    setTimeout(updateTwit, 3000);
  } else{
    return true;
  }

}

// close stream after 15 minutes
var closeChecker = setInterval(() => {
  if ((new Date).getTime() - lastUpdated > 60 * 1000 * 15) {
    tweetStream.close();
    clearInterval(closeChecker);
  }
}, 60 * 1000);
