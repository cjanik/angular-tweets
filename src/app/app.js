import angular from 'angular';
import client from 'websocket';
import uirouter from 'angular-ui-router';
import routing from './app.config';
import bars from './bars';

var ws = new client.w3cwebsocket('ws://localhost:5060/');

import '../style/app.css';

let app = () => {
  return {
    template: require('./app.html'),
    controller: 'AppCtrl',
    controllerAs: 'app'
  }
};

class AppCtrl {
  constructor() {
    // this.url = 'https://github.com/cjanik/angular-tweets';
  }
}

export default angular.module('app', [uirouter, bars])
  .config(routing)
  .directive('app', app)
  .controller('AppCtrl', AppCtrl)
  .name;
