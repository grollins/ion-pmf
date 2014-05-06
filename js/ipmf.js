angular.module('ionPmf', ['ngResource', 'ui.bootstrap', 'highcharts-ng'])
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
    $scope.distance = [2,2.1,2.2,2.3,2.4,2.5,2.6,2.7,2.8,2.9,3,3.1,3.2,3.3,
                       3.4,3.5,3.6,3.7,3.8,3.9,4,4.1,4.2,4.3,4.4,4.5,4.6,4.7,
                       4.8,4.9,5,5.2,5.4,5.6,5.8,6,6.2,6.4,6.6,6.8,7,7.2,7.4,
                       7.6,7.8,8,8.4,8.8,9.2,9.6,10,10.4,10.8,11.2,11.6,12];
    $scope.potential = [-3.38390808,-2.23535455,-1.41094942,-0.890451563,-0.669411061,
                        -0.719568224,-0.961652039,-1.30164017,-1.67189352,-2.0023784,
                        -2.23312771,-2.31860434,-2.27447391,-2.19366396,-2.06322268,
                        -1.79783854,-1.4544722,-1.18776619,-1.10761518,-1.19691603,
                        -1.3179558,-1.31965355,-1.13963203,-0.808491157,-0.396164751,
                        0.00713183403,0.32054365,0.479381777,0.469512804,0.331550283,
                        0.137857166,-0.211184246,-0.426343533,-0.507174456,-0.514862449,
                        -0.478118238,-0.420359198,-0.339758356,-0.230600448,-0.123314764,
                        -0.0564614884,-0.0464244547,-0.0731552782,-0.109255926,-0.136133527,
                        -0.145652627,-0.127752748,-0.0822016157,-0.0386121564,-0.0240003806,
                        -0.0307192669,-0.0267742385,-0.0111906406,-0.00278244375,
                        0.00015124601,0];
    $scope.failed_attempts = 0;

    $scope.chartConfig = {
      options: {
        chart: {
          type: 'line',
          zoomType: 'x'
        },
        legend: {
          enabled: false
        },
        colors: ['#428bca','#777', '#7cb5ec', '#434348', '#90ed7d'],
        tooltip: {
          enabled: false
        },
      },
      series: [{
        data: _.zip($scope.distance, $scope.potential),
        lineWidth: 5,
        shadow: true,
        name: "PMF",
        enableMouseTracking: false
      }],
      title: {
        text: ''
      },
      xAxis: {
        currentMin: 1, currentMax: 13, minRange: 1,
        title: {
          text: 'Distance (angstroms)',
          margin: 15,
          style: {
            "color": "#000",
            "font-family": "Open Sans",
            "font-size": "16px"
          }
        },
        labels: {
          style: {
            color: '#000',
            "font-family": "Open Sans",
            "font-size": "14px"
          },
          x: 0,
          y: 30
        }
      },
      yAxis: {
        title: {
          text: 'Free Energy (kcal/mol)',
          margin: 15,
          style: {
            "color": "#000",
            "font-family": "Open Sans",
            "font-size": "16px"
          }
        },
        labels: {
          style: {
            color: '#000',
            "font-family": "Open Sans",
            "font-size": "14px"
          },
        }
      },
      size: {
        height: 500
      },
      loading: false
    };

    $scope.getPmf = function() {
      $scope.toggleLoading();
      params = {charge1: $scope.charge1, charge2: $scope.charge2,
                sigma1: $scope.sigma1, sigma2: $scope.sigma2};
      IonPmfDatabase.get(params,
        function(response) {
          // success
          $scope.distance = response.distance;
          $scope.potential = response.potential;
          $scope.chartConfig.series[0].data = _.zip($scope.distance, $scope.potential);
          $scope.toggleLoading();
          $scope.failed_attempts = 0;
        },
        function(response) {
          // error
          if ($scope.failed_attempts > 50) {
            console.error('Failed to contact server.')
            $scope.failed_attempts = 0;    
          }
          else {
            $scope.failed_attempts++;
            $scope.getPmf();
          };
      });
    };

    $scope.exportCSV = function() {
      var csvContent = 'charge1,charge2,sigma1,sigma2\n';
      csvContent += $scope.charge1 + ',';
      csvContent += $scope.charge2 + ',';
      csvContent += $scope.sigma1 + ',';
      csvContent += $scope.sigma2 + '\n\n';
      csvContent += 'distance,energy\n';
      for (var i = 0; i < $scope.distance.length; i++) {
          var r = $scope.distance[i];
          var E = $scope.potential[i];
          csvContent += r + ',';
          csvContent += E + '\n';
      }

      var tempLink = document.createElement('a');
      tempLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      tempLink.setAttribute('download','pmf.csv');
      tempLink.click();
    };

    $scope.toggleLoading = function () {
      this.chartConfig.loading = !this.chartConfig.loading;
    };

    $scope.changeData = function () {
      var b = _.map($scope.potential, function(num) { 
        return num + 0.5;
      });
      $scope.potential = b;
      $scope.chartConfig.series[0].data = _.zip($scope.distance, $scope.potential);
    };

  });
