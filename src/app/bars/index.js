import angular from 'angular';
import uirouter from 'angular-ui-router';

import BarsCtrl from './bars.controller';
import bars from './bars.directive';
import routing from './bars.routes';

export default angular.module('app', [uirouter])
  .config(routing)
  .controller('BarsCtrl', BarsCtrl)
  .directive('bars', bars)
  .name;
