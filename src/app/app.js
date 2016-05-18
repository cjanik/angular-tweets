import angular from 'angular';
import uirouter from 'angular-ui-router';
import routing from './app.config';

import AppCtrl from './app.controller.js';
import bars from './bars/bars.directive';

import _ from 'lodash';

import '../style/app.css';

let app = () => {
  return {
    template: require('./app.html'),
    controller: 'AppCtrl',
    controllerAs: 'app',
  }
};

export default angular.module('app', [uirouter])
  .config(routing)
  .controller('AppCtrl', ['$scope', AppCtrl])
  .directive('app', app)
  .directive('bars', bars)
  .name;
