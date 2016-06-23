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
  tweetStream,
  MAX_CLIENTS = 30;

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

  addToTrack(data.clientId, data.input);

  setInterval(() => {
    handleTweets(data.clientId, socket, {
      id_str: Math.floor(Math.random()*31011).toString(),
      text: "just another test",
      retweeted_status: {
        retweet_count: Math.floor(Math.random()*100),
        id_str: Math.floor(Math.random()*5101).toString()
      }
    }, data.input);
  }, 500);


  // tweetStream.on('channels/' + data.clientId, (twt) => {
  //   handleTweets(data.clientId, socket, twt, data.input);
  // });

  // tweetStream.on('error', (error) => {
  //   socket.emit('error', error);
  //   console.log('error: ', error);
  // });

}

function handleTweets(subscriber, socket, twt, query) {
  // Manage client tweet Map and emit additions and deletions
  if (twt.retweeted_status) {
    let clientUpdates = {};

    if (clients[subscriber].tweetMap.size < MAX_CLIENTS
      || twt.retweeted_status.retweet_count > clients[subscriber].minTweet.retweeted_status.retweet_count
    ) {
      clients[subscriber].tweetMap.set(twt.id_str, twt);
      clientUpdates.add = twt;
    }
    if (clients[subscriber].tweetMap.size > MAX_CLIENTS) {
      clients[subscriber].tweetMap.delete(clients[subscriber].minTweet.id_str);
      clientUpdates.remove = clients[subscriber].minTweet.id_str;
    }
    if (clients[subscriber].tweetMap.size === MAX_CLIENTS) {
      clients[subscriber].minTweet = getMinTweet(subscriber);
    }

    console.log(twt.text);
    if (clientUpdates.add) {
      console.log('emitting test on: ', query);
      socket.emit(query, clientUpdates);
    }
  }
}

function getMinTweet(subscriber) {
  let minTweet = null;
  for( let value of clients[subscriber].tweetMap.values()) {
    if (!minTweet || value.retweeted_status.retweet_count < minTweet.retweeted_status.retweet_count) {
      minTweet = value;
    }
  }
  return minTweet;
}

function addToTrack(subscriber, track) {
  channels[subscriber] = Array(track);
  clients[subscriber] = { tweetMap: new Map() };
  console.log('channels: ', channels);
  // updateTwit();
}

function updateTwit() {
  var now = (new Date).getTime(),
    updated = false;
    console.log('now: ', now, ' lastUpdated: ', lastUpdated);

  if (now - lastUpdated > 5000 && rateLimit === false) {
    tweetStream = Twit.streamChannels({ track: channels, language: 'en' });
    console.log(tweetStream);
    console.log('updated, no rateLimit: ', now - lastUpdated);
    lastUpdated = now;
    updated = true;

  } else if (rateLimit === true && now - lastUpdated > 60000) {
    tweetStream = Twit.streamChannels({ track: channels, language: 'en' });
    console.log('updated, after rateLimit', now - lastUpdated);
    lastUpdated = now;
    rateLimit = false;
    updated = true;
  }

  if (!updated) {
    setTimeout(updateTwit, 5000);
  } else {
    return true;
  }

}

// close stream after 15 minutes
var closeChecker = setInterval(() => {
  if ((new Date).getTime() - lastUpdated > 60 * 1000 * 15) {
      tweetStream.stop();
    clearInterval(closeChecker);
  }
}, 60 * 1000);
