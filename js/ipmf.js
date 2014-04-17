angular.module('ionPmf', ['ngResource', 'ui.bootstrap', 'radian'])
  .factory('IonPmfDatabase', function($resource) {
    // Use the resource plugin to talk to an App Engine JSON backend.
    var IonPmfDatabase = $resource('/_ah/api/ionPmfApi/v1/pmf/1d', {},
      {
        'get': {method: 'GET', params: {charge1: 1, charge2: -1,
        sigma1: 2.00, sigma2: 2.00}, isArray: false}
      }
    );
    return IonPmfDatabase;
  })
  .controller('IonPmfCtrl', function($scope, IonPmfDatabase) {
    $scope.charge1 = 1;
    $scope.charge2 = -1;
    $scope.sigma1 = 2.20;
    $scope.sigma2 = 2.00;
    $scope.distance = [0.0, 1.0, 1.0];
    $scope.potential = [0.0, 0.0, 1.0];

    $scope.getPmf = function() {
      params = {charge1: $scope.charge1, charge2: $scope.charge2,
                sigma1: $scope.sigma1, sigma2: $scope.sigma2};
      IonPmfDatabase.get(params, function(response) {
          $scope.distance = response.distance;
          $scope.potential = response.potential;
      });
    };
    // $scope.getPmf();
  });
