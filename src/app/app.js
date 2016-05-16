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
    scope: {}
  }
};

class AppCtrl {
  constructor($scope) {
    this.$scope = $scope
    this.connect();
  }

  connect() {
    let socket = io('http://localhost:5080'),
      socketCallback = () => {
        this.$scope.socket = this.$scope.data;
        socket.emit('my other event', { my: 'data' });
      };

    socket.on('news', (data) => {
      this.$scope.data = data;
      this.$scope.$apply(socketCallback);
    });
  }
}

AppCtrl.$inject = ['$scope'];

export default angular.module('app', [uirouter, bars])
  .config(routing)
  .directive('app', app)
  .controller('AppCtrl', ['$scope', AppCtrl])
  .name;
