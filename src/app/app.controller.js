import io from 'socket.io-client';

class AppCtrl {
  constructor($scope) {
    $scope.collectionSize = 30;
    $scope.uuid = this.generateUuid();
    $scope.inputError = false;
    $scope.topTweets = {
      count: 0
    };
    this.$scope = $scope;

    this.connect();

    $scope.executeSearch = (event) => {
      console.log('time to open the stream.');
      event.preventDefault();

      let input = event.target.track.value.trim();
      console.log('search term: ', input);

      if(input !== '') {
        $scope.inputError = false;
        this.$scope.query = input;
        event.target.track.value = '';
        this.getTweets(input);
      } else {
        $scope.inputError = 'Need to enter a proper search term';
        console.log('Need to enter a proper search term');
      }

      return false;
    }
  }

    generateUuid() {
    var d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      d = Math.floor(d/16);
      var r = (d + Math.random()*16)%16 | 0;
      return (c == 'x' ? r : (r&0x3|0x8)).toString(16);
    });
  }

  connect() {
    this.socket = io('http://localhost:5080');

    let socketCallback = (data) => {
      this.$scope.socket = data;
      this.socket.emit('my other event', { my: 'data' });
    };

    this.socket.on('news', (data) => {
      this.$scope.$apply(() => {
        socketCallback(data);
      });
    });
  }

  getTweets(input) {
    if (this.listener) {
      this.listener.emit('unsubscribe', this.$scope.uuid);
      this.listener.off(this.$scope.search, tweetHandler);
    }
    this.socket.emit('subscribeClient', { input: input, lang: 'en', clientId: this.$scope.uuid });
    // this.waitForSubscription();
    this.listen();
    this.$scope.waitingMsg = "Not seeing much? Someone is bound to tweet about it eventually! Click a bar to see the tweet";
  }

  waitForSubscription() {
    this.socket.on('subscribed' + this.$scope.uuid, (success) => {
      this.$scope.clientID = success.ID;
      console.log(success);
      this.listen();
    });
  }

  listen(success) {
    console.log('listening for: ', this.$scope.query);
    this.socket.on(this.$scope.query, (tweet) => {

      console.log(tweet);

      if (typeof this.$scope.topTweets.currentMinimum === 'undefined') {
        this.$scope.topTweets.currentMinimum = tweet.retweetCount;
        this.$scope.topTweets.minimumIndex = tweet.tweetId;
      }

      if (tweet.retweetCount > this.$scope.topTweets.currentMinimum || this.$scope.topTweets.count < this.$scope.collectionSize) {
        let isDuplicate = _.find(this.$scope.topTweets, (dup) => {
          return dup.tweetId === tweet.tweetId;
        });

        if (isDuplicate) {
          isDuplicate.retweetCount = tweet.retweetCount;
        } else {
          this.$scope.topTweets[tweet.tweetId] = tweet;
          this.$scope.topTweets.count++;
        }

        if (this.$scope.topTweets.count > this.$scope.collectionSize) {
          delete this.$scope.topTweets[this.$scope.topTweets.minimumIndex];

          // this is clean but unnecessary, another data structure might be appropriate
          let minTweet = _.sortBy(this.$scope.topTweets, ['retweetCount'])[0];

          this.$scope.topTweets.minimumIndex = minTweet.tweetId;
          this.$scope.topTweets.currentMinimum = minTweet.retweetCount;
          this.$scope.topTweets.count--;
        }
      }
    });
    this.socket.on('error', (error) => {
      console.log('error: ', error);
    });
  }
}

AppCtrl.$inject = ['$scope'];

export default AppCtrl;
