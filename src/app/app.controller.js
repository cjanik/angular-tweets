import io from 'socket.io-client';
import {generateUuid} from './utils';

class AppCtrl {
  constructor($scope) {
    $scope.collectionSize = 30;
    $scope.uuid = generateUuid();
    $scope.inputError = false;
    $scope.topTweets = {};
    this.$scope = $scope;

    const socketCallback = (data) => {
      this.$scope.socket = data;
      this.socket.emit('my other event', { my: 'jello' });
    };

    let connectPromise = new Promise((resolve, reject) => {
      this.socket = io('http://localhost:5080')
        .on('news', (data) => {
          resolve(data);
        });
    });

    connectPromise.then(socketCallback);

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
    this.socket.on(this.$scope.query, (update) => {
      console.log('got ', update);

      if (update.add) {
        this.$scope.topTweets[update.add.id_str] = update.add;
      }
      if (update.remove) {
        delete this.$scope.topTweets[update.remove];
      }

    });
    this.socket.on('error', (error) => {
      console.log('error: ', error);
    });
  }
}

AppCtrl.$inject = ['$scope'];

export default AppCtrl;
