routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
  $stateProvider
    .state('app', {
      url: '/',
      template: require('./bars.html'),
      controller: 'BarsCtrl',
      controllerAs: 'bars'
    });
}