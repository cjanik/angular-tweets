routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
  $stateProvider
    .state('bars', {
      url: '/',
      template: require('./bars.html'),
      controller: 'BarsController',
      controllerAs: 'bars'
    });
}