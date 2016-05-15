import angular from 'angular';
import uirouter from 'angular-ui-router';

import BarsController from './bars.controller';
import d3Bars from './bars.directive';
import routing from './bars.routes';


export default angular.module('app.bars', [uirouter])
  .config(routing)
  .directive('d3Bars', d3Bars)
  .controller('BarsController', BarsController)
  .name;