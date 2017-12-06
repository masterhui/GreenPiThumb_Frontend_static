'use strict';

var greenPiThumbApp = angular.module('greenPiThumbApp', [
  'greenPiThumbApp.directives',
  'greenPiThumbApp.version'
  ]);

angular.module('d3', []);
angular.module('greenPiThumbApp.directives', ['d3']);

greenPiThumbApp.controller('DashboardCtrl', function($scope, $http) {
  $http.get('/temperatureHistory.json').success(function(temperatureHistory) {    
    $scope.temperature = temperatureHistory
    $scope.temperatureRecords = temperatureHistory.length;
    $scope.latestTemperature = temperatureHistory[temperatureHistory.length - 1].temperature;
    $scope.temperatureTimestamp = temperatureHistory[temperatureHistory.length - 1].timestamp;
  });
  $http.get('/humidityHistory.json').success(function(humidityHistory) {
    $scope.humidity = humidityHistory;
    $scope.humidityRecords = humidityHistory.length;
    $scope.latestHumidity = humidityHistory[humidityHistory.length - 1].humidity;
    $scope.humidityTimestamp = humidityHistory[humidityHistory.length - 1].timestamp;	  
  });
  $http.get('/lightHistory.json').success(function(lightHistory) {
    $scope.lightLevel = lightHistory;
    $scope.lightRecords = lightHistory.length;
    $scope.latestLightLevel = lightHistory[lightHistory.length - 1].light;
    $scope.lightLevelTimestamp = lightHistory[lightHistory.length - 1].timestamp;	  
  });
  $http.get('/soilMoistureHistory.json').success(function(moistureHistory) {
    $scope.soilMoisture = [];
    moistureHistory.forEach(function(record) {
      $scope.soilMoisture.push({
        moisture: record.soil_moisture,
        timestamp: record.timestamp
      });
    });
    $scope.soilMoistureRecords = $scope.soilMoisture.length;    
    $scope.latestSoilMoisture = $scope.soilMoisture[$scope.soilMoisture.length - 1].moisture;
    $scope.soilMoistureTimestamp = $scope.soilMoisture[$scope.soilMoisture.length - 1].timestamp;	  
  });
  $http.get('/wateringEventHistory.json').success(function(wateringEventHistory) {
    $scope.waterPumped = wateringEventHistory;    
    if (wateringEventHistory.length >= 1) {
        $scope.latestPumpEvent1 = wateringEventHistory[wateringEventHistory.length - 1].water_pumped;
        $scope.pumpEventTimestamp1 = wateringEventHistory[wateringEventHistory.length - 1].timestamp;
        $scope.waterRecords1 = wateringEventHistory.length;
    }
    if (wateringEventHistory.length >= 2) {
        $scope.latestPumpEvent2 = wateringEventHistory[wateringEventHistory.length - 2].water_pumped;
        $scope.pumpEventTimestamp2 = wateringEventHistory[wateringEventHistory.length - 2].timestamp;
        $scope.waterRecords2 = wateringEventHistory.length - 1;
    }
    if (wateringEventHistory.length >= 3) {
        $scope.latestPumpEvent3 = wateringEventHistory[wateringEventHistory.length - 3].water_pumped;
        $scope.pumpEventTimestamp3 = wateringEventHistory[wateringEventHistory.length - 3].timestamp;
        $scope.waterRecords3 = wateringEventHistory.length - 2;
    }
  });	
  $http.get('/images.json').success(function(images) {
    $scope.images = [];
    images.forEach(function(image) {
      $scope.images.push({
        'timestamp': image.timestamp,
        'filename': 'images/' + image.filename
      });
    });
    $scope.images.sort(function(a, b) {
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      return 0;
    });
    $scope.currentImage = $scope.images.length - 1;
  });

  $scope.firstImage = function() {
    $scope.currentImage = 0;
  };

  $scope.previousImage = function() {
    $scope.currentImage = Math.max(0, $scope.currentImage - 1);
  };

  $scope.nextImage = function() {
    $scope.currentImage = Math.min(($scope.currentImage + 1),
                                   ($scope.images.length - 1));
  };

  $scope.lastImage = function() {
    $scope.currentImage = $scope.images.length - 1;
  };
});
