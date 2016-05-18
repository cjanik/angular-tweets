import angular from 'angular';
import io from 'socket.io-client';
import uirouter from 'angular-ui-router';
import routing from './app.config';
import bars from './bars';

import '../style/app.css';

let app = () => {
    return {
      template: require('./app.html'),
      controller: 'AppCtrl',
      controllerAs: 'app',
    }
  },
  generateUuid = () => {
    var d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      d = Math.floor(d/16);
      var r = (d + Math.random()*16)%16 | 0;
      return (c == 'x' ? r : (r&0x3|0x8)).toString(16);
    });
  };

class AppCtrl {
  constructor($scope) {
    this.$scope = $scope;
    $scope.uuid = generateUuid();
    $scope.inputError = false;
    console.log('client id: ', $scope.uuid);

    this.connect();

    $scope.search = (event) => {
      console.log('time to open the stream.');
      event.preventDefault();

      let input = event.target.track.value.trim();
      console.log('search term: ', input);

      if(input !== '') {
        $scope.inputError = false;
        this.getTweets(input);
      } else {
        $scope.inputError = 'Need to enter a proper search term';
        console.log('Need to enter a proper search term');
      }

      return false;
    }
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

    this.socket.emit('unsubscribe', this.$scope.uuid);
    // Retweets.remove({});
    this.socket.emit('subscribeClient', { input: input, lang: 'en', clientId: this.$scope.uuid });
    event.target.track.value = '';
    this.$scope.waitingMsg = "Not seeing much? Someone is bound to tweet about it eventually! Click a bar to see the tweet";
    this.listen();
  }

  listen() {
    this.socket.on('subscribed' + this.$scope.uuid, (success) => {
      console.log(success);
    });
  }
}

AppCtrl.$inject = ['$scope'];

export default angular.module('app', [uirouter, bars])
  .config(routing)
  .directive('app', app)
  .controller('AppCtrl', ['$scope', AppCtrl])
  .name;
