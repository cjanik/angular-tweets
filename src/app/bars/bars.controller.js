class BarsCtrl {
  constructor($scope) {
    $scope.name = 'Bar Chart Controller';
    $scope.id = 'barchart';
    console.log('constructed', this.name);
  }
}

BarsCtrl.$inject = ['$scope'];

export default BarsCtrl;
