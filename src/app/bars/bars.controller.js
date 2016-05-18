export default class BarsCtrl {
  constructor() {
    this.$scope.name = 'Bar Chart Controller';
    this.$scope.id = 'barChart';
    console.log('constructed', this.name);
  }
}