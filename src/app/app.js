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
  generateUUID = () => {
      var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
  },
  uuid = generateUUID();

class AppCtrl {
  constructor($scope) {
    this.$scope = $scope
    this.connect();

    $scope.search = (event) => {
      console.log('time to open the stream.');
      event.preventDefault();

      let input = event.target.track.value.trim();

      if(input !== '') {
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

    this.socket.emit('unsubscribe', uuid);
    Retweets.remove({});
    this.socket.emit('subscribeClient', input, 'en', uuid);
    event.target.track.value = '';
    this.$scope.waitingMsg = "<p>not seeing much? someone is bound to tweet about it eventually!</p><p>click a bar to see the tweet</p>";
  }
}

AppCtrl.$inject = ['$scope'];

export default angular.module('app', [uirouter, bars])
  .config(routing)
  .directive('app', app)
  .controller('AppCtrl', ['$scope', AppCtrl])
  .name;
